import type { FileInfo } from "../types/file-info.js";
import type { AnalysisResult } from "../types/seo.js";

import { aeoRules } from "../rules/aeo/index.js";
import { runRules } from "./rule-engine.js";
import { calculateScore } from "./score-calculator.js";

export function analyzeAEO(
  file: FileInfo
): AnalysisResult {
  const issues = runRules(file, aeoRules);

  const scoreResult = calculateScore(
    issues,
    aeoRules
  );

  const score = scoreResult.score;

  return {
    score,

    summary: {
      errors: issues.filter(
        (issue) => issue.severity === "error"
      ).length,

      warnings: issues.filter(
        (issue) => issue.severity === "warning"
      ).length,

      infos: issues.filter(
        (issue) => issue.severity === "info"
      ).length,

      totalIssues: issues.length,
    },

    ruleStats: scoreResult.ruleStats,

    issues,
  };
}