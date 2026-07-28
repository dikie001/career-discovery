const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.roadmapEdge.deleteMany({});
  await prisma.roadmapNode.deleteMany({});
  await prisma.roadmap.deleteMany({});
  console.log('Cleared roadmaps!');
}

main().then(() => prisma.$disconnect());
