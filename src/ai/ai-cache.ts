import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { AIAnalysisResult } from "./ai-provider.js";

export interface AICacheEntry {
  hash: string;
  provider: string;
  model: string;
  result: AIAnalysisResult;
  createdAt: string;
}

export interface AICacheData {
  version: number;
  entries: Record<string, AICacheEntry>;
}

const DEFAULT_CACHE_DIRECTORY = ".ai-project-auditor";
const CACHE_FILE = "cache.json";

export function createContentHash(
  content: string
): string {
  return createHash("sha256")
    .update(content, "utf8")
    .digest("hex");
}

export async function loadAICache(
  cacheDirectory: string = DEFAULT_CACHE_DIRECTORY
): Promise<AICacheData> {
  const cachePath = path.resolve(
    cacheDirectory,
    CACHE_FILE
  );

  try {
    const content = await readFile(
      cachePath,
      "utf8"
    );

    const parsed = JSON.parse(
      content
    ) as AICacheData;

    if (
      parsed.version !== 1 ||
      typeof parsed.entries !== "object" ||
      parsed.entries === null
    ) {
      return {
        version: 1,
        entries: {},
      };
    }

    return parsed;
  } catch {
    return {
      version: 1,
      entries: {},
    };
  }
}

export async function saveAICache(
  cache: AICacheData,
  cacheDirectory: string = DEFAULT_CACHE_DIRECTORY
): Promise<void> {
  const cacheDirectoryPath =
    path.resolve(cacheDirectory);

  const cachePath = path.join(
    cacheDirectoryPath,
    CACHE_FILE
  );

  await mkdir(
    cacheDirectoryPath,
    {
      recursive: true,
    }
  );

  await writeFile(
    cachePath,
    JSON.stringify(
      cache,
      null,
      2
    ),
    "utf8"
  );
}

export async function getAICacheEntry(
  filePath: string,
  content: string,
  provider: string,
  model: string,
  cacheDirectory?: string
): Promise<AIAnalysisResult | null> {
  const cache = await loadAICache(
  cacheDirectory
);

  const entry = cache.entries[filePath];

  if (!entry) {
    return null;
  }

  const currentHash = createContentHash(
    content
  );

  if (entry.hash !== currentHash) {
    return null;
  }

  if (entry.provider !== provider) {
    return null;
  }

  if (entry.model !== model) {
    return null;
  }

  return entry.result;
}

export async function setAICacheEntry(
  filePath: string,
  content: string,
  provider: string,
  model: string,
  result: AIAnalysisResult,
  cacheDirectory: string = DEFAULT_CACHE_DIRECTORY
): Promise<void> {
  const cache = await loadAICache(cacheDirectory);

  const hash = createContentHash(
    content
  );

  cache.entries[filePath] = {
    hash,
    provider,
    model,
    result,
    createdAt: new Date().toISOString(),
  };

  await saveAICache(
  cache,
  cacheDirectory
);
}