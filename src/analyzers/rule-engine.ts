import type { FileInfo } from "../types/file-info.js";
import type { AuditIssue, AuditRule } from "../types/seo.js";

export function runRules(
  file: FileInfo,
  rules: AuditRule[]
): AuditIssue[] {
  const issues: AuditIssue[] = [];

  for (const rule of rules) {
    const ruleIssues = rule.check(file);

    const enrichedIssues = ruleIssues.map((issue) => ({
      ...issue,
      ruleId: rule.id,
      file: file.path,
    }));

    issues.push(...enrichedIssues);
  }

  return issues;
}