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
  private model: string = "openai/gpt-oss-20b";

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
- Format responses in clean, minimal, professional markdown
- Use proper markdown formatting with headers, lists, and emphasis

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
5. Companies/industries hiring for this role

INITIAL DISCOVERY FLOW:
When starting a new conversation about career discovery or recommendations:
1. First, gather basic info: Ask for their name
2. Then ask: What's your current education level? (Provide clear options)
3. Then ask: What are your main interests or passions?
4. Then ask: What's your current experience level? (Beginner/Intermediate/Advanced)
5. Then provide personalized recommendations based on their answers

Ask ONE QUESTION AT A TIME, and format responses minimally and professionally in markdown.`;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || "";
    if (!this.apiKey) {
      console.warn("GROQ_API_KEY not set in environment variables");
    }
  }

  async chat(messages: GroqMessage[]): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error("GROQ_API_KEY is not configured");
      }

      const payload = {
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
      };

      console.log("Sending request to Groq API with model:", this.model);

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (!response.ok) {
        console.error("Groq API error response:", responseText);
        console.error("Response status:", response.status);
        throw new Error(
          `Groq API error: ${response.status} - ${responseText || response.statusText}`
        );
      }

      const data: GroqResponse = JSON.parse(responseText);
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
    // If this is the very first message, ask for their name
    if (conversationHistory.length === 0) {
      return `Hi! I'm excited to help you discover your ideal career path! 👋\n\nTo get started, could you tell me your name?`;
    }

    // Check if we're at a stage where we should offer multiple choice options
    // Count the messages to determine the conversation stage
    const messageCount = conversationHistory.length;

    let promptPrefix = "";
    if (messageCount === 2) {
      // After name, ask about education with options
      promptPrefix = `Now that I know their name, ask them about their education level. Provide the options in a structured format as shown below. Format your response like this:

Your educational background helps me tailor recommendations. What's your highest level of education?

\`\`\`json
{
  "message": "Your educational background helps me tailor recommendations.",
  "options": [
    { "id": "highschool", "label": "High School / Secondary", "description": "Currently in or completed high school" },
    { "id": "bachelor", "label": "Bachelor's Degree", "description": "Completed undergraduate degree" },
    { "id": "master", "label": "Master's Degree", "description": "Completed master's degree" },
    { "id": "phd", "label": "PhD / Postgraduate", "description": "Advanced research qualification" },
    { "id": "selftaught", "label": "Self-taught / Online", "description": "Primarily self-taught or online courses" }
  ]
}
\`\`\`

Only provide the text and JSON, nothing else.`;
    } else if (messageCount === 4) {
      // After education, ask about interests
      promptPrefix = `The user has told us about their education. Now ask about their interests in a structured way with options:

\`\`\`json
{
  "message": "Great! Now I'd like to know what excites you most. What are your primary interests?",
  "options": [
    { "id": "tech", "label": "Technology & Software", "description": "Building apps, coding, automation" },
    { "id": "business", "label": "Business & Entrepreneurship", "description": "Strategy, management, startups" },
    { "id": "creative", "label": "Creative & Design", "description": "Art, design, content creation" },
    { "id": "social", "label": "Social Impact", "description": "Helping people, community work" },
    { "id": "finance", "label": "Finance & Economics", "description": "Money, investments, analysis" },
    { "id": "science", "label": "Science & Research", "description": "Exploration, discovery, data" }
  ]
}
\`\`\``;
    } else if (messageCount === 6) {
      // After interests, ask about experience level
      promptPrefix = `Now ask about their experience level in their chosen interest area:

\`\`\`json
{
  "message": "How would you describe your experience level in this area?",
  "options": [
    { "id": "beginner", "label": "Complete Beginner", "description": "Just starting out in this area" },
    { "id": "intermediate", "label": "Intermediate", "description": "Some knowledge and experience" },
    { "id": "advanced", "label": "Advanced", "description": "Significant experience and skills" }
  ]
}
\`\`\``;
    } else if (messageCount >= 8) {
      // After gathering info, provide recommendations
      promptPrefix = `Based on all the information gathered, now provide 3 personalized career recommendations. Be concise and actionable. Format as markdown with the recommendations clearly structured.`;
    }

    // Build a better context message
    const userContext = `User Profile:
- Interests: ${userProfile.interests.join(", ") || "Not yet specified"}
- Current Skills: ${userProfile.skills.join(", ") || "Not yet specified"}
- Experience Level: ${userProfile.experienceLevel || "Not specified"}
- Target Role: ${userProfile.targetRole || "Exploring options"}

${promptPrefix}

Remember:
1. Be conversational and encouraging
2. When providing options, use ONLY the JSON format shown
3. Keep messages concise and focused
4. Ask ONE question at a time`;

    const messages: GroqMessage[] = [
      ...conversationHistory,
      {
        role: "user",
        content: `${userContext}\n\nUser message: ${question}`,
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

  async startCareerDiscovery(userName: string): Promise<string> {
    const prompt = `A new user named "${userName}" wants to discover suitable career paths for them.
    
Ask them: "What's your highest level of education?" and provide these clear options in markdown format with a numbered list:
1. High School / Secondary
2. Bachelor's Degree
3. Master's Degree
4. PhD / Postgraduate
5. Self-taught / Online Courses
6. No formal education yet

Format the response minimally and professionally. Ask only this one question for now.`;

    return this.chat([{ role: "user", content: prompt }]);
  }

  async askEducationLevel(): Promise<string> {
    const prompt = `Ask the user about their education level with these options clearly presented in markdown format:
    
1. High School / Secondary
2. Bachelor's Degree
3. Master's Degree  
4. PhD / Postgraduate
5. Self-taught / Online Courses
6. No formal education yet

Keep it professional and minimal.`;

    return this.chat([{ role: "user", content: prompt }]);
  }

  async askInterestsAndSkills(
    educationLevel: string,
    conversationHistory: GroqMessage[] = []
  ): Promise<string> {
    const prompt = `User's education level: ${educationLevel}

Now ask them: "What are your main interests or passions?" with some examples they can relate to (tech, business, creative, social impact, etc.). Keep it conversational, minimal, and professional in markdown format.`;

    const messages: GroqMessage[] = [
      ...conversationHistory,
      {
        role: "user",
        content: prompt,
      },
    ];

    return this.chat(messages);
  }

  async askExperienceLevel(
    interests: string,
    conversationHistory: GroqMessage[] = []
  ): Promise<string> {
    const prompt = `User's interests: ${interests}

Now ask them: "What's your current experience level in your field of interest?" with these clear options in markdown:
1. Complete Beginner (just starting out)
2. Intermediate (some knowledge/projects)
3. Advanced (extensive experience)

Keep responses minimal and professional.`;

    const messages: GroqMessage[] = [
      ...conversationHistory,
      {
        role: "user",
        content: prompt,
      },
    ];

    return this.chat(messages);
  }

  async generatePersonalizedRecommendations(
    userName: string,
    educationLevel: string,
    interests: string,
    experienceLevel: string,
    conversationHistory: GroqMessage[] = []
  ): Promise<string> {
    const prompt = `Based on the following user profile, provide 3-4 personalized career recommendations:

**User Profile:**
- Name: ${userName}
- Education Level: ${educationLevel}
- Interests: ${interests}
- Experience Level: ${experienceLevel}

For each recommendation, provide:
1. **Career Title** - Clear and specific
2. **Why It Fits** - Brief explanation based on their profile
3. **Key Skills Needed** - 3-4 essential skills
4. **Timeline** - Realistic timeframe to enter this role
5. **Next Steps** - 2-3 immediate actions

Format in clean, minimal, professional markdown. Be encouraging and specific.`;

    const messages: GroqMessage[] = [
      ...conversationHistory,
      {
        role: "user",
        content: prompt,
      },
    ];

    return this.chat(messages);
  }
}

export const groqService = new GroqService();
