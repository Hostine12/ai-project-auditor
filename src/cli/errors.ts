export function formatCLIError(
  error: unknown
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Une erreur inconnue est survenue.";
}