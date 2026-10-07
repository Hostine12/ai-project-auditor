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

        expect(
          parsed.project.name
        ).toBe("test-project");
      }
    );
  }
);