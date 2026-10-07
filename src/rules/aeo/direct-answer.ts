import type { FileInfo } from "../../types/file-info.js";
import type { RuleIssue } from "../../types/seo.js";

export function checkDirectAnswer(
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

  const hasTextContent =
    /<p\b[^>]*>[\s\S]*?\S[\s\S]*?<\/p>/i.test(
      file.content
    );

  if (!hasTextContent) {
    issues.push({
      type: "missing-direct-answer",
      message:
        "La page ne contient pas de contenu textuel directement identifiable.",
      severity: "warning",
      line: 1,
      column: 1,
      recommendation:
        "Ajouter une réponse ou une explication claire et directement identifiable dans le contenu de la page.",
      fix:
        "Ajouter un paragraphe contenant une réponse claire et concise, par exemple <p>Notre service permet de...</p>.",
    });
  }

  return issues;
}