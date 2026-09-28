import type { FileInfo } from "../../types/file-info.js";
import type { RuleIssue } from "../../types/seo.js";

export function checkMissingAlt(file: FileInfo): RuleIssue[] {
  const issues: RuleIssue[] = [];

  if (
    file.extension !== ".html" &&
    file.extension !== ".jsx" &&
    file.extension !== ".tsx"
  ) {
    return issues;
  }

  const imagePattern = /<img\b[^>]*>/gi;
  const images = file.content.match(imagePattern) ?? [];

  for (const image of images) {
    if (!/\balt\s*=/.test(image)) {
      issues.push({
        type: "missing-alt",
        message: "Une image ne possède pas d'attribut alt.",
        severity: "warning",
      });
    }
  }

  return issues;
}