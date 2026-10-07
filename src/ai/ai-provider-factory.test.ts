import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  createAIProvider,
} from "./ai-provider-factory.js";

describe(
  "createAIProvider",
  () => {
    const originalEnv = {
      AI_PROVIDER:
        process.env.AI_PROVIDER,

      OPENROUTER_API_KEY:
        process.env.OPENROUTER_API_KEY,

      OPENROUTER_MODEL:
        process.env.OPENROUTER_MODEL,

      GROQ_API_KEY:
        process.env.GROQ_API_KEY,

      GROQ_MODEL:
        process.env.GROQ_MODEL,
    };

    afterEach(() => {
      process.env.AI_PROVIDER =
        originalEnv.AI_PROVIDER;

      process.env.OPENROUTER_API_KEY =
        originalEnv.OPENROUTER_API_KEY;

      process.env.OPENROUTER_MODEL =
        originalEnv.OPENROUTER_MODEL;

      process.env.GROQ_API_KEY =
        originalEnv.GROQ_API_KEY;

      process.env.GROQ_MODEL =
        originalEnv.GROQ_MODEL;

      vi.restoreAllMocks();
    });

    it(
      "utilise le provider configuré dans AuditConfig",
      () => {
        process.env.GROQ_API_KEY =
          "test-groq-key";

        const result =
          createAIProvider({
            ai: {
              provider: "groq",
            },
          });

        expect(
          result.providerName
        ).toBe("groq");
      }
    );

    it(
      "utilise le modèle configuré dans AuditConfig",
      () => {
        process.env.GROQ_API_KEY =
          "test-groq-key";

        const result =
          createAIProvider({
            ai: {
              provider: "groq",
              model: "mon-modele-groq",
            },
          });

        expect(result.model).toBe(
          "mon-modele-groq"
        );
      }
    );

    it(
      "utilise le modèle par défaut lorsque aucun modèle n'est configuré",
      () => {
        process.env.GROQ_API_KEY =
          "test-groq-key";

        delete process.env.GROQ_MODEL;

        const result =
          createAIProvider({
            ai: {
              provider: "groq",
            },
          });

        expect(result.model).toBe(
          "openai/gpt-oss-20b"
        );
      }
    );
  }
);