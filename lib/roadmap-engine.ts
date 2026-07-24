import { prisma } from "./prisma";

export async function startUserRoadmap(userId: string, roadmapId: string) {
  // Check if already started
  const existing = await prisma.userRoadmap.findUnique({
    where: { userId_roadmapId: { userId, roadmapId } }
  });

  if (existing) {
    return existing;
  }

  // Create UserRoadmap
  const userRoadmap = await prisma.userRoadmap.create({
    data: {
      userId,
      roadmapId,
      status: "in_progress",
    }
  });

  // Find root nodes
  const rootNodes = await prisma.roadmapNode.findMany({
    where: {
      roadmapId,
      isRoot: true,
    }
  });

  // Unlock root nodes
  if (rootNodes.length > 0) {
    await prisma.userRoadmapNode.createMany({
      data: rootNodes.map(node => ({
        userRoadmapId: userRoadmap.id,
        nodeId: node.id,
        status: "available",
      }))
    });
  }

  return userRoadmap;
}

export async function completeNodeAndUnlockNext(userId: string, roadmapId: string, nodeId: string) {
  const userRoadmap = await prisma.userRoadmap.findUnique({
    where: { userId_roadmapId: { userId, roadmapId } },
    include: { progress: true }
  });

  if (!userRoadmap) throw new Error("Roadmap not started by user");

  // Mark node as completed
  const completedNode = await prisma.userRoadmapNode.upsert({
    where: { userRoadmapId_nodeId: { userRoadmapId: userRoadmap.id, nodeId } },
    update: { status: "completed", completedAt: new Date() },
    create: { userRoadmapId: userRoadmap.id, nodeId, status: "completed", completedAt: new Date() }
  });

  // Find edges originating from this node
  const edgesOut = await prisma.roadmapEdge.findMany({
    where: { sourceId: nodeId },
    include: { target: true }
  });

  // Unlock targets
  const unlockedNodes = [];
  for (const edge of edgesOut) {
    // In a real scenario, evaluate edge.condition here if needed.
    // We'll unlock the target node
    
    // Check if target node already unlocked/completed
    const existingProgress = await prisma.userRoadmapNode.findUnique({
       where: { userRoadmapId_nodeId: { userRoadmapId: userRoadmap.id, nodeId: edge.targetId } }
    });

    if (!existingProgress) {
       const newProgress = await prisma.userRoadmapNode.create({
         data: {
           userRoadmapId: userRoadmap.id,
           nodeId: edge.targetId,
           status: "available"
         }
       });
       unlockedNodes.push(newProgress);
    }
  }

  return { completedNode, unlockedNodes };
}
