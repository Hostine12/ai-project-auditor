import type { FileInfo } from "../../types/file-info.js";
import type { RuleIssue } from "../../types/seo.js";

export function checkEmptyTitle(
  file: FileInfo
): RuleIssue[] {
  const issues: RuleIssue[] = [];

  if (file.extension !== ".html") {
    return issues;
  }

  const titleMatch = file.content.match(
    /<title\b[^>]*>([\s\S]*?)<\/title>/i
  );

  if (titleMatch) {
    const titleContent = titleMatch[1]?.trim();

    if (!titleContent) {
      issues.push({
        type: "empty-title",
        message: "La balise title est présente mais vide.",
        severity: "error",
      });
    }
  }

  return issues;
}