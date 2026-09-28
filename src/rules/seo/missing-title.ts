import type { FileInfo } from "../../types/file-info.js";
import type { RuleIssue } from "../../types/seo.js";

export function checkMissingTitle(file: FileInfo): RuleIssue[] {
  const issues: RuleIssue[] = [];

  if (file.extension !== ".html") {
    return issues;
  }

  const hasTitle = /<title\b[^>]*>[\s\S]*?<\/title>/i.test(file.content);

  if (!hasTitle) {
    issues.push({
      type: "missing-title",
      message: "La page ne possède pas de balise title.",
      severity: "error",
      
    });
  }

  return issues;
}