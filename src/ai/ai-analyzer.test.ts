import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";


import { analyzeWithAI } from "./ai-analyzer.js";

import { rm, writeFile } from "node:fs/promises";

import type {
  AIAnalysisResult,
  AIProvider,
} from "./ai-provider.js";

import type { FileInfo } from "../types/file-info.js";

const TEST_CACHE_DIRECTORY =
  ".ai-project-auditor-test";

class FakeAIProvider implements AIProvider {
  callCount = 0;

  async analyze(
    input: {
      file: string;
      content: string;
    }
  ): Promise<AIAnalysisResult> {
    this.callCount++;

    return {
      file: input.file,

      seo: {
        title: "Titre de test",
        h1: ["Titre principal"],
        metaDescription: "Description de test",
        keywords: ["seo", "test"],
        strengths: ["Bonne structure"],
        weaknesses: [],
        recommendations: ["Améliorer le contenu"],
      },

      aeo: {
        directAnswer: "Ceci est une réponse directe.",
        strengths: ["Réponse claire"],
        weaknesses: [],
        recommendations: [],
      },
    };
  }
}
class FailingAIProvider implements AIProvider {
  async analyze(
    input: {
      file: string;
      content: string;
    }
  ): Promise<AIAnalysisResult> {
    throw new Error(
      "Erreur simulée du provider IA."
    );
  }
}

beforeEach(async () => {
  await rm(TEST_CACHE_DIRECTORY, {
    recursive: true,
    force: true,
  });
});

describe("analyzeWithAI", () => {
  it("utilise le provider IA et retourne son résultat", async () => {
    const provider = new FakeAIProvider();

    const file: FileInfo = {
      path: "test.html",
      extension: ".html",
      content: `
        <html>
          <head>
            <title>Test</title>
          </head>
          <body>
            <h1>Test</h1>
            <p>Contenu de test</p>
          </body>
        </html>
      `,
    };

    const result = await analyzeWithAI(
      file,
      provider,
      "fake-provider",
      "fake-model",
      TEST_CACHE_DIRECTORY
    );

    expect(result.file).toBe("test.html");
    expect(result.seo.title).toBe("Titre de test");
    expect(result.aeo.directAnswer).toBe(
      "Ceci est une réponse directe."
    );
  });

    it("utilise le cache lors d'un deuxième appel identique", async () => {
    const provider = new FakeAIProvider();

    const file: FileInfo = {
      path: "cache-test.html",
      extension: ".html",
      content: `
        <html>
          <head>
            <title>Cache Test</title>
          </head>
          <body>
            <h1>Cache Test</h1>
            <p>Contenu de test du cache</p>
          </body>
        </html>
      `,
    };

    const firstResult = await analyzeWithAI(
      file,
      provider,
      "fake-provider",
      "fake-model",
      TEST_CACHE_DIRECTORY
    );

    const secondResult = await analyzeWithAI(
      file,
      provider,
      "fake-provider",
      "fake-model",
      TEST_CACHE_DIRECTORY
    );

    expect(firstResult).toEqual(secondResult);

    expect(provider.callCount).toBe(1);
  });

  it("propage une erreur du provider IA", async () => {
  const provider = new FailingAIProvider();

  const file: FileInfo = {
    path: "error-test.html",
    extension: ".html",
    content: `
      <html>
        <head>
          <title>Test erreur</title>
        </head>
        <body>
          <h1>Test erreur</h1>
          <p>Contenu de test</p>
        </body>
      </html>
    `,
  };

  await expect(
    analyzeWithAI(
      file,
      provider,
      "fake-provider",
      "fake-model",
      TEST_CACHE_DIRECTORY
    )
  ).rejects.toThrow(
    "Erreur simulée du provider IA."
  );
});


  it("retourne le résultat même si l'enregistrement du cache échoue", async () => {
    await writeFile(
      TEST_CACHE_DIRECTORY,
      "ce chemin est volontairement un fichier"
    );

    const warnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    try {
      const provider = new FakeAIProvider();

      const file: FileInfo = {
        path: "cache-write-failure.html",
        extension: ".html",
        content: "<html><body><h1>Test</h1></body></html>",
      };

      const result = await analyzeWithAI(
        file,
        provider,
        "fake-provider",
        "fake-model",
        TEST_CACHE_DIRECTORY
      );

      expect(result.file).toBe(
        "cache-write-failure.html"
      );
      expect(provider.callCount).toBe(1);
      expect(warnSpy).toHaveBeenCalledOnce();
    } finally {
      warnSpy.mockRestore();
    }
  });


  it("ignore un résultat invalide présent dans le cache", async () => {
  const provider = new FakeAIProvider();

  const file: FileInfo = {
    path: "corrupted-cache.html",
    extension: ".html",
    content: "<html><body><h1>Test</h1></body></html>",
  };

  const cacheDirectory =
    ".ai-project-auditor-corrupted-test";

  const cachePath = `${cacheDirectory}/cache.json`;

  const { mkdir, writeFile } =
    await import("node:fs/promises");

  await mkdir(cacheDirectory, {
    recursive: true,
  });

  const { createContentHash } =
    await import("./ai-cache.js");

  const invalidCache = {
    version: 1,
    entries: {
      [file.path]: {
        hash: createContentHash(file.content),
        provider: "fake-provider",
        model: "fake-model",
        result: {
          file: file.path,
          seo: {
            title: 123,
          },
          aeo: {},
        },
        createdAt: new Date().toISOString(),
      },
    },
  };

  await writeFile(
    cachePath,
    JSON.stringify(invalidCache),
    "utf8"
  );

  try {
    const result = await analyzeWithAI(
      file,
      provider,
      "fake-provider",
      "fake-model",
      cacheDirectory
    );

    expect(result.file).toBe(
      "corrupted-cache.html"
    );

    // Le cache invalide doit être ignoré.
    expect(provider.callCount).toBe(1);
  } finally {
    await rm(cacheDirectory, {
      recursive: true,
      force: true,
    });
  }
});

  it(
    "ne transmet pas directement les secrets présents dans le contenu au provider IA",
    async () => {
      let receivedContent = "";

      const provider: AIProvider = {
        async analyze(input) {
          receivedContent = input.content;

          return {
            file: input.file,

            seo: {
              title: null,
              h1: [],
              metaDescription: null,
              keywords: [],
              strengths: [],
              weaknesses: [],
              recommendations: [],
            },

            aeo: {
              directAnswer: null,
              strengths: [],
              weaknesses: [],
              recommendations: [],
            },
          };
        },
      };

      const file: FileInfo = {
        path: "config.ts",
        extension: ".ts",
        content: `
          const API_KEY = "super-secret-api-key";
          const DATABASE_PASSWORD = "super-secret-password";
        `,
      };

      await analyzeWithAI(
        file,
        provider,
        "fake-provider",
        "fake-model",
        TEST_CACHE_DIRECTORY
      );

      expect(
        receivedContent
      ).not.toContain(
        "super-secret-api-key"
      );

      expect(
        receivedContent
      ).not.toContain(
        "super-secret-password"
      );
    }
  );

});