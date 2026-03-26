const KEYWORDS =
  /\b(tech|technology|developer|software|engineering|programming|devops|data\s*science|machine\s*learning|\bAI\b|artificial\s*intelligence|startup|digital|hackathon|cyber|security|cloud|webinar|meetup|code|coding|javascript|typescript|python|golang|react|kubernetes|docker|panama|remote)\b/i

export function looksTechRelated(text: string): boolean {
  const t = text.trim()
  if (t.length < 8) return false
  return KEYWORDS.test(t)
}
