import { describe, expect, it } from "vitest";

import { analyzeSEO } from "./seo-analyzer.js";

import type { FileInfo } from "../types/file-info.js";

describe("analyzeSEO", () => {
  it("détecte l'absence du title", () => {
    const file: FileInfo = {
      path: "test.html",
      extension: ".html",
      content: `
        <!DOCTYPE html>
        <html>
          <head>
          </head>
          <body>
            <h1>Ma page</h1>
          </body>
        </html>
      `,
    };

    const result = analyzeSEO(file);

    expect(result.issues.length).toBeGreaterThan(0);

    expect(
      result.issues.some(
        (issue) => issue.ruleId === "missing-title"
      )
    ).toBe(true);
  });

  it("ne signale pas missing-title lorsque le title est présent", () => {
  const file: FileInfo = {
    path: "test.html",
    extension: ".html",
    content: `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ma page</title>
        </head>
        <body>
          <h1>Ma page</h1>
        </body>
      </html>
    `,
  };

  const result = analyzeSEO(file);

  expect(
    result.issues.some(
      (issue) => issue.ruleId === "missing-title"
    )
  ).toBe(false);
});

it("détecte l'absence du h1", () => {
  const file: FileInfo = {
    path: "test.html",
    extension: ".html",
    content: `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ma page</title>
        </head>
        <body>
          <p>Contenu de ma page</p>
        </body>
      </html>
    `,
  };

  const result = analyzeSEO(file);

  expect(
    result.issues.some(
      (issue) => issue.ruleId === "missing-h1"
    )
  ).toBe(true);
});
});