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

  if (
    /^(salary|growth|timeline|summary|why it matches|why it fits|key skills|gap analysis|course|learning|roadmap|insight|recommendation)s?$/i.test(
      normalized
    )
  ) {
    return false
  }

  const hasCareerKeyword = CAREER_KEYWORDS.some((keyword) =>
    new RegExp(`\\b${keyword}\\b`, "i").test(normalized)
  )
  if (hasCareerKeyword) return true

  return /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4}$/.test(normalized)
}

function cleanTitle(raw: string): string {
  const title = raw.replace(/\*\*/g, "").trim()
  const separators = [
    /\s+Why it matches.*/i,
    /\s+Why it fits.*/i,
    /\s+Recommended because.*/i,
    /\s+–\s+.*/,
    /\s+-\s+.*/,
    /\s*:\s*.*/,
  ]

  for (const pattern of separators) {
    const match = title.match(pattern)
    if (match) {
      return title.slice(0, match.index).trim()
    }
  }

  return title
}

function cleanSummary(raw: string): string {
  const cleaned = raw
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/#{1,6}\s*/g, "")
    .replace(/\*\*/g, "")
    .replace(/(^|\n)\s*[-*+]\s+/g, "$1")
    .replace(/\n{2,}/g, "\n")
    .replace(/\s+/g, " ")
    .trim()

  const lines = cleaned
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(
      (line) =>
        line &&
        !/^\d+\./.test(line) &&
        !/^(why it matches|why it fits|salary|match|recommended because)/i.test(line)
    )

  const summaryText = lines.slice(0, 2).join(" ")
    .replace(/(Why it matches|Why it fits|Match.*|Salary.*|Recommended because).*/i, "")
    .replace(/\s+/g, " ")
    .trim()

  return summaryText.slice(0, 100).trim()
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
    const cleaned = cleanTitle(title)
    if (!cleaned || GENERIC_WORDS.has(cleaned.toLowerCase())) continue
    if (isLikelyCareerTitle(cleaned)) {
      found.add(cleaned)
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
  const summary = cleanSummary(text)

  return {
    titles: extractRecommendationTitles(text),
    salaryRange,
    matchPercentage,
    summary,
  }
}
