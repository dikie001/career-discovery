import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth-prisma";

// Helper to load support tickets from SystemSetting table
async function getTickets(): Promise<any[]> {
  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: "support_tickets" } });
    if (!setting) return [
      {
        id: "demo-1",
        userId: "demo-user",
        userName: "Kelvin M.",
        userEmail: "kelvin@student.ke",
        subject: "Requesting AI Mentor for Industrial Attachment in Nairobi",
        category: "Mentorship & Attachment",
        message: "I am a beginner in Python & Data Analytics and need guidance on applying for attachment opportunities starting in May.",
        status: "open",
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    return JSON.parse(setting.value);
  } catch {
    return [];
  }
}

async function saveTickets(tickets: any[]) {
  await prisma.systemSetting.upsert({
    where: { key: "support_tickets" },
    update: { value: JSON.stringify(tickets) },
    create: { key: "support_tickets", value: JSON.stringify(tickets) }
  });
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const userId = verifyToken(token);
    if (!userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { profile: true } 
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const allTickets = await getTickets();

    if (user.role === "ADMIN") {
      // Return all support tickets + student directory for mentor assignment
      const students = await prisma.user.findMany({
        where: { role: "USER" },
        include: { profile: true },
        orderBy: { createdAt: "desc" }
      });

      const studentRoster = students.map(s => {
        const edu = s.profile?.educationLevel || "university";
        let expLevel = s.profile?.experienceLevel;
        if (!expLevel || expLevel === "beginner") {
          if (edu === "working") expLevel = "professional";
          else if (edu === "university") expLevel = "intermediate";
          else expLevel = "beginner";
        }
        return {
          id: s.id,
          name: s.name,
          email: s.email,
          educationLevel: edu,
          experienceLevel: expLevel,
          targetRole: s.profile?.targetRole || (s.profile?.interests?.[0] ? `${s.profile.interests[0]} Specialist` : "Software Engineering"),
          interests: s.profile?.interests || ["Software Engineering", "AI Systems"],
          skills: s.profile?.skills || ["Problem Solving", "Digital Fundamentals"],
          mentorshipStatus: s.profile?.onboardingIntent || "mentorship_requested"
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          tickets: allTickets,
          students: studentRoster
        }
      });
    } else {
      // Regular user: return only their tickets & mentor status
      const myTickets = allTickets.filter(t => t.userId === user.id || t.userEmail === user.email);
      return NextResponse.json({
        success: true,
        data: {
          tickets: myTickets,
          mentorshipStatus: user.profile?.onboardingIntent || "self_directed",
          experienceLevel: user.profile?.experienceLevel || "beginner"
        }
      });
    }
  } catch (error) {
    console.error("Support API GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const userId = verifyToken(token);
    if (!userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { subject, category, message } = await request.json();
    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message required" }, { status: 400 });
    }

    const tickets = await getTickets();
    const newTicket = {
      id: `ticket-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      subject,
      category: category || "General Help Desk",
      message,
      status: "open",
      createdAt: new Date().toISOString()
    };

    tickets.unshift(newTicket);
    await saveTickets(tickets);

    return NextResponse.json({ success: true, data: newTicket }, { status: 201 });
  } catch (error) {
    console.error("Support API POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const adminId = verifyToken(token);
    if (!adminId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin authorization required." }, { status: 403 });
    }

    const { action, ticketId, newStatus, studentId, assignedMentor } = await request.json();

    if (action === "update_ticket") {
      const tickets = await getTickets();
      const idx = tickets.findIndex(t => t.id === ticketId);
      if (idx !== -1) {
        tickets[idx].status = newStatus || "resolved";
        await saveTickets(tickets);
      }
      return NextResponse.json({ success: true });
    } 
    
    if (action === "assign_mentor") {
      if (!studentId || !assignedMentor) {
        return NextResponse.json({ error: "Student ID and Mentor Name required" }, { status: 400 });
      }

      await prisma.userProfile.upsert({
        where: { userId: studentId },
        update: { onboardingIntent: `mentor_assigned:${assignedMentor}` },
        create: {
          userId: studentId,
          experienceLevel: "beginner",
          onboardingIntent: `mentor_assigned:${assignedMentor}`,
          onboardingCompleted: true
        }
      });

      return NextResponse.json({ success: true, mentor: assignedMentor });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Support API PUT Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
