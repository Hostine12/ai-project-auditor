
import {
  access,
  mkdir,
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
  await mkdir(projectPath, {
    recursive: true,
  });

  const configPath = join(
    projectPath,
    "ai-audit.config.json"
  );

  let configExists = false;

  try {
    await access(configPath);
    configExists = true;
  } catch (error) {
    const code =
      error !== null &&
      typeof error === "object" &&
      "code" in error
        ? error.code
        : undefined;

    if (code !== "ENOENT") {
      throw error;
    }
  }

  if (configExists) {
    throw new Error(
      "Le fichier ai-audit.config.json existe déjà."
    );
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
