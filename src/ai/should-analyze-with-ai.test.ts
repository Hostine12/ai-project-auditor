import { describe, expect, it } from "vitest";

import {
  shouldAnalyzeWithAI,
} from "./should-analyze-with-ai.js";

import type { FileInfo } from "../types/file-info.js";

function createFile(
  extension: string,
  content: string
): FileInfo {
  return {
    path: `test${extension}`,
    content,
    extension,
  };
}

describe(
  "shouldAnalyzeWithAI",
  () => {

    it(
      "analyse toujours les fichiers HTML",
      () => {
        const file = createFile(
          ".html",
          "<h1>Bienvenue</h1>"
        );

        expect(
          shouldAnalyzeWithAI(file)
        ).toBe(true);
      }
    );

    it(
      "analyse toujours les fichiers Markdown",
      () => {
        const file = createFile(
          ".md",
          "# Bienvenue"
        );

        expect(
          shouldAnalyzeWithAI(file)
        ).toBe(true);
      }
    );

    it(
      "analyse toujours les fichiers JSX",
      () => {
        const file = createFile(
          ".jsx",
          "return <h1>Bienvenue</h1>;"
        );

        expect(
          shouldAnalyzeWithAI(file)
        ).toBe(true);
      }
    );

    it(
      "analyse toujours les fichiers TSX",
      () => {
        const file = createFile(
          ".tsx",
          "return <h1>Bienvenue</h1>;"
        );

        expect(
          shouldAnalyzeWithAI(file)
        ).toBe(true);
      }
    );

    it(
      "analyse un fichier JavaScript contenant du contenu web",
      () => {
        const file = createFile(
          ".js",
          `
            const content = \`
              <h1>Bienvenue</h1>
              <p>Découvrez notre service.</p>
            \`;
          `
        );

        expect(
          shouldAnalyzeWithAI(file)
        ).toBe(true);
      }
    );

    it(
      "analyse un fichier TypeScript contenant du contenu web",
      () => {
        const file = createFile(
          ".ts",
          `
            const page = {
              title: "<title>Formation React</title>",
              content: "<p>Apprenez React.</p>"
            };
          `
        );

        expect(
          shouldAnalyzeWithAI(file)
        ).toBe(true);
      }
    );

    it(
      "n'analyse pas un fichier JavaScript purement utilitaire",
      () => {
        const file = createFile(
          ".js",
          `
            function add(a, b) {
              return a + b;
            }

            console.log(add(2, 3));
          `
        );

        expect(
          shouldAnalyzeWithAI(file)
        ).toBe(false);
      }
    );

    it(
      "n'analyse pas un fichier TypeScript purement utilitaire",
      () => {
        const file = createFile(
          ".ts",
          `
            interface User {
              id: number;
              name: string;
            }

            const user: User = {
              id: 1,
              name: "Hostine"
            };
          `
        );

        expect(
          shouldAnalyzeWithAI(file)
        ).toBe(false);
      }
    );

    it(
      "n'analyse pas les extensions non supportées",
      () => {
        const file = createFile(
          ".css",
          "body { margin: 0; }"
        );

        expect(
          shouldAnalyzeWithAI(file)
        ).toBe(false);
      }
    );
    it(
  "analyse un fichier JavaScript contenant des métadonnées web",
  () => {
    const file = createFile(
      ".js",
      `
        const page = {
          title: "Formation React",
          description: "Apprenez React facilement",
          content: "Découvrez notre formation."
        };
      `
    );

    expect(
      shouldAnalyzeWithAI(file)
    ).toBe(true);
  }
);

it(
  "analyse un fichier TypeScript contenant des métadonnées SEO",
  () => {
    const file = createFile(
      ".ts",
      `
        const seo = {
          title: "Agence web à Cotonou",
          description: "Création de sites web professionnels",
          keywords: ["web", "React", "Laravel"]
        };
      `
    );

    expect(
      shouldAnalyzeWithAI(file)
    ).toBe(true);
  }
);

it(
  "analyse un fichier JavaScript contenant une FAQ",
  () => {
    const file = createFile(
      ".js",
      `
        const faq = [
          {
            question: "Comment créer un site web ?",
            answer: "Vous pouvez utiliser React et Laravel."
          }
        ];
      `
    );

    expect(
      shouldAnalyzeWithAI(file)
    ).toBe(true);
  }
);

it(
  "n'analyse pas un fichier JavaScript contenant uniquement de la logique métier",
  () => {
    const file = createFile(
      ".js",
      `
        function calculateTotal(items) {
          return items.reduce(
            (total, item) => total + item.price,
            0
          );
        }

        function calculateTax(amount) {
          return amount * 0.18;
        }
      `
    );

    expect(
      shouldAnalyzeWithAI(file)
    ).toBe(false);
  }
);

it(
  "n'analyse pas un fichier TypeScript contenant uniquement des types",
  () => {
    const file = createFile(
      ".ts",
      `
        interface Product {
          id: number;
          name: string;
          price: number;
        }

        type ProductId = number;
      `
    );

    expect(
      shouldAnalyzeWithAI(file)
    ).toBe(false);
  }
);

it(
  "n'analyse pas un fichier JavaScript avec une description purement technique",
  () => {
    const file = createFile(
      ".js",
      `
        const config = {
          description: "Configuration interne du module",
          timeout: 5000
        };
      `
    );

    expect(
      shouldAnalyzeWithAI(file)
    ).toBe(false);
  }
);

it(
  "n'analyse pas un fichier TypeScript avec une propriété title purement technique",
  () => {
    const file = createFile(
      ".ts",
      `
        const requestConfig = {
          title: "Configuration de la requête",
          timeout: 5000
        };
      `
    );

    expect(
      shouldAnalyzeWithAI(file)
    ).toBe(false);
  }
);

it(
  "analyse un fichier JavaScript contenant une page avec titre et contenu",
  () => {
    const file = createFile(
      ".js",
      `
        const page = {
          title: "Découvrez nos services",
          content: "Nous proposons des services adaptés à vos besoins."
        };
      `
    );

    expect(
      shouldAnalyzeWithAI(file)
    ).toBe(true);
  }
);

it(
  "analyse un fichier TypeScript contenant une structure de FAQ",
  () => {
    const file = createFile(
      ".ts",
      `
        export const faq = {
          question: "Comment fonctionne notre service ?",
          answer: "Notre service permet de gérer vos commandes en ligne."
        };
      `
    );

    expect(
      shouldAnalyzeWithAI(file)
    ).toBe(true);
  }
);

it(
  "analyse un fichier JavaScript avec plusieurs signaux de contenu web",
  () => {
    const file = createFile(
      ".js",
      `
        const page = {
          title: "Découvrez nos services",
          description: "Nous proposons des services adaptés.",
          content: "Découvrez toutes nos offres.",
          keywords: ["services", "offres"]
        };
      `
    );

    expect(
      shouldAnalyzeWithAI(file)
    ).toBe(true);
  }
);

it(
  "n'analyse pas un fichier JavaScript avec un seul signal web ambigu",
  () => {
    const file = createFile(
      ".js",
      `
        const config = {
          title: "Configuration interne",
          timeout: 5000
        };
      `
    );

    expect(
      shouldAnalyzeWithAI(file)
    ).toBe(false);
  }
);

it(
  "analyse un fichier TypeScript avec une FAQ complète",
  () => {
    const file = createFile(
      ".ts",
      `
        export const faq = [
          {
            question: "Comment fonctionne notre service ?",
            answer: "Notre service permet de gérer vos commandes.",
          },
          {
            question: "Quels sont les délais ?",
            answer: "Les commandes sont livrées rapidement.",
          }
        ];
      `
    );

    expect(
      shouldAnalyzeWithAI(file)
    ).toBe(true);
  }
);
  }
);