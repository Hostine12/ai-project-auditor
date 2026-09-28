import { describe, expect, it } from "vitest";

import { normalizeAIResult } from "./ai-result-normalizer.js";

describe("normalizeAIResult", () => {
  it("normalise correctement une réponse IA valide", () => {
    const data = {
      file: "test.html",

      seo: {
        title: "Titre de test",
        h1: ["Titre principal"],
        metaDescription: "Description de test",
        keywords: ["seo", "test"],
        strengths: ["Bonne structure"],
        weaknesses: ["Contenu trop court"],
        recommendations: ["Améliorer le contenu"],
      },

      aeo: {
        directAnswer: "Ceci est une réponse directe.",
        strengths: ["Réponse claire"],
        weaknesses: ["Réponse trop courte"],
        recommendations: ["Ajouter plus de précision"],
      },
    };

    const result = normalizeAIResult(data);

    expect(result).toEqual(data);
  });

   it("rejette une réponse IA invalide", () => {
  const data = {
    file: 123,

    seo: {
      title: "123",
      h1: ["Titre principal"],
      metaDescription: "Description de test",
      keywords: ["seo", "test"],
      strengths: ["Bonne structure"],
      weaknesses: [],
      recommendations: [],
    },

    aeo: {
      directAnswer: "Réponse directe",
      strengths: ["Réponse claire"],
      weaknesses: [],
      recommendations: [],
    },
  };

  expect(() => normalizeAIResult(data)).toThrow(
    "La réponse IA ne respecte pas le format attendu"
  );
});

  it("transforme les tableaux null en tableaux vides", () => {
    const data = {
      file: "test-page-2.html",

      seo: {
        title: "Titre de test",
        h1: ["Titre principal"],
        metaDescription: "Description de test",
        keywords: null,
        strengths: ["Bonne structure"],
        weaknesses: [],
        recommendations: [],
      },

      aeo: {
        directAnswer: "Réponse directe",
        strengths: [],
        weaknesses: [],
        recommendations: [],
      },
    };

    const result = normalizeAIResult(data);

    expect(result.seo.keywords).toEqual([]);
  });

});