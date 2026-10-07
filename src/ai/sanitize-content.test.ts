
import {
  describe,
  expect,
  it,
} from "vitest";

import {
  sanitizeContent,
} from "./sanitize-content.js";

describe("sanitizeContent", () => {
  it("masque la valeur d'une API_KEY", () => {
    const content =
      'const API_KEY = "super-secret-api-key";';

    const result =
      sanitizeContent(content);

    expect(result).not.toContain(
      "super-secret-api-key"
    );

    expect(result).toContain(
      "[REDACTED]"
    );

    expect(result).toContain(
      "API_KEY"
    );
  });

  it("masque la valeur d'une SECRET_KEY", () => {
    const content =
      'const SECRET_KEY = "secret-123";';

    const result =
      sanitizeContent(content);

    expect(result).not.toContain(
      "secret-123"
    );

    expect(result).toContain(
      "[REDACTED]"
    );
  });

  it("masque le mot de passe de la base de données", () => {
    const content =
      'const DATABASE_PASSWORD = "password-123";';

    const result =
      sanitizeContent(content);

    expect(result).not.toContain(
      "password-123"
    );

    expect(result).toContain(
      "[REDACTED]"
    );
  });

  it("conserve le contenu sans secret détecté", () => {
    const content =
      'const title = "Bienvenue sur mon site";';

    expect(
      sanitizeContent(content)
    ).toBe(content);
  });

  it("masque plusieurs secrets dans un même fichier", () => {
    const content = `
      const API_KEY = "api-secret-123";
      const SECRET_KEY = "secret-456";
      const DATABASE_PASSWORD = "db-password-789";
    `;

    const result =
      sanitizeContent(content);

    expect(result).not.toContain(
      "api-secret-123"
    );

    expect(result).not.toContain(
      "secret-456"
    );

    expect(result).not.toContain(
      "db-password-789"
    );
  });

    it("masque la valeur d'un ACCESS_TOKEN", () => {
    const content =
      'const ACCESS_TOKEN = "access-token-secret-123";';

    const result =
      sanitizeContent(content);

    expect(result).not.toContain(
      "access-token-secret-123"
    );
  });

  it("masque la valeur d'un PASSWORD", () => {
    const content =
      'const PASSWORD = "my-password-secret-456";';

    const result =
      sanitizeContent(content);

    expect(result).not.toContain(
      "my-password-secret-456"
    );
  });

    it("masque les clés API avec un préfixe de fournisseur", () => {
    const content = `
      OPENROUTER_API_KEY=super-secret-openrouter-key
      GROQ_API_KEY="super-secret-groq-key"
    `;

    const result =
      sanitizeContent(content);

    expect(result).not.toContain(
      "super-secret-openrouter-key"
    );

    expect(result).not.toContain(
      "super-secret-groq-key"
    );

    expect(result).toContain(
      "OPENROUTER_API_KEY"
    );

    expect(result).toContain(
      "GROQ_API_KEY"
    );
  });
});
