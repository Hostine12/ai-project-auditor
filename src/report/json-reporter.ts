import { writeFile } from "node:fs/promises";

import type { AuditResult } from "../types/audit.js";

export async function generateJsonReport(
  result: AuditResult,
  outputPath: string = "audit-report.json"
): Promise<void> {
  const json = JSON.stringify(result, null, 2);

  await writeFile(outputPath, json, "utf-8");
}