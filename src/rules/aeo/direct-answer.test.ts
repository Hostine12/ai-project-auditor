import { describe, expect, it } from "vitest";
import { checkDirectAnswer } from "./direct-answer.js";
import type { FileInfo } from "../../types/file-info.js";

describe("checkDirectAnswer", () => {
  it("détecte l'absence de contenu textuel identifiable", () => {
    const file: FileInfo = {
      path: "index.html",
      extension: ".html",
      content: `
        <html>
          <head>
            <title>Accueil</title>
          </head>
          <body>
            <h1>Accueil</h1>
          </body>
        </html>
      `,
    };

    const issues = checkDirectAnswer(file);

    expect(issues).toHaveLength(1);

    expect(issues[0]).toMatchObject({
      type: "missing-direct-answer",
      severity: "warning",
      line: 1,
      column: 1,
    });

    expect(issues[0].recommendation).toBeDefined();
    expect(issues[0].fix).toBeDefined();
  });

  it("ne signale rien lorsqu'un contenu textuel existe", () => {
    const file: FileInfo = {
      path: "index.html",
      extension: ".html",
      content: `
        <html>
          <body>
            <h1>Accueil</h1>
            <p>Notre service permet de créer facilement votre boutique en ligne.</p>
          </body>
        </html>
      `,
    };

    const issues = checkDirectAnswer(file);

    expect(issues).toHaveLength(0);
  });

  it("ignore les fichiers qui ne sont pas HTML, JSX ou TSX", () => {
    const file: FileInfo = {
      path: "script.js",
      extension: ".js",
      content: `
        const content = "<p>Une réponse</p>";
      `,
    };

    const issues = checkDirectAnswer(file);

    expect(issues).toHaveLength(0);
  });

  it("fonctionne avec les fichiers JSX et TSX", () => {
    const jsxFile: FileInfo = {
      path: "Home.jsx",
      extension: ".jsx",
      content: `
        export default function Home() {
          return <p>Notre service permet de...</p>;
        }
      `,
    };

    const tsxFile: FileInfo = {
      path: "Home.tsx",
      extension: ".tsx",
      content: `
        export default function Home() {
          return <p>Notre service permet de...</p>;
        }
      `,
    };

    expect(checkDirectAnswer(jsxFile)).toHaveLength(0);
    expect(checkDirectAnswer(tsxFile)).toHaveLength(0);
  });
});