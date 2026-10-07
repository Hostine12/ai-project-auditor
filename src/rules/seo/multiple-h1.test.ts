import { describe, it, expect } from "vitest";
import { checkMultipleH1 } from "./multiple-h1.js";
import type { FileInfo } from "../../types/file-info.js";

describe("checkMultipleH1", () => {
  it("détecte plusieurs balises H1", () => {
    const file: FileInfo = {
      path: "index.html",
      extension: ".html",
      content:
        "<html>\n<body>\n  <h1>Premier titre</h1>\n  <h1>Deuxième titre</h1>\n</body>\n</html>",
    };

    const issues = checkMultipleH1(file);

    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe("multiple-h1");
    expect(issues[0].message).toBe(
      "La page contient 2 balises H1."
    );
    expect(issues[0].line).toBe(4);
    expect(issues[0].column).toBe(3);
    expect(issues[0].recommendation).toBeDefined();
    expect(issues[0].fix).toBeDefined();
  });

  it("ne signale rien lorsqu'il n'y a qu'un seul H1", () => {
    const file: FileInfo = {
      path: "index.html",
      extension: ".html",
      content:
        "<html>\n<body>\n  <h1>Premier titre</h1>\n</body>\n</html>",
    };

    const issues = checkMultipleH1(file);

    expect(issues).toHaveLength(0);
  });

  it("ne signale rien lorsqu'il n'y a aucun H1", () => {
    const file: FileInfo = {
      path: "index.html",
      extension: ".html",
      content:
        "<html>\n<body>\n  <h2>Un titre secondaire</h2>\n</body>\n</html>",
    };

    const issues = checkMultipleH1(file);

    expect(issues).toHaveLength(0);
  });

  it("ignore les extensions non prises en charge", () => {
    const file: FileInfo = {
      path: "script.js",
      extension: ".js",
      content:
        "const content = '<h1>Premier</h1><h1>Deuxième</h1>';",
    };

    const issues = checkMultipleH1(file);

    expect(issues).toHaveLength(0);
  });

  it("fonctionne avec les fichiers JSX et TSX", () => {
    const jsxFile: FileInfo = {
      path: "Home.jsx",
      extension: ".jsx",
      content:
        "export default function Home() {\n  return (\n    <div>\n      <h1>Premier</h1>\n      <h1>Deuxième</h1>\n    </div>\n  );\n}",
    };

    const tsxFile: FileInfo = {
      path: "Home.tsx",
      extension: ".tsx",
      content:
        "export default function Home() {\n  return (\n    <div>\n      <h1>Premier</h1>\n      <h1>Deuxième</h1>\n    </div>\n  );\n}",
    };

    expect(checkMultipleH1(jsxFile)).toHaveLength(1);
    expect(checkMultipleH1(tsxFile)).toHaveLength(1);
  });
});