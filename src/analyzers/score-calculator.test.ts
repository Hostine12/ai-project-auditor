import { describe, expect, it } from "vitest";

import {
  calculateScore,
} from "./score-calculator.js";

import type {
  AuditIssue,
  AuditRule,
} from "../types/seo.js";

describe("calculateScore", () => {
  it("retourne 100 lorsqu'il n'y a aucun problème", () => {
    const issues: AuditIssue[] = [];

    const rules: AuditRule[] = [
      {
        id: "missing-title",
        description: "Le titre est absent",
        severity: "error",
        weight: 10,
        maxPenalty: 20,
        check: () => [],
      },
    ];

    const result = calculateScore(
      issues,
      rules
    );

    expect(result.score).toBe(100);
  });

  it("applique la pénalité d'une règle", () => {
    const issues: AuditIssue[] = [
      {
        ruleId: "missing-title",
        type: "missing-title",
        message: "Titre absent",
        severity: "error",
      },
    ];

    const rules: AuditRule[] = [
      {
        id: "missing-title",
        description: "Le titre est absent",
        severity: "error",
        weight: 10,
        maxPenalty: 20,
        check: () => [],
      },
    ];

    const result = calculateScore(
      issues,
      rules
    );

    expect(result.score).toBe(90);
    expect(result.ruleStats[0].issueCount).toBe(1);
    expect(result.ruleStats[0].appliedPenalty).toBe(10);
  });

  it("ne dépasse pas la pénalité maximale d'une règle", () => {
    const issues: AuditIssue[] = [
      {
        ruleId: "missing-title",
        type: "missing-title",
        message: "Titre absent",
        severity: "error",
      },
      {
        ruleId: "missing-title",
        type: "missing-title",
        message: "Titre absent",
        severity: "error",
      },
      {
        ruleId: "missing-title",
        type: "missing-title",
        message: "Titre absent",
        severity: "error",
      },
    ];

    const rules: AuditRule[] = [
      {
        id: "missing-title",
        description: "Le titre est absent",
        severity: "error",
        weight: 10,
        maxPenalty: 20,
        check: () => [],
      },
    ];

    const result = calculateScore(
      issues,
      rules
    );

    expect(result.score).toBe(80);
    expect(result.ruleStats[0].rawPenalty).toBe(30);
    expect(result.ruleStats[0].appliedPenalty).toBe(20);
  });
});