import { describe, expect, it, vi } from "vitest";

import {
  mkdir,
  mkdtemp,
  rm,
  writeFile,
} from "node:fs/promises";

import { tmpdir } from "node:os";

import { join } from "node:path";

vi.mock("node:fs/promises", async () => {
  const actual = await vi.importActual<
    typeof import("node:fs/promises")
  >("node:fs/promises");

  return {
    ...actual,
    readFile: vi.fn(actual.readFile),
  };
});

import { readFile } from "node:fs/promises";
import { startScan } from "./project-scanner.js";

describe("startScan", () => {
  it("rejette un dossier qui n'existe pas", async () => {
    await expect(
      startScan("./dossier-inexistant-pour-test")
    ).rejects.toThrow(
      "Le dossier indiqué n'existe pas"
    );
  });

  it("continue le scan lorsqu'un fichier est illisible", async () => {
    vi.mocked(readFile).mockRejectedValueOnce(
      new Error("Permission refusée")
    );

    const result = await startScan(".");

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]?.error).toBe(
      "Permission refusée"
    );
  });
it("utilise les exclusions fournies par la configuration", async () => {
  const projectPath = await mkdtemp(
    join(tmpdir(), "ai-auditor-test-")
  );

  try {
    const customFolder = join(
      projectPath,
      "custom-folder"
    );

    await mkdir(customFolder);

    await writeFile(
      join(projectPath, "index.html"),
      "<html></html>",
      "utf-8"
    );

    await writeFile(
      join(customFolder, "page.html"),
      "<html></html>",
      "utf-8"
    );

    const config = {
      include: [],
      exclude: [
        "node_modules",
        ".git",
        "dist",
        "build",
        "custom-folder",
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
    };

    const result = await startScan(
      projectPath,
      config
    );

    expect(result.files).toHaveLength(1);

    expect(
      result.files[0]?.path
    ).toContain("index.html");
  } finally {
    await rm(projectPath, {
      recursive: true,
      force: true,
    });
  }
});

it(
  "analyse uniquement les dossiers inclus",
  async () => {
    const projectPath =
      await mkdtemp(
        join(
          tmpdir(),
          "ai-auditor-include-test-"
        )
      );

    try {
      const srcFolder =
        join(
          projectPath,
          "src"
        );

      const publicFolder =
        join(
          projectPath,
          "public"
        );

      await mkdir(
        srcFolder
      );

      await mkdir(
        publicFolder
      );

      await writeFile(
        join(
          srcFolder,
          "page.html"
        ),
        "<html></html>",
        "utf-8"
      );

      await writeFile(
        join(
          publicFolder,
          "index.html"
        ),
        "<html></html>",
        "utf-8"
      );

      const config = {
        include: ["src"],
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
      };

      const result =
        await startScan(
          projectPath,
          config
        );

      expect(
        result.files
      ).toHaveLength(1);

      expect(
        result.files[0]?.path
      ).toContain(
        "src"
      );

      expect(
        result.files[0]?.path
      ).toContain(
        "page.html"
      );
    } finally {
      await rm(
        projectPath,
        {
          recursive: true,
          force: true,
        }
      );
    }
  }
);

it(
  "conserve les exclusions par défaut avec une exclusion personnalisée",
  async () => {
    const projectPath =
      await mkdtemp(
        join(
          tmpdir(),
          "ai-auditor-default-exclude-test-"
        )
      );

    try {
      const distFolder =
        join(
          projectPath,
          "dist"
        );

      await mkdir(
        distFolder
      );

      await writeFile(
        join(
          projectPath,
          "index.html"
        ),
        "<html></html>",
        "utf-8"
      );

      await writeFile(
        join(
          distFolder,
          "generated.html"
        ),
        "<html></html>",
        "utf-8"
      );

      const config = {
        include: [],
        exclude: ["custom-folder"],
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
      };

      const result =
        await startScan(
          projectPath,
          config
        );

      expect(
        result.files.some(
          (file) =>
            file.path.includes(
              "generated.html"
            )
        )
      ).toBe(false);

      expect(
        result.files.some(
          (file) =>
            file.path.includes(
              "index.html"
            )
        )
      ).toBe(true);
    } finally {
      await rm(
        projectPath,
        {
          recursive: true,
          force: true,
        }
      );
    }
  }
);

it(
  "exclut un fichier précis indiqué dans la configuration",
  async () => {
    const projectPath =
      await mkdtemp(
        join(
          tmpdir(),
          "ai-auditor-file-exclude-test-"
        )
      );

    try {
      await writeFile(
        join(
          projectPath,
          "index.html"
        ),
        "<html></html>",
        "utf-8"
      );

      await writeFile(
        join(
          projectPath,
          "page-a-exclure.html"
        ),
        "<html></html>",
        "utf-8"
      );

      const config = {
        include: [],
        exclude: [
          "page-a-exclure.html",
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
      };

      const result =
        await startScan(
          projectPath,
          config
        );

      expect(
        result.files.some(
          (file) =>
            file.path.includes(
              "page-a-exclure.html"
            )
        )
      ).toBe(false);

      expect(
        result.files.some(
          (file) =>
            file.path.includes(
              "index.html"
            )
        )
      ).toBe(true);
    } finally {
      await rm(
        projectPath,
        {
          recursive: true,
          force: true,
        }
      );
    }
  }
);

it(
  "applique les exclusions à l'intérieur des dossiers inclus",
  async () => {
    const projectPath =
      await mkdtemp(
        join(
          tmpdir(),
          "ai-auditor-include-exclude-test-"
        )
      );

    try {
      const srcFolder =
        join(
          projectPath,
          "src"
        );

      const componentsFolder =
        join(
          srcFolder,
          "components"
        );

      await mkdir(
        componentsFolder,
        {
          recursive: true,
        }
      );

      await writeFile(
        join(
          srcFolder,
          "page.html"
        ),
        "<html></html>",
        "utf-8"
      );

      await writeFile(
        join(
          componentsFolder,
          "Button.tsx"
        ),
        "export default function Button() {}",
        "utf-8"
      );

      const config = {
        include: ["src"],
        exclude: ["components"],
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
      };

      const result =
        await startScan(
          projectPath,
          config
        );

      expect(
        result.files.some(
          (file) =>
            file.path.includes(
              "page.html"
            )
        )
      ).toBe(true);

      expect(
        result.files.some(
          (file) =>
            file.path.includes(
              "Button.tsx"
            )
        )
      ).toBe(false);
    } finally {
      await rm(
        projectPath,
        {
          recursive: true,
          force: true,
        }
      );
    }
  }
);


it(
  "analyse un fichier précis indiqué dans include",
  async () => {
    const projectPath =
      await mkdtemp(
        join(
          tmpdir(),
          "ai-auditor-include-file-test-"
        )
      );

    try {
      await writeFile(
        join(
          projectPath,
          "page.html"
        ),
        "<html></html>",
        "utf-8"
      );

      await writeFile(
        join(
          projectPath,
          "other.html"
        ),
        "<html></html>",
        "utf-8"
      );

      const config = {
        include: ["page.html"],
        exclude: [],
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
      };

      const result =
        await startScan(
          projectPath,
          config
        );

      expect(
        result.files
      ).toHaveLength(1);

      expect(
        result.files[0]?.path
      ).toContain(
        "page.html"
      );
    } finally {
      await rm(
        projectPath,
        {
          recursive: true,
          force: true,
        }
      );
    }
  }
);

it("signale un fichier trop volumineux sans arrêter le scan", async () => {
  const projectPath = await mkdtemp(
    join(tmpdir(), "scanner-large-file-")
  );

  const largeFile = join(projectPath, "large.js");
  const normalFile = join(projectPath, "normal.js");

  await writeFile(
    largeFile,
    "a".repeat(5 * 1024 * 1024 + 1),
    "utf-8"
  );

  await writeFile(
    normalFile,
    "console.log('ok');",
    "utf-8"
  );

  const result = await startScan(projectPath);

  expect(
    result.files.some((file) => file.path === normalFile)
  ).toBe(true);

  expect(
    result.files.some((file) => file.path === largeFile)
  ).toBe(false);

  expect(
    result.errors.some((error) => error.file === largeFile)
  ).toBe(true);

  await rm(projectPath, {
    recursive: true,
    force: true,
  });
});

it(
  "analyse tous les types de fichiers supportés et ignore les autres",
  async () => {
    const projectPath =
      await mkdtemp(
        join(
          tmpdir(),
          "ai-auditor-supported-files-test-"
        )
      );

    try {
      const supportedFiles = [
        "script.js",
        "component.jsx",
        "module.ts",
        "component.tsx",
        "page.html",
        "README.md",
      ];

      for (const fileName of supportedFiles) {
        await writeFile(
          join(
            projectPath,
            fileName
          ),
          "contenu de test",
          "utf-8"
        );
      }

      await writeFile(
        join(
          projectPath,
          "image.png"
        ),
        "fichier non supporté",
        "utf-8"
      );

      const result =
        await startScan(
          projectPath
        );

      expect(
        result.files
      ).toHaveLength(
        supportedFiles.length
      );

      for (const fileName of supportedFiles) {
        expect(
          result.files.some(
            (file) =>
              file.path.endsWith(
                fileName
              )
          )
        ).toBe(true);
      }

      expect(
        result.files.some(
          (file) =>
            file.path.endsWith(
              "image.png"
            )
        )
      ).toBe(false);
    } finally {
      await rm(
        projectPath,
        {
          recursive: true,
          force: true,
        }
      );
    }
  }
);

it(
  "ignore explicitement les fichiers de configuration sensibles",
  async () => {
    const projectPath =
      await mkdtemp(
        join(
          tmpdir(),
          "ai-auditor-sensitive-files-test-"
        )
      );

    try {
      await writeFile(
        join(
          projectPath,
          ".env"
        ),
        "API_KEY=secret",
        "utf-8"
      );

      await writeFile(
        join(
          projectPath,
          ".env.local"
        ),
        "API_KEY=local-secret",
        "utf-8"
      );

      await writeFile(
        join(
          projectPath,
          ".env.production"
        ),
        "API_KEY=production-secret",
        "utf-8"
      );

      await writeFile(
        join(
          projectPath,
          "index.html"
        ),
        "<html></html>",
        "utf-8"
      );

      const result =
        await startScan(
          projectPath
        );

      expect(
        result.files.some(
          (file) =>
            file.path.endsWith(".env")
        )
      ).toBe(false);

      expect(
        result.files.some(
          (file) =>
            file.path.endsWith(
              ".env.local"
            )
        )
      ).toBe(false);

      expect(
        result.files.some(
          (file) =>
            file.path.endsWith(
              ".env.production"
            )
        )
      ).toBe(false);

      expect(
        result.files.some(
          (file) =>
            file.path.endsWith(
              "index.html"
            )
        )
      ).toBe(true);
    } finally {
      await rm(
        projectPath,
        {
          recursive: true,
          force: true,
        }
      );
    }
  }
);

it(
  "respecte exclude même lorsqu'un fichier est explicitement inclus",
  async () => {
    const projectPath =
      await mkdtemp(
        join(
          tmpdir(),
          "ai-auditor-include-exclude-file-test-"
        )
      );

    try {
      await writeFile(
        join(
          projectPath,
          "secret.html"
        ),
        "<html></html>",
        "utf-8"
      );

      const config = {
        include: ["secret.html"],
        exclude: ["secret.html"],
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
      };

      const result =
        await startScan(
          projectPath,
          config
        );

      expect(
        result.files.some(
          (file) =>
            file.path.endsWith(
              "secret.html"
            )
        )
      ).toBe(false);
    } finally {
      await rm(
        projectPath,
        {
          recursive: true,
          force: true,
        }
      );
    }
  }
);

});