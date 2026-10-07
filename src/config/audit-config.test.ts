import { describe, expect, it, afterEach, } from "vitest";
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

import { loadAuditConfig } from "./audit-config.js";

describe("loadAuditConfig", () => {
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
  "retourne les valeurs par défaut",
  async () => {
    const directory =
      await mkdtemp(
        join(
          tmpdir(),
          "ai-project-auditor-config-"
        )
      );

    temporaryDirectories.push(
      directory
    );

    const config =
      await loadAuditConfig(
        directory
      );

    expect(config.include).toEqual([]);

    expect(config.exclude).toEqual([
      "node_modules",
      ".git",
      "dist",
      "build",
    ]);

    expect(config.features).toEqual({
      seo: true,
      aeo: true,
      ai: true,
    });

    expect(config.output).toEqual({
      path: "audit-report.json",
    });

    expect(config.ci).toEqual({
      threshold: 0,
    });
  }
);

 it(
  "retourne une nouvelle configuration à chaque appel",
  async () => {
    const directory =
      await mkdtemp(
        join(
          tmpdir(),
          "ai-project-auditor-config-"
        )
      );

    temporaryDirectories.push(
      directory
    );

    const firstConfig =
      await loadAuditConfig(
        directory
      );

    const secondConfig =
      await loadAuditConfig(
        directory
      );

    expect(firstConfig).not.toBe(
      secondConfig
    );

    expect(firstConfig.exclude).not.toBe(
      secondConfig.exclude
    );

    expect(firstConfig.features).not.toBe(
      secondConfig.features
    );

    expect(firstConfig.output).not.toBe(
      secondConfig.output
    );

    expect(firstConfig.ci).not.toBe(
      secondConfig.ci
    );
  }
);

 it(
  "utilise les valeurs par défaut lorsqu'aucun fichier de configuration n'existe",
  async () => {
    const directory =
      await mkdtemp(
        join(
          tmpdir(),
          "ai-project-auditor-config-"
        )
      );

    temporaryDirectories.push(
      directory
    );

    const config =
      await loadAuditConfig(
        directory
      );

    expect(config.include).toEqual([]);

    expect(config.exclude).toEqual([
      "node_modules",
      ".git",
      "dist",
      "build",
    ]);

    expect(config.features).toEqual({
      seo: true,
      aeo: true,
      ai: true,
    });

    expect(config.output).toEqual({
      path: "audit-report.json",
    });

    expect(config.ci).toEqual({
      threshold: 0,
    });
  }
);


it(
  "charge la configuration depuis ai-audit.config.json",
  async () => {
    const directory =
      await mkdtemp(
        join(
          tmpdir(),
          "ai-project-auditor-config-"
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

    await writeFile(
      configPath,
      JSON.stringify({
        include: ["src", "public"],

        exclude: [
          "node_modules",
          "dist",
        ],

        features: {
          seo: true,
          aeo: false,
          ai: true,
        },

        output: {
          path: "reports/audit.json",
        },

        ci: {
          threshold: 80,
        },
      })
    );

    const config =
  await loadAuditConfig(
    directory
  );

    expect(config).toEqual({
      ai: {
    provider: "openrouter",
  },
      include: ["src", "public"],

      exclude: [
        "node_modules",
        "dist",
      ],

      features: {
        seo: true,
        aeo: false,
        ai: true,
      },

      output: {
        path: "reports/audit.json",
      },

      ci: {
        threshold: 80,
      },
    });
  }
);

it(
  "complète une configuration partielle avec les valeurs par défaut",
  async () => {
    const directory =
      await mkdtemp(
        join(
          tmpdir(),
          "ai-project-auditor-config-"
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

    await writeFile(
      configPath,
      JSON.stringify({
        ai: {
          provider: "groq",
        },

        features: {
          ai: false,
        },
      })
    );

    const config =
      await loadAuditConfig(
        directory
      );

    expect(config.ai).toEqual({
      provider: "groq",
    });

    expect(config.include).toEqual([]);

    expect(config.exclude).toEqual([
      "node_modules",
      ".git",
      "dist",
      "build",
    ]);

    expect(config.features).toEqual({
      seo: true,
      aeo: true,
      ai: false,
    });

    expect(config.output).toEqual({
      path: "audit-report.json",
    });

    expect(config.ci).toEqual({
      threshold: 0,
    });
  }
);

it(
  "rejette un fichier de configuration avec un JSON invalide",
  async () => {
    const directory =
      await mkdtemp(
        join(
          tmpdir(),
          "ai-project-auditor-config-"
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

    await writeFile(
      configPath,
      "{ invalid json }"
    );

    await expect(
      loadAuditConfig(directory)
    ).rejects.toThrow(
      "contient un JSON invalide"
    );
  }
);

it(
  "rejette un fournisseur IA invalide",
  async () => {
    const directory =
      await mkdtemp(
        join(
          tmpdir(),
          "ai-project-auditor-config-"
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

    await writeFile(
      configPath,
      JSON.stringify({
        ai: {
          provider: "gemini",
        },
      })
    );

    await expect(
      loadAuditConfig(directory)
    ).rejects.toThrow(
      "Fournisseur IA invalide"
    );
  }
);

it(
  "rejette un seuil CI/CD supérieur à 100",
  async () => {
    const directory =
      await mkdtemp(
        join(
          tmpdir(),
          "ai-project-auditor-config-"
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

    await writeFile(
      configPath,
      JSON.stringify({
        ci: {
          threshold: 150,
        },
      })
    );

    await expect(
      loadAuditConfig(directory)
    ).rejects.toThrow(
      "compris entre 0 et 100"
    );
  }
);

it(
  "rejette une configuration include invalide",
  async () => {
    const directory =
      await mkdtemp(
        join(
          tmpdir(),
          "ai-project-auditor-config-"
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

    await writeFile(
      configPath,
      JSON.stringify({
        include: "src",
      })
    );

    await expect(
      loadAuditConfig(directory)
    ).rejects.toThrow(
      "configuration 'include'"
    );
  }
);
});