import { loadConfig } from "../config/config.js";

import type { AuditConfig } from "../config/audit-config.js";

import type { AIProvider } from "./ai-provider.js";

import { OpenRouterProvider } from "./openrouter-provider.js";

import { GroqProvider } from "./groq-provider.js";

export interface AIProviderConfig {
  provider: AIProvider;
  providerName: string;
  model: string;
}

export function createAIProvider(
  auditConfig?: Pick<AuditConfig, "ai">
): AIProviderConfig {
  const config = loadConfig(
  auditConfig?.ai.provider
);

  const providerName =
    auditConfig?.ai.provider ??
    config.provider;

  if (providerName === "groq") {
    if (!config.groqApiKey) {
      throw new Error(
        "GROQ_API_KEY est absente."
      );
    }

    const model =
      auditConfig?.ai.model ??
      config.groqModel;

    return {
      provider: new GroqProvider(
        config.groqApiKey,
        model
      ),
      providerName: "groq",
      model,
    };
  }

  if (!config.openRouterApiKey) {
    throw new Error(
      "OPENROUTER_API_KEY est absente."
    );
  }

  const model =
    auditConfig?.ai.model ??
    config.openRouterModel;

  return {
    provider: new OpenRouterProvider(
      config.openRouterApiKey,
      model
    ),
    providerName: "openrouter",
    model,
  };
}