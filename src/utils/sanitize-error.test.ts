import { describe, expect, it } from "vitest";
import { sanitizeErrorMessage } from "./sanitize-error.js";

describe("sanitizeErrorMessage", () => {
  it("masque une clé OpenRouter", () => {
    const message =
      "Erreur : OPENROUTER_API_KEY=sk-secret123";

    expect(sanitizeErrorMessage(message)).toBe(
      "Erreur : OPENROUTER_API_KEY=[REDACTED]"
    );
  });

  it("masque une clé Groq", () => {
    const message =
      "Erreur : GROQ_API_KEY=gsk-secret456";

    expect(sanitizeErrorMessage(message)).toBe(
      "Erreur : GROQ_API_KEY=[REDACTED]"
    );
  });

  it("masque les noms de variables sans tenir compte de la casse", () => {
    expect(
      sanitizeErrorMessage("openrouter_api_key=secret123")
    ).toBe(
      "OPENROUTER_API_KEY=[REDACTED]"
    );
  });

  it("masque les clés lorsque des espaces entourent le signe égal", () => {
    expect(
      sanitizeErrorMessage("GROQ_API_KEY = gsk-secret456")
    ).toBe(
      "GROQ_API_KEY=[REDACTED]"
    );
  });

  it("masque les deux clés dans un même message", () => {
    const message =
      "OPENROUTER_API_KEY=secret1, GROQ_API_KEY=secret2";

    expect(sanitizeErrorMessage(message)).toBe(
      "OPENROUTER_API_KEY=[REDACTED], GROQ_API_KEY=[REDACTED]"
    );
  });

  it("conserve un message normal", () => {
    const message =
      "La réponse IA n'est pas un objet valide.";

    expect(sanitizeErrorMessage(message)).toBe(message);
  });

  it("ne modifie pas une valeur qui n'est pas un secret", () => {
    const message =
      "Le fournisseur utilisé est openrouter.";

    expect(sanitizeErrorMessage(message)).toBe(message);
  });

it("masque une clé OpenRouter séparée par deux-points", () => {
  expect(
    sanitizeErrorMessage(
      "OPENROUTER_API_KEY: secret123"
    )
  ).toBe(
    "OPENROUTER_API_KEY=[REDACTED]"
  );
});

it("masque une clé Groq séparée par deux-points", () => {
  expect(
    sanitizeErrorMessage(
      "GROQ_API_KEY: gsk-secret456"
    )
  ).toBe(
    "GROQ_API_KEY=[REDACTED]"
  );
});

it("masque un jeton dans un en-tête Bearer", () => {
  expect(
    sanitizeErrorMessage(
      "Authorization: Bearer secret-token-123"
    )
  ).toBe(
    "Authorization: Bearer [REDACTED]"
  );
});

it("masque plusieurs secrets sans modifier le texte environnant", () => {
  expect(
    sanitizeErrorMessage(
      "Échec : GROQ_API_KEY=secret456. Vérification en cours."
    )
  ).toBe(
    "Échec : GROQ_API_KEY=[REDACTED]. Vérification en cours."
  );
});

it("masque entièrement une clé contenant des points", () => {
  expect(
    sanitizeErrorMessage(
      "OPENROUTER_API_KEY=sk-part1.part2"
    )
  ).toBe(
    "OPENROUTER_API_KEY=[REDACTED]"
  );
});

});
