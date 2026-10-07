
import { describe, expect, it } from "vitest";

import { checkMissingAlt } from "./missing-alt.js";

describe("checkMissingAlt", () => {
  it("détecte une image sans attribut alt", () => {
    const file = {
      path: "index.html",
      content: `<html>
<body>
  <img src="photo.jpg">
</body>
</html>`,
      extension: ".html",
    };

    const issues = checkMissingAlt(file);

    expect(issues).toHaveLength(1);

    expect(issues[0]).toMatchObject({
      type: "missing-alt",
      severity: "warning",
      line: 3,
      column: 3,
      recommendation:
        "Ajouter un attribut alt décrivant le contenu ou la fonction de l'image.",
      fix:
        'Ajouter un attribut alt à la balise img, par exemple alt="Description de l’image".',
    });
  });

  it("ne signale pas une image qui possède un attribut alt", () => {
    const file = {
      path: "index.html",
      content: `<img src="photo.jpg" alt="Une photo">`,
      extension: ".html",
    };

    const issues = checkMissingAlt(file);

    expect(issues).toHaveLength(0);
  });

  it("détecte plusieurs images sans attribut alt", () => {
    const file = {
      path: "index.html",
      content: `<img src="photo1.jpg">
<img src="photo2.jpg">`,
      extension: ".html",
    };

    const issues = checkMissingAlt(file);

    expect(issues).toHaveLength(2);
  });

  it("ignore les fichiers non pris en charge", () => {
    const file = {
      path: "script.js",
      content: `<img src="photo.jpg">`,
      extension: ".js",
    };

    const issues = checkMissingAlt(file);

    expect(issues).toHaveLength(0);
  });

  it("prend en charge les fichiers JSX et TSX", () => {
    const jsxFile = {
      path: "Component.jsx",
      content: `<img src="photo.jpg">`,
      extension: ".jsx",
    };

    const tsxFile = {
      path: "Component.tsx",
      content: `<img src="photo.jpg">`,
      extension: ".tsx",
    };

    expect(checkMissingAlt(jsxFile)).toHaveLength(1);
    expect(checkMissingAlt(tsxFile)).toHaveLength(1);
  });
});