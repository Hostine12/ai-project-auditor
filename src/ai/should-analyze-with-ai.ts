
import type { FileInfo } from "../types/file-info.js";

export function shouldAnalyzeWithAI(
  file: FileInfo
): boolean {
  // Exclure les fichiers de tests.
  if (
    /\.(test|spec)\.[^.]+$/i.test(file.path)
  ) {
    return false;
  }

  const alwaysAnalyze = [
    ".html",
    ".md",
    ".jsx",
    ".tsx",
  ];

  if (alwaysAnalyze.includes(file.extension)) {
    return true;
  }

  if (
    file.extension === ".js" ||
    file.extension === ".ts"
  ) {
    return containsWebContent(file.content);
  }

  return false;
}

function containsWebContent(
  content: string
): boolean {
  const strongWebPatterns = [
    /<h1\b/i,
    /<h2\b/i,
    /<title\b/i,
    /<meta\b/i,
    /<p\b/i,
    /<section\b/i,
    /<article\b/i,
    /<main\b/i,
    /<header\b/i,
    /<footer\b/i,
    /<nav\b/i,
    /<form\b/i,
    /<img\b/i,
    /<a\b/i,
  ];

  if (
    strongWebPatterns.some(
      (pattern) => pattern.test(content)
    )
  ) {
    return true;
  }

  const contentSignals = [
    /\btitle\s*:/i,
    /\bdescription\s*:/i,
    /\bkeywords\s*:/i,
    /\bcontent\s*:/i,
    /\bquestion\s*:/i,
    /\banswer\s*:/i,
    /\bfaq\b/i,
  ];

  const signalCount = contentSignals.filter(
    (pattern) => pattern.test(content)
  ).length;

  return signalCount >= 2;
}
