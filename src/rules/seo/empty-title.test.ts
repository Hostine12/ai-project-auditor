import { describe, expect, it } from "vitest";

import { checkEmptyTitle } from "./empty-title.js";

describe("checkEmptyTitle", () => {
  it("détecte une balise title vide", () => {
    const file = {
      path: "index.html",
      content: `<html>
<head>
  <title></title>
</head>
<body>
  <h1>Accueil</h1>
</body>
</html>`,
      extension: ".html",
    };

    const issues = checkEmptyTitle(file);

    expect(issues).toHaveLength(1);

    expect(issues[0]).toMatchObject({
      type: "empty-title",
      severity: "error",
      line: 3,
      column: 3,
      recommendation:
        "Ajouter un titre descriptif et pertinent dans la balise title.",
      fix:
        "Remplacer <title></title> par une balise contenant un titre descriptif, par exemple <title>Accueil - Mon site</title>.",
    });
  });

  it("ne signale pas une balise title contenant du texte", () => {
    const file = {
      path: "index.html",
      content: `<html>
<head>
  <title>Accueil</title>
</head>
<body>
  <h1>Accueil</h1>
</body>
</html>`,
      extension: ".html",
    };

    const issues = checkEmptyTitle(file);

    expect(issues).toHaveLength(0);
  });

  it("détecte une balise title contenant uniquement des espaces", () => {
    const file = {
      path: "index.html",
      content: `<html>
<head>
  <title>   </title>
</head>
<body>
  <h1>Accueil</h1>
</body>
</html>`,
      extension: ".html",
    };

    const issues = checkEmptyTitle(file);

    expect(issues).toHaveLength(1);

    expect(issues[0]).toMatchObject({
      type: "empty-title",
      line: 3,
      column: 3,
    });
  });

  it("ignore les fichiers qui ne sont pas HTML", () => {
    const file = {
      path: "script.js",
      content: `const title = "";`,
      extension: ".js",
    };

    const issues = checkEmptyTitle(file);

    expect(issues).toHaveLength(0);
  });
});