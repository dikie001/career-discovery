import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-prisma";
import { groqService } from "@/lib/groq-service";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = verifyToken(authHeader.substring(7));
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const targetRole = profile.targetRole || "General Career";
    const currentSkills = profile.skills || [];

    // Call Groq to generate a skill gap analysis
    const prompt = `Perform a skill gap analysis for someone aiming for the role of "${targetRole}". 
    Their current skills are: ${currentSkills.length > 0 ? currentSkills.join(", ") : "None specified"}.
    Identify the missing critical skills they need.
    Also recommend 2 specific courses (with provider names) and 2 relevant certifications to acquire these missing skills.
    
    Return ONLY a valid JSON object matching exactly this format (no extra text):
    {
      "targetRole": "${targetRole}",
      "missingSkills": ["Skill 1", "Skill 2"],
      "recommendations": {
        "courses": [
          { "title": "Course Name", "provider": "Provider Name", "url": "https://..." }
        ],
        "certifications": [
          { "name": "Cert Name", "provider": "Provider Name", "url": "https://..." }
        ]
      }
    }`;

    const aiResponse = await groqService.chat([{ role: "user", content: prompt }], "analyst");
    
    let parsedContent;
    try {
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse.replace(/```json|```/g, '');
      parsedContent = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse AI response as JSON", aiResponse);
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    // Ensure structure matches
    if (!parsedContent.recommendations) {
      parsedContent.recommendations = { courses: [], certifications: [] };
    }

    return NextResponse.json({ success: true, data: parsedContent });
    
  } catch (error) {
    console.error("Error generating skill gap analysis:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
