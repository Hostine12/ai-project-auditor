import type { SEOResult, AnalysisResult } from "./seo.js";

import type { ScanError } from "./file-info.js";

import type {
  AIAnalysisError,
  AIAnalysisResult,
} from "../ai/ai-provider.js";

export interface AuditMetadata {
  generatedAt: string;
  filesScanned: number;
  filesWithIssues: number;
}



export interface AuditResult {
  project: {
    name: string;
  };

  metadata: AuditMetadata;

  seo: SEOResult;

  aeo: AnalysisResult;

  ai: {
    results: AIAnalysisResult[];
    errors: AIAnalysisError[];
  };

  scan: {
    errors: ScanError[];
  };
}