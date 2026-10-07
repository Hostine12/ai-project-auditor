import { describe, expect, it } from "vitest";

import { checkMissingTitle } from "./missing-title.js";

describe("checkMissingTitle", () => {
  it("détecte une page HTML sans balise title", () => {
    const file = {
      path: "index.html",
      content: `<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
  <h1>Accueil</h1>
</body>
</html>`,
      extension: ".html",
    };

    const issues = checkMissingTitle(file);

    expect(issues).toHaveLength(1);

    expect(issues[0]).toMatchObject({
      type: "missing-title",
      severity: "error",
      line: 2,
      column: 1,
      recommendation:
        "Ajouter une balise title unique et descriptive dans la section head de la page.",
      fix:
        "Ajouter une balise <title>...</title> à l'intérieur de la section <head>.",
    });
  });

  it("ne signale rien lorsqu'une balise title existe", () => {
    const file = {
      path: "index.html",
      content: `<html>
<head>
  <title>Ma page</title>
</head>
<body>
  <h1>Accueil</h1>
</body>
</html>`,
      extension: ".html",
    };

    const issues = checkMissingTitle(file);

    expect(issues).toHaveLength(0);
  });

  it("ignore les fichiers qui ne sont pas HTML", () => {
    const file = {
      path: "script.js",
      content: `const title = "Ma page";`,
      extension: ".js",
    };

    const issues = checkMissingTitle(file);

    expect(issues).toHaveLength(0);
  });
});