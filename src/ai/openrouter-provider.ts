import { normalizeAIResult } from "./ai-result-normalizer.js";
import { buildAuditAnalysisPrompt } from "./prompts/audit-analysis-prompt.js";

import type {
  AIAnalysisInput,
  AIAnalysisResult,
  AIProvider,
} from "./ai-provider.js";

import {
  AIAnalysisSchema,
} from "./schemas/ai-analysis-schema.js";

export class OpenRouterProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async analyze(
    input: AIAnalysisInput
  ): Promise<AIAnalysisResult> {
   let response: Response;

try {
  response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },

      body: JSON.stringify({
        model: this.model,

        messages: [
          {
            role: "system",
            content: buildAuditAnalysisPrompt(),
          },

          {
            role: "user",
            content: `
Analyse le fichier suivant

Nom du fichier :
${input.file}

Contenu du fichier :
${input.content}
`,
          },
        ],
      }),
    }
  );
} catch {
  throw new Error(
    "Erreur réseau lors de la communication avec OpenRouter."
  );
}

   if (!response.ok) {
  if (response.status === 429) {
    throw new Error(
      "OpenRouter a atteint sa limite de requêtes. Veuillez réessayer plus tard."
    );
  }

  throw new Error(
    `Erreur OpenRouter : ${response.status} ${response.statusText}`
  );
}

    let data: unknown;

try {
  data = await response.json();
} catch {
  throw new Error(
    "La réponse reçue d'OpenRouter n'est pas un JSON valide."
  );
}

    const responseData = data as {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

const content =
  responseData.choices?.[0]?.message?.content;

if (typeof content !== "string") {
  throw new Error(
    "OpenRouter n'a pas retourné de contenu textuel valide."
  );
}

    

    const cleanedContent = extractJsonObject(content);

    let parsedJson: unknown;

    try {
      parsedJson = JSON.parse(cleanedContent);
    } catch {
      throw new Error(
        "OpenRouter a retourné un contenu contenant un JSON invalide."
      );
    }

    const normalizedJson =
      normalizeAIResult(parsedJson);

    const validatedResult =
      AIAnalysisSchema.safeParse(normalizedJson);

    if (!validatedResult.success) {
      throw new Error(
        `La réponse OpenRouter ne respecte pas le schéma attendu : ${JSON.stringify(
          validatedResult.error.issues
        )}`
      );
    }

    return validatedResult.data;
  }
}

function extractJsonObject(content: string): string {
  const trimmedContent = content.trim();

  const withoutMarkdown = trimmedContent
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  if (
    withoutMarkdown.startsWith("{") &&
    withoutMarkdown.endsWith("}")
  ) {
    return withoutMarkdown;
  }

  const firstBrace = withoutMarkdown.indexOf("{");
  const lastBrace = withoutMarkdown.lastIndexOf("}");

  if (
    firstBrace === -1 ||
    lastBrace === -1 ||
    firstBrace >= lastBrace
  ) {
    throw new Error(
      "OpenRouter n'a retourné aucun objet JSON identifiable."
    );
  }

  return withoutMarkdown.slice(
    firstBrace,
    lastBrace + 1
  );
}

