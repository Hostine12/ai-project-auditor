import {
  access,
  writeFile,
} from "node:fs/promises";

import {
  join,
} from "node:path";

const DEFAULT_CONFIG = {
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
};

export async function initAuditConfig(
  projectPath: string = "."
): Promise<string> {
  const configPath = join(
    projectPath,
    "ai-audit.config.json"
  );

  try {
    await access(configPath);

    throw new Error(
      "Le fichier ai-audit.config.json existe déjà."
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "Le fichier ai-audit.config.json existe déjà."
    ) {
      throw error;
    }
  }

  await writeFile(
    configPath,
    JSON.stringify(
      DEFAULT_CONFIG,
      null,
      2
    ) + "\n",
    "utf-8"
  );

  return configPath;
}