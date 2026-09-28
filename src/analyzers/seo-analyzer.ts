import type { FileInfo } from "../types/file-info.js";
import type { SEOResult } from "../types/seo.js";

import { seoRules } from "../rules/seo/index.js";

import { runRules } from "./rule-engine.js";

import { calculateScore } from "./score-calculator.js";

import { summarizeIssues } from "./issue-summary.js";

export function analyzeSEO(file: FileInfo): SEOResult {
  const issues = runRules(file, seoRules);

  const scoreResult = calculateScore(issues, seoRules);

  const summary = summarizeIssues(issues);

  return {
  score: scoreResult.score,
  summary,
  ruleStats: scoreResult.ruleStats,
  issues,
};
}