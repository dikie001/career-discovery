import { Career, Course } from "./types";

interface GroqMessage {
  role: "user" | "assistant";
  content: string;
}

interface GroqResponseChoice {
  message: {
    content: string;
  };
}

interface GroqResponse {
  choices: GroqResponseChoice[];
}

class GroqService {
  private apiKey: string;
  private baseURL: string = "https://api.groq.com/openai/v1";
  private model: string = "mixtral-8x7b-32768";

  private systemPrompt = `You are Pathfinder AI, an expert career guidance and mentoring assistant. Your role is to help users discover suitable careers, develop skills, and create actionable learning paths.

KEY PERSONALITY TRAITS:
- Encouraging and supportive: Celebrate user progress and potential
- Practical and specific: Give concrete recommendations with rationale
- Adaptable: Respond to different experience levels (beginners, intermediate, advanced)
- Data-driven: Reference user interests, skills, and experience in recommendations
- Action-oriented: Always suggest next steps and specific resources

YOUR EXPERTISE AREAS:
1. Career Discovery: Help users identify roles matching their interests and skills
2. Skill Gap Analysis: Identify what skills are needed vs. what they have
3. Learning Paths: Create structured learning journeys with milestones
4. Industry Insights: Explain salary ranges, job market trends, and career trajectories
5. Soft Skills: Help develop communication, leadership, and teamwork abilities
6. Transition Planning: Guide career pivots and professional growth

COMMUNICATION STYLE:
- Keep responses concise but thorough (2-3 paragraphs maximum)
- Use examples and real-world scenarios when helpful
- Break complex topics into clear, digestible points
- Ask clarifying questions when user intent is unclear
- Use positive framing even when discussing challenges

RECOMMENDATIONS SHOULD INCLUDE:
- Why it matches the user's profile
- Timeframe and effort required
- Specific next steps
- Potential salary or growth outcomes
- Resources to explore

When users ask about specific career paths, provide:
1. What the role entails
2. Required vs. nice-to-have skills
3. Career progression options
4. Industry salary ranges (if in Kenya, use KES; otherwise USD)
5. Companies/industries hiring for this role`;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || "";
    if (!this.apiKey) {
      console.warn("GROQ_API_KEY not set in environment variables");
    }
  }

  async chat(messages: GroqMessage[]): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system" as const,
              content: this.systemPrompt,
            },
            ...messages,
          ],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Groq API error:", error);
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data: GroqResponse = await response.json();
      return data.choices[0]?.message.content || "Unable to generate response";
    } catch (error) {
      console.error("Error calling Groq API:", error);
      throw error;
    }
  }

  async generateCareerRecommendations(
    userProfile: {
      interests: string[];
      skills: string[];
      experienceLevel: string;
      targetRole?: string;
    },
    availableCareers: Career[]
  ): Promise<string> {
    const prompt = `Based on this user's profile, recommend the top 3-4 career paths from the available options:

USER PROFILE:
- Interests: ${userProfile.interests.join(", ")}
- Current Skills: ${userProfile.skills.join(", ")}
- Experience Level: ${userProfile.experienceLevel}
- Target Role Interest: ${userProfile.targetRole || "Open to suggestions"}

AVAILABLE CAREERS:
${availableCareers.slice(0, 10).map((c) => `- ${c.title}: ${c.description}`).join("\n")}

For each recommendation provide:
1. Career name and why it matches their profile
2. Required vs. their current skills (gap analysis)
3. Typical salary range and growth trajectory
4. Realistic timeline to transition into this role
5. First concrete step they should take

Be specific and encouraging. Consider their experience level when recommending.`;

    return this.chat([{ role: "user", content: prompt }]);
  }

  async generateCourseRecommendations(
    userProfile: {
      interests: string[];
      skills: string[];
      experienceLevel: string;
      targetRole?: string;
    },
    availableCourses: Course[]
  ): Promise<string> {
    const prompt = `Create a personalized learning path for this user. Recommend 4-5 specific courses in priority order:

USER PROFILE:
- Interests: ${userProfile.interests.join(", ")}
- Current Skills: ${userProfile.skills.join(", ")}
- Experience Level: ${userProfile.experienceLevel}
- Goal: ${userProfile.targetRole || "General career development"}

AVAILABLE COURSES:
${availableCourses.slice(0, 15).map((c) => `- ${c.title} (${c.level}, ${c.duration}h): ${c.description}`).join("\n")}

For each course provide:
1. Course name and why it's recommended
2. How it fills a skill gap or advances them toward their goal
3. Estimated time commitment and difficulty
4. What they'll be able to do after completing it
5. Prerequisite knowledge (if any)

Arrange in learning order - easy fundamentals first, then progressively more advanced skills.`;

    return this.chat([{ role: "user", content: prompt }]);
  }

  async answerCareerQuestion(
    userProfile: {
      interests: string[];
      skills: string[];
      experienceLevel: string;
      targetRole?: string;
    },
    question: string,
    conversationHistory: GroqMessage[] = []
  ): Promise<string> {
    const userContext = `User Profile:
- Interests: ${userProfile.interests.join(", ") || "Not specified"}
- Current Skills: ${userProfile.skills.join(", ") || "Exploring"}
- Experience Level: ${userProfile.experienceLevel}
- Target Role: ${userProfile.targetRole || "Exploring options"}

Tailor your response to this specific user's background and goals. If they're a beginner, use simpler language and more foundational concepts. If they're advanced, go deeper into strategy and nuance.`;

    const messages: GroqMessage[] = [
      ...conversationHistory,
      {
        role: "user",
        content: `${userContext}\n\nQuestion: ${question}`,
      },
    ];

    return this.chat(messages);
  }

  async generateSkillGaps(
    targetRole: string,
    currentSkills: string[]
  ): Promise<string> {
    const prompt = `Conduct a skill gap analysis for someone wanting to become a "${targetRole}":

Current Skills: ${currentSkills.length > 0 ? currentSkills.join(", ") : "No specific skills yet - complete beginner"}

Provide a detailed analysis with:
1. Essential skills required for this role (must-haves)
2. High-value skills that differentiate top performers (nice-to-haves)
3. Soft skills that are critical
4. Which of their current skills are transferable/valuable
5. Biggest gaps to address first
6. Estimated timeline to competency
7. Learning resources or career paths to acquire these skills

Be realistic about effort and timeline. For beginners, suggest a 3-6 month intensive plan. For experienced professionals, suggest specialization areas.`;

    return this.chat([{ role: "user", content: prompt }]);
  }

  async generateRoadmap(
    targetRole: string,
    currentSkills: string[],
    timelineWeeks: number = 12
  ): Promise<string> {
    const prompt = `Create a concrete, actionable ${timelineWeeks}-week learning roadmap to transition into a "${targetRole}" role.

Starting Point: ${currentSkills.length > 0 ? currentSkills.join(", ") : "Complete beginner"}

Structure the roadmap as:

**PHASE 1 (Weeks 1-3): Foundations**
- Key learning objectives
- Specific resources and courses
- Practical exercise or project
- Success metrics

**PHASE 2 (Weeks 4-6): Building Skills**
- Intermediate competencies to develop
- Hands-on projects and practice
- Industry tools to learn
- Milestones to complete

**PHASE 3 (Weeks 7-9): Specialization**
- Advanced topics relevant to the role
- Real-world application projects
- Portfolio building
- Networking activities

**PHASE 4 (Weeks 10-${timelineWeeks}): Job Readiness**
- Interview preparation
- Resume and portfolio optimization
- Application strategy
- Final checklist

Include:
- Time commitment per week
- Specific resources (courses, platforms, books)
- Measurable outcomes for each phase
- Realistic salary expectations after completing roadmap`;

    return this.chat([{ role: "user", content: prompt }]);
  }
}

export const groqService = new GroqService();
