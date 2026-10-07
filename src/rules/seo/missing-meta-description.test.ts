import { describe, it, expect } from "vitest";
import { checkMissingMetaDescription } from "./missing-meta-description.js";
import type { FileInfo } from "../../types/file-info.js";

describe("checkMissingMetaDescription", () => {
  it("détecte l'absence de meta description", () => {
    const file: FileInfo = {
      path: "index.html",
      extension: ".html",
      content:
        "<html>\n<head>\n  <title>Accueil</title>\n</head>\n<body>\n  <h1>Bienvenue</h1>\n</body>\n</html>",
    };

    const issues = checkMissingMetaDescription(file);

    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe("missing-meta-description");
    expect(issues[0].severity).toBe("warning");
    expect(issues[0].line).toBe(1);
    expect(issues[0].column).toBe(1);
    expect(issues[0].recommendation).toBeDefined();
    expect(issues[0].fix).toBeDefined();
  });

  it("ne signale rien si une meta description existe", () => {
    const file: FileInfo = {
      path: "index.html",
      extension: ".html",
      content:
        '<html>\n<head>\n<meta name="description" content="Description de la page">\n</head>\n<body>\n<h1>Accueil</h1>\n</body>\n</html>',
    };

    const issues = checkMissingMetaDescription(file);

    expect(issues).toHaveLength(0);
  });

  it("détecte une meta description avec des guillemets simples", () => {
    const file: FileInfo = {
      path: "index.html",
      extension: ".html",
      content:
        "<html><head><meta name='description' content='Description de la page'></head></html>",
    };

    const issues = checkMissingMetaDescription(file);

    expect(issues).toHaveLength(0);
  });

  it("ignore les extensions non HTML", () => {
    const file: FileInfo = {
      path: "page.jsx",
      extension: ".jsx",
      content:
        "export default function Page() { return <h1>Accueil</h1>; }",
    };

    const issues = checkMissingMetaDescription(file);

    expect(issues).toHaveLength(0);
  });
});