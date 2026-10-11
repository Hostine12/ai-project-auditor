import {
  readFile,
} from "node:fs/promises";

import {
  join,
} from "node:path";

export interface AuditConfig {
  ai: {
    provider: "openrouter" | "groq";
    model?: string;
  };

  include: string[];

  exclude: string[];

  features: {
    seo: boolean;
    aeo: boolean;
    ai: boolean;
  };

  output: {
    path: string;
  };

  ci: {
    threshold: number;
  };
}

const DEFAULT_EXCLUDE = [
  "node_modules",
  ".git",
  "dist",
  "build",
];

export async function loadAuditConfig(
  projectPath: string = "."
): Promise<AuditConfig> {
  const defaultConfig: AuditConfig = {
    ai: {
      provider: "openrouter",
    },

    include: [],

    exclude: [...DEFAULT_EXCLUDE],

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

  const configPath = join(
    projectPath,
    "ai-audit.config.json"
  );

  let content: string;

  try {
    content =
      await readFile(
        configPath,
        "utf-8"
      );
  } catch (error) {
    const errorCode =
      error &&
      typeof error === "object" &&
      "code" in error
        ? error.code
        : undefined;

    if (errorCode === "ENOENT") {
      return {
        ...defaultConfig,

        ai: {
          ...defaultConfig.ai,
        },

        include: [
          ...defaultConfig.include,
        ],

        exclude: [
          ...defaultConfig.exclude,
        ],

        features: {
          ...defaultConfig.features,
        },

        output: {
          ...defaultConfig.output,
        },

        ci: {
          ...defaultConfig.ci,
        },
      };
    }

    throw new Error(
      `Impossible de lire le fichier de configuration : ${configPath}`
    );
  }

  let userConfig: unknown;

  try {
    userConfig = JSON.parse(content);
  } catch {
    throw new Error(
      `Le fichier de configuration ${configPath} contient un JSON invalide.`
    );
  }

  if (
    typeof userConfig !== "object" ||
    userConfig === null ||
    Array.isArray(userConfig)
  ) {
    throw new Error(
      `Le fichier de configuration ${configPath} doit contenir un objet JSON.`
    );
  }

  const config =
    userConfig as Record<string, unknown>;


const ai =
  config.ai === undefined
    ? {}
    : getConfigSection(config.ai, "ai");

const features =
  config.features === undefined
    ? {}
    : getConfigSection(config.features, "features");

const output =
  config.output === undefined
    ? {}
    : getConfigSection(config.output, "output");

const ci =
  config.ci === undefined
    ? {}
    : getConfigSection(config.ci, "ci");


  const provider =
    ai.provider ??
    defaultConfig.ai.provider;


function getConfigSection(
  value: unknown,
  sectionName: string
): Record<string, unknown> {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    throw new Error(
      `La section '${sectionName}' doit être un objet JSON.`
    );
  }

  return value as Record<string, unknown>;
}


  if (
    provider !== "openrouter" &&
    provider !== "groq"
  ) {
    throw new Error(
      `Fournisseur IA invalide : ${String(provider)}. ` +
      `Utilisez "openrouter" ou "groq".`
    );
  }

  const model =
    ai.model;


if (
  model !== undefined &&
  (
    typeof model !== "string" ||
    model.trim() === ""
  )
) {
  throw new Error(
    "Le modèle IA doit être une chaîne de caractères non vide."
  );
}

  const include =
    config.include ??
    defaultConfig.include;

  if (
    !Array.isArray(include) ||
    !include.every(
      (item) => typeof item === "string"
    )
  ) {
    throw new Error(
      "La configuration 'include' doit être un tableau de chaînes de caractères."
    );
  }

  const exclude =
    config.exclude ??
    defaultConfig.exclude;

  if (
    !Array.isArray(exclude) ||
    !exclude.every(
      (item) => typeof item === "string"
    )
  ) {
    throw new Error(
      "La configuration 'exclude' doit être un tableau de chaînes de caractères."
    );
  }

  const seo =
    features.seo ??
    defaultConfig.features.seo;

  const aeo =
    features.aeo ??
    defaultConfig.features.aeo;

  const aiFeature =
    features.ai ??
    defaultConfig.features.ai;

  if (
    typeof seo !== "boolean" ||
    typeof aeo !== "boolean" ||
    typeof aiFeature !== "boolean"
  ) {
    throw new Error(
      "Les fonctionnalités SEO, AEO et IA doivent être des valeurs booléennes."
    );
  }

  const outputPath =
    output.path ??
    defaultConfig.output.path;

  if (
    typeof outputPath !== "string" ||
    outputPath.trim() === ""
  ) {
    throw new Error(
      "Le chemin de sortie du rapport doit être une chaîne de caractères non vide."
    );
  }

  const threshold =
    ci.threshold ??
    defaultConfig.ci.threshold;

  if (
    typeof threshold !== "number" ||
    !Number.isFinite(threshold) ||
    threshold < 0 ||
    threshold > 100
  ) {
    throw new Error(
      "Le seuil CI/CD doit être un nombre compris entre 0 et 100."
    );
  }

  return {
    ai: {
      provider,
      ...(model !== undefined
        ? { model }
        : {}),
    },

    include: [
      ...include,
    ],

    exclude: [
      ...exclude,
    ],

    features: {
      seo,
      aeo,
      ai: aiFeature,
    },

    output: {
      path: outputPath,
    },

    ci: {
      threshold,
    },
  };
}
