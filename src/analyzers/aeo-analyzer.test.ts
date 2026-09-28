import { describe, expect, it } from "vitest";

import { analyzeAEO } from "./aeo-analyzer.js";

import type { FileInfo } from "../types/file-info.js";

describe("analyzeAEO", () => {
  it("détecte une page qui ne contient pas de réponse directe", () => {
  const file: FileInfo = {
    path: "test.html",
    extension: ".html",
    content: `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Qu'est-ce que le SEO ?</title>
        </head>
        <body>
          <h1>Qu'est-ce que le SEO ?</h1>
          <div>
            Le SEO est important pour les sites web.
          </div>
        </body>
      </html>
    `,
  };

  const result = analyzeAEO(file);

  expect(
    result.issues.some(
      (issue) => issue.type === "missing-direct-answer"
    )
  ).toBe(true);
});

  it("ne signale pas missing-direct-answer lorsqu'une réponse directe est présente", () => {
    const file: FileInfo = {
      path: "test.html",
      extension: ".html",
      content: `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Qu'est-ce que le SEO ?</title>
          </head>
          <body>
            <h1>Qu'est-ce que le SEO ?</h1>

            <p>
              Le SEO est l'ensemble des techniques utilisées
              pour améliorer la visibilité d'un site web dans
              les moteurs de recherche.
            </p>
          </body>
        </html>
      `,
    };

    const result = analyzeAEO(file);

    expect(
      result.issues.some(
        (issue) => issue.ruleId === "missing-direct-answer"
      )
    ).toBe(false);
  });

  it("retourne un résultat pour un fichier Markdown", () => {
    const file: FileInfo = {
      path: "test.md",
      extension: ".md",
      content: `
        # Qu'est-ce que le SEO ?

        Le SEO permet d'améliorer la visibilité d'un site web
        dans les moteurs de recherche.
      `,
    };

    const result = analyzeAEO(file);

    expect(result).toBeDefined();
    expect(result.issues).toBeDefined();
  });
});