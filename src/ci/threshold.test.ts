import { describe, it, expect } from "vitest";
import { checkThreshold } from "./threshold.js";
describe("CI threshold", () => {
  it("réussit lorsque SEO et AEO respectent le seuil", () => {
    const threshold = 90;

    const seoScore = 95;
    const aeoScore = 92;

    const passed =
      seoScore >= threshold &&
      aeoScore >= threshold;

    expect(passed).toBe(true);
  });

  it("réussit lorsque SEO et AEO respectent le seuil", () => {
  const result = checkThreshold(
    95,
    92,
    90
  );

  expect(result).toBe(true);
});

  it("échoue lorsque le score SEO est inférieur au seuil", () => {
  const result = checkThreshold(
    85,
    95,
    90
  );

  expect(result).toBe(false);
});

it("échoue lorsque le score AEO est inférieur au seuil", () => {
  const result = checkThreshold(
    95,
    85,
    90
  );

  expect(result).toBe(false);
});
});