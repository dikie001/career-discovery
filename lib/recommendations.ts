export interface RecommendationExtractResult {
  titles: string[];
  salaryRange: string;
  matchPercentage: number;
  summary: string;
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
]);

export function extractRecommendationTitles(text: string): string[] {
  const found = new Set<string>();

  const boldPattern = /\*\*([^*\n]{2,40})\*\*/g;
  let match: RegExpExecArray | null;
  while ((match = boldPattern.exec(text)) !== null) {
    const title = match[1].trim();
    if (title.length > 3 && !GENERIC_WORDS.has(title.toLowerCase())) {
      found.add(title);
    }
  }

  const listPattern = /^\d+\.\s+([A-Z][A-Za-z0-9 &/.-]{3,40})$/gm;
  while ((match = listPattern.exec(text)) !== null) {
    found.add(match[1].trim());
  }

  return Array.from(found).slice(0, 5);
}

export function extractRecommendationMetadata(text: string): RecommendationExtractResult {
  const salaryMatch = text.match(/[Kk][Ss][Hh]\s*[\d,]+[Kk]?\s*[-–]?\s*[\d,]*[Kk]?/);
  const salaryRange = salaryMatch ? salaryMatch[0] : "";
  const matchMatch = text.match(/(\d{1,3})%\s*match/i);
  const matchPercentage = matchMatch ? parseInt(matchMatch[1], 10) : 0;
  const summary = text.replace(/\*\*/g, "").slice(0, 320).trim();

  return {
    titles: extractRecommendationTitles(text),
    salaryRange,
    matchPercentage,
    summary,
  };
}
