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

  // Recherche les paragraphes HTML.
  const paragraphs = [
    ...file.content.matchAll(
      /<p\b[^>]*>([\s\S]*?)<\/p>/gi
    ),
  ];

  // Retire les balises HTML et les espaces superflus.
  const hasDirectAnswer = paragraphs.some((paragraph) => {
    const text = (paragraph[1] ?? "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/\s+/g, " ")
      .trim();

    // Évite de considérer un paragraphe très court
    // comme une réponse suffisamment informative.
    return text.length >= 40;
  });

  if (!hasDirectAnswer) {
    issues.push({
      type: "missing-direct-answer",
      message:
        "La page ne contient pas de paragraphe suffisamment informatif pour être identifié comme une réponse directe.",
      severity: "warning",
      line: 1,
      column: 1,
      recommendation:
        "Ajouter un paragraphe clair et informatif qui répond directement à la question ou présente l'information principale de la page.",
      fix:
        "Ajouter un paragraphe concis et informatif, par exemple <p>Notre service permet aux entreprises de gérer leurs commandes en ligne et de suivre leurs livraisons.</p>.",
    });
  }

  return issues;
}