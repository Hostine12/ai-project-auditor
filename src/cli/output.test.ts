import { describe, expect, it, vi } from "vitest";
import { printAuditSummary } from "./output.js";

describe("printAuditSummary", () => {
  it("affiche le résumé de l'audit", () => {
    const consoleSpy = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    printAuditSummary({
      filesScanned: 49,
      filesWithIssues: 2,
      seoScore: 98,
      aeoScore: 90,
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Audit terminé."
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      "Fichiers analysés       : 49"
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      "Fichiers avec problèmes : 2"
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      "SEO : 98/100"
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      "AEO : 90/100"
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      "audit-report.json"
    );

    consoleSpy.mockRestore();
  });
});