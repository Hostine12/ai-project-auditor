import {
  afterEach,
  beforeEach,
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

vi.mock("./ai/ai-provider-factory.js", () => ({
  createAIProvider: vi.fn(),
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

import {
  createAIProvider,
} from "./ai/ai-provider-factory.js";

import { startScan } from "./scanner/project-scanner.js";

vi.mock("./scanner/project-scanner.js", async () => {
  const actual =
    await vi.importActual<
      typeof import("./scanner/project-scanner.js")
    >("./scanner/project-scanner.js");

  return {
    ...actual,
    startScan: vi.fn(actual.startScan),
  };
});

const temporaryDirectories: string[] = [];

beforeEach(() => {
  vi.mocked(
    createAIProvider
  ).mockReturnValue({
    provider: {} as never,
    providerName: "openrouter",
    model: "openrouter/free",
  });
});

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

it("n'effectue pas l'analyse SEO lorsque la fonctionnalité SEO est désactivée", async () => {
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
        </head>

        <body>
          <h1>Test</h1>
        </body>
      </html>
    `,
    "utf-8"
  );

  const config = {
    include: [],
    exclude: [],
    features: {
      seo: false,
      aeo: true,
      ai: false,
    },
    output: {
      path: "audit-report.json",
    },
    ci: {
      threshold: 0,
    },
  };

  const result = await runAudit(
    projectDirectory,
    config
  );

  expect(result.metadata.filesScanned).toBe(1);

  expect(result.seo.issues).toEqual([]);
  expect(result.seo.summary.totalIssues).toBe(0);
  expect(result.seo.score).toBe(100);
});

it("n'effectue pas l'analyse AEO lorsque la fonctionnalité AEO est désactivée", async () => {
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
          <meta
            name="description"
            content="Une page de test"
          />
        </head>

        <body>
          <h1>Test</h1>
        </body>
      </html>
    `,
    "utf-8"
  );

  const config = {
    include: [],
    exclude: [],
    features: {
      seo: true,
      aeo: false,
      ai: false,
    },
    output: {
      path: "audit-report.json",
    },
    ci: {
      threshold: 0,
    },
  };

  const result = await runAudit(
    projectDirectory,
    config
  );

  expect(
    result.metadata.filesScanned
  ).toBe(1);

  expect(
    result.aeo.issues
  ).toEqual([]);

  expect(
    result.aeo.summary.totalIssues
  ).toBe(0);

  expect(
    result.aeo.score
  ).toBe(100);
});

it("n'effectue pas l'analyse IA lorsque la fonctionnalité IA est désactivée", async () => {
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
          <meta
            name="description"
            content="Une page de test"
          />
        </head>

        <body>
          <h1>Test</h1>
        </body>
      </html>
    `,
    "utf-8"
  );

  vi.mocked(analyzeWithAI).mockClear();

  const config = {
    include: [],
    exclude: [],
    features: {
      seo: true,
      aeo: true,
      ai: false,
    },
    output: {
      path: "audit-report.json",
    },
    ci: {
      threshold: 0,
    },
  };

  const result = await runAudit(
    projectDirectory,
    config
  );

  expect(
    result.metadata.filesScanned
  ).toBe(1);

  expect(
    result.ai.results
  ).toEqual([]);

  expect(
    result.ai.errors
  ).toEqual([]);

  expect(
    analyzeWithAI
  ).not.toHaveBeenCalled();
});

it(
  "calcule les scores globaux à partir des pénalités agrégées",
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
        "perfect.html"
      ),
      `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Page parfaite</title>
            <meta
              name="description"
              content="Une page parfaitement optimisée"
            />
          </head>

          <body>
            <h1>Page parfaite</h1>

            <p>
              Cette page contient une réponse directement identifiable.
            </p>
          </body>
        </html>
      `,
      "utf-8"
    );

    await writeFile(
      join(
        projectDirectory,
        "problem.html"
      ),
      `
        <!DOCTYPE html>
        <html>
          <head>
          </head>

          <body>
            <p></p>
          </body>
        </html>
      `,
      "utf-8"
    );

    const config = {
      ai: {
        provider: "openrouter" as const,
      },

      include: [],

      exclude: [],

      features: {
        seo: true,
        aeo: true,
        ai: false,
      },

      output: {
        path: "audit-report.json",
      },

      ci: {
        threshold: 0,
      },
    };

    const result =
      await runAudit(
        projectDirectory,
        config
      );

    /*
 * perfect.html
 * SEO = 100
 * AEO = 100
 *
 * problem.html
 * missing-title           = -20
 * missing-h1              = -10
 * missing-meta-description = -5
 *
 * Pénalité SEO globale = 35
 * SEO global = 100 - 35 = 65
 *
 * problem.html
 * missing-direct-answer = -10
 *
 * Pénalité AEO globale = 10
 * AEO global = 100 - 10 = 90
 */

    expect(
  result.seo.score
).toBe(65);

expect(
  result.aeo.score
).toBe(90);
  }
);

it(
  "transmet la configuration effective au scanner",
  async () => {
    const projectDirectory = await mkdtemp(
      join(tmpdir(), "ai-project-auditor-")
    );

    temporaryDirectories.push(projectDirectory);

    const config = {
      include: ["src"],
      exclude: ["node_modules"],
      features: {
        seo: false,
        aeo: false,
        ai: false,
      },
      output: {
        path: "audit-report.json",
      },
      ci: {
        threshold: 0,
      },
    };

    vi.mocked(startScan).mockResolvedValue({
      files: [],
      errors: [],
    });

    await runAudit(
      projectDirectory,
      config
    );

    expect(startScan).toHaveBeenCalledWith(
      projectDirectory,
      config
    );
  }
);

it(
  "utilise le provider et le modèle configurés dans le fichier de configuration",
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
            <title>Page de test</title>
            <meta
              name="description"
              content="Une page de test"
            />
          </head>

          <body>
            <h1>Test</h1>
          </body>
        </html>
      `,
      "utf-8"
    );

    await writeFile(
      join(
        projectDirectory,
        "ai-audit.config.json"
      ),
      JSON.stringify(
        {
          ai: {
            provider: "groq",
            model: "mon-modele-groq",
          },
        }
      ),
      "utf-8"
    );

    vi.mocked(
      createAIProvider
    ).mockReturnValue({
      provider: {} as never,
      providerName: "groq",
      model: "mon-modele-groq",
    });

    vi.mocked(
      analyzeWithAI
    ).mockResolvedValue({
      file: join(
        projectDirectory,
        "index.html"
      ),

      seo: {
        title: "Page de test",
        h1: ["Test"],
        metaDescription: "Une page de test",
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

    await runAudit(
      projectDirectory
    );

    expect(
      createAIProvider
    ).toHaveBeenCalledWith({
      ai: {
        provider: "groq",
        model: "mon-modele-groq",
      },

      include: [],

      exclude: [
        "node_modules",
        ".git",
        "dist",
        "build",
      ],

      features: {
        seo: true,
        aeo: true,
        ai: true,
      },

      output: {
        path: "audit-report.json",
      },

      ci: {
        threshold: 0,
      },
    });
  }
);

  }
);