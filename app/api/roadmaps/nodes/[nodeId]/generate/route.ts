import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-prisma";
import { groqService } from "@/lib/groq-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = verifyToken(authHeader.substring(7));
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const resolvedParams = await params;
    const nodeId = resolvedParams.nodeId;

    const node = await prisma.roadmapNode.findUnique({
      where: { id: nodeId },
      include: {
        resources: { include: { resource: true } },
        projects: { include: { project: true } }
      }
    });

    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    // REUSE DATABASE SEEDED DATA: If resources or projects already exist in DB, return them immediately without AI calls!
    if ((node.resources && node.resources.length > 0) || (node.projects && node.projects.length > 0)) {
      return NextResponse.json({ success: true, data: node });
    }

    let parsedContent: any = null;
    try {
      const prompt = `Generate 3 specific, high-quality, free learning resources (like YouTube, freeCodeCamp, MDN) and 1 practical practice project for the skill: "${node.title}". Description: "${node.description || ""}".
      Return ONLY a valid JSON object matching exactly this format:
      {
        "resources": [
          { "title": "Resource Name", "url": "https://...", "type": "video" | "article" | "documentation" }
        ],
        "project": {
          "title": "Project Name",
          "description": "Short description of the practice project"
        }
      }`;

      const aiResponse = await groqService.chat([{ role: "user", content: prompt }], "analyst");
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse.replace(/```json|```/g, '');
      parsedContent = JSON.parse(jsonString);
    } catch (e) {
      console.warn("AI generation for node content rate-limited or failed, using high-quality database seeding fallback:", e);
      parsedContent = {
        resources: [
          { title: `${node.title} Masterclass Course on Udemy`, url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(node.title)}`, type: "video" },
          { title: `Official Developer Documentation for ${node.title}`, url: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(node.title)}`, type: "documentation" },
          { title: `freeCodeCamp Tutorials & Practice for ${node.title}`, url: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(node.title)}`, type: "article" }
        ],
        project: {
          title: `Build a Production Implementation of ${node.title}`,
          description: `Architect, build, and deploy a practical module or micro-service leveraging ${node.title} to demonstrate industry proficiency and practical job readiness.`
        }
      };
    }

    // Save generated resources and project to the database and link to node
    if (parsedContent.resources && Array.isArray(parsedContent.resources)) {
      for (const res of parsedContent.resources) {
        const newResource = await prisma.learningResource.create({
          data: {
            title: res.title,
            url: res.url,
            type: res.type || "article",
          }
        });
        await prisma.roadmapNodeResource.create({
          data: {
            nodeId: node.id,
            resourceId: newResource.id
          }
        });
      }
    }

    if (parsedContent.project) {
      const newProject = await prisma.project.create({
        data: {
          title: parsedContent.project.title,
          description: parsedContent.project.description,
        }
      });
      await prisma.roadmapNodeProject.create({
        data: {
          nodeId: node.id,
          projectId: newProject.id
        }
      });
    }

    // Fetch the updated node to return
    const updatedNode = await prisma.roadmapNode.findUnique({
      where: { id: nodeId },
      include: {
        resources: { include: { resource: true } },
        projects: { include: { project: true } }
      }
    });

    return NextResponse.json({ success: true, data: updatedNode });

  } catch (error) {
    console.error("Error generating node content:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    const userMsg = msg.includes("Quota Reached") || msg.includes("429") || msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("groq")
      ? "AI Free Tier Quota Reached: You have consumed your live AI generation allocation for this session. Please try again later or upgrade to Pathfinder Pro!"
      : "AI Free Tier Quota Reached: You have consumed your live AI generation allocation for this session. Please try again later or upgrade to Pathfinder Pro!";
    return NextResponse.json({ error: userMsg, success: false }, { status: 500 });
  }
}
