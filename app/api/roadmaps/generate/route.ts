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

    // Update user profile target role immediately so skill gaps, reports, and roadmaps align to this specialization
    await prisma.userProfile.upsert({
      where: { userId },
      update: { targetRole: careerTitle },
      create: {
        userId,
        targetRole: careerTitle,
        interests: [],
        skills: [],
        certificates: [],
        projects: [],
        achievements: [],
        experienceLevel: "beginner",
      },
    });

    // 2. CHECK DATABASE SEED/CACHE: Does a roadmap for this career already exist in the database?
    const existingCareer = await prisma.career.findFirst({
      where: { title: { equals: careerTitle, mode: "insensitive" } },
      include: { roadmaps: { include: { nodes: true } } }
    });

    const existingRoadmap = await prisma.roadmap.findFirst({
      where: {
        OR: [
          { title: { equals: careerTitle, mode: "insensitive" } },
          { title: { equals: `${careerTitle} Roadmap`, mode: "insensitive" } },
          { career: { title: { equals: careerTitle, mode: "insensitive" } } }
        ]
      },
      include: { nodes: true }
    });

    // If a populated roadmap exists in DB, instantly reuse the seeded curriculum without invoking AI!
    const targetRoadmapId = (existingRoadmap && existingRoadmap.nodes.length > 0)
      ? existingRoadmap.id
      : (existingCareer && existingCareer.roadmaps.length > 0 && existingCareer.roadmaps[0].nodes.length > 0)
        ? existingCareer.roadmaps[0].id
        : null;

    if (targetRoadmapId) {
      await prisma.userRoadmap.upsert({
        where: { userId_roadmapId: { userId, roadmapId: targetRoadmapId } },
        update: {},
        create: {
          userId,
          roadmapId: targetRoadmapId,
          status: "in_progress",
        }
      });
      
      return NextResponse.json({ roadmapId: targetRoadmapId });
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

    // 4. THE MAGIC: Call Groq with model fallback retry & high-quality curated curriculums
    let content: {
      nodes: Array<{ id: string; title: string; description: string; type: string; isRoot?: boolean }>;
      edges: Array<{ sourceId: string; targetId: string }>;
    } | null = null;

    const modelsToTry = ["llama-3.3-70b-versatile", "llama3-8b-8192", "mixtral-8x7b-32768"];

    for (const model of modelsToTry) {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: model,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content: `You are an expert technical career advisor. Your job is to generate a realistic, industry-ready, highly granular learning roadmap for a "${careerTitle}" specifically tailored for the Kenyan job market. 
                
                You MUST return ONLY a valid JSON object. Do not include any markdown, explanation, or text outside the JSON.
                
                CRITICAL INSTRUCTIONS FOR NODE CONTENT:
                1. DO NOT use generic category names like 'Core Fundamentals' or 'Advanced Methodologies'. 
                2. You MUST generate highly specific, granular technologies, languages, frameworks, or tools as the node titles (e.g., HTML5, CSS3, Tailwind CSS, JavaScript ES6, React.js, Node.js, Express.js, MongoDB, PostgreSQL, Git/GitHub, Figma, etc.).
                3. In the "description" field, you MUST recommend specific learning platforms (e.g., "Recommended: Udemy, Coursera, freeCodeCamp, Codecademy, or specific YouTube channels").
                4. ABSOLUTELY NO EMOJIS in the node titles or descriptions. Only use plain text.
                
                The JSON must follow this exact structure:
                {
                  "nodes": [
                    { "id": "1", "title": "HTML5 & Semantic Web", "description": "Master document structure and accessibility. Recommended: freeCodeCamp or Udemy.", "type": "skill", "isRoot": true },
                    { "id": "2", "title": "Tailwind CSS", "description": "Learn utility-first styling. Recommended: Official Docs & YouTube.", "type": "skill" },
                    { "id": "3", "title": "Fullstack Capstone", "description": "Build a real-world MERN app to prove competence.", "type": "project" }
                  ],
                  "edges": [
                    { "sourceId": "1", "targetId": "2" },
                    { "sourceId": "2", "targetId": "3" }
                  ]
                }
                
                Rules:
                1. Generate exactly 8 to 11 nodes forming a logical, granular technical progression.
                2. "id" must be a simple string number ("1", "2", etc.).
                3. "type" must be exactly one of: "milestone", "skill", "career_opportunity", or "project".
                4. Only one node should have "isRoot": true.
                5. Ensure the edges connect the nodes logically using the IDs.`
              }
            ],
            temperature: 0.3
          })
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const parsed = JSON.parse(groqData.choices[0].message.content);
          if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges) && parsed.nodes.length >= 5) {
            content = parsed;
            break;
          }
        }
      } catch (err) {
        console.warn(`Roadmap generation attempt with model ${model} failed:`, err);
      }
    }

    if (!content) {
      console.warn("AI generation fallback triggered for career:", careerTitle);
      if (careerTitle.toLowerCase().includes("software") || careerTitle.toLowerCase().includes("developer") || careerTitle.toLowerCase().includes("engineer") || careerTitle.toLowerCase().includes("programming") || careerTitle.toLowerCase().includes("tech")) {
        content = {
          nodes: [
            { id: "1", title: "Git & Version Control Fundamentals", description: "Master source code management, branching, pull requests, and collaborative workflows. Recommended: GitHub Documentation & freeCodeCamp.", type: "skill", isRoot: true },
            { id: "2", title: "HTML5 & Modern Responsive CSS3", description: "Learn semantic DOM architecture, accessibility standards, and modern layout systems like CSS Grid and Flexbox. Recommended: MDN Web Docs & Kevin Powell YouTube.", type: "skill" },
            { id: "3", title: "JavaScript ES6+ & TypeScript", description: "Deep dive into asynchronous JavaScript, promises, strong typing, interfaces, and DOM manipulation. Recommended: Udemy & Official TypeScript Handbook.", type: "skill" },
            { id: "4", title: "React & Next.js Framework Architecture", description: "Build high-performance interactive web interfaces using React Server Components, routing, and state management. Recommended: Frontend Masters & Official Next.js Learn.", type: "milestone" },
            { id: "5", title: "Node.js & Express RESTful API Engineering", description: "Develop robust backend microservices, JWT authentication protocols, error handling, and modular routing. Recommended: Coursera & Traversy Media.", type: "skill" },
            { id: "6", title: "PostgreSQL & Prisma ORM Database Design", description: "Design scalable relational schema models, optimize complex SQL queries, and integrate robust TypeScript ORMs. Recommended: SQLZoo & Prisma Guides.", type: "skill" },
            { id: "7", title: "Docker Containerization & CI/CD Pipelines", description: "Containerize multi-service fullstack environments and deploy automated testing and continuous integration workflows. Recommended: Docker Labs & GitHub Actions Docs.", type: "milestone" },
            { id: "8", title: "Cloud Infrastructure Deployments (AWS / Vercel)", description: "Configure production web security, SSL certificates, load balancing, and automated serverless cloud hosting. Recommended: AWS Training & Vercel Docs.", type: "skill" },
            { id: "9", title: "Enterprise Fullstack E-Commerce Capstone", description: "Architect and deploy an end-to-end production SaaS platform complete with payment integration and live performance monitoring to prove industry competence.", type: "project" }
          ],
          edges: [
            { sourceId: "1", targetId: "2" },
            { sourceId: "2", targetId: "3" },
            { sourceId: "3", targetId: "4" },
            { sourceId: "4", targetId: "5" },
            { sourceId: "5", targetId: "6" },
            { sourceId: "6", targetId: "7" },
            { sourceId: "7", targetId: "8" },
            { sourceId: "8", targetId: "9" }
          ]
        };
      } else if (careerTitle.toLowerCase().includes("data") || careerTitle.toLowerCase().includes("analyst") || careerTitle.toLowerCase().includes("scientist")) {
        content = {
          nodes: [
            { id: "1", title: "Statistical Analysis & Applied Mathematics", description: "Master linear algebra, descriptive & inferential statistics, and probability distributions. Recommended: Khan Academy & Coursera.", type: "skill", isRoot: true },
            { id: "2", title: "Python Programming & Data Structures", description: "Learn core Python syntax, algorithms, virtual environments, and modular script architecture. Recommended: freeCodeCamp & Real Python.", type: "skill" },
            { id: "3", title: "SQL for Advanced Data Analytics", description: "Write complex analytical SQL queries involving joins, window functions, and indexing. Recommended: Mode Analytics & SQLZoo.", type: "skill" },
            { id: "4", title: "Data Manipulation with Pandas & NumPy", description: "Transform, cleanse, and wrangle multi-source tabular and unformatted dataset files efficiently. Recommended: Kaggle Learn & O'Reilly Books.", type: "milestone" },
            { id: "5", title: "Data Visualization & Interactive Dashboarding", description: "Construct insightful visual narratives using Matplotlib, Seaborn, Tableau, and Power BI. Recommended: Udemy & Tableau Official Learn.", type: "skill" },
            { id: "6", title: "Machine Learning with Scikit-Learn", description: "Train, validate, and optimize classification, regression, and clustering predictive algorithms. Recommended: Stanford Online & Coursera ML.", type: "milestone" },
            { id: "7", title: "Production Data Pipeline & Capstone Project", description: "Build an automated ETL pipeline and deploy interactive data prediction dashboards to demonstrate job-readiness.", type: "project" }
          ],
          edges: [
            { sourceId: "1", targetId: "2" },
            { sourceId: "2", targetId: "3" },
            { sourceId: "3", targetId: "4" },
            { sourceId: "4", targetId: "5" },
            { sourceId: "5", targetId: "6" },
            { sourceId: "6", targetId: "7" }
          ]
        };
      } else {
        content = {
          nodes: [
            { id: "1", title: `Core Industry Fundamentals of ${careerTitle}`, description: `Understand theoretical principles, terminology, and standard professional workflows for ${careerTitle}. Recommended: Coursera & edX.`, type: "skill", isRoot: true },
            { id: "2", title: "Industry Standard Tools & Workspace Setup", description: "Configure professional software environments and master essential productivity tools. Recommended: Official Vendor Documentation & YouTube Tutorials.", type: "skill" },
            { id: "3", title: "Applied Technical Methodology & Best Practices", description: "Learn practical techniques for quality assurance, troubleshooting, and efficiency optimization. Recommended: Udemy & LinkedIn Learning.", type: "skill" },
            { id: "4", title: "Intermediate Certification Competency", description: "Achieve verified skill proficiency and prepare for recognized professional certification exams. Recommended: CompTIA / AWS / Official Test Preps.", type: "milestone" },
            { id: "5", title: "Advanced Domain Specialization", description: "Master advanced methodologies, automated tooling, and system integrations required for leadership roles. Recommended: O'Reilly Media & Specialized Masterclasses.", type: "skill" },
            { id: "6", title: "Portfolio Capstone Implementation", description: "Execute an end-to-end real-world case study or production deployment to prove job-readiness to employers.", type: "project" }
          ],
          edges: [
            { sourceId: "1", targetId: "2" },
            { sourceId: "2", targetId: "3" },
            { sourceId: "3", targetId: "4" },
            { sourceId: "4", targetId: "5" },
            { sourceId: "5", targetId: "6" }
          ]
        };
      }
    }

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

    // 6. ENROLL USER IMMEDIATELY
    const userRoadmap = await prisma.userRoadmap.upsert({
      where: { userId_roadmapId: { userId, roadmapId: roadmap.id } },
      update: {},
      create: {
        userId,
        roadmapId: roadmap.id,
        status: "in_progress",
      }
    });

    // 7. Return the roadmap ID to transition the UI
    return NextResponse.json({ roadmapId: roadmap.id });

  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}