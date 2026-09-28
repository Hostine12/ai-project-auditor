import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  mkdtemp,
  rm,
  writeFile,
} from "node:fs/promises";

import {
  tmpdir,
} from "node:os";

import {
  join,
} from "node:path";

vi.mock("./ai/ai-analyzer.js", () => ({
  analyzeWithAI: vi.fn(),
}));

vi.mock("node:fs/promises", async () => {
  const actual =
    await vi.importActual<
      typeof import("node:fs/promises")
    >("node:fs/promises");

  return {
    ...actual,

    readFile: vi.fn(
      async (
        filePath: Parameters<
          typeof actual.readFile
        >[0],
        ...args: Parameters<
          typeof actual.readFile
        >[1][]
      ) => {
        if (
          String(filePath).endsWith(
            "fichier-probleme.html"
          )
        ) {
          throw new Error(
            "Permission refusée"
          );
        }

        return actual.readFile(
          filePath,
          ...args
        );
      }
    ),
  };
});

import { runAudit } from "./audit-runner.js";

import {
  analyzeWithAI,
} from "./ai/ai-analyzer.js";

// import { startScan } from "./scanner/project-scanner.js";

// vi.mock("./scanner/project-scanner.js", () => ({
//   startScan: vi.fn(),
// }));

const temporaryDirectories: string[] = [];

afterEach(async () => {
  for (
    const directory
    of temporaryDirectories
  ) {
    await rm(
      directory,
      {
        recursive: true,
        force: true,
      }
    );
  }

  temporaryDirectories.length = 0;
});

describe(
  "runAudit - intégration",
  () => {

    it(
      "analyse un projet temporaire",
      async () => {

        const projectDirectory =
          await mkdtemp(
            join(
              tmpdir(),
              "ai-project-auditor-"
            )
          );

        temporaryDirectories.push(
          projectDirectory
        );

        await writeFile(
          join(
            projectDirectory,
            "index.html"
          ),
          `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Test</title>
                <meta
                  name="description"
                  content="Page de test"
                />
              </head>

              <body>
                <h1>Page de test</h1>
              </body>
            </html>
          `,
          "utf-8"
        );

        
        vi.mocked(analyzeWithAI).mockResolvedValue({
  file: join(
    projectDirectory,
    "index.html"
  ),

  seo: {
    title: "Test",
    h1: ["Page de test"],
    metaDescription: "Page de test",
    keywords: [],
    strengths: [],
    weaknesses: [],
    recommendations: [],
  },

  aeo: {
    directAnswer: null,
    strengths: [],
    weaknesses: [],
    recommendations: [],
  },
});
        const result =
          await runAudit(
            projectDirectory
          );

        expect(
          result.metadata.filesScanned
        ).toBe(1);

        expect(
          result.scan.errors
        ).toEqual([]);

        expect(
          result.seo.score
        ).toBeGreaterThanOrEqual(0);

        expect(
          result.seo.score
        ).toBeLessThanOrEqual(100);

        expect(
          result.aeo.score
        ).toBeGreaterThanOrEqual(0);

        expect(
          result.aeo.score
        ).toBeLessThanOrEqual(100);
      }
    );

    it(
  "continue l'audit lorsqu'un fichier est illisible",
  async () => {

    const projectDirectory =
      await mkdtemp(
        join(
          tmpdir(),
          "ai-project-auditor-"
        )
      );

    temporaryDirectories.push(
      projectDirectory
    );

    await writeFile(
      join(
        projectDirectory,
        "index.html"
      ),
      `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Test</title>
            <meta
              name="description"
              content="Page de test"
            />
          </head>

          <body>
            <h1>Page de test</h1>
          </body>
        </html>
      `,
      "utf-8"
    );

    await writeFile(
      join(
        projectDirectory,
        "fichier-probleme.html"
      ),
      `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Fichier problématique</title>
          </head>

          <body>
            <h1>Test</h1>
          </body>
        </html>
      `,
      "utf-8"
    );

    vi.mocked(analyzeWithAI).mockResolvedValue({
      file: join(
        projectDirectory,
        "index.html"
      ),

      seo: {
        title: "Test",
        h1: ["Page de test"],
        metaDescription: "Page de test",
        keywords: [],
        strengths: [],
        weaknesses: [],
        recommendations: [],
      },

      aeo: {
        directAnswer: null,
        strengths: [],
        weaknesses: [],
        recommendations: [],
      },
    });

    const result =
      await runAudit(
        projectDirectory
      );

    expect(
      result.metadata.filesScanned
    ).toBe(1);

    expect(
  result.scan.errors
).toHaveLength(1);

expect(
  result.scan.errors[0]?.error
).toBe(
  "Permission refusée"
);

expect(
  result.scan.errors[0]?.file
).toContain(
  "fichier-probleme.html"
);

    expect(
      result.seo.score
    ).toBeGreaterThanOrEqual(0);

    expect(
      result.seo.score
    ).toBeLessThanOrEqual(100);
  }
);

it("continue l'audit lorsqu'une analyse IA échoue", async () => {
  const projectDirectory = await mkdtemp(
    join(tmpdir(), "ai-project-auditor-")
  );

  temporaryDirectories.push(projectDirectory);

  await writeFile(
    join(projectDirectory, "index.html"),
    `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Page de test</title>
          <meta name="description" content="Une page de test">
        </head>
        <body>
          <h1>Bienvenue</h1>
        </body>
      </html>
    `
  );

  vi.mocked(analyzeWithAI).mockRejectedValue(
    new Error("Erreur simulée du fournisseur IA")
  );

  const result = await runAudit(
    projectDirectory
  );

  expect(
    result.metadata.filesScanned
  ).toBe(1);

  expect(
    result.ai.results
  ).toHaveLength(0);

  expect(
    result.ai.errors
  ).toHaveLength(1);

  expect(
    result.ai.errors[0]?.error
  ).toBe(
    "Erreur simulée du fournisseur IA"
  );

  expect(
    result.ai.errors[0]?.file
  ).toContain("index.html");

  expect(
    result.seo.score
  ).toBeGreaterThanOrEqual(0);

  expect(
    result.seo.score
  ).toBeLessThanOrEqual(100);

  expect(
    result.aeo.score
  ).toBeGreaterThanOrEqual(0);

  expect(
    result.aeo.score
  ).toBeLessThanOrEqual(100);
});

it("continue l'analyse des autres fichiers lorsqu'une analyse IA échoue", async () => {
  const projectDirectory = await mkdtemp(
    join(tmpdir(), "ai-project-auditor-")
  );

  temporaryDirectories.push(projectDirectory);

  await writeFile(
    join(projectDirectory, "index.html"),
    `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Accueil</title>
          <meta name="description" content="Page d'accueil">
        </head>
        <body>
          <h1>Accueil</h1>
        </body>
      </html>
    `
  );

  await writeFile(
    join(projectDirectory, "about.html"),
    `
      <!DOCTYPE html>
      <html>
        <head>
          <title>À propos</title>
        </head>
        <body>
          <h1>À propos</h1>
        </body>
      </html>
    `
  );

  await writeFile(
    join(projectDirectory, "contact.html"),
    `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contact</title>
          <meta name="description" content="Contactez-nous">
        </head>
        <body>
          <h1>Contact</h1>
        </body>
      </html>
    `
  );

  vi.mocked(analyzeWithAI).mockImplementation(
    async (file) => {
      if (file.path.endsWith("about.html")) {
        throw new Error(
          "Erreur IA pour about.html"
        );
      }

      return {
        file: file.path,
        seo: {
          title: "Titre de test",
          h1: ["Titre principal"],
          metaDescription: "Description de test",
          keywords: [],
          strengths: [],
          weaknesses: [],
          recommendations: [],
        },
        aeo: {
          directAnswer: null,
          strengths: [],
          weaknesses: [],
          recommendations: [],
        },
      };
    }
  );

  const result = await runAudit(
    projectDirectory
  );

  expect(
    result.metadata.filesScanned
  ).toBe(3);

  expect(
    result.ai.results
  ).toHaveLength(2);

  expect(
    result.ai.errors
  ).toHaveLength(1);

  expect(
    result.ai.errors[0]?.error
  ).toBe(
    "Erreur IA pour about.html"
  );

  expect(
    result.ai.errors[0]?.file
  ).toContain("about.html");

  expect(
    result.ai.results.some(
      (item) =>
        item.file.endsWith("index.html")
    )
  ).toBe(true);

  expect(
    result.ai.results.some(
      (item) =>
        item.file.endsWith("contact.html")
    )
  ).toBe(true);
});

it("gère un projet sans fichier analysable par l'IA", async () => {
  const projectDirectory = await mkdtemp(
    join(tmpdir(), "ai-project-auditor-")
  );

  temporaryDirectories.push(projectDirectory);

  await writeFile(
    join(projectDirectory, "script.js"),
    `
      console.log("Hello World");
    `
  );

  await writeFile(
    join(projectDirectory, "app.ts"),
    `
      const message: string = "Hello";
    `
  );

  await writeFile(
    join(projectDirectory, "composant.tsx"),
    `
      export default function App() {
        return <div>Hello</div>;
      }
    `
  );

  vi.mocked(analyzeWithAI).mockClear();

  const result = await runAudit(
    projectDirectory
  );

  expect(
    result.metadata.filesScanned
  ).toBe(3);

  expect(
    result.ai.results
  ).toHaveLength(0);

  expect(
    result.ai.errors
  ).toHaveLength(0);

  expect(
    analyzeWithAI
  ).not.toHaveBeenCalled();
});

it("analyse correctement plusieurs fichiers dans un même projet", async () => {
  const projectDirectory = await mkdtemp(
    join(tmpdir(), "ai-project-auditor-")
  );

  temporaryDirectories.push(projectDirectory);

  await writeFile(
    join(projectDirectory, "index.html"),
    `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Accueil</title>
          <meta name="description" content="Page d'accueil">
        </head>
        <body>
          <h1>Accueil</h1>
        </body>
      </html>
    `
  );

  await writeFile(
    join(projectDirectory, "about.html"),
    `
      <!DOCTYPE html>
      <html>
        <head>
          <title>À propos</title>
          <meta name="description" content="À propos de notre projet">
        </head>
        <body>
          <h1>À propos</h1>
        </body>
      </html>
    `
  );

  await writeFile(
    join(projectDirectory, "contact.html"),
    `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Contact</title>
          <meta name="description" content="Contactez-nous">
        </head>
        <body>
          <h1>Contact</h1>
        </body>
      </html>
    `
  );

  vi.mocked(analyzeWithAI).mockResolvedValue({
    file: "test.html",
    seo: {
      title: "Page de test",
      h1: ["Titre"],
      metaDescription: "Description",
      keywords: [],
      strengths: [],
      weaknesses: [],
      recommendations: [],
    },
    aeo: {
      directAnswer: null,
      strengths: [],
      weaknesses: [],
      recommendations: [],
    },
  });

  const result = await runAudit(
    projectDirectory
  );

  expect(
    result.metadata.filesScanned
  ).toBe(3);

  expect(
    result.ai.results
  ).toHaveLength(3);

  expect(
    result.ai.errors
  ).toHaveLength(0);

  expect(
    result.seo.summary.totalIssues
  ).toBeGreaterThanOrEqual(0);

  expect(
    result.aeo.summary.totalIssues
  ).toBeGreaterThanOrEqual(0);

  expect(
    result.seo.score
  ).toBeGreaterThanOrEqual(0);

  expect(
    result.seo.score
  ).toBeLessThanOrEqual(100);

  expect(
    result.aeo.score
  ).toBeGreaterThanOrEqual(0);

  expect(
    result.aeo.score
  ).toBeLessThanOrEqual(100);
});
  }
);