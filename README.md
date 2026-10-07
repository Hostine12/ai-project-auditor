# AI Project Auditor

AI Project Auditor est un outil d’audit automatisé pour les projets web, développé avec Node.js et TypeScript.

Il permet d’analyser un projet afin d’identifier différents problèmes liés au **SEO (Search Engine Optimization)** et à l’**AEO (Answer Engine Optimization)**, puis de produire un rapport d’audit structuré au format JSON.

L’outil combine plusieurs niveaux d’analyse :

* une analyse statique des fichiers du projet ;
* un système de règles SEO et AEO ;
* un calcul de scores ;
* une analyse complémentaire par intelligence artificielle ;
* une validation des résultats ;
* une gestion des erreurs et un système de cache pour les analyses IA.

L’objectif est de fournir un outil capable d’analyser automatiquement un projet web et de présenter ses résultats de manière structurée et exploitable.


## ✨ Fonctionnalités

### 🔍 Analyse d’un projet

* Scan récursif des fichiers du projet.
* Prise en charge des fichiers `.js`, `.jsx`, `.ts`, `.tsx`, `.html` et `.md`.
* Exclusion automatique de certains dossiers comme `node_modules`, `.git`, `dist` et `build`.
* Gestion des erreurs de lecture des fichiers.

## 📈 Analyse SEO

- Vérification du titre HTML (`<title>`).
- Vérification de la présence et du contenu de la meta description.
- Vérification de la présence des balises `<h1>`.
- Détection des titres multiples ou manquants.
- Vérification des attributs `alt` des images.
- Analyse de la structure et du contenu pertinent du projet.
- Calcul d'un score SEO.
- Statistiques par règle et résumé des problèmes détectés.

### 🤖 Analyse AEO

L'analyse AEO vise à évaluer les éléments qui facilitent la compréhension et l'extraction des informations par les moteurs de réponse.

Elle prend notamment en compte :

- la présence de réponses directes et compréhensibles ;
- la clarté et la structure de l'information ;
- l'organisation des questions et réponses ;
- la présence et la structuration des contenus de type FAQ ;
- la capacité du contenu à fournir rapidement une réponse pertinente.

L'outil calcule un score AEO et fournit un résumé ainsi que des statistiques sur les problèmes détectés.

* Analyse des éléments favorisant la compréhension du contenu par les moteurs de réponse.
* Détection des problèmes selon les règles AEO définies dans le projet.
* Calcul d’un score AEO.
* Résumé et statistiques des problèmes détectés.

### 🧠 Analyse par intelligence artificielle

* Intégration de fournisseurs IA externes.
* Support d’OpenRouter et de Groq.
* Analyse complémentaire des fichiers HTML et Markdown.
* Normalisation et validation des réponses de l’IA.
* Gestion des erreurs du fournisseur IA.
* Mise en cache des analyses afin d’éviter des appels inutiles.

## 📊 Rapport d’audit

L'audit génère un rapport structuré au format JSON dans le fichier `audit-report.json` par défaut.

Le rapport contient notamment :

- les résultats et le score SEO ;
- les résultats et le score AEO ;
- les problèmes détectés et leur niveau de gravité ;
- les résultats de l'analyse IA ;
- les erreurs rencontrées lors du scan et de l'analyse IA ;
- les métadonnées de l'audit, notamment le nombre de fichiers analysés ;
- les résultats regroupés par fichier et par règle ;
- les recommandations associées aux problèmes détectés.

La structure du rapport est validée avec **Zod** afin de garantir un format de sortie cohérent et exploitable.
### 🛡️ Robustesse et sécurité

Validation des données reçues des fournisseurs IA.

Validation de la structure du rapport avec Zod.

Gestion des erreurs à différents niveaux du processus d'audit.

Gestion des erreurs de lecture des fichiers sans interrompre l'ensemble du scan.

Gestion des erreurs des fournisseurs IA et des limites de requêtes.

Protection des informations sensibles dans les données transmises à l'IA et les messages d'erreur.

Les clés API ne sont jamais affichées dans les rapports, les logs ou les messages d'erreur.

Tests unitaires et tests d'intégration.


## 🛠️ Technologies utilisées

* **Node.js** — environnement d’exécution du projet.
* **TypeScript** — typage statique et structuration du code.
* **Zod** — validation des données et des réponses de l’IA.
* **Vitest** — tests unitaires et tests d’intégration.
* **dotenv** — gestion des variables d’environnement.
* **OpenRouter** — fournisseur d’intelligence artificielle accessible via API.
* **Groq** — fournisseur d’intelligence artificielle accessible via API.


## 📋 Prérequis

Avant d’utiliser AI Project Auditor, assurez-vous d’avoir installé :

* **Node.js** — version 22 ou supérieure recommandée.
* **npm** — installé automatiquement avec Node.js.
* Une **clé API OpenRouter ou Groq** si vous souhaitez utiliser l’analyse par intelligence artificielle.

Le projet peut être exécuté sur un environnement Windows, Linux ou macOS disposant de Node.js et npm.


## ⚙️ Installation

### Prérequis

- Node.js 18 ou version supérieure
- npm

### Installation du package

Dans le projet que vous souhaitez auditer :

```bash
npm install -D ai-project-auditor
```

Le package fournit la commande :

```bash
npx ai-audit
```

### Initialisation de la configuration

Pour créer automatiquement le fichier de configuration :

```bash
npx ai-audit init
```

Cela génère un fichier `ai-audit.config.json` à la racine du projet.

Exemple de configuration générée :

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

Le fichier peut ensuite être personnalisé selon les besoins du projet.

### Configuration de l'IA

Deux fournisseurs sont pris en charge :

- OpenRouter
- Groq

#### OpenRouter

```json
{
  "ai": {
    "provider": "openrouter",
    "model": "openrouter/free"
  }
}
```

La clé API doit être fournie dans une variable d'environnement :

```env
OPENROUTER_API_KEY=votre_clé
```

#### Groq

```json
{
  "ai": {
    "provider": "groq",
    "model": "openai/gpt-oss-20b"
  }
}
```

La clé API doit être fournie dans une variable d'environnement :

```env
GROQ_API_KEY=votre_clé
```

Les clés API ne doivent jamais être placées dans le code source, dans `ai-audit.config.json` ou dans le rapport généré.

### Fichiers inclus et exclus

Le champ `include` permet de limiter l'analyse à certains fichiers ou dossiers.

Exemple :

```json
{
  "include": [
    "src",
    "index.html"
  ]
}
```

Si `include` est vide :

```json
"include": []
```

le scanner parcourt automatiquement le projet en appliquant les exclusions configurées.

Le champ `exclude` permet d'empêcher certains fichiers ou dossiers d'être analysés.

Les exclusions par défaut sont :

```json
"exclude": [
  "node_modules",
  ".git",
  "dist",
  "build"
]
```

Les exclusions restent prioritaires sur les inclusions. Un fichier ou dossier exclu ne sera donc pas analysé même s'il se trouve dans un chemin indiqué dans `include`.

### Fonctionnalités

Les fonctionnalités peuvent être activées ou désactivées individuellement :

```json
{
  "features": {
    "seo": true,
    "aeo": true,
    "ai": true
  }
}
```

- `seo` : active l'analyse SEO statique.
- `aeo` : active l'analyse AEO.
- `ai` : active l'analyse sémantique avec le fournisseur IA configuré.

Désactiver l'IA permet notamment d'effectuer une analyse locale sans appel à un fournisseur d'IA.

### Fichiers analysés

Le scanner prend en charge les extensions suivantes :

- `.html`
- `.js`
- `.jsx`
- `.ts`
- `.tsx`
- `.md`

Les autres types de fichiers sont ignorés.

Les fichiers de plus de **5 Mo** ne sont pas lus ni transmis à l'analyse. Ils sont signalés dans les erreurs du rapport, sans interrompre l'ensemble du scan.

### Chemin du rapport

Le rapport est généré par défaut dans :

```text
audit-report.json
```

Il est possible de modifier son emplacement :

```json
{
  "output": {
    "path": "reports/audit-report.json"
  }
}
```

### Seuil CI/CD

Un seuil minimal peut être défini pour les scores SEO et AEO :

```json
{
  "ci": {
    "threshold": 80
  }
}
```

Dans cet exemple, le scan échoue si le score SEO **ou** le score AEO est inférieur à 80.

Cela permet d'utiliser l'outil dans une pipeline CI/CD.

### Lancer un audit

Depuis la racine du projet :

```bash
npx ai-audit scan
```

Pour analyser un autre dossier :

```bash
npx ai-audit scan ./mon-projet
```

Autres commandes disponibles :

```bash
npx ai-audit init
npx ai-audit scan
npx ai-audit --help
npx ai-audit --version
```

### 🔒 Confidentialité

L'outil effectue une partie des analyses localement afin de limiter les données transmises aux fournisseurs d'IA.

Lorsque l'analyse IA est activée, certaines données du projet peuvent être transmises au fournisseur configuré (OpenRouter ou Groq).

Avant leur transmission, les contenus analysés sont traités afin de réduire le risque d'exposition de certaines informations sensibles.

Il est donc recommandé :

de ne pas inclure de secrets ou de données sensibles dans les fichiers analysés ;

de conserver les clés API uniquement dans les variables d'environnement ;

d'utiliser include pour limiter les fichiers à analyser lorsque cela est nécessaire ;

d'utiliser exclude pour empêcher l'analyse de fichiers ou dossiers sensibles ;

d'éviter de transmettre inutilement des fichiers contenant des informations confidentielles.

Les fichiers exclus du scan ne sont pas analysés ni transmis au fournisseur IA.

## 📊 Rapport généré

Après l'exécution de l'audit, AI Project Auditor génère un fichier `audit-report.json`.

Le rapport contient notamment :

* les informations générales du projet ;
* la date et les métadonnées de l'audit ;
* le nombre de fichiers analysés ;
* les résultats de l'analyse SEO ;
* les résultats de l'analyse AEO ;
* les scores obtenus ;
* les problèmes détectés et leur niveau de gravité ;
* les statistiques par règle ;
* les résultats de l'analyse par intelligence artificielle ;
* les éventuelles erreurs rencontrées lors du scan ou de l'analyse IA.

### Structure générale

Le rapport est organisé en plusieurs parties afin de faciliter son exploitation par un développeur ou un autre outil.

Exemple simplifié :

```json
{
  "project": {
    "name": "mon-projet"
  },
  "metadata": {
    "generatedAt": "...",
    "filesScanned": 44,
    "filesWithIssues": 2
  },
  "seo": {},
  "aeo": {},
  "ai": {
    "results": [],
    "errors": []
  },
  "scan": {
    "errors": []
  }
}
```


La structure complète du rapport est validée à l'aide de **Zod** afin de garantir la cohérence des données produites.


## 🔄 Fonctionnement

L'audit suit plusieurs étapes successives :

```text
Projet à analyser
       │
       ▼
   Scan des fichiers
       │
       ▼
 Analyse SEO + AEO
       │
       ▼
 Calcul des scores
       │
       ▼
 Analyse IA des fichiers HTML/Markdown
       │
       ▼
 Normalisation + validation des résultats IA
       │
       ▼
 Gestion des erreurs + cache
       │
       ▼
 Génération du rapport JSON
```

### Étapes principales

1. **Scan**
   Le projet est parcouru récursivement afin d'identifier les fichiers pris en charge.

2. **Analyse statique**
   Les règles SEO et AEO sont appliquées aux fichiers concernés.

3. **Calcul des scores**
   Les problèmes détectés sont pondérés afin de calculer les scores SEO et AEO.

4. **Analyse IA**
   Les fichiers HTML et Markdown peuvent être analysés par le fournisseur IA configuré.

5. **Validation**
   Les réponses de l'IA sont normalisées puis validées avec Zod.

6. **Gestion des erreurs et du cache**
   Les erreurs sont gérées sans interrompre inutilement l'ensemble de l'audit et les résultats IA peuvent être réutilisés grâce au cache.

7. **Génération du rapport**
   Toutes les informations sont regroupées dans `audit-report.json`.


## 🏗️ Architecture

Le projet est organisé de manière modulaire afin de séparer les différentes responsabilités de l'application.

Une partie de l'organisation principale est la suivante :

```text
ai-project-auditor/
│
├── src/
│   ├── ai/
│   │   ├── schemas/
│   │   ├── ai-analyzer.ts
│   │   ├── ai-cache.ts
│   │   ├── ai-provider.ts
│   │   ├── ai-provider-factory.ts
│   │   ├── groq-provider.ts
│   │   ├── openrouter-provider.ts
│   │   └── ai-result-normalizer.ts
│   │
│   ├── analyzers/
│   │   ├── aeo-analyzer.ts
│   │   ├── seo-analyzer.ts
│   │   ├── rule-engine.ts
│   │   ├── score-calculator.ts
│   │   └── issue-summary.ts
│   │
│   ├── cli/
│   │
│   ├── config/
│   │
│   ├── report/
│   │
│   ├── rules/
│   │   ├── seo/
│   │   └── aeo/
│   │
│   ├── scanner/
│   │   └── project-scanner.ts
│   │
│   ├── types/
│   │
│   ├── utils/
│   │
│   ├── audit-runner.ts
│   └── index.ts
│
├── .env.example
├── ai-audit.config.json
├── package.json
├── tsconfig.json
└── README.md
```

### Principales responsabilités

* **`scanner/`** : analyse récursivement les fichiers du projet.
* **`analyzers/`** : contient les moteurs d'analyse SEO et AEO ainsi que le calcul des scores et la gestion des problèmes.
* **`rules/seo/`** : contient les règles d'analyse SEO.
* **`rules/aeo/`** : contient les règles d'analyse AEO.
* **`ai/`** : gère les fournisseurs IA, le cache, la normalisation, la validation et l'analyse IA.
* **`cli/`** : gère les arguments, les sorties et les erreurs de la ligne de commande.
* **`config/`** : gère la configuration de l'application.
* **`report/`** : gère la génération du rapport d'audit.
* **`types/`** : contient les types TypeScript utilisés dans le projet.
* **`utils/`** : contient les fonctions utilitaires, notamment le nettoyage des messages d'erreur.
* **`audit-runner.ts`** : orchestre les différentes étapes de l'audit.
* **`index.ts`** : point d'entrée de l'application.

Cette organisation permet de séparer clairement les responsabilités et de faire évoluer chaque partie du projet indépendamment.



## 🧪 Tests

Le projet utilise **Vitest** pour automatiser les tests unitaires et les tests d'intégration.

Pour exécuter l'ensemble des tests :

```bash
npm test
npx vitest run
```

Pour compiler le projet et vérifier le typage TypeScript :

```bash
npx tsc
```

Les tests couvrent notamment :

* le calcul des scores SEO et AEO ;
* l'analyse par les fournisseurs IA ;
* la gestion du cache ;
* la normalisation et la validation des résultats IA ;
* la configuration du projet ;
* la gestion des erreurs ;
* le fonctionnement du scanner ;
* les différents scénarios d'intégration de l'audit.

L'ensemble des tests doit passer avant de considérer une modification comme stable.


## 🛡️ Sécurité

AI Project Auditor intègre plusieurs mécanismes destinés à limiter les risques liés à l'utilisation de données externes et de fournisseurs IA.

### 🔐 Protection des clés API

Les clés API sont stockées dans des variables d'environnement et ne doivent jamais être écrites directement dans le code source.

Elles ne doivent pas être affichées dans les logs, les messages d'erreur ou les rapports générés.

Le fichier .env doit rester privé et ne doit jamais être ajouté au dépôt Git.

### 🧹 Nettoyage des messages d'erreur

Les messages d'erreur provenant des fournisseurs IA sont nettoyés avant d'être ajoutés au rapport afin d'éviter d'exposer certaines informations sensibles, notamment les clés API.

### ✅ Validation des données IA

Les réponses reçues des fournisseurs IA sont :

1. normalisées ;
2. vérifiées ;
3. validées avec **Zod** avant d'être utilisées dans le rapport.

### ⚠️ Gestion des erreurs

Une erreur sur un fichier ou lors d'une analyse IA ne doit pas nécessairement interrompre l'ensemble de l'audit.

Le système conserve les résultats disponibles et enregistre les erreurs de manière structurée afin de faciliter leur identification.

## 🤖 Fournisseurs IA

AI Project Auditor utilise une architecture permettant d'intégrer différents fournisseurs d'intelligence artificielle.

Les fournisseurs actuellement pris en charge sont :

### OpenRouter

OpenRouter permet d'utiliser différents modèles d'intelligence artificielle à travers une API unifiée.

Dans le projet, il est utilisé comme l'un des fournisseurs possibles pour l'analyse complémentaire des fichiers.

### Groq

Groq est également pris en charge comme fournisseur IA.

Le projet communique avec son API afin d'obtenir une analyse des fichiers concernés.

### Architecture commune

Les fournisseurs utilisent une architecture commune afin que le reste du projet ne dépende pas directement d'un fournisseur particulier.

Cette approche permet notamment :

* de changer de fournisseur sans modifier toute l'architecture de l'application ;
* de gérer les résultats IA de manière uniforme ;
* de centraliser la normalisation et la validation des réponses ;
* de faciliter l'ajout futur d'autres fournisseurs.



## 📄 Licence

Le projet **AI Project Auditor** est actuellement un projet personnel.

Les conditions de distribution, de modification et de réutilisation du code n'ont pas encore été définies.
