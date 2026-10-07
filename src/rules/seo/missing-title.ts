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

export function checkMissingTitle(
  file: FileInfo
): RuleIssue[] {
  const issues: RuleIssue[] = [];

  if (file.extension !== ".html") {
    return issues;
  }

  const hasTitle =
    /<title\b[^>]*>[\s\S]*?<\/title>/i.test(
      file.content
    );

  if (!hasTitle) {
    const headMatch =
      /<head\b[^>]*>/i.exec(
        file.content
      );

    const position =
      headMatch?.index ?? 0;

    const location =
      getLineAndColumn(
        file.content,
        position
      );

    issues.push({
      type: "missing-title",

      message:
        "La page ne possède pas de balise title.",

      severity: "error",

      line: location.line,

      column: location.column,

      recommendation:
        "Ajouter une balise title unique et descriptive dans la section head de la page.",

      fix:
        "Ajouter une balise <title>...</title> à l'intérieur de la section <head>.",
    });
  }

  return issues;
}




