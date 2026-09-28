export interface CLIArguments {
  command?: string;
  projectPath: string;
  error?: string;
}

export function parseArguments(
  args: string[]
): CLIArguments {
  const command = args[0];

  if (!command) {
    return {
      projectPath: ".",
    };
  }

  if (
    command === "--help" ||
    command === "-h" ||
    command === "--version" ||
    command === "-v"
  ) {
    if (args.length > 1) {
      return {
        command,
        projectPath: ".",
        error: `La commande "${command}" n'accepte pas d'argument supplémentaire.`,
      };
    }

    return {
      command,
      projectPath: ".",
    };
  }

  if (command === "scan") {
    if (args.length > 2) {
      return {
        command,
        projectPath: args[1] ?? ".",
        error:
          "La commande scan accepte au maximum un chemin de projet.",
      };
    }

    return {
      command,
      projectPath: args[1] ?? ".",
    };
  }

  return {
    command,
    projectPath: ".",
    error: `Commande inconnue : ${command}`,
  };

  
}