import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-prisma";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the User
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = verifyToken(authHeader.substring(7));
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { careerTitle } = await request.json();
    if (!careerTitle) {
      return NextResponse.json({ error: "Career title required" }, { status: 400 });
    }

    // 2. CHECK CACHE: Does this roadmap already exist in the database?
    const existingCareer = await prisma.career.findFirst({
      where: { title: { equals: careerTitle, mode: "insensitive" } },
      include: { roadmaps: { include: { nodes: true } } }
    });

    // If it exists and has nodes, return it instantly!
    if (existingCareer && existingCareer.roadmaps.length > 0 && existingCareer.roadmaps[0].nodes.length > 0) {
      return NextResponse.json({ roadmapId: existingCareer.roadmaps[0].id });
    }

    // 3. CREATE BASE RECORDS (Fixes the TypeScript errors)
    let careerId = existingCareer?.id;
    
    if (!careerId) {
      const newCareer = await prisma.career.create({
        data: {
          title: careerTitle,
          description: `An AI-generated career path for a ${careerTitle}.`,
          category: "AI Generated",
          salaryMin: 50000,
          salaryMax: 120000,
        }
      });
      careerId = newCareer.id;
    }

    const roadmap = await prisma.roadmap.create({
      data: {
        title: `${careerTitle} Roadmap`,
        description: `Your dynamic, industry-ready step-by-step guide to becoming a ${careerTitle}.`,
        careerId: careerId,
      }
    });

    // 4. THE MAGIC: Call Groq to generate the specific nodes and edges
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Fast and excellent at JSON
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are an expert technical career advisor. Your job is to generate a realistic, industry-ready learning roadmap for a "${careerTitle}". 
            
            You MUST return ONLY a valid JSON object. Do not include any markdown, explanation, or text outside the JSON.
            
            The JSON must follow this exact structure:
            {
              "nodes": [
                { "id": "1", "title": "Phase 1: Foundations", "description": "Short description of basic skills.", "type": "milestone", "isRoot": true },
                { "id": "2", "title": "Core Skill", "description": "Specific technology or concept.", "type": "skill" },
                { "id": "3", "title": "Capstone Project", "description": "A portfolio project to prove competence.", "type": "project" }
              ],
              "edges": [
                { "sourceId": "1", "targetId": "2" },
                { "sourceId": "2", "targetId": "3" }
              ]
            }
            
            Rules:
            1. Generate exactly 5 to 7 nodes forming a logical progression.
            2. "id" must be a simple string number ("1", "2", etc.).
            3. "type" must be exactly one of: "milestone", "skill", "career_opportunity", or "project".
            4. Only one node should have "isRoot": true.
            5. Ensure the edges connect the nodes logically using the IDs.`
          }
        ],
        temperature: 0.3
      })
    });

    if (!groqRes.ok) {
      throw new Error("Failed to communicate with Groq AI");
    }

    const groqData = await groqRes.json();
    const content = JSON.parse(groqData.choices[0].message.content);

    // 5. TRANSLATE AI JSON TO PRISMA DATABASE RECORDS
    const idMap = new Map<string, string>();

    for (const node of content.nodes) {
      const dbNode = await prisma.roadmapNode.create({
        data: {
          roadmapId: roadmap.id,
          title: node.title,
          description: node.description,
          type: node.type,
          isRoot: node.isRoot || false,
        }
      });
      idMap.set(node.id, dbNode.id); 
    }

    for (const edge of content.edges) {
      const realSource = idMap.get(edge.sourceId);
      const realTarget = idMap.get(edge.targetId);
      
      if (realSource && realTarget) {
        await prisma.roadmapEdge.create({
          data: {
            sourceId: realSource,
            targetId: realTarget,
          }
        });
      }
    }

    // 6. Return the roadmap ID to transition the UI
    return NextResponse.json({ roadmapId: roadmap.id });

  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}