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
  writeFile,
} from "node:fs/promises";

import {
  join,
} from "node:path";

import {
  tmpdir,
} from "node:os";

import {
  initAuditConfig,
} from "./init-config.js";

describe("initAuditConfig", () => {
  const temporaryDirectories: string[] = [];

  afterEach(async () => {
    await Promise.all(
      temporaryDirectories.map(
        (directory) =>
          rm(directory, {
            recursive: true,
            force: true,
          })
      )
    );

    temporaryDirectories.length = 0;
  });

  it(
    "crée une configuration par défaut",
    async () => {
      const directory =
        await mkdtemp(
          join(
            tmpdir(),
            "ai-project-auditor-init-"
          )
        );

      temporaryDirectories.push(
        directory
      );

      const configPath =
        await initAuditConfig(
          directory
        );

      expect(configPath).toBe(
        join(
          directory,
          "ai-audit.config.json"
        )
      );

      const content =
        await readFile(
          configPath,
          "utf-8"
        );

      expect(
        JSON.parse(content)
      ).toEqual({

        ai: {
  provider: "openrouter",
},
        include: [],
        exclude: [
          "node_modules",
          ".git",
          "dist",
          "build",
        ],
        features: {
          seo: true,
          aeo: true,
          ai: true,
        },
        output: {
          path: "audit-report.json",
        },
        ci: {
          threshold: 0,
        },
      });
    }
  );

  it(
    "refuse d'écraser une configuration existante",
    async () => {
      const directory =
        await mkdtemp(
          join(
            tmpdir(),
            "ai-project-auditor-init-"
          )
        );

      temporaryDirectories.push(
        directory
      );

      const configPath =
        join(
          directory,
          "ai-audit.config.json"
        );

      const existingConfig =
        JSON.stringify({
          features: {
            seo: false,
          },
        });

      await writeFile(
        configPath,
        existingConfig,
        "utf-8"
      );

      await expect(
        initAuditConfig(directory)
      ).rejects.toThrow(
        "Le fichier ai-audit.config.json existe déjà."
      );

      const content =
        await readFile(
          configPath,
          "utf-8"
        );

      expect(content).toBe(
        existingConfig
      );
    }
  );
});