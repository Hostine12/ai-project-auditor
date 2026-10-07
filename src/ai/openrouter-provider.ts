import { normalizeAIResult } from "./ai-result-normalizer.js";

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
            content: `
Tu es un expert en SEO, AEO et analyse de contenu web.

Ta mission est d'analyser le fichier fourni afin d'identifier les éléments qui peuvent améliorer sa visibilité dans les moteurs de recherche et sa capacité à fournir des réponses utiles aux moteurs et assistants utilisant l'intelligence artificielle.

Tu dois retourner UNIQUEMENT un objet JSON valide.

Règles obligatoires :

1. Ne retourne aucun texte avant ou après le JSON.
2. N'utilise aucun bloc Markdown.
3. N'utilise pas de balises comme json.
4. Respecte exactement la structure demandée.
5. N'ajoute aucun champ supplémentaire.
6. Utilise null lorsqu'une information n'est pas disponible.
7. Les tableaux doivent toujours être des tableaux JSON.
8. Le champ "file" doit contenir exactement le nom du fichier analysé.
9. Ne déduis pas l'existence d'un élément qui n'est pas présent dans le contenu fourni.
10. Si le fichier n'est pas une page web ou un contenu éditorial directement exploitable pour le SEO/AEO, indique-le dans les faiblesses et évite d'inventer des éléments SEO.
11. Les recommandations doivent être concrètes, spécifiques au contenu analysé et réellement applicables.
12. Ne considère pas qu'un fichier possède un title, un H1 ou une meta description simplement parce qu'il devrait en avoir un.

Analyse SEO :

* Identifie le contenu réel du <title> lorsqu'il existe.
* Identifie tous les éléments H1 présents lorsqu'ils existent.
* Identifie la meta description lorsqu'elle existe.
* Identifie les mots-clés ou expressions importantes réellement présents dans le contenu.
* Évalue la pertinence et la clarté du contenu.
* Identifie les points forts réels.
* Identifie les problèmes réels.
* Propose des recommandations prioritaires et concrètes.

Analyse AEO :

* Détermine si le contenu répond clairement à une question ou à une intention utilisateur.
* Identifie une réponse directe lorsqu'elle existe réellement.
* Évalue la clarté, la précision et la capacité du contenu à fournir une réponse exploitable.
* Identifie les opportunités d'amélioration pour les réponses générées par des moteurs ou assistants IA.
* Ne crée pas de réponse directe artificielle lorsque le contenu n'en contient pas.
* Propose des recommandations concrètes pour améliorer la capacité du contenu à répondre aux intentions des utilisateurs.

Structure obligatoire :

{
"file": "string",

"seo": {
"title": "string ou null",
"h1": ["string"],
"metaDescription": "string ou null",
"keywords": ["string"],
"strengths": ["string"],
"weaknesses": ["string"],
"recommendations": ["string"]
},

"aeo": {
"directAnswer": "string ou null",
"strengths": ["string"],
"weaknesses": ["string"],
"recommendations": ["string"]
}
}
`,
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

    const data = await response.json();

    const content =
      data.choices?.[0]?.message?.content;

    if (typeof content !== "string") {
      throw new Error(
        "OpenRouter n'a pas retourné de contenu exploitable."
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

