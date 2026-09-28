import type { SEOIssue, SEOIssueSummary } from "../types/seo.js";

export function summarizeIssues(
  issues: SEOIssue[]
): SEOIssueSummary {
  let errors = 0;
  let warnings = 0;
  let infos = 0;

  for (const issue of issues) {
    if (issue.severity === "error") {
      errors++;
    } else if (issue.severity === "warning") {
      warnings++;
    } else if (issue.severity === "info") {
      infos++;
    }
  }

  return {
    errors,
    warnings,
    infos,
    totalIssues: issues.length,
  };
}