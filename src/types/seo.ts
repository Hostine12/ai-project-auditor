import type { FileInfo } from "./file-info.js";

export type IssueSeverity = "error" | "warning" | "info";

export interface RuleIssue {
  type: string;
  message: string;
  severity: IssueSeverity;
}

export interface AuditIssue extends RuleIssue {
  ruleId: string;
  file?: string;
}

export interface SEOIssue extends AuditIssue {}

export interface SEOIssueSummary {
  errors: number;
  warnings: number;
  infos: number;
  totalIssues: number;
}

export interface AnalysisResult {
  score: number;
  summary: SEOIssueSummary;
  ruleStats: RuleScoreStats[];
  issues: AuditIssue[];
}

export interface SEOResult extends AnalysisResult {
  issues: SEOIssue[];
}

export interface AuditRule {
  id: string;
  description: string;
  severity: IssueSeverity;
  weight: number;
  maxPenalty: number;
  check: (file: FileInfo) => RuleIssue[];
}

export interface RuleScoreStats {
  ruleId: string;
  issueCount: number;
  rawPenalty: number;
  appliedPenalty: number;
}