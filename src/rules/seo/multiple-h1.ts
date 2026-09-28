import type { FileInfo } from "../../types/file-info.js";
import type { RuleIssue } from "../../types/seo.js";

export function checkMultipleH1(
  file: FileInfo
): RuleIssue[] {
  const issues: RuleIssue[] = [];

  if (
    file.extension !== ".html" &&
    file.extension !== ".jsx" &&
    file.extension !== ".tsx"
  ) {
    return issues;
  }

  const h1Pattern = /<h1\b[^>]*>[\s\S]*?<\/h1>/gi;
  const h1s = file.content.match(h1Pattern) ?? [];

  if (h1s.length > 1) {
    issues.push({
      type: "multiple-h1",
      message: `La page contient ${h1s.length} balises H1.`,
      severity: "warning",
    });
  }

  return issues;
}