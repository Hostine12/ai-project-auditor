import "dotenv/config";

import { basename, resolve } from "node:path";

import { startScan } from "./scanner/project-scanner.js";

import { analyzeSEO } from "./analyzers/seo-analyzer.js";

import { analyzeAEO } from "./analyzers/aeo-analyzer.js";

import { createAIProvider } from "./ai/ai-provider-factory.js";

// import { OpenRouterProvider } from "./ai/openrouter-provider.js";

import { analyzeWithAI } from "./ai/ai-analyzer.js";
import { sanitizeErrorMessage } from "./utils/sanitize-error.js";

import type {
AIAnalysisResult,
AIAnalysisError,
} from "./ai/ai-provider.js";

import type { AuditResult } from "./types/audit.js";

import type {
AnalysisResult,
RuleScoreStats,
} from "./types/seo.js";

import { loadAuditConfig } from "./config/audit-config.js";

import type { AuditConfig } from "./config/audit-config.js";

export async function runAudit(
  projectPath: string = ".",
  config?: AuditConfig
): Promise<AuditResult> {
  const effectiveConfig =
  config ?? await loadAuditConfig(projectPath);

  const scanResult = await startScan(
  projectPath,
  effectiveConfig
);

const files = scanResult.files;
const scanErrors = scanResult.errors;

const aiResults: AIAnalysisResult[] = [];
const aiErrors: AIAnalysisError[] = [];

if (effectiveConfig.features.ai) {
  const aiProviderConfig =
  createAIProvider(effectiveConfig);

  const aiFiles = files.filter(
    (file) =>
      file.extension === ".html" ||
      file.extension === ".md"
  );

  for (const file of aiFiles) {
    try {
      const result = await analyzeWithAI(
        file,
        aiProviderConfig.provider,
        aiProviderConfig.providerName,
        aiProviderConfig.model
      );

      aiResults.push(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erreur inconnue pendant l'analyse IA.";

      const safeErrorMessage =
        sanitizeErrorMessage(errorMessage);

      aiErrors.push({
        file: file.path,
        error: safeErrorMessage,
      });

      console.error(
        `Erreur IA pour ${file.path} :`,
        safeErrorMessage
      );
    }
  }
}

const seoResults = effectiveConfig.features.seo
  ? files.map((file) => analyzeSEO(file))
  : [];

const aeoResults = effectiveConfig.features.aeo
  ? files.map((file) => analyzeAEO(file))
  : [];

const aeoIssues = aeoResults.flatMap(
  (result) => result.issues
);

const aeoRuleStats = aggregateRuleStats(
  aeoResults
);

const aeoScore = effectiveConfig.features.aeo
  ? calculateScoreFromRuleStats(aeoRuleStats)
  : 100;

const filesWithIssues = files.filter(
  (_, index) => {
    const seoHasIssues = effectiveConfig.features.seo
      ? seoResults[index]?.issues.length > 0
      : false;

    const aeoHasIssues = effectiveConfig.features.aeo
  ? aeoResults[index]?.issues.length > 0
  : false;

    return seoHasIssues || aeoHasIssues;
  }
).length;

const issues = seoResults.flatMap(
  (result) =>
     result.issues
);

const ruleStats = aggregateRuleStats(
  seoResults
);

const score = effectiveConfig.features.seo
  ? calculateScoreFromRuleStats(ruleStats)
  : 100;

return {
project: {
name: basename(resolve(projectPath)),
},


metadata: {
  generatedAt: new Date().toISOString(),
  filesScanned: files.length,
  filesWithIssues,
},

seo: {
  score,

  summary: {
    errors: issues.filter(
      (issue) => issue.severity === "error"
    ).length,

    warnings: issues.filter(
      (issue) => issue.severity === "warning"
    ).length,

    infos: issues.filter(
      (issue) => issue.severity === "info"
    ).length,

    totalIssues: issues.length,
  },

  ruleStats,
  issues,
},

aeo: {
  score: aeoScore,

  summary: {
    errors: aeoIssues.filter(
      (issue) => issue.severity === "error"
    ).length,

    warnings: aeoIssues.filter(
      (issue) => issue.severity === "warning"
    ).length,

    infos: aeoIssues.filter(
      (issue) => issue.severity === "info"
    ).length,

    totalIssues: aeoIssues.length,
  },

  ruleStats: aeoRuleStats,
  issues: aeoIssues,
},

ai: {
  results: aiResults,
  errors: aiErrors,
},
scan: {
  errors: scanErrors,
},

};
}

function aggregateRuleStats(
results: AnalysisResult[]
): RuleScoreStats[] {
const statsMap = new Map<
string,
RuleScoreStats

> ();

for (const result of results) {
for (const stat of result.ruleStats) {
const existing = statsMap.get(
stat.ruleId
);


  if (existing) {
    existing.issueCount +=
      stat.issueCount;

    existing.rawPenalty +=
      stat.rawPenalty;

    existing.appliedPenalty +=
      stat.appliedPenalty;

  } else {
    statsMap.set(
      stat.ruleId,
      {
        ...stat,
      }
    );
  }
}


}

return Array.from(
statsMap.values()
);
}

function calculateScoreFromRuleStats(
  ruleStats: RuleScoreStats[]
): number {
  const totalPenalty = ruleStats.reduce(
    (total, stat) =>
      total + stat.appliedPenalty,
    0
  );

  return Math.max(
    0,
    100 - totalPenalty
  );
}
