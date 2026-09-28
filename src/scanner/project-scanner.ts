import {
  readdir,
  readFile,
  stat,
} from "node:fs/promises";
import { extname } from "node:path";
import type {
  FileInfo,
  ScanError,
} from "../types/file-info.js";

const IGNORED_DIRECTORIES = [
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

async function readProjectFile(filePath: string): Promise<string> {
  const content = await readFile(filePath, "utf-8");

  return content;
}
async function scanDirectory(directory: string): Promise<string[]> {
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
    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.includes(entry.name)) {
        continue;
      }

      const nestedFiles = await scanDirectory(
        `${directory}/${entry.name}`
      );

      files.push(...nestedFiles);
    } else {
      const extension = extname(entry.name);

      if (SUPPORTED_EXTENSIONS.includes(extension)) {
        files.push(`${directory}/${entry.name}`);
      }
    }
  }

  return files;
}

export async function startScan(
  projectPath: string = "."
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

  const files = await scanDirectory(projectPath);

  const fileInfos: FileInfo[] = [];

  const scanErrors: ScanError[] = [];

  for (const file of files) {
  try {
    const content = await readProjectFile(file);

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