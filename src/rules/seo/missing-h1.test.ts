
import { describe, it, expect } from "vitest";
import { checkMissingH1 } from "./missing-h1.js";
import type { FileInfo } from "../../types/file-info.js";

describe("checkMissingH1", () => {
  it("détecte une page sans H1", () => {
    const file: FileInfo = {
      path: "index.html",
      extension: ".html",
      content: "<html><body><p>Bonjour</p></body></html>",
    };

    const issues = checkMissingH1(file);

    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe("missing-h1");
    expect(issues[0].line).toBe(1);
    expect(issues[0].column).toBe(1);
    expect(issues[0].recommendation).toBeDefined();
    expect(issues[0].fix).toBeDefined();
  });

  it("ne signale rien si un H1 existe", () => {
    const file: FileInfo = {
      path: "index.html",
      extension: ".html",
      content: "<html><body><h1>Accueil</h1></body></html>",
    };

    expect(checkMissingH1(file)).toHaveLength(0);
  });

  it("ignore les extensions non prises en charge", () => {
    const file: FileInfo = {
      path: "script.js",
      extension: ".js",
      content: "const title = 'Accueil';",
    };

    expect(checkMissingH1(file)).toHaveLength(0);
  });

  it("fonctionne avec les fichiers JSX et TSX", () => {
    const jsxFile: FileInfo = {
      path: "Home.jsx",
      extension: ".jsx",
      content: "export default function Home() { return <p>Accueil</p>; }",
    };

    const tsxFile: FileInfo = {
      path: "Home.tsx",
      extension: ".tsx",
      content: "export default function Home() { return <p>Accueil</p>; }",
    };

    expect(checkMissingH1(jsxFile)).toHaveLength(1);
    expect(checkMissingH1(tsxFile)).toHaveLength(1);
  });
});