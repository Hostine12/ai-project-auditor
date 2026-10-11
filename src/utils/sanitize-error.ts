export function sanitizeErrorMessage(
  message: string
): string {
  return message
    .replace(
      /\b(OPENROUTER_API_KEY|GROQ_API_KEY)\s*[:=]\s*["']?([^\s,;"']+)/gi,
      (_match, variableName: string, secret: string) => {
        const punctuation = secret.match(/[.!?]+$/)?.[0] ?? "";
        return `${variableName.toUpperCase()}=[REDACTED]${punctuation}`;
      }
    )
    .replace(
      /(\bAuthorization\s*:\s*Bearer\s+)([^\s,;"']+)/gi,
      (_match, prefix: string, secret: string) => {
        const punctuation = secret.match(/[.!?]+$/)?.[0] ?? "";
        return `${prefix}[REDACTED]${punctuation}`;
      }
    );
}