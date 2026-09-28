import { describe, expect, it } from "vitest";
import { parseArguments } from "./arguments.js";

describe("parseArguments", () => {
  it("récupère la commande et le chemin du projet", () => {
    const result = parseArguments([
      "scan",
      "./mon-projet",
    ]);

    expect(result.command).toBe("scan");
    expect(result.projectPath).toBe("./mon-projet");
  });

  it("utilise le dossier courant si aucun chemin n'est fourni", () => {
    const result = parseArguments([
      "scan",
    ]);

    expect(result.command).toBe("scan");
    expect(result.projectPath).toBe(".");
  });

  it("fonctionne avec --help", () => {
    const result = parseArguments([
      "--help",
    ]);

    expect(result.command).toBe("--help");
    expect(result.projectPath).toBe(".");
  });

  it("fonctionne avec --version", () => {
    const result = parseArguments([
      "--version",
    ]);

    expect(result.command).toBe("--version");
    expect(result.projectPath).toBe(".");
  });

  it("rejette plusieurs chemins avec scan", () => {
  const result = parseArguments([
    "scan",
    "./projet1",
    "./projet2",
  ]);

  expect(result.error).toBe(
    "La commande scan accepte au maximum un chemin de projet."
  );
});

it("rejette une commande inconnue", () => {
  const result = parseArguments([
    "test",
  ]);

  expect(result.command).toBe("test");

  expect(result.error).toBe(
    "Commande inconnue : test"
  );
});

it("rejette un argument supplémentaire avec --help", () => {
  const result = parseArguments([
    "--help",
    "autre-chose",
  ]);

  expect(result.error).toBe(
    'La commande "--help" n\'accepte pas d\'argument supplémentaire.'
  );
});
});