import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";

import {
  mkdtemp,
  readFile,
  rm,
} from "node:fs/promises";

import {
  tmpdir,
} from "node:os";

import {
  join,
} from "node:path";

import {
  generateJsonReport,
} from "./json-reporter.js";

import {
  AuditReportSchema,
} from "../ai/schemas/audit-report-schema.js";

describe(
  "generateJsonReport",
  () => {
    const temporaryDirectories: string[] = [];

    afterEach(
      async () => {
        await Promise.all(
          temporaryDirectories.map(
            (directory) =>
              rm(
                directory,
                {
                  recursive: true,
                  force: true,
                }
              )
          )
        );

        temporaryDirectories.length = 0;
      }
    );

    it(
      "génère le rapport au chemin indiqué",
      async () => {
        const directory =
          await mkdtemp(
            join(
              tmpdir(),
              "ai-project-auditor-"
            )
          );

        temporaryDirectories.push(
          directory
        );

        const outputPath = join(
          directory,
          "reports",
          "audit.json"
        );

        const result = {
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
            errors: [],
          },
        };

        await generateJsonReport(
          result,
          outputPath
        );

        const content =
          await readFile(
            outputPath,
            "utf-8"
          );

        const parsed =
          JSON.parse(content);

          const validation =
  AuditReportSchema.safeParse(
    parsed
  );

expect(
  validation.success
).toBe(true);

        expect(
          parsed.project.name
        ).toBe("test-project");
      }
    );


it("écrit les erreurs du rapport dans le JSON", async () => {
  const directory = await mkdtemp(
    join(tmpdir(), "ai-auditor-report-test-")
  );

  temporaryDirectories.push(directory);

  const outputPath = join(directory, "audit.json");

  const result = {
    project: { name: "test-project" },
    metadata: {
      generatedAt: new Date().toISOString(),
      filesScanned: 0,
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
      errors: [
        {
          file: "src/page.html",
          error: "Impossible de lire le fichier.",
        },
      ],
    },
    scan: {
      errors: [
        {
          file: "src/page.html",
          error: "Impossible de lire le fichier.",
        },
      ],
    },
  };

  await generateJsonReport(result, outputPath);

  const content = await readFile(outputPath, "utf-8");
  const parsed = JSON.parse(content);

  expect(parsed.ai.errors[0].error).toBe(
    "Impossible de lire le fichier."
  );

  expect(parsed.scan.errors[0].error).toBe(
    "Impossible de lire le fichier."
  );
});

  }
);
