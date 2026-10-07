const SECRET_PATTERNS = [
  // Clés API, clés secrètes et jetons d'accès.
  /\b[A-Z0-9_]*(?:API_KEY|SECRET_KEY|ACCESS_TOKEN|AUTH_TOKEN|API_TOKEN)\b\s*[:=]\s*(["'`])[^"'`]*\1/gi,

  // Mots de passe, dont celui de la base de données.
  /\b[A-Z0-9_]*(?:DATABASE_PASSWORD|DB_PASSWORD|PASSWORD|PASSWD)\b\s*[:=]\s*(["'`])[^"'`]*\1/gi,

  // Même famille de secrets avec une valeur non entourée de guillemets.
  /\b[A-Z0-9_]*(?:API_KEY|SECRET_KEY|ACCESS_TOKEN|AUTH_TOKEN|API_TOKEN|DATABASE_PASSWORD|DB_PASSWORD|PASSWORD|PASSWD)\b\s*[:=]\s*[^"'`\s;,)]+/gi,
];

export function sanitizeContent(content: string): string {
  let sanitizedContent = content;

  for (const pattern of SECRET_PATTERNS) {
    sanitizedContent = sanitizedContent.replace(pattern, (match) => {
      const separatorIndex = match.search(/[:=]/);

      if (separatorIndex === -1) {
        return "[REDACTED]";
      }

      return match.slice(0, separatorIndex + 1) + " [REDACTED]";
    });
  }

  return sanitizedContent;
}