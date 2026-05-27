const ADVERSARIAL_PATTERNS = [
  /\[SYSTEM OVERRIDE:[^\]]*\]/gi,
  /\[IGNORE:[^\]]*\]/gi,
  /@agent_instructions[^\n]*/gi,
];

export function sanitizeSnippet(content: string): string {
  let sanitized = content;
  for (const pattern of ADVERSARIAL_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }
  return sanitized.trim();
}
