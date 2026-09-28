import type { AuditRule } from "../../types/seo.js";

import { checkMissingAlt } from "./missing-alt.js";
import { checkMissingTitle } from "./missing-title.js";
import { checkMissingH1 } from "./missing-h1.js";
import { checkEmptyTitle } from "./empty-title.js";
import { checkMultipleH1 } from "./multiple-h1.js";
import { checkMissingMetaDescription } from "./missing-meta-description.js";

export const seoRules: AuditRule[] = [
  {
    id: "missing-alt",
    description: "Vérifie que les images possèdent un attribut alt.",
    severity: "warning",
    weight: 5,
    maxPenalty: 20,
    check: checkMissingAlt,
  },

  {
    id: "missing-title",
    description: "Vérifie que les pages possèdent une balise title.",
    severity: "error",
    weight: 20,
    maxPenalty: 20,
    check: checkMissingTitle,
  },

  {
  id: "empty-title",
  description: "Vérifie que la balise title n'est pas vide.",
  severity: "error",
  weight: 20,
  maxPenalty: 20,
  check: checkEmptyTitle,
},

  {
    id: "missing-h1",
    description: "Vérifie que les pages possèdent une balise H1.",
    severity: "warning",
    weight: 10,
    maxPenalty: 10,
    check: checkMissingH1,
  },
  {
  id: "multiple-h1",
  description: "Vérifie que les pages ne possèdent pas plusieurs balises H1.",
  severity: "warning",
  weight: 5,
  maxPenalty: 10,
  check: checkMultipleH1,
},

  {
  id: "missing-meta-description",
  description:
    "Vérifie que les pages possèdent une meta description.",
  severity: "warning",
  weight: 5,
  maxPenalty: 10,
  check: checkMissingMetaDescription,
},
];