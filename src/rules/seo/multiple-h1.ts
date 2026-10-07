import type { FileInfo } from "../../types/file-info.js";
import type { RuleIssue } from "../../types/seo.js";

function getLineAndColumn(
  content: string,
  position: number
): { line: number; column: number } {
  const beforePosition = content.slice(0, position);
  const lines = beforePosition.split("\n");

  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

export function checkMultipleH1(
  file: FileInfo
): RuleIssue[] {
  const issues: RuleIssue[] = [];

  if (
    file.extension !== ".html" &&
    file.extension !== ".jsx" &&
    file.extension !== ".tsx"
  ) {
    return issues;
  }

  const h1Pattern = /<h1\b[^>]*>[\s\S]*?<\/h1>/gi;
  const h1s = [...file.content.matchAll(h1Pattern)];

  if (h1s.length > 1) {
    const secondH1 = h1s[1];

    if (secondH1.index !== undefined) {
      const location = getLineAndColumn(
        file.content,
        secondH1.index
      );

      issues.push({
        type: "multiple-h1",
        message: `La page contient ${h1s.length} balises H1.`,
        severity: "warning",
        line: location.line,
        column: location.column,
        recommendation:
          "Conserver un seul H1 principal sur la page et utiliser des balises H2 ou H3 pour les sous-sections.",
        fix:
          "Remplacer les H1 supplémentaires par des balises H2 ou H3 selon leur niveau dans la structure du contenu.",
      });
    }
  }

  return issues;
}