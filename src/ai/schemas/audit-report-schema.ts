import { z } from "zod";

const IssueSeveritySchema = z.enum([
  "error",
  "warning",
  "info",
]);

const AuditIssueSchema = z.object({
  type: z.string(),
  message: z.string(),
  severity: IssueSeveritySchema,
  ruleId: z.string(),
  file: z.string().optional(),
});

const IssueSummarySchema = z.object({
  errors: z.number().int().nonnegative(),
  warnings: z.number().int().nonnegative(),
  infos: z.number().int().nonnegative(),
  totalIssues: z.number().int().nonnegative(),
});

const RuleScoreStatsSchema = z.object({
  ruleId: z.string(),
  issueCount: z.number().int().nonnegative(),
  rawPenalty: z.number().nonnegative(),
  appliedPenalty: z.number().nonnegative(),
});

const AnalysisResultSchema = z.object({
  score: z.number().min(0).max(100),

  summary: IssueSummarySchema,

  ruleStats: z.array(
    RuleScoreStatsSchema
  ),

  issues: z.array(
    AuditIssueSchema
  ),
});

const AIAnalysisResultSchema = z.object({
  file: z.string(),

  seo: z.object({
    title: z.string().nullable(),
    h1: z.array(z.string()),
    metaDescription: z.string().nullable(),
    keywords: z.array(z.string()),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),

  aeo: z.object({
    directAnswer: z.string().nullable(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
});

const AIAnalysisErrorSchema = z.object({
  file: z.string(),
  error: z.string(),
});

export const AuditReportSchema = z.object({
  project: z.object({
    name: z.string(),
  }),

  metadata: z.object({
    generatedAt: z.string(),
    filesScanned: z.number().int().nonnegative(),
    filesWithIssues: z.number().int().nonnegative(),
  }),

  seo: AnalysisResultSchema,

  aeo: AnalysisResultSchema,

  ai: z.object({
    results: z.array(
      AIAnalysisResultSchema
    ),

    errors: z.array(
      AIAnalysisErrorSchema
    ),
  }),

  scan: z.object({
  errors: z.array(
    z.object({
      file: z.string(),
      error: z.string(),
    })
  ),
}).optional(),
});

export type AuditReport = z.infer<
  typeof AuditReportSchema
>;