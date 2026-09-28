import { describe, expect, it } from "vitest";
import { formatCLIError } from "./errors.js";

describe("formatCLIError", () => {
  it("retourne le message d'une erreur standard", () => {
    const error = new Error(
      "Le projet est introuvable."
    );

    expect(formatCLIError(error)).toBe(
      "Le projet est introuvable."
    );
  });

  it("gère une erreur inconnue", () => {
    expect(formatCLIError("erreur")).toBe(
      "Une erreur inconnue est survenue."
    );
  });

  it("gère une valeur numérique", () => {
    expect(formatCLIError(123)).toBe(
      "Une erreur inconnue est survenue."
    );
  });
});