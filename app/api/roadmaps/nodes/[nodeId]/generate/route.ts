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
    });

    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    // Call Groq to generate resources and a practice project based on the node
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
    
    // Parse JSON from response
    let parsedContent;
    try {
      // Find JSON block if wrapped in markdown
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse.replace(/```json|```/g, '');
      parsedContent = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse AI response as JSON", aiResponse);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
