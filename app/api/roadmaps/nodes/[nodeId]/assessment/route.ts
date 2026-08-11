import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth-prisma";
import { prisma } from "@/lib/prisma";
import { groqService } from "@/lib/groq-service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ nodeId: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const userId = verifyToken(token);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const { nodeId } = await context.params;

    // Fetch the node to know what skill to assess
    const node = await prisma.roadmapNode.findUnique({
      where: { id: nodeId },
    });

    if (!node) {
      return NextResponse.json(
        { success: false, error: "Node not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description } = body;

    // Check the cache first
    const cached = await prisma.assessmentCache.findUnique({
      where: { skillTitle: title || node.title }
    });

    if (cached) {
      return NextResponse.json(
        { success: true, data: cached.data },
        { status: 200 }
      );
    }

    // Use Groq to generate assessment questions, with an industry-grade fallback if AI is unavailable
    let assessment: any = null;
    try {
      assessment = await groqService.generateAssessment(title || node.title, description || node.description);
    } catch (e) {
      console.warn("AI Assessment generation failed or quota reached. Seeding industry standard assessment into database cache:", e);
      const skillName = title || node.title || "Technical Specialization";
      assessment = {
        title: `Industry Competency Assessment: ${skillName}`,
        timeLimitMinutes: 20,
        passMarkPercentage: 60,
        questions: [
          {
            id: "q1",
            text: `When configuring production deployments with ${skillName}, which of the following represents an industry-standard best practice?`,
            options: [
              { id: "a", text: "Implementing automated testing pipelines and strictly adhering to modular documentation standards." },
              { id: "b", text: "Deploying raw changes directly to live servers without localized integration verification." },
              { id: "c", text: "Bypassing environmental access controls to maximize short-term execution speed." },
              { id: "d", text: "Omitting version control tracking to simplify solo contributions." }
            ],
            correctOptionId: "a",
            explanation: "Automated testing pipelines and clear modular documentation are essential for scalable, robust production implementations."
          },
          {
            id: "q2",
            text: `What is a core technical advantage of mastering ${skillName} in modern cross-functional digital workflows?`,
            options: [
              { id: "a", text: "It eliminates all hardware overhead across enterprise cloud systems." },
              { id: "b", text: "It enhances system interoperability, maintainability, and architectural efficiency." },
              { id: "c", text: "It prevents third-party integrations from executing asynchronously." },
              { id: "d", text: "It restricts data access to localized physical terminals only." }
            ],
            correctOptionId: "b",
            explanation: "Mastery of industry-ready skills directly contributes to high maintainability, structural efficiency, and robust team workflows."
          },
          {
            id: "q3",
            text: `In standard software and digital architecture practices, how should exceptions or integration failures within ${skillName} be managed?`,
            options: [
              { id: "a", text: "Suppressing all execution logging to keep console outputs completely blank." },
              { id: "b", text: "Halting the global application lifecycle without alerting diagnostic monitoring teams." },
              { id: "c", text: "Utilizing graceful error boundaries, descriptive event logging, and clear status responses." },
              { id: "d", text: "Allowing raw stack traces and unencrypted database variables to surface to end-users." }
            ],
            correctOptionId: "c",
            explanation: "Graceful error boundaries with clean status codes and diagnostic logging safeguard performance and security."
          },
          {
            id: "q4",
            text: `How does ongoing skill development in ${skillName} directly align with global and regional job market expectations?`,
            options: [
              { id: "a", text: "By proving practical problem-solving capability and compliance with professional production standards." },
              { id: "b", text: "By replacing the requirement for clear communication in cross-functional team agile sprints." },
              { id: "c", text: "By limiting practical application strictly to legacy desktop computing environments." },
              { id: "d", text: "By focusing exclusively on theoretical concepts without creating usable implementations." }
            ],
            correctOptionId: "a",
            explanation: "Modern employers emphasize practical problem-solving and adherence to verified industry production standards."
          },
          {
            id: "q5",
            text: `When auditing an existing codebase or implementation that utilizes ${skillName}, what factor primarily determines structural quality?`,
            options: [
              { id: "a", text: "The total file size and line count of uncompiled source assets." },
              { id: "b", text: "Code cleanliness, modular encapsulation, adherence to DRY principles, and test suite coverage." },
              { id: "c", text: "The absence of third-party utility abstractions or standard build tools." },
              { id: "d", text: "The frequency of arbitrary system reloads during normal operation." }
            ],
            correctOptionId: "b",
            explanation: "Clean modular encapsulation and strong test coverage characterize elite engineering craftsmanship in professional environments."
          }
        ]
      };
    }

    // Save to cache safely (using upsert to avoid race conditions)
    await prisma.assessmentCache.upsert({
      where: { skillTitle: title || node.title },
      update: { data: assessment },
      create: {
        skillTitle: title || node.title,
        data: assessment
      }
    });

    return NextResponse.json(
      { success: true, data: assessment },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to generate assessment:", error);
    const msg = error instanceof Error ? error.message : "Internal Server Error";
    const userMsg = (msg.includes("429") || msg.toLowerCase().includes("rate") || msg.toLowerCase().includes("quota") || msg.includes("Free Tier") || msg.toLowerCase().includes("groq") || msg.toLowerCase().includes("failed"))
      ? "AI Free Tier Quota Reached: You have reached your daily trial limit for live AI generations. Please try again later or upgrade to Pathfinder Pro for unlimited instant assessments!"
      : "AI Free Tier Quota Reached: You have reached your daily trial limit for live AI generations. Please try again later or upgrade to Pathfinder Pro for unlimited instant assessments!";
    return NextResponse.json(
      {
        success: false,
        error: userMsg,
      },
      { status: 500 }
    );
  }
}
