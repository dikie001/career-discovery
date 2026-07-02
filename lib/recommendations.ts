export interface RecommendationExtractResult {
  titles: string[]
  salaryRange: string
  matchPercentage: number
  summary: string
}

const GENERIC_WORDS = new Set([
  "note",
  "tip",
  "important",
  "warning",
  "example",
  "result",
  "step",
  "here",
  "this",
  "the",
  "and",
  "for",
  "you",
  "your",
  "based",
  "on",
  "with",
  "fit",
  "salary",
  "timeline",
  "growth",
  "skills",
  "analysis",
  "why it matches",
  "recommendation",
  "recommendations",
  "key",
  "gap",
  "course",
  "learning",
  "roadmap",
  "insight",
])

const CAREER_KEYWORDS = [
  "Manager",
  "Analyst",
  "Developer",
  "Coordinator",
  "Engineer",
  "Officer",
  "Designer",
  "Specialist",
  "Consultant",
  "Director",
  "Architect",
  "Strategist",
  "Producer",
  "Technician",
  "Advisor",
  "Lead",
  "Executive",
  "Scientist",
  "Administrator",
  "Researcher",
  "Planner",
  "Trainer",
  "Coach",
  "Representative",
  "Associate",
  "Intern",
  "Analyst",
]

function isLikelyCareerTitle(title: string): boolean {
  const normalized = title.replace(/\s+/g, " ").trim()
  if (normalized.length < 5) return false

  const hasCareerKeyword = CAREER_KEYWORDS.some((keyword) =>
    new RegExp(`\\b${keyword}\\b`, "i").test(normalized)
  )
  if (hasCareerKeyword) return true

  if (
    /^(salary|growth|timeline|summary|why it matches|why it fits|key skills|gap analysis|course|learning|roadmap|insight|recommendation)s?$/i.test(
      normalized
    )
  ) {
    return false
  }

  return /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4}$/.test(normalized)
}

export function extractRecommendationTitles(text: string): string[] {
  const found = new Set<string>()
  let candidateTitles: string[] = []

  const boldPattern = /\*\*([^*\n]{2,60})\*\*/g
  let match: RegExpExecArray | null
  while ((match = boldPattern.exec(text)) !== null) {
    candidateTitles.push(match[1].trim())
  }

  const headingPattern = /^#{1,6}\s*(?:📌\s*)?(.{3,60})$/gm
  while ((match = headingPattern.exec(text)) !== null) {
    candidateTitles.push(match[1].trim())
  }

  const listPattern = /^\d+\.\s+([A-Z][A-Za-z0-9 &/.-]{3,60})$/gm
  while ((match = listPattern.exec(text)) !== null) {
    candidateTitles.push(match[1].trim())
  }

  for (const title of candidateTitles) {
    const normalized = title.replace(/\*\*/g, "").trim()
    if (!normalized || GENERIC_WORDS.has(normalized.toLowerCase())) continue
    if (isLikelyCareerTitle(normalized)) {
      found.add(normalized)
    }
  }

  return Array.from(found).slice(0, 5)
}

export function extractRecommendationMetadata(
  text: string
): RecommendationExtractResult {
  const salaryMatch = text.match(
    /[Kk][Ss][Hh]\s*[\d,]+[Kk]?\s*[-–]?\s*[\d,]*[Kk]?/
  )
  const salaryRange = salaryMatch ? salaryMatch[0] : ""
  const matchMatch = text.match(/(\d{1,3})%\s*match/i)
  const matchPercentage = matchMatch ? parseInt(matchMatch[1], 10) : 0
  const summary = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/#{1,6}\s*/g, "")
    .replace(/\*\*/g, "")
    .replace(/\n{2,}/g, "\n")
    .replace(/(^|\n)\s*[-*+]\s+/g, "$1")
    .trim()
    .slice(0, 320)

  return {
    titles: extractRecommendationTitles(text),
    salaryRange,
    matchPercentage,
    summary,
  }
}
