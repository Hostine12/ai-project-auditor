# AI Project Auditor

**AI Project Auditor** est un outil en ligne de commande (CLI) développé avec Node.js et TypeScript. Il permet d'analyser des projets web afin d'identifier des problèmes liés au **SEO** (Search Engine Optimization) et à l'**AEO** (Answer Engine Optimization), puis de générer un rapport d'audit au format JSON.

L'outil combine des règles d'analyse statique et, lorsqu'elle est activée et correctement configurée, une analyse assistée par intelligence artificielle.

## 1. Fonctionnalités

- Analyse de fichiers web pris en charge.
- Vérifications SEO fondées sur des règles statiques.
- Vérification AEO statique de la présence de contenu textuel identifiable.
- Analyse complémentaire par IA avec OpenRouter ou Groq.
- Calcul des scores SEO et AEO sur 100.
- Détection et classification des problèmes : `error`, `warning` et `info`.
- Recommandations et propositions de correction lorsqu'elles sont disponibles.
- Génération d'un rapport JSON structuré.
- Configuration des fonctionnalités, des fichiers à analyser et du chemin du rapport.
- Contrôle des scores avec un seuil CI configurable.
- Validation de la structure du rapport avec Zod.

## 2. Prérequis

- Node.js 22 ou une version compatible avec les dépendances du projet.
- npm.
- Une clé API OpenRouter ou Groq si l'analyse IA est activée.

L'analyse statique peut être utilisée sans clé API lorsque l'analyse IA est désactivée.

## 3. Installation

Après publication du package sur npm, installez-le dans le projet à auditer :

```bash
npm install -D ai-project-auditor
```

Vous pouvez ensuite utiliser les commandes avec `npx`.

> Tant que le package n'est pas publié sur npm, cette commande d'installation n'est pas encore destinée aux utilisateurs externes. Pour développer ou tester le package localement, utilisez la procédure de développement du dépôt.

## 4. Initialisation

À la racine du projet à auditer, exécutez :

```bash
npx ai-audit init
```

Cette commande initialise la configuration du projet.

Pour lancer l'audit :

```bash
npx ai-audit scan
```

Pour auditer un autre répertoire :

```bash
npx ai-audit scan ./mon-projet
```

Le rapport est généré selon le chemin de sortie configuré. Par défaut, il s'agit de `audit-report.json`.

## 5. Configuration

Le fichier `ai-audit.config.json` permet de personnaliser l'audit.

Exemple de configuration :

```json
{
  "ai": {
    "provider": "openrouter"
  },
  "include": [],
  "exclude": [
    "node_modules",
    ".git",
    "dist",
    "build"
  ],
  "features": {
    "seo": true,
    "aeo": true,
    "ai": true
  },
  "output": {
    "path": "audit-report.json"
  },
  "ci": {
    "threshold": 0
  }
}
```

### Options principales

| Option | Description |
|---|---|
| `ai.provider` | Fournisseur IA sélectionné. |
| `include` | Liste des fichiers ou chemins à inclure, selon les règles du scanner. |
| `exclude` | Fichiers ou répertoires à exclure. |
| `features.seo` | Active ou désactive l'analyse SEO. |
| `features.aeo` | Active ou désactive l'analyse AEO. |
| `features.ai` | Active ou désactive l'analyse IA. |
| `output.path` | Chemin du rapport JSON. |
| `ci.threshold` | Score minimal exigé séparément pour le SEO et l'AEO. |

Les répertoires `node_modules`, `.git`, `dist` et `build` font partie des exclusions par défaut documentées. Vérifiez la configuration générée par la commande `init` pour connaître les valeurs effectivement utilisées par votre version.

## 6. Analyse SEO et AEO

### SEO

L'analyse SEO repose sur des règles statiques qui vérifient notamment certains éléments de structure et de contenu des pages, tels que :

- la présence du titre HTML (`<title>`) ;
- la présence d'une méta-description ;
- la présence d'un titre principal (`<h1>`) ;
- la présence de plusieurs titres principaux ;
- la présence d'attributs `alt` sur les images.

Les problèmes détectés sont accompagnés d'une gravité et, selon la règle, d'une recommandation ou d'une proposition de correction.

### AEO

L'objectif de l'AEO est d'améliorer la capacité d'un contenu à fournir des réponses claires et directement exploitables.

Dans la version actuelle, la règle AEO statique `missing-direct-answer` vérifie la présence d'un paragraphe textuel non vide dans les fichiers HTML, JSX et TSX pris en charge.

Cette règle ne vérifie pas à elle seule si le paragraphe répond réellement à une question. Elle constitue un contrôle élémentaire de la présence de contenu textuel.

L'analyse IA peut compléter ce contrôle avec des informations sur les réponses directes, les points forts, les faiblesses et les recommandations AEO.

### Scores et problèmes

Chaque analyse SEO et AEO comprend :

- un score compris entre 0 et 100 ;
- un résumé des erreurs, avertissements et informations ;
- des statistiques par règle ;
- la liste des problèmes détectés.

Le score dépend des règles configurées, de leurs poids et des pénalités appliquées.

## 7. Analyse par intelligence artificielle

L'outil prend en charge deux fournisseurs IA :

- OpenRouter ;
- Groq.

Le fournisseur et le modèle sont configurés selon les options prises en charge par le projet.

### Configuration OpenRouter

Définissez les variables d'environnement suivantes :

```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=votre_cle_api
```

Le modèle doit être défini selon la configuration du projet. Le modèle par défaut documenté est `openrouter/free`.

### Configuration Groq

```env
AI_PROVIDER=groq
GROQ_API_KEY=votre_cle_api
```

Le modèle par défaut documenté est `openai/gpt-oss-20b`.

Utilisez `.env.example` comme modèle de configuration. Ne placez jamais de véritable clé API dans ce fichier d'exemple, dans le code source ou dans un dépôt public.

L'analyse IA peut notamment produire des informations sur :

- le titre et le H1 ;
- la méta-description et les mots-clés ;
- les points forts et les faiblesses ;
- les recommandations SEO ;
- la réponse directe et les recommandations AEO.

Les résultats reçus sont normalisés et validés avant leur intégration au rapport. Une erreur d'analyse IA est enregistrée séparément afin de distinguer ce problème des erreurs de scan.

## 8. Rapport JSON

Le rapport généré contient les sections suivantes :

| Section | Contenu |
|---|---|
| `project` | Nom du projet audité. |
| `metadata` | Date de génération, nombre de fichiers analysés et nombre de fichiers présentant des problèmes. |
| `seo` | Score, résumé, statistiques par règle et problèmes SEO. |
| `aeo` | Score, résumé, statistiques par règle et problèmes AEO. |
| `ai.results` | Résultats de l'analyse IA par fichier. |
| `ai.errors` | Erreurs survenues pendant l'analyse IA. |
| `scan.errors` | Erreurs rencontrées pendant le scan des fichiers. |

Exemple simplifié :

```json
{
  "project": {
    "name": "mon-projet"
  },
  "metadata": {
    "generatedAt": "2026-01-01T10:00:00.000Z",
    "filesScanned": 12,
    "filesWithIssues": 3
  },
  "seo": {
    "score": 90,
    "summary": {
      "errors": 1,
      "warnings": 2,
      "infos": 0,
      "totalIssues": 3
    },
    "ruleStats": [],
    "issues": []
  },
  "aeo": {
    "score": 90,
    "summary": {
      "errors": 0,
      "warnings": 1,
      "infos": 0,
      "totalIssues": 1
    },
    "ruleStats": [],
    "issues": []
  },
  "ai": {
    "results": [],
    "errors": []
  },
  "scan": {
    "errors": []
  }
}
```

Cet exemple illustre la structure générale du rapport. Les scores et les nombres sont fictifs, et les tableaux vides sont utilisés pour simplifier la présentation.

Le rapport est validé à l'aide d'un schéma Zod afin de vérifier la structure et les types de ses données.

## 9. Seuil CI

Le seuil CI permet de vérifier que les scores SEO et AEO atteignent un niveau minimal.

Exemple :

```json
{
  "ci": {
    "threshold": 80
  }
}
```

Avec un seuil de `80`, les deux conditions suivantes doivent être respectées :

- score SEO supérieur ou égal à 80 ;
- score AEO supérieur ou égal à 80.

Si l'un des deux scores est inférieur au seuil, le contrôle échoue. Le seuil `0` permet aux scores non négatifs de satisfaire ce contrôle.

## 10. Fichiers pris en charge

Les extensions prises en charge par le scanner sont :

- `.js`
- `.jsx`
- `.ts`
- `.tsx`
- `.html`
- `.md`

Les fichiers exclus par la configuration ne sont pas analysés. La règle AEO statique décrite plus haut ne s'applique actuellement qu'aux fichiers HTML, JSX et TSX.

## 11. Sécurité et confidentialité

L'analyse d'un projet peut impliquer la lecture de son contenu source. Lorsque l'analyse IA est activée, certains contenus peuvent être transmis au fournisseur IA configuré pour être analysés.

Avant d'utiliser l'outil sur un projet sensible :

- configurez les exclusions ;
- ne transmettez pas de secrets, de mots de passe ou de clés API ;
- gardez les clés API dans les variables d'environnement ;
- vérifiez les politiques de confidentialité et de conservation des données du fournisseur IA utilisé.

Les fichiers `.env` et les autres fichiers contenant des secrets doivent être exclus de l'analyse et de toute transmission à un service externe.

## 12. Commandes disponibles

Afficher l'aide :

```bash
npx ai-audit --help
```

Afficher la version :

```bash
npx ai-audit --version
```

Initialiser la configuration :

```bash
npx ai-audit init
```

Analyser le projet courant :

```bash
npx ai-audit scan
```

Analyser un répertoire spécifique :

```bash
npx ai-audit scan ./mon-projet
```

## 13. Développement et tests

Pour travailler sur le code source du dépôt :

Installer les dépendances :

```bash
npm install
```

Compiler le projet TypeScript :

```bash
npm run build
```

Exécuter les tests :

```bash
npm test
```

Exécuter tous les tests une seule fois :

```bash
npx vitest run
```

Vérifier le contenu prévu pour la distribution npm sans publier le package :

```bash
npm pack --dry-run
```

## 14. Licence

Le fichier `package.json` déclare actuellement la licence ISC. Vérifiez que le fichier `LICENSE` correspondant est présent dans le dépôt et inclus dans la distribution avant de publier le package.

---

**AI Project Auditor** — outil d'audit SEO/AEO en ligne de commande, développé avec TypeScript.