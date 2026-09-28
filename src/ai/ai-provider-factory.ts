
import { loadConfig } from "../config/config.js";

import type { AIProvider } from "./ai-provider.js";
import { OpenRouterProvider } from "./openrouter-provider.js";
import { GroqProvider } from "./groq-provider.js";

export interface AIProviderConfig {
  provider: AIProvider;
  providerName: string;
  model: string;
}

export function createAIProvider(): AIProviderConfig {
  const config = loadConfig();

  if (config.provider === "groq") {
    if (!config.groqApiKey) {
      throw new Error(
        "GROQ_API_KEY est absente."
      );
    }

    return {
      provider: new GroqProvider(
        config.groqApiKey,
        config.groqModel
      ),
      providerName: "groq",
      model: config.groqModel,
    };
  }

  if (!config.openRouterApiKey) {
    throw new Error(
      "OPENROUTER_API_KEY est absente."
    );
  }

  return {
    provider: new OpenRouterProvider(
      config.openRouterApiKey,
      config.openRouterModel
    ),
    providerName: "openrouter",
    model: config.openRouterModel,
  };
}

