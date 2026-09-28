import type { AuditRule  } from "../../types/seo.js";

import { checkDirectAnswer } from "./direct-answer.js";

export const aeoRules: AuditRule [] = [
  {
    id: "missing-direct-answer",
    description:
      "Vérifie que la page contient du contenu textuel directement identifiable.",
    severity: "warning",
    weight: 10,
    maxPenalty: 20,
    check: checkDirectAnswer,
  },
];