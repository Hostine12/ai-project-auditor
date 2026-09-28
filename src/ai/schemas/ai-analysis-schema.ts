
import { z } from "zod";

export const AIAnalysisSchema = z.object({
  file: z.string(),

  seo: z.object({
    title: z.string().nullable(),

    h1: z.array(z.string()),

    metaDescription: z.string().nullable(),

    keywords: z.array(z.string()),

    strengths: z.array(z.string()),

    weaknesses: z.array(z.string()),

    recommendations: z.array(z.string()),
  }),

  aeo: z.object({
    directAnswer: z.string().nullable(),

    strengths: z.array(z.string()),

    weaknesses: z.array(z.string()),

    recommendations: z.array(z.string()),
  }),
});

export type AIAnalysisResult = z.infer<
  typeof AIAnalysisSchema
>;

