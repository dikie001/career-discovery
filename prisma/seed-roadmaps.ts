import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding branching roadmaps...');

  // 1. Create a Career if one doesn't exist to link to
  let career = await prisma.career.findFirst({ where: { title: 'Web Developer' } });
  if (!career) {
    career = await prisma.career.create({
      data: {
        title: 'Web Developer',
        description: 'Build web applications and websites.',
        category: 'Engineering',
        salaryMin: 50000,
        salaryMax: 150000,
      }
    });
  }

  // 2. Create the Roadmap
  const roadmap = await prisma.roadmap.create({
    data: {
      title: 'Fullstack Web Developer Roadmap',
      description: 'A comprehensive branching path to becoming a web developer.',
      careerId: career.id,
    }
  });

  // 3. Create Nodes
  const rootNode = await prisma.roadmapNode.create({
    data: {
      roadmapId: roadmap.id,
      title: 'Internet Basics',
      description: 'Understand how the internet works.',
      type: 'milestone',
      isRoot: true,
    }
  });

  const htmlCssNode = await prisma.roadmapNode.create({
    data: {
      roadmapId: roadmap.id,
      title: 'HTML & CSS',
      description: 'Learn the building blocks of the web.',
      type: 'skill',
    }
  });

  const jsNode = await prisma.roadmapNode.create({
    data: {
      roadmapId: roadmap.id,
      title: 'JavaScript Fundamentals',
      description: 'Learn programming concepts with JS.',
      type: 'skill',
    }
  });

  // The Branch!
  const frontendBranchNode = await prisma.roadmapNode.create({
    data: {
      roadmapId: roadmap.id,
      title: 'Frontend Path',
      description: 'Focus on user interfaces.',
      type: 'career_opportunity',
    }
  });

  const backendBranchNode = await prisma.roadmapNode.create({
    data: {
      roadmapId: roadmap.id,
      title: 'Backend Path',
      description: 'Focus on servers and databases.',
      type: 'career_opportunity',
    }
  });

  const reactNode = await prisma.roadmapNode.create({
    data: {
      roadmapId: roadmap.id,
      title: 'React.js',
      description: 'Learn the React library for UI.',
      type: 'course',
    }
  });

  const nodejsNode = await prisma.roadmapNode.create({
    data: {
      roadmapId: roadmap.id,
      title: 'Node.js',
      description: 'Server-side JavaScript.',
      type: 'skill',
    }
  });

  const dbNode = await prisma.roadmapNode.create({
    data: {
      roadmapId: roadmap.id,
      title: 'PostgreSQL Database',
      description: 'Learn relational databases.',
      type: 'skill',
    }
  });

  const finalProject = await prisma.roadmapNode.create({
    data: {
      roadmapId: roadmap.id,
      title: 'Fullstack Application Project',
      description: 'Combine everything into a final project.',
      type: 'project',
    }
  });

  // 4. Create Edges (The Connections)
  await prisma.roadmapEdge.createMany({
    data: [
      { sourceId: rootNode.id, targetId: htmlCssNode.id },
      { sourceId: htmlCssNode.id, targetId: jsNode.id },
      // Branching here
      { sourceId: jsNode.id, targetId: frontendBranchNode.id, label: 'Choose Frontend' },
      { sourceId: jsNode.id, targetId: backendBranchNode.id, label: 'Choose Backend' },
      // Path implementations
      { sourceId: frontendBranchNode.id, targetId: reactNode.id },
      { sourceId: backendBranchNode.id, targetId: nodejsNode.id },
      { sourceId: nodejsNode.id, targetId: dbNode.id },
      // Convergence
      { sourceId: reactNode.id, targetId: finalProject.id },
      { sourceId: dbNode.id, targetId: finalProject.id },
    ]
  });

  console.log('Seed complete! Roadmap created:', roadmap.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
