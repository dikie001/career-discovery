import { prisma } from "@/lib/prisma";

export interface SkillGapItem {
  skill: string;
  status: "completed" | "in_progress" | "missing";
  source?: string;
}

export interface SkillGapAnalysis {
  targetCareer: string;
  requiredSkills: string[];
  userSkills: string[];
  completedFromRoadmap: string[];
  gaps: SkillGapItem[];
  coveragePercent: number;
  activeRoadmapId?: string;
}

function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase();
}

function uniqueSkills(skills: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const skill of skills) {
    const key = normalizeSkill(skill);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(skill.trim());
  }
  return result;
}

export async function analyzeSkillGap(userId: string): Promise<SkillGapAnalysis> {
  const profile = await prisma.userProfile.findUnique({ where: { userId } });

  const latestRecommendation = await prisma.aIRecommendation.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const targetCareer =
    profile?.targetRole?.trim() ||
    latestRecommendation?.title ||
    "Your target career";

  const career = await prisma.career.findFirst({
    where: { title: { equals: targetCareer, mode: "insensitive" } },
    include: {
      roadmaps: {
        include: {
          nodes: true,
        },
      },
    },
  });

  const roadmapSkillNodes =
    career?.roadmaps.flatMap((roadmap) =>
      roadmap.nodes
        .filter((node) => node.type === "skill" || node.type === "milestone")
        .map((node) => node.title)
    ) ?? [];

  const isTechRole = /software|developer|engineer|full stack|web|it|tech|cloud|devops|data|systems/i.test(targetCareer);
  const coreTechMustKnows = isTechRole ? [
    "Computer Hardware & System Fundamentals",
    "Computer Networking & DNS/HTTP Protocols",
    "IT Infrastructure & Cloud Architecture",
    "IT Support Basics & Systems Troubleshooting",
    "Version Control & Git Enterprise Workflows"
  ] : [];

  const requiredSkills = uniqueSkills([...roadmapSkillNodes, ...coreTechMustKnows]);

  const userRoadmaps = await prisma.userRoadmap.findMany({
    where: { userId },
    include: {
      progress: true,
      roadmap: {
        include: { nodes: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const completedFromRoadmap = uniqueSkills(
    userRoadmaps.flatMap((ur) =>
      ur.progress
        .filter((p) => p.status === "completed")
        .map((p) => {
          const node = ur.roadmap.nodes.find((n) => n.id === p.nodeId);
          return node?.title ?? "";
        })
        .filter(Boolean)
    )
  );

  const profileSkills = uniqueSkills([
    ...(profile?.skills ?? []),
    ...(profile?.certificates ?? []),
    ...(profile?.projects ?? []),
  ]);

  const userSkillSet = new Map<string, { label: string; source: string }>();
  for (const skill of profileSkills) {
    userSkillSet.set(normalizeSkill(skill), { label: skill, source: "profile" });
  }
  for (const skill of completedFromRoadmap) {
    const key = normalizeSkill(skill);
    if (!userSkillSet.has(key)) {
      userSkillSet.set(key, { label: skill, source: "roadmap" });
    }
  }

  const inProgressFromRoadmap = uniqueSkills(
    userRoadmaps.flatMap((ur) =>
      ur.progress
        .filter((p) => p.status === "in_progress" || p.status === "available")
        .map((p) => {
          const node = ur.roadmap.nodes.find((n) => n.id === p.nodeId);
          return node?.title ?? "";
        })
        .filter(Boolean)
    )
  );

  const required =
    requiredSkills.length > 0
      ? requiredSkills
      : uniqueSkills([
          "Communication",
          "Problem Solving",
          "Technical Skills",
          "Teamwork",
          "Project Management",
        ]);

  const gaps: SkillGapItem[] = required.map((skill) => {
    const key = normalizeSkill(skill);
    const owned = userSkillSet.get(key);
    if (owned) {
      return {
        skill,
        status: "completed",
        source: owned.source,
      };
    }
    if (inProgressFromRoadmap.some((s) => normalizeSkill(s) === key)) {
      return { skill, status: "in_progress", source: "roadmap" };
    }
    return { skill, status: "missing" };
  });

  const completedCount = gaps.filter((g) => g.status === "completed").length;
  const coveragePercent =
    required.length > 0 ? Math.round((completedCount / required.length) * 100) : 0;

  return {
    targetCareer,
    requiredSkills: required,
    userSkills: Array.from(userSkillSet.values()).map((s) => s.label),
    completedFromRoadmap,
    gaps,
    coveragePercent,
    activeRoadmapId: userRoadmaps[0]?.roadmapId,
  };
}
