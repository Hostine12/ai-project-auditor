import type {
  AuditIssue,
  AuditRule,
  RuleScoreStats,
} from "../types/seo.js";

export interface ScoreResult {
  score: number;
  ruleStats: RuleScoreStats[];
}

export function calculateScore(
  issues: AuditIssue[],
  rules: AuditRule[]
): ScoreResult {
  const ruleStats: RuleScoreStats[] = [];

  let penalty = 0;

  for (const rule of rules) {
    const ruleIssues = issues.filter(
      (issue) => issue.ruleId === rule.id
    );

    const issueCount = ruleIssues.length;

    const rawPenalty = issueCount * rule.weight;

    const appliedPenalty = Math.min(
      rawPenalty,
      rule.maxPenalty
    );

    penalty += appliedPenalty;

    ruleStats.push({
      ruleId: rule.id,
      issueCount,
      rawPenalty,
      appliedPenalty,
    });
  }

  const score = Math.max(
    0,
    100 - penalty
  );

  return {
    score,
    ruleStats,
  };
}