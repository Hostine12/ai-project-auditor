import type { FileInfo } from "../../types/file-info.js";
import type { RuleIssue } from "../../types/seo.js";

export function checkMissingMetaDescription(
  file: FileInfo
): RuleIssue[] {
  const issues: RuleIssue[] = [];

  if (file.extension !== ".html") {
    return issues;
  }

  const hasMetaDescription =
    /<meta\b[^>]*name\s*=\s*["']description["'][^>]*>/i.test(
      file.content
    );

  if (!hasMetaDescription) {
    issues.push({
      type: "missing-meta-description",
      message:
        "La page ne possède pas de balise meta description.",
      severity: "warning",
      line: 1,
      column: 1,
      recommendation:
        "Ajouter une meta description concise et pertinente qui résume le contenu principal de la page.",
      fix:
        'Ajouter une balise meta description dans la section <head>, par exemple <meta name="description" content="Description de la page">.',
    });
  }

  return issues;
}