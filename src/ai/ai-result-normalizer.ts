import type { AIAnalysisResult } from "./ai-provider.js";
import { AIAnalysisSchema } from "./schemas/ai-analysis-schema.js";

export function normalizeAIResult(
  data: unknown
): AIAnalysisResult {
  if (
    typeof data !== "object" ||
    data === null
  ) {
    throw new Error(
      "La réponse IA n'est pas un objet valide."
    );
  }

  const result =
    data as Record<string, unknown>;

  /*
   * Normalisation des sections SEO et AEO.
   */
  const seo =
    typeof result.seo === "object" &&
    result.seo !== null
      ? result.seo as Record<string, unknown>
      : {};

  const aeo =
    typeof result.aeo === "object" &&
    result.aeo !== null
      ? result.aeo as Record<string, unknown>
      : {};

  /*
   * Certains modèles IA peuvent retourner null
   * pour un tableau lorsqu'aucune information
   * n'a été trouvée.
   *
   * Notre contrat interne exige toujours un tableau.
   */
  const normalizedData = {
    ...result,

    seo: {
      ...seo,

      h1:
        seo.h1 === null
          ? []
          : seo.h1,

      keywords:
        seo.keywords === null
          ? []
          : seo.keywords,

      strengths:
        seo.strengths === null
          ? []
          : seo.strengths,

      weaknesses:
        seo.weaknesses === null
          ? []
          : seo.weaknesses,

      recommendations:
        seo.recommendations === null
          ? []
          : seo.recommendations,
    },

    aeo: {
      ...aeo,

      strengths:
        aeo.strengths === null
          ? []
          : aeo.strengths,

      weaknesses:
        aeo.weaknesses === null
          ? []
          : aeo.weaknesses,

      recommendations:
        aeo.recommendations === null
          ? []
          : aeo.recommendations,
    },
  };

  const validation =
    AIAnalysisSchema.safeParse(normalizedData);

  if (!validation.success) {
    throw new Error(
      `La réponse IA ne respecte pas le format attendu : ${JSON.stringify(
        validation.error.issues
      )}`
    );
  }

  return validation.data;
}