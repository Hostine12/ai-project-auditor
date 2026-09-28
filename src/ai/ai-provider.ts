export interface AIAnalysisInput {
  file: string;
  content: string;
}

export interface AIAnalysisError {
  file: string;
  error: string;
}

export interface AIAnalysisResult {
  file: string;

  seo: {
    title: string | null;
    h1: string[];
    metaDescription: string | null;
    keywords: string[];
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };

  aeo: {
    directAnswer: string | null;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

export interface AIProvider {
  analyze(
    input: AIAnalysisInput
  ): Promise<AIAnalysisResult>;
}

