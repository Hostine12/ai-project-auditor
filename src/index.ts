#!/usr/bin/env node

import { runAudit } from "./audit-runner.js";
import { generateJsonReport } from "./report/json-reporter.js";
import { AuditReportSchema } from "./ai/schemas/audit-report-schema.js";
import {
  existsSync,
  statSync,
} from "node:fs";
import { parseArguments } from "./cli/arguments.js";
import { printAuditSummary } from "./cli/output.js";
import { formatCLIError } from "./cli/errors.js";
import { loadAuditConfig } from "./config/audit-config.js";
import {
  initAuditConfig,
} from "./config/init-config.js";

const VERSION = "1.0.0";

function showHelp(): void {
  console.log(`
AI Project Auditor

Usage:
  ai-audit init [path]
  ai-audit scan [path]
  ai-audit --help
  ai-audit --version

Commands:
  init        Initialise la configuration du projet
  scan        Analyse le projet indiqué
  --help      Affiche cette aide
  --version   Affiche la version
`);
}

async function main(): Promise<void> {
  const parsedArguments = parseArguments(
  process.argv.slice(2)
);

const {
  command,
  projectPath,
  error,
} = parsedArguments;

if (error) {
  console.error(`Erreur : ${error}`);
  console.error(
    'Utilisez "ai-audit --help" pour voir les commandes disponibles.'
  );

  process.exitCode = 1;
  return;
}

  if (
    !command ||
    command === "--help" ||
    command === "-h"
  ) {
    showHelp();
    return;
  }

  if (
    command === "--version" ||
    command === "-v"
  ) {
    console.log(VERSION);
    return;
  }


if (command === "init") {
  try {
    const configPath =
      await initAuditConfig(projectPath);

    console.log(
      `Configuration créée : ${configPath}`
    );
  } catch (error) {
    console.error(
      `Erreur : ${formatCLIError(error)}`
    );

    process.exitCode = 1;
  }

  return;
}


  if (command === "scan") {
    console.log("");
    console.log(`AI Project Auditor v${VERSION}`);
    console.log("");
    console.log(`Projet : ${projectPath}`);
    console.log("");

    if (!existsSync(projectPath)) {
  console.error(
    `Erreur : le chemin "${projectPath}" n'existe pas.`
  );

  process.exitCode = 1;
  return;
}

try {
  if (!statSync(projectPath).isDirectory()) {
    console.error(
      `Erreur : le chemin "${projectPath}" n'est pas un dossier.`
    );
    process.exitCode = 1;
    return;
  }
} catch {
  console.error(
    `Erreur : impossible d'accéder au chemin "${projectPath}".`
  );
  process.exitCode = 1;
  return;
}

  
    const config = await loadAuditConfig(projectPath);

const result = await runAudit(
  projectPath,
  config
);
    const validation =
  AuditReportSchema.safeParse(result);

if (!validation.success) {
  console.error(
    "Erreur : le rapport généré est invalide."
  );

  console.error(
    validation.error.issues
  );

  process.exitCode = 1;
  return;
}

    
    printAuditSummary({
  filesScanned: result.metadata.filesScanned,
  filesWithIssues: result.metadata.filesWithIssues,
  seoScore: result.seo.score,
  aeoScore: result.aeo.score,
  reportPath: config.output.path,
});

await generateJsonReport(
  result,
  config.output.path
);



const threshold = config.ci.threshold;

const thresholdPassed =
  result.seo.score >= threshold &&
  result.aeo.score >= threshold;

if (!thresholdPassed) {
  console.error(
    `\nÉchec du seuil CI/CD : ` +
    `SEO ${result.seo.score}/100, ` +
    `AEO ${result.aeo.score}/100, ` +
    `seuil ${threshold}/100.`
  );

  process.exitCode = 1;
}
    return;
  }

  console.error(
    `Commande inconnue : ${command}`
  );

  console.error(
    'Utilisez "ai-audit --help" pour voir les commandes disponibles.'
  );

  process.exitCode = 1;
}

main().catch((error) => {
  console.error(
    "Erreur pendant l'exécution :",
    formatCLIError(error)
  );

  process.exitCode = 1;

  
});