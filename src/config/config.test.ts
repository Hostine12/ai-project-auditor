/// <reference types="node" />

import { describe, expect, it } from "vitest";
import { loadConfig } from "./config.js";

describe("loadConfig", () => {
  it("utilise OpenRouter par défaut", () => {
    delete process.env.AI_PROVIDER;
    process.env.OPENROUTER_API_KEY = "test-openrouter-key";

    const config = loadConfig();

    expect(config.provider).toBe("openrouter");
  });

  it("utilise Groq lorsque le provider est configuré sur groq", () => {
  process.env.AI_PROVIDER = "groq";
  process.env.GROQ_API_KEY = "test-groq-key";

  const config = loadConfig();

  expect(config.provider).toBe("groq");
});

it("rejette un fournisseur IA invalide", () => {
  process.env.AI_PROVIDER = "invalid-provider";

  expect(() => loadConfig()).toThrow(
    'Fournisseur IA invalide : invalid-provider.'
  );
});

it("rejette OpenRouter si la clé API est absente", () => {
  process.env.AI_PROVIDER = "openrouter";
  delete process.env.OPENROUTER_API_KEY;

  expect(() => loadConfig()).toThrow(
    "OPENROUTER_API_KEY est absente."
  );
});

it("rejette Groq si la clé API est absente", () => {
  process.env.AI_PROVIDER = "groq";
  delete process.env.GROQ_API_KEY;

  expect(() => loadConfig()).toThrow(
    "GROQ_API_KEY est absente."
  );
});

it("utilise les modèles par défaut", () => {
  process.env.AI_PROVIDER = "openrouter";
  process.env.OPENROUTER_API_KEY = "test-openrouter-key";

  delete process.env.OPENROUTER_MODEL;
  delete process.env.GROQ_MODEL;

  const config = loadConfig();

  expect(config.openRouterModel).toBe(
    "openrouter/free"
  );

  expect(config.groqModel).toBe(
    "openai/gpt-oss-20b"
  );
});

it("utilise les modèles personnalisés", () => {
  process.env.AI_PROVIDER = "openrouter";
  process.env.OPENROUTER_API_KEY = "test-openrouter-key";

  process.env.OPENROUTER_MODEL =
    "mon-modele-openrouter";

  process.env.GROQ_MODEL =
    "mon-modele-groq";

  const config = loadConfig();

  expect(config.openRouterModel).toBe(
    "mon-modele-openrouter"
  );

  expect(config.groqModel).toBe(
    "mon-modele-groq"
  );
});
});