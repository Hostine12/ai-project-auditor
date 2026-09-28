import {
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";


import { analyzeWithAI } from "./ai-analyzer.js";

import { rm } from "node:fs/promises";

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

});