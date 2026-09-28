import { describe, expect, it } from "vitest";
import { sanitizeErrorMessage } from "./sanitize-error.js";

describe("sanitizeErrorMessage", () => {
  it("masque une clé OpenRouter", () => {
    const message =
      "Erreur : OPENROUTER_API_KEY=sk-secret123";

    expect(
      sanitizeErrorMessage(message)
    ).toBe(
      "Erreur : OPENROUTER_API_KEY=[REDACTED]"
    );
  });

  it("masque une clé Groq", () => {
    const message =
      "Erreur : GROQ_API_KEY=gsk-secret456";

    expect(
      sanitizeErrorMessage(message)
    ).toBe(
      "Erreur : GROQ_API_KEY=[REDACTED]"
    );
  });

  it("conserve un message normal", () => {
    const message =
      "La réponse IA n'est pas un objet valide.";

    expect(
      sanitizeErrorMessage(message)
    ).toBe(message);
  });
});