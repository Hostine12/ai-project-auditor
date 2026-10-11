import { sanitizeErrorMessage } from "../utils/sanitize-error.js";

export function formatCLIError(
  error: unknown
): string {
  if (error instanceof Error) {
    return sanitizeErrorMessage(error.message);
  }

  return "Une erreur inconnue est survenue.";
}