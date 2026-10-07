
export interface AIConfig {
  provider: "openrouter" | "groq";
  openRouterApiKey?: string;
  openRouterModel: string;
  groqApiKey?: string;
  groqModel: string;
}

export function loadConfig(
  providerOverride?: "openrouter" | "groq"
): AIConfig {
  const provider =
  providerOverride ??
  process.env.AI_PROVIDER ??
  "openrouter";

  if (
    provider !== "openrouter" &&
    provider !== "groq"
  ) {
    throw new Error(
      `Fournisseur IA invalide : ${provider}. ` +
      `Utilisez "openrouter" ou "groq".`
    );
  }

  const openRouterApiKey =
    process.env.OPENROUTER_API_KEY;

  const groqApiKey =
    process.env.GROQ_API_KEY;

  if (
    provider === "openrouter" &&
    !openRouterApiKey
  ) {
    throw new Error(
      "OPENROUTER_API_KEY est absente."
    );
  }

  if (
    provider === "groq" &&
    !groqApiKey
  ) {
    throw new Error(
      "GROQ_API_KEY est absente."
    );
  }

  return {
    provider,

    openRouterApiKey,

    openRouterModel:
      process.env.OPENROUTER_MODEL ??
      "openrouter/free",

    groqApiKey,

    groqModel:
      process.env.GROQ_MODEL ??
      "openai/gpt-oss-20b",
  };
}

