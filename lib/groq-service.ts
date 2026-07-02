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

COMMUNICATION STYLE & CHAT ROUTING:
- Keep responses concise but thorough (2-3 paragraphs maximum)
- Use examples and real-world scenarios when helpful
- Break complex topics into clear, digestible points
- Ask clarifying questions when user intent is unclear
- Use positive framing even when discussing challenges
- Format responses in clean, minimal, professional markdown
- Use proper markdown formatting with headers, lists, and emphasis
- CASUAL CHAT & PLEASANTRIES: You must be able to hold friendly, casual conversations (e.g. greetings like "hey", "hello", "how are you?", or general pleasantries). Keep casual replies extremely short and polite (1-2 sentences maximum), and gently guide the user back to the app's main features (career guidance and learning roadmaps) without outputting any recommendations, lists, or JSON buttons. Only suggest careers or courses when explicitly requested or when career goals are discussed.

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

IMPORTANT: You have access to the user's profile data (interests, skills, experience level, target role). USE THIS DATA instead of asking redundant questions. Only ask for additional clarification if needed for specificity.

INSTRUCTIONS ON PRESENTING SUGGESTIONS (CRITICAL):
1. WHEN SUGGESTING CAREERS (including in the initial greeting, or in response to a request for matches or careers):
   - You MUST NOT list or suggest multiple careers at once.
   - Present exactly ONE career suggestion at a time.
   - For each suggestion, provide:
     - The career title (e.g., "Software Engineer")
     - Why it matches the user's profile
     - Key skills needed and gap analysis
     - Salary range (KES if Kenya, USD otherwise) and timeline
     - The first action-oriented step
   - Ask the user to click the "Next Career" button to see the next suggestion.
   - Append a JSON options block at the very end of your response to render the "Next" button:
     \`\`\`json
     {
       "options": [
         {
           "id": "next_career",
           "label": "Next Career",
           "description": "View the next career recommendation"
         }
       ]
     }
     \`\`\`
   - When the user asks for the next suggestion (e.g., sends "Next Career" or "Next"), check the conversation history to see which careers you already suggested, and suggest the NEXT matching career path.
   - Recommend a maximum of 3 careers. On the 3rd (final) career suggestion, do not include the "Next Career" button or ask the user to click it. Instead, conclude the list and ask if they would like to see course/learning path recommendations for any of these.

2. WHEN SUGGESTING COURSES OR LEARNING ROADS (including in response to "Create a personalized learning roadmap" or similar):
   - You MUST NOT list or suggest multiple courses/milestones at once.
   - Present exactly ONE course suggestion at a time.
   - For each course, provide:
     - Course name and provider/difficulty
     - How it fills a gap or advances their goal
     - Duration and estimated timeframe
     - Key outcomes (what they will build or do)
   - Ask the user to click the "Next Course" button to see the next suggestion.
   - Append a JSON options block at the very end of your response to render the "Next" button:
     \`\`\`json
     {
       "options": [
         {
           "id": "next_course",
           "label": "Next Course",
           "description": "View the next course recommendation"
         }
       ]
     }
     \`\`\`
   - When the user asks for the next suggestion (e.g., sends "Next Course" or "Next"), check the conversation history to see which courses you already suggested, and suggest the NEXT matching course.
   - Recommend a maximum of 4 courses. On the 4th (final) course suggestion, do not include the "Next Course" button or ask the user to click it. Instead, conclude the roadmap.`;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || "";
    if (!this.apiKey) {
      console.warn("GROQ_API_KEY not set in environment variables");
    }
  }

  async chat(messages: GroqMessage[], personality: string = "mentor"): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error("GROQ_API_KEY is not configured");
      }

      const personalityPrompts: Record<string, string> = {
        mentor: `YOUR PERSONALITY: Expert Mentor (Default). You are professional, structured, data-driven, balanced, and encouraging. Focus on providing detailed, well-founded career advice, structured roadmaps, and career growth trajectories.`,
        coach: `YOUR PERSONALITY: Warm Career Coach. You are highly empathetic, conversational, warm, and friendly. Focus on user motivation, soft skills, confidence building, and work-life balance. Use a warmer tone, encouraging words, and helpful emojis.`,
        analyst: `YOUR PERSONALITY: Direct Analyst. You are straight-to-the-point, highly analytical, objective, and data-focused. Skip long introductions and pleasantries. Focus heavily on market demand statistics, salary numbers, concrete skill gaps, and ROI of career moves.`,
        pivot: `YOUR PERSONALITY: Creative Career Pivoter. You are creative, out-of-the-box, and focused on transition. Specialize in identifying transferable skills, alternative/non-linear paths, and creative routes to break into new industries. Encouraging and strategic about pivoting.`
      };

      const selectedPersonalityPrompt = personalityPrompts[personality.toLowerCase()] || personalityPrompts.mentor;
      const fullSystemPrompt = `${this.systemPrompt}\n\n${selectedPersonalityPrompt}`;

      const payload = {
        model: this.model,
        messages: [
          {
            role: "system" as const,
            content: fullSystemPrompt,
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
    conversationHistory: GroqMessage[] = [],
    personality: string = "mentor"
  ): Promise<string> {
    // Build user context from their profile
    const userContext = `User Profile (from signup):
- Interests: ${userProfile.interests.join(", ") || "Not yet specified"}
- Current Skills: ${userProfile.skills.join(", ") || "Not yet specified"}
- Experience Level: ${userProfile.experienceLevel || "Not specified"}
- Target Role: ${userProfile.targetRole || "Open to suggestions"}

IMPORTANT: Do NOT ask the user questions about their interests, skills, or experience level - you already have this information from their signup. Use this data to provide personalized recommendations directly.`;

    // For very first message, provide a warm greeting and ask if they want career guidance
    if (conversationHistory.length === 0) {
      const initialMessage = `${userContext}

Greet the user warmly and introduce yourself as Pathfinder AI.
1. Acknowledge their profile (interests and skills from signup) in a very friendly, polite, conversational way (e.g. "I see you are interested in Javascript and have skills in App Development...").
2. Ask them if they would like to explore some personalized career recommendations based on their profile, or if they have a specific question.
3. Provide a JSON options block at the end with two options: "Explore Careers" and "Ask a Question". Do not suggest any specific career path yet. Format:
   \`\`\`json
   {
     "options": [
       {
         "id": "explore_careers",
         "label": "Explore Careers",
         "description": "Show career matches for my profile"
       },
       {
         "id": "ask_question",
         "label": "Ask a Question",
         "description": "I have a specific question to ask"
       }
     ]
   }
   \`\`\`

Keep it conversational, warm, brief, and action-oriented.`;

      return this.chat([
        {
          role: "user",
          content: initialMessage,
        },
      ], personality);
    }

    // Guide the AI model if user clicked "Next Career" or "Next Course" or used specific phrases
    let userMessageContent = `${userContext}\n\nUser's question: ${question}`;

    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion === "next career") {
      userMessageContent += `\n\n(System: The user has clicked "Next Career". Please identify the careers suggested so far from the chat history. Provide the next (second or third) career recommendation from their matches in the exact same format, ask the user to click "Next Career", and include the "Next Career" JSON block. If this is the 3rd career path, it will be the last one, so do not include a "Next Career" option or ask the user to click Next. Instead, conclude and offer to help them with courses/roadmaps.)`;
    } else if (lowerQuestion === "next course") {
      userMessageContent += `\n\n(System: The user has clicked "Next Course". Please identify the courses suggested so far from the chat history. Provide the next recommended course in their learning roadmap in the exact same format, ask the user to click "Next Course", and include the "Next Course" JSON block. If this is the 4th course, it is the last one, so do not include a "Next Course" option or ask the user to click Next. Instead, conclude.)`;
    } else if (
      lowerQuestion.includes("explore career") ||
      lowerQuestion.includes("explore_careers") ||
      lowerQuestion.includes("career match") ||
      lowerQuestion.includes("top career paths") ||
      (lowerQuestion.includes("career") && lowerQuestion.includes("recommend"))
    ) {
      userMessageContent += `\n\n(System: The user is requesting career matches/suggestions. Suggest ONLY the FIRST career recommendation right now. Do not list multiple careers. Provide details, ask them to click "Next Career" to see more, and append the "Next Career" JSON options block.)`;
    } else if (
      lowerQuestion.includes("learning roadmap") ||
      lowerQuestion.includes("courses to study") ||
      (lowerQuestion.includes("course") && lowerQuestion.includes("recommend"))
    ) {
      userMessageContent += `\n\n(System: The user is requesting course recommendations or a learning roadmap. Suggest ONLY the FIRST course suggestion right now. Do not list multiple courses. Provide details, ask them to click "Next Course" to see the next, and append the "Next Course" JSON options block.)`;
    }

    const messages: GroqMessage[] = [
      ...conversationHistory,
      {
        role: "user",
        content: userMessageContent,
      },
    ];

    return this.chat(messages, personality);
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
    const prompt = `The user "${userName}" is starting their career discovery journey. You have access to their profile data. Greet them warmly and invite them to ask questions or explore career opportunities. Keep it conversational and minimal.`;

    return this.chat([{ role: "user", content: prompt }]);
  }
}

export const groqService = new GroqService();
