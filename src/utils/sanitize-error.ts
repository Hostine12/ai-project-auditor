export function sanitizeErrorMessage(
  message: string
): string {
  return message
    .replace(
      /OPENROUTER_API_KEY\s*=\s*[^\s,;]+/gi,
      "OPENROUTER_API_KEY=[REDACTED]"
    )
    .replace(
      /GROQ_API_KEY\s*=\s*[^\s,;]+/gi,
      "GROQ_API_KEY=[REDACTED]"
    );
}