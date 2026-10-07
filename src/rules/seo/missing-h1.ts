
import type { FileInfo } from "../../types/file-info.js";
import type { RuleIssue } from "../../types/seo.js";

export function checkMissingH1(file: FileInfo): RuleIssue[] {
  const issues: RuleIssue[] = [];

  if (
    file.extension !== ".html" &&
    file.extension !== ".jsx" &&
    file.extension !== ".tsx"
  ) {
    return issues;
  }

  const hasH1 =
    /<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(file.content);

  if (!hasH1) {
    issues.push({
      type: "missing-h1",
      message: "La page ne possède pas de balise H1.",
      severity: "warning",
      line: 1,
      column: 1,
      recommendation:
        "Ajouter un titre principal H1 pertinent qui décrit le sujet principal de la page.",
      fix:
        "Ajouter une balise <h1> contenant le titre principal de la page, par exemple <h1>Bienvenue sur notre site</h1>.",
    });
  }

  return issues;
}