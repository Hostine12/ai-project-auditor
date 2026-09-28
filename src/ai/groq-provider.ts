import { normalizeAIResult } from "./ai-result-normalizer.js";
import type {
  AIAnalysisInput,
  AIAnalysisResult,
  AIProvider,
} from "./ai-provider.js";

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
    const response = await fetch(
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
              content: `
Tu es un expert en SEO et AEO.

Tu dois analyser le fichier fourni.

Tu dois retourner UNIQUEMENT un objet JSON valide.

Règles obligatoires :

1. Ne retourne aucun texte avant ou après le JSON.
2. N'utilise pas de bloc Markdown.
3. N'utilise pas de balises comme \`\`\`json.
4. Respecte exactement la structure demandée.
5. N'ajoute aucun champ supplémentaire.
6. Utilise null lorsqu'une information n'est pas disponible.
7. Les tableaux doivent toujours être des tableaux JSON.
8. Le champ "file" doit contenir le nom du fichier analysé.

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

Consignes supplémentaires :

- Analyse uniquement ce qui est réellement présent dans le fichier.
- Ne suppose pas qu'une balise ou une information existe si elle n'est pas présente.
- Pour un fichier HTML, identifie réellement les éléments title, h1 et meta description.
- Pour un fichier Markdown, analyse les titres et le contenu réellement présents.
- Si le fichier est du code ou ne contient pas de contenu pertinent pour le SEO, indique-le clairement.
`,
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

    if (!response.ok) {
      const errorBody = await response.text();

      throw new Error(
        `Erreur Groq : ${response.status} ${response.statusText}\n${errorBody}`
      );
    }

    const data = await response.json();

    const content =
      data.choices?.[0]?.message?.content;

    if (typeof content !== "string") {
      throw new Error(
        "Groq n'a pas retourné de contenu exploitable."
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

    return normalizedJson;
  }
}


