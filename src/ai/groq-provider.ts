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

export class GroqProvider implements AIProvider {
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
    "https://api.groq.com/openai/v1/chat/completions",
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
Analyse le fichier suivant selon les critères SEO et AEO.

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
    "Erreur réseau lors de la communication avec Groq."
  );
}
    if (!response.ok) {
  if (response.status === 429) {
    throw new Error(
      "Groq a atteint sa limite de requêtes. Veuillez réessayer plus tard."
    );
  }

  throw new Error(
    `Erreur Groq : ${response.status} ${response.statusText}`
  );
}

    let data: unknown;

try {
  data = await response.json();
} catch {
  throw new Error(
    "La réponse reçue de Groq n'est pas un JSON valide."
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
    "Groq n'a pas retourné de contenu textuel valide."
  );
}

    const cleanedContent = content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsedJson: unknown;

    try {
      parsedJson = JSON.parse(cleanedContent);
    } catch {
      throw new Error(
        "Groq a retourné un JSON invalide."
      );
    }

    /*
     * Normalisation de la réponse IA.
     *
     * Certains modèles peuvent retourner null
     * à la place d'un tableau.
     *
     * On transforme donc ces valeurs en tableaux
     * vides avant la validation Zod.
     */
    const normalizedJson =
  normalizeAIResult(parsedJson);

const validatedResult =
  AIAnalysisSchema.safeParse(normalizedJson);

if (!validatedResult.success) {
  throw new Error(
    `La réponse Groq ne respecte pas le schéma attendu : ${JSON.stringify(
      validatedResult.error.issues
    )}`
  );
}

return validatedResult.data;
  }
}

