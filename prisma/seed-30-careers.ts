import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const diverseCareers = [
  // --- TECH & COMPUTER SCIENCE (Heavy focus) ---
  {
    title: 'Software Engineer',
    description: 'Design, develop, and test scalable software applications and systems.',
    category: 'Tech',
    salaryMin: 70000,
    salaryMax: 150000,
  },
  {
    title: 'Fullstack Web Developer',
    description: 'Build complete web applications from front-end interfaces to back-end databases.',
    category: 'Tech',
    salaryMin: 65000,
    salaryMax: 140000,
  },
  {
    title: 'Cybersecurity Analyst',
    description: 'Protect organization infrastructure, monitor security breaches, and defend networks.',
    category: 'Tech',
    salaryMin: 75000,
    salaryMax: 155000,
  },
  {
    title: 'Network Engineer',
    description: 'Design, implement, and manage high-performance local and wide-area network systems.',
    category: 'Tech',
    salaryMin: 70000,
    salaryMax: 135000,
  },
  {
    title: 'Cloud Solutions Architect',
    description: 'Oversee cloud computing strategy, adoption, and cloud architecture design.',
    category: 'Tech',
    salaryMin: 110000,
    salaryMax: 195000,
  },
  {
    title: 'Junior Data Analyst',
    description: 'Extract insights from complex datasets using machine learning, statistics, and coding.',
    category: 'Tech',
    salaryMin: 85000,
    salaryMax: 165000,
  },
  {
    title: 'DevOps & SRE Engineer',
    description: 'Automate deployment pipelines, scale infrastructure, and ensure system reliability.',
    category: 'Tech',
    salaryMin: 90000,
    salaryMax: 170000,
  },
  {
    title: 'Mobile App Developer',
    description: 'Build native or cross-platform mobile applications for iOS and Android ecosystems.',
    category: 'Tech',
    salaryMin: 70000,
    salaryMax: 140000,
  },
  {
    title: 'Artificial Intelligence Engineer',
    description: 'Develop machine learning models, neural networks, and generative AI pipelines.',
    category: 'Tech',
    salaryMin: 95000,
    salaryMax: 185000,
  },
  {
    title: 'Database Administrator',
    description: 'Ensure data availability, performance optimization, and secure database storage.',
    category: 'Tech',
    salaryMin: 70000,
    salaryMax: 130000,
  },
  {
    title: 'Systems Analyst',
    description: 'Evaluate business IT systems and recommend enhancements for operational efficiency.',
    category: 'Tech',
    salaryMin: 65000,
    salaryMax: 120000,
  },
  {
    title: 'Blockchain Developer',
    description: 'Build decentralized applications and smart contracts using distributed ledger technology.',
    category: 'Tech',
    salaryMin: 90000,
    salaryMax: 175000,
  },
  {
    title: 'Game Developer',
    description: 'Program game mechanics, physics engines, and interactive virtual environments.',
    category: 'Tech',
    salaryMin: 60000,
    salaryMax: 130000,
  },
  {
    title: 'IT Support Specialist',
    description: 'Troubleshoot hardware, software, and network issues for internal or external users.',
    category: 'Tech',
    salaryMin: 45000,
    salaryMax: 85000,
  },

  // --- CREATIVES & DESIGN ---
  {
    title: 'UI/UX Product Designer',
    description: 'Design intuitive, human-centered digital experiences, wireframes, and interfaces.',
    category: 'Creatives',
    salaryMin: 60000,
    salaryMax: 130000,
  },
  {
    title: 'Graphic Designer',
    description: 'Create visual concepts, brand assets, typography layouts, and marketing materials.',
    category: 'Creatives',
    salaryMin: 45000,
    salaryMax: 90000,
  },
  {
    title: 'Video Editor & Motion Designer',
    description: 'Craft compelling video storytelling, visual effects, and animated graphics.',
    category: 'Creatives',
    salaryMin: 50000,
    salaryMax: 100000,
  },
  {
    title: 'Content Strategist',
    description: 'Plan, create, and manage digital content across channels to drive user engagement.',
    category: 'Creatives',
    salaryMin: 55000,
    salaryMax: 110000,
  },
  {
    title: '3D Artist & Modeler',
    description: 'Build realistic 3D models, textures, and assets for gaming, film, and product visualization.',
    category: 'Creatives',
    salaryMin: 55000,
    salaryMax: 120000,
  },

  // --- BUSINESS & MANAGEMENT ---
  {
    title: 'Product Manager',
    description: 'Define product vision, strategy, and roadmap while collaborating with engineering teams.',
    category: 'Business',
    salaryMin: 80000,
    salaryMax: 160000,
  },
  {
    title: 'Digital Marketing Specialist',
    description: 'Manage SEO, paid advertising campaigns, email marketing, and social media funnels.',
    category: 'Business',
    salaryMin: 50000,
    salaryMax: 100000,
  },
  {
    title: 'Financial Analyst',
    description: 'Evaluate investment opportunities, financial statements, and market trends.',
    category: 'Business',
    salaryMin: 65000,
    salaryMax: 125000,
  },
  {
    title: 'Human Resources Manager',
    description: 'Oversee talent acquisition, employee relations, company culture, and compliance.',
    category: 'Business',
    salaryMin: 60000,
    salaryMax: 120000,
  },
  {
    title: 'Business Development Executive',
    description: 'Identify strategic partnerships, close sales deals, and expand market reach.',
    category: 'Business',
    salaryMin: 60000,
    salaryMax: 130000,
  },
  {
    title: 'Management Consultant',
    description: 'Advise corporate leaders on optimization, restructuring, and profitability strategies.',
    category: 'Business',
    salaryMin: 85000,
    salaryMax: 170000,
  },

  // --- MEDICINE & HEALTHCARE ---
  {
    title: 'Clinical Data Analyst',
    description: 'Analyze medical datasets, clinical trials, and healthcare operational workflows.',
    category: 'Medicine',
    salaryMin: 70000,
    salaryMax: 130000,
  },
  {
    title: 'Healthcare Informatics Specialist',
    description: 'Manage electronic health records (EHR) and optimize medical data technology systems.',
    category: 'Medicine',
    salaryMin: 75000,
    salaryMax: 135000,
  },
  {
    title: 'Biomedical Engineer',
    description: 'Design medical devices, diagnostic equipment, and artificial organs.',
    category: 'Medicine',
    salaryMin: 70000,
    salaryMax: 140000,
  },
  {
    title: 'Registered Nurse',
    description: 'Provide direct patient care, administer treatments, and coordinate healthcare plans.',
    category: 'Medicine',
    salaryMin: 65000,
    salaryMax: 110000,
  },
  {
    title: 'Health Services Manager',
    description: 'Direct medical practices, hospital departments, and healthcare administration frameworks.',
    category: 'Medicine',
    salaryMin: 80000,
    salaryMax: 155000,
  },
];

async function main() {
  console.log('Seeding comprehensive career database...');

  for (const careerData of diverseCareers) {
    let career = await prisma.career.findFirst({
      where: { title: { equals: careerData.title, mode: 'insensitive' } }
    });

    if (!career) {
      career = await prisma.career.create({ data: careerData });
      console.log(`Created career: ${career.title}`);
    }

    // Check if roadmap exists for this career, if not create a default one
    const existingRoadmap = await prisma.roadmap.findFirst({
      where: { careerId: career.id }
    });

    if (!existingRoadmap) {
      const roadmap = await prisma.roadmap.create({
        data: {
          title: `${career.title} Roadmap`,
          description: `Comprehensive step-by-step master path for ${career.title}.`,
          careerId: career.id,
        }
      });

      const n1 = await prisma.roadmapNode.create({ data: { roadmapId: roadmap.id, title: 'Core Fundamentals', description: 'Essential baseline concepts and theories.', type: 'milestone', isRoot: true } });
      const n2 = await prisma.roadmapNode.create({ data: { roadmapId: roadmap.id, title: 'Intermediate Tools & Frameworks', description: 'Practical industry-standard tooling.', type: 'skill' } });
      const n3 = await prisma.roadmapNode.create({ data: { roadmapId: roadmap.id, title: 'Advanced Methodologies', description: 'Advanced problem solving and architectural patterns.', type: 'skill' } });
      const n4 = await prisma.roadmapNode.create({ data: { roadmapId: roadmap.id, title: 'Capstone Portfolio Project', description: 'Demonstrate competency via a real-world project.', type: 'project' } });

      await prisma.roadmapEdge.createMany({
        data: [
          { sourceId: n1.id, targetId: n2.id },
          { sourceId: n2.id, targetId: n3.id },
          { sourceId: n3.id, targetId: n4.id },
        ]
      });
    }
  }

  console.log('Successfully seeded 30 diverse careers and matching roadmaps!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });