import { describe, expect, it, vi, afterEach } from "vitest";

import { OpenRouterProvider } from "./openrouter-provider.js";

describe("OpenRouterProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("retourne une réponse IA valide", async () => {
    const validResponse = {
      file: "index.html",
      seo: {
        title: "Ma page",
        h1: ["Bienvenue"],
        metaDescription: "Description de ma page",
        keywords: ["web", "SEO"],
        strengths: ["Titre clair"],
        weaknesses: [],
        recommendations: ["Ajouter une FAQ"],
      },
      aeo: {
        directAnswer: "Cette page présente un service web.",
        strengths: ["Réponse claire"],
        weaknesses: [],
        recommendations: ["Ajouter des réponses plus précises"],
      },
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify(validResponse),
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );

    const provider = new OpenRouterProvider(
      "test-api-key",
      "test-model"
    );

    const result = await provider.analyze({
      file: "index.html",
      content: "<html><title>Ma page</title></html>",
    });

    expect(result).toEqual(validResponse);
  });

  it("gère explicitement une erreur 429", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, {
        status: 429,
        statusText: "Too Many Requests",
      })
    );

    const provider = new OpenRouterProvider(
      "test-api-key",
      "test-model"
    );

    await expect(
      provider.analyze({
        file: "index.html",
        content: "<html></html>",
      })
    ).rejects.toThrow(
      "OpenRouter a atteint sa limite de requêtes. Veuillez réessayer plus tard."
    );
  });

  it("gère une erreur HTTP sans exposer le contenu brut de la réponse", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("secret server details", {
        status: 500,
        statusText: "Internal Server Error",
      })
    );

    const provider = new OpenRouterProvider(
      "test-api-key",
      "test-model"
    );

    await expect(
      provider.analyze({
        file: "index.html",
        content: "<html></html>",
      })
    ).rejects.toThrow(
      "Erreur OpenRouter : 500 Internal Server Error"
    );
  });

  it("rejette une réponse IA qui ne respecte pas le schéma attendu", async () => {
    const invalidResponse = {
      file: "index.html",
      seo: {},
      aeo: {},
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify(invalidResponse),
              },
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );

    const provider = new OpenRouterProvider(
      "test-api-key",
      "test-model"
    );

    await expect(
  provider.analyze({
    file: "index.html",
    content: "<html></html>",
  })
).rejects.toThrow();
  });

  it("gère une erreur réseau de fetch", async () => {
  vi.spyOn(globalThis, "fetch").mockRejectedValue(
    new Error("terminated")
  );

  const provider = new OpenRouterProvider(
    "test-api-key",
    "test-model"
  );

  await expect(
  provider.analyze({
    file: "index.html",
    content: "<html></html>",
  })
).rejects.toThrow(
  "Erreur réseau lors de la communication avec OpenRouter."
);
});

    it("n'expose pas la clé API dans les erreurs", async () => {
    const apiKey = "super-secret-openrouter-key";

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("server failure", {
        status: 500,
        statusText: "Internal Server Error",
      })
    );

    const provider = new OpenRouterProvider(
      apiKey,
      "test-model"
    );

    try {
      await provider.analyze({
        file: "index.html",
        content: "<html></html>",
      });

      throw new Error(
        "Le provider aurait dû lever une erreur."
      );
    } catch (error) {
      expect(error).toBeInstanceOf(Error);

      expect(
        (error as Error).message
      ).not.toContain(apiKey);
    }
  });
});