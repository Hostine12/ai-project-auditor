
import {
  readdir,
  readFile,
  stat,
} from "node:fs/promises";

import {
  extname,
  join,
  relative,
  resolve,
} from "node:path";

import type {
  FileInfo,
  ScanError,
} from "../types/file-info.js";

import type { AuditConfig } from "../config/audit-config.js";

const DEFAULT_IGNORED_DIRECTORIES = [
  "node_modules",
  ".git",
  "dist",
  "build",
];

const DEFAULT_IGNORED_FILES = [
  ".env",
  ".env.local",
  ".env.development",
  ".env.development.local",
  ".env.production",
  ".env.production.local",
  ".env.test",
  ".env.staging",
  "credentials.js",
  "credentials.ts",
  "secrets.js",
  "secrets.ts",
];

const SUPPORTED_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".html",
  ".md",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

function isSensitiveFile(fileName: string): boolean {
  return (
    /^\.env(?:\..+)?$/.test(fileName) ||
    /^(?:credentials|secrets)\.(?:js|ts|jsx|tsx)$/.test(fileName)
  );
}

async function readProjectFile(
  filePath: string
): Promise<string> {
  return readFile(filePath, "utf-8");
}

function isExcludedPath(
  filePath: string,
  projectPath: string,
  exclusions: string[],
  ignoredFiles: string[] = []
): boolean {
  const relativePath = relative(
    resolve(projectPath),
    resolve(filePath)
  ).replace(/\\/g, "/");

  const fileName = relativePath.split("/").pop() ?? "";

  if (isSensitiveFile(fileName)) {
    return true;
  }

  return [
    ...exclusions,
    ...ignoredFiles,
  ].some((excludedPath) => {
    const normalizedExclude = excludedPath
      .replace(/\\/g, "/")
      .replace(/^\.\//, "")
      .replace(/\/+$/, "");

    return (
      relativePath === normalizedExclude ||
      fileName === normalizedExclude
    );
  });
}

function isExcludedDirectory(
  directory: string,
  projectPath: string,
  excludedDirectories: string[]
): boolean {
  const directoryName =
    directory.split(/[\\/]/).pop() ?? "";

  const relativeDirectoryPath = relative(
    resolve(projectPath),
    resolve(directory)
  ).replace(/\\/g, "/");

  return excludedDirectories.some((exclusion) => {
    const normalizedExclusion = exclusion
      .replace(/\\/g, "/")
      .replace(/^\.\//, "")
      .replace(/\/+$/, "");

    if (!normalizedExclusion) {
      return false;
    }

    // Exclusion par nom de dossier : dist, build, components...
    if (!normalizedExclusion.includes("/")) {
      return directoryName === normalizedExclusion;
    }

    // Exclusion par chemin relatif : src/generated...
    return (
      relativeDirectoryPath === normalizedExclusion ||
      relativeDirectoryPath.startsWith(
        `${normalizedExclusion}/`
      )
    );
  });
}

async function scanDirectory(
  directory: string,
  projectPath: string,
  excludedDirectories: string[],
  excludedPaths: string[],
  ignoredFiles: string[]
): Promise<string[]> {
  if (
    isExcludedDirectory(
      directory,
      projectPath,
      excludedDirectories
    )
  ) {
    return [];
  }

  let entries;

  try {
    entries = await readdir(directory, {
      withFileTypes: true,
    });
  } catch {
    return [];
  }

  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      const nestedFiles = await scanDirectory(
        entryPath,
        projectPath,
        excludedDirectories,
        excludedPaths,
        ignoredFiles
      );

      files.push(...nestedFiles);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (
      isExcludedPath(
        entryPath,
        projectPath,
        excludedPaths,
        ignoredFiles
      )
    ) {
      continue;
    }

    const extension = extname(entry.name);

    if (SUPPORTED_EXTENSIONS.includes(extension)) {
      files.push(entryPath);
    }
  }

  return files;
}

export async function startScan(
  projectPath: string = ".",
  config?: AuditConfig
): Promise<{
  files: FileInfo[];
  errors: ScanError[];
}> {
  let projectStats;

  try {
    projectStats = await stat(projectPath);
  } catch {
    throw new Error(
      `Le dossier indiqué n'existe pas : ${projectPath}`
    );
  }

  if (!projectStats.isDirectory()) {
    throw new Error(
      `Le chemin indiqué n'est pas un dossier : ${projectPath}`
    );
  }

  const excludedDirectories = [
    ...new Set([
      ...DEFAULT_IGNORED_DIRECTORIES,
      ...(config?.exclude ?? []),
    ]),
  ];

  const excludedPaths = [
    ...(config?.exclude ?? []),
  ];

  const ignoredFiles = [
    ...DEFAULT_IGNORED_FILES,
  ];

  let files: string[];

  if (config?.include && config.include.length > 0) {
    const includedFiles = await Promise.all(
      config.include.map(async (includedPath) => {
        const targetPath = join(
          projectPath,
          includedPath
        );

        let targetStats;

        try {
          targetStats = await stat(targetPath);
        } catch {
          return [];
        }

        if (targetStats.isDirectory()) {
          return scanDirectory(
            targetPath,
            projectPath,
            excludedDirectories,
            excludedPaths,
            ignoredFiles
          );
        }

        if (targetStats.isFile()) {
          if (
            isExcludedPath(
              targetPath,
              projectPath,
              excludedPaths,
              ignoredFiles
            )
          ) {
            return [];
          }

          const extension = extname(targetPath);

          if (SUPPORTED_EXTENSIONS.includes(extension)) {
            return [targetPath];
          }
        }

        return [];
      })
    );

    files = [
      ...new Set(includedFiles.flat()),
    ];
  } else {
    files = await scanDirectory(
      projectPath,
      projectPath,
      excludedDirectories,
      excludedPaths,
      ignoredFiles
    );
  }

  const fileInfos: FileInfo[] = [];
  const scanErrors: ScanError[] = [];

  for (const file of files) {
    try {
      const fileStats = await stat(file);

      if (fileStats.size > MAX_FILE_SIZE) {
        scanErrors.push({
          file,
          error:
            "Fichier trop volumineux pour être analysé. La taille maximale autorisée est de 5 Mo.",
        });

        continue;
      }

      const content = await readProjectFile(file);

      fileInfos.push({
        path: file,
        content,
        extension: extname(file),
      });
    } catch {
      scanErrors.push({
        file,
        error: "Impossible de lire le fichier.",
      });
    }
  }

  return {
    files: fileInfos,
    errors: scanErrors,
  };
}
