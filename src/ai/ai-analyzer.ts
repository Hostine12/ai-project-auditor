import type { FileInfo } from "../types/file-info.js";

import {
  sanitizeContent,
} from "./sanitize-content.js";

import {
  getAICacheEntry,
  setAICacheEntry,
} from "./ai-cache.js";

import type {
  AIAnalysisResult,
  AIProvider,
} from "./ai-provider.js";

export async function analyzeWithAI(
  file: FileInfo,
  provider: AIProvider,
  providerName: string,
  model: string,
  cacheDirectory?: string
): Promise<AIAnalysisResult> {
  const cachedResult = await getAICacheEntry(
    file.path,
    file.content,
    providerName,
    model,
    cacheDirectory
  );

  if (cachedResult) {
    console.log(
      `Cache IA utilisé pour ${file.path}`
    );

    return cachedResult;
  }

  console.log(
    `Analyse IA en cours pour ${file.path}`
  );

  const result = await provider.analyze({
  file: file.path,
  content: sanitizeContent(file.content),
});

   try {
    await setAICacheEntry(
      file.path,
      file.content,
      providerName,
      model,
      result,
      cacheDirectory
    );
  } catch {
    console.warn(
      `Impossible d'enregistrer le cache IA pour ${file.path}.`
    );
  }

  return result;
}

