import { describe, expect, it } from "vitest";

import { AuditReportSchema } from "./audit-report-schema.js";

describe(
  "AuditReportSchema",
  () => {

    it(
      "accepte un rapport valide",
      () => {

        const report = {
          project: {
            name: "ai-project-auditor",
          },

          metadata: {
            generatedAt:
              "2026-09-20T23:49:57.152Z",
            filesScanned: 44,
            filesWithIssues: 2,
          },

          seo: {
            score: 98,

            summary: {
              errors: 2,
              warnings: 8,
              infos: 0,
              totalIssues: 10,
            },

            ruleStats: [],

            issues: [],
          },

          aeo: {
            score: 90,

            summary: {
              errors: 0,
              warnings: 1,
              infos: 0,
              totalIssues: 1,
            },

            ruleStats: [],

            issues: [],
          },

          ai: {
            results: [],

            errors: [],
          },
        };

        const result =
          AuditReportSchema.safeParse(
            report
          );

        expect(result.success).toBe(true);
      }
    );

    it(
      "rejette un score invalide",
      () => {

        const report = {
          project: {
            name: "ai-project-auditor",
          },

          metadata: {
            generatedAt:
              "2026-09-20T23:49:57.152Z",
            filesScanned: 44,
            filesWithIssues: 2,
          },

          seo: {
            score: 150,

            summary: {
              errors: 0,
              warnings: 0,
              infos: 0,
              totalIssues: 0,
            },

            ruleStats: [],

            issues: [],
          },

          aeo: {
            score: 90,

            summary: {
              errors: 0,
              warnings: 0,
              infos: 0,
              totalIssues: 0,
            },

            ruleStats: [],

            issues: [],
          },

          ai: {
            results: [],
            errors: [],
          },
        };

        const result =
          AuditReportSchema.safeParse(
            report
          );

        expect(result.success).toBe(false);
      }
    );

    it(
      "rejette une erreur IA mal structurée",
      () => {

        const report = {
          project: {
            name: "ai-project-auditor",
          },

          metadata: {
            generatedAt:
              "2026-09-20T23:49:57.152Z",
            filesScanned: 44,
            filesWithIssues: 2,
          },

          seo: {
            score: 98,

            summary: {
              errors: 2,
              warnings: 8,
              infos: 0,
              totalIssues: 10,
            },

            ruleStats: [],

            issues: [],
          },

          aeo: {
            score: 90,

            summary: {
              errors: 0,
              warnings: 1,
              infos: 0,
              totalIssues: 1,
            },

            ruleStats: [],

            issues: [],
          },

          ai: {
            results: [],

            errors: [
              {
                file: "./test.html",

                // Cette valeur doit être une chaîne.
                // On met volontairement un nombre
                // pour vérifier que Zod le rejette.
                error: 123,
              },
            ],
          },
        };

        const result =
          AuditReportSchema.safeParse(
            report
          );

        expect(result.success).toBe(false);
      }
    );

    it(
      "accepte les erreurs du scanner",
      () => {

        const report = {
          project: {
            name: "test-project",
          },

          metadata: {
            generatedAt:
              new Date().toISOString(),
            filesScanned: 1,
            filesWithIssues: 0,
          },

          seo: {
            score: 100,

            summary: {
              errors: 0,
              warnings: 0,
              infos: 0,
              totalIssues: 0,
            },

            ruleStats: [],

            issues: [],
          },

          aeo: {
            score: 100,

            summary: {
              errors: 0,
              warnings: 0,
              infos: 0,
              totalIssues: 0,
            },

            ruleStats: [],

            issues: [],
          },

          ai: {
            results: [],

            errors: [],
          },

          scan: {
            errors: [
              {
                file: "./test.html",
                error: "Permission refusée",
              },
            ],
          },
        };

        const result =
          AuditReportSchema.safeParse(
            report
          );

        expect(result.success).toBe(true);
      }
    );

  }
);