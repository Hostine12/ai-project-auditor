export interface AuditSummary {
  filesScanned: number;
  filesWithIssues: number;
  seoScore: number;
  aeoScore: number;
  reportPath: string;
}

export function printAuditSummary(
  summary: AuditSummary
): void {
  console.log("");
  console.log("Audit terminé.");
  console.log("");

  console.log("Résumé");
  console.log("────────────────────────");
  console.log(
    `Fichiers analysés       : ${summary.filesScanned}`
  );
  console.log(
    `Fichiers avec problèmes : ${summary.filesWithIssues}`
  );
  console.log("");

  console.log("Scores");
  console.log("────────────────────────");
  console.log(
    `SEO : ${summary.seoScore}/100`
  );
  console.log(
    `AEO : ${summary.aeoScore}/100`
  );
  console.log("");

  console.log("Rapport");
  console.log("────────────────────────");
  console.log(summary.reportPath);
  console.log("");
}