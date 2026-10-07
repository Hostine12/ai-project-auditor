import type { FileInfo } from "../../types/file-info.js";
import type { RuleIssue } from "../../types/seo.js";

function getLineAndColumn(
  content: string,
  position: number
): {
  line: number;
  column: number;
} {
  const beforePosition =
    content.slice(
      0,
      position
    );

  const lines =
    beforePosition.split("\n");

  return {
    line: lines.length,
    column:
      lines[lines.length - 1].length + 1,
  };
}

export function checkEmptyTitle(
  file: FileInfo
): RuleIssue[] {
  const issues: RuleIssue[] = [];

  if (file.extension !== ".html") {
    return issues;
  }

  const titleMatch = file.content.match(
    /<title\b[^>]*>([\s\S]*?)<\/title>/i
  );

  if (titleMatch) {
    const titleContent =
      titleMatch[1]?.trim();

    if (!titleContent) {
      const position =
        titleMatch.index ?? 0;

      const location =
        getLineAndColumn(
          file.content,
          position
        );

      issues.push({
        type: "empty-title",

        message:
          "La balise title est présente mais vide.",

        severity: "error",

        line: location.line,

        column: location.column,

        recommendation:
          "Ajouter un titre descriptif et pertinent dans la balise title.",

        fix:
          "Remplacer <title></title> par une balise contenant un titre descriptif, par exemple <title>Accueil - Mon site</title>.",
      });
    }
  }

  return issues;
}
