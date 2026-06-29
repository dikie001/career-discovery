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
          messages: messages,
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
    const prompt = `Based on the following user profile and available careers, provide personalized career recommendations:

User Profile:
- Interests: ${userProfile.interests.join(", ") || "Not specified"}
- Skills: ${userProfile.skills.join(", ") || "Not specified"}
- Experience Level: ${userProfile.experienceLevel}
- Target Role: ${userProfile.targetRole || "Exploring options"}

Available Careers:
${availableCareers.map((c) => `- ${c.title}: ${c.description}`).join("\n")}

Please provide 2-3 specific career recommendations with reasons why they match the user's profile.`;

    const messages: GroqMessage[] = [
      {
        role: "user",
        content: prompt,
      },
    ];

    return this.chat(messages);
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
    const prompt = `Based on the following user profile and available courses, recommend the best learning path:

User Profile:
- Interests: ${userProfile.interests.join(", ") || "Not specified"}
- Skills: ${userProfile.skills.join(", ") || "Not specified"}
- Experience Level: ${userProfile.experienceLevel}
- Target Role: ${userProfile.targetRole || "General exploration"}

Available Courses:
${availableCourses.map((c) => `- ${c.title} (${c.level}): ${c.description}`).join("\n")}

Please recommend 3-4 courses that would best help this user progress towards their goals, and explain why each course is recommended.`;

    const messages: GroqMessage[] = [
      {
        role: "user",
        content: prompt,
      },
    ];

    return this.chat(messages);
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
    const systemContext = `You are Pathfinder AI, a helpful career guidance assistant. You help users discover suitable careers and learning paths based on their interests and skills. 

User Profile:
- Interests: ${userProfile.interests.join(", ") || "Not specified"}
- Skills: ${userProfile.skills.join(", ") || "Not specified"}
- Experience Level: ${userProfile.experienceLevel}
- Target Role: ${userProfile.targetRole || "Exploring options"}

Be friendly, encouraging, and specific in your recommendations. Keep responses concise but informative.`;

    const messages: GroqMessage[] = [
      ...conversationHistory,
      {
        role: "user",
        content: `Context: ${systemContext}\n\nQuestion: ${question}`,
      },
    ];

    return this.chat(messages);
  }

  async generateSkillGaps(
    targetRole: string,
    currentSkills: string[]
  ): Promise<string> {
    const prompt = `Analyze the skill gaps for someone wanting to become a ${targetRole} with the following current skills: ${currentSkills.join(", ") || "None specified"}.

Provide:
1. Key skills needed for the role
2. Skills they already have (if any)
3. Critical skill gaps to address
4. Suggested learning order`;

    const messages: GroqMessage[] = [
      {
        role: "user",
        content: prompt,
      },
    ];

    return this.chat(messages);
  }

  async generateRoadmap(
    targetRole: string,
    currentSkills: string[],
    timelineWeeks: number = 12
  ): Promise<string> {
    const prompt = `Create a ${timelineWeeks}-week learning roadmap for someone to transition to a ${targetRole} role, given they currently have these skills: ${currentSkills.join(", ") || "None"}.

Format the roadmap as:
- Week 1-3: [Goals]
- Week 4-6: [Goals]
- Week 7-9: [Goals]
- Week 10-12: [Goals]

Include specific resources and milestones.`;

    const messages: GroqMessage[] = [
      {
        role: "user",
        content: prompt,
      },
    ];

    return this.chat(messages);
  }
}

export const groqService = new GroqService();
