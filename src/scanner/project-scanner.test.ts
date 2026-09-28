import { describe, expect, it, vi } from "vitest";

vi.mock("node:fs/promises", async () => {
  const actual = await vi.importActual<
    typeof import("node:fs/promises")
  >("node:fs/promises");

  return {
    ...actual,
    readFile: vi.fn(actual.readFile),
  };
});

import { readFile } from "node:fs/promises";
import { startScan } from "./project-scanner.js";

describe("startScan", () => {
  it("rejette un dossier qui n'existe pas", async () => {
    await expect(
      startScan("./dossier-inexistant-pour-test")
    ).rejects.toThrow(
      "Le dossier indiqué n'existe pas"
    );
  });

  it("continue le scan lorsqu'un fichier est illisible", async () => {
    vi.mocked(readFile).mockRejectedValueOnce(
      new Error("Permission refusée")
    );

    const result = await startScan(".");

    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]?.error).toBe(
      "Permission refusée"
    );
  });
});