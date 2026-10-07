
import type { FileInfo } from "../../types/file-info.js";
import type { RuleIssue } from "../../types/seo.js";

// Calcule la ligne et la colonne à partir d'une position.
function getLineAndColumn(
  content: string,
  position: number
): {
  line: number;
  column: number;
} {
  const beforePosition = content.slice(0, position);
  const lines = beforePosition.split("\n");

  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

export function checkMissingAlt(file: FileInfo): RuleIssue[] {
  const issues: RuleIssue[] = [];

  // Vérifie les extensions prises en charge.
  if (
    file.extension !== ".html" &&
    file.extension !== ".jsx" &&
    file.extension !== ".tsx"
  ) {
    return issues;
  }

  // Recherche toutes les balises img.
  const imagePattern = /<img\b[^>]*>/gi;

  let match: RegExpExecArray | null;

  // Parcourt les images une par une pour connaître leur position.
  while ((match = imagePattern.exec(file.content)) !== null) {
    const image = match[0];

    // Vérifie si l'attribut alt est présent.
    if (!/\balt\s*=/i.test(image)) {
      const location = getLineAndColumn(
        file.content,
        match.index
      );

      issues.push({
        type: "missing-alt",
        message: "Une image ne possède pas d'attribut alt.",
        severity: "warning",
        line: location.line,
        column: location.column,
        recommendation:
          "Ajouter un attribut alt décrivant le contenu ou la fonction de l'image.",
        fix:
          'Ajouter un attribut alt à la balise img, par exemple alt="Description de l’image".',
      });
    }
  }

  return issues;
}