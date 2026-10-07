import {
  mkdir,
  writeFile,
} from "node:fs/promises";

import {
  dirname,
} from "node:path";

import type { AuditResult } from "../types/audit.js";

export async function generateJsonReport(
  result: AuditResult,
  outputPath: string = "audit-report.json"
): Promise<void> {
  const json = JSON.stringify(
    result,
    null,
    2
  );

  const outputDirectory =
    dirname(outputPath);

  await mkdir(
    outputDirectory,
    {
      recursive: true,
    }
  );

  await writeFile(
    outputPath,
    json,
    "utf-8"
  );
}