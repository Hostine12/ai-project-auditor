import {
  readdir,
  readFile,
  stat,
} from "node:fs/promises";

import {
  extname,
  join,
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

const SUPPORTED_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".html",
  ".md",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo

async function readProjectFile(
  filePath: string
): Promise<string> {
  const content = await readFile(
    filePath,
    "utf-8"
  );

  return content;
}

function isExcludedPath(
  filePath: string,
  projectPath: string,
  exclusions: string[]
): boolean {
  const relativePath =
    filePath
      .slice(projectPath.length + 1)
      .replace(/\\/g, "/");

  const fileName =
    relativePath.split("/").pop();

  return exclusions.some(
    (excludedPath) => {
      const normalizedExclude =
        excludedPath.replace(
          /\\/g,
          "/"
        );

      return (
        relativePath ===
          normalizedExclude ||
        fileName === normalizedExclude
      );
    }
  );
}

async function scanDirectory(
  directory: string,
  projectPath: string,
  excludedDirectories: string[],
  excludedPaths: string[]
): Promise<string[]> {
  const directoryName =
    directory.split(/[\\/]/).pop();

  if (
    directoryName &&
    excludedDirectories.includes(
      directoryName
    )
  ) {
    return [];
  }

  let entries;

  try {
    entries = await readdir(
      directory,
      { withFileTypes: true }
    );
  } catch {
    return [];
  }

  const files: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (
        excludedDirectories.includes(
          entry.name
        )
      ) {
        continue;
      }

      const nestedFiles =
        await scanDirectory(
          join(
            directory,
            entry.name
          ),
          projectPath,
          excludedDirectories,
          excludedPaths
        );

      files.push(...nestedFiles);
    } else {
      const filePath =
        join(
          directory,
          entry.name
        );

      if (
        isExcludedPath(
          filePath,
          projectPath,
          excludedPaths
        )
      ) {
        continue;
      }

      const extension =
        extname(entry.name);

      if (
        SUPPORTED_EXTENSIONS.includes(
          extension
        )
      ) {
        files.push(filePath);
      }
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
    projectStats = await stat(
      projectPath
    );
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

const excludedPaths =
  config?.exclude ?? [];

 let files: string[];

if (
  config?.include &&
  config.include.length > 0
) {
  const includedFiles =
    await Promise.all(
      config.include.map(
        async (includedPath) => {
          const targetPath =
            join(
              projectPath,
              includedPath
            );

          let targetStats;

          try {
            targetStats =
              await stat(
                targetPath
              );
          } catch {
            return [];
          }

          if (targetStats.isDirectory()) {
            return scanDirectory(
  targetPath,
  projectPath,
  excludedDirectories,
  excludedPaths
);
          }

          if (targetStats.isFile()) {
  if (
    isExcludedPath(
      targetPath,
      projectPath,
      excludedPaths
    )
  ) {
    return [];
  }

  const extension =
    extname(targetPath);

  if (
    SUPPORTED_EXTENSIONS.includes(
      extension
    )
  ) {
    return [targetPath];
  }
}

          return [];
        }
      )
    );

  files =
    [
      ...new Set(
        includedFiles.flat()
      ),
    ];
} else {
 files =
  await scanDirectory(
    projectPath,
    projectPath,
    excludedDirectories,
    excludedPaths
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

    const content =
      await readProjectFile(file);

    fileInfos.push({
      path: file,
      content,
      extension: extname(file),
    });
  } catch (error) {
    scanErrors.push({
      file,
      error:
        error instanceof Error
          ? error.message
          : "Impossible de lire le fichier.",
    });
  }
}

  return {
    files: fileInfos,
    errors: scanErrors,
  };
}