import type {
  AnalysisResult,
  AuditIssue,
  AuditRule,
} from "./rule.js";

export interface AEOIssue extends AuditIssue {}

export interface AEOIssueSummary {
  errors: number;
  warnings: number;
  infos: number;
  totalIssues: number;
}

export interface AEOResult extends AnalysisResult {
  summary: AEOIssueSummary;
  issues: AEOIssue[];
}

export type AEORule = AuditRule;