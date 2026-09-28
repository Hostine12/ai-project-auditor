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

### 📈 Analyse SEO

* Vérification du titre HTML.
* Vérification de la présence et du contenu de la meta description.
* Vérification des balises `<h1>`.
* Détection des titres multiples ou manquants.
* Vérification des attributs `alt` des images.
* Calcul d’un score SEO.
* Statistiques par règle et résumé des problèmes détectés.

### 🤖 Analyse AEO

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

### 📊 Rapport d’audit

* Génération d’un rapport structuré au format JSON.
* Résultats SEO et AEO.
* Résultats de l’analyse IA.
* Erreurs de scan et erreurs IA.
* Métadonnées de l’audit.
* Validation de la structure du rapport avec Zod.

### 🛡️ Robustesse et sécurité

* Validation des données reçues de l’IA.
* Gestion des erreurs à différents niveaux du processus d’audit.
* Protection des informations sensibles dans certains messages d’erreur.
* Tests unitaires et tests d’intégration.


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

### 1. Cloner le projet

Clonez le dépôt du projet puis placez-vous dans son dossier :

```bash
git clone <URL_DU_DEPOT>
cd ai-project-auditor
```

### 2. Installer les dépendances

Installez les dépendances du projet avec npm :

```bash
npm install
```

### 3. Compiler le projet

Compilez le code TypeScript :

```bash
npx tsc
```

Si la compilation se termine sans erreur, le projet est prêt à être exécuté.

### 4. Configurer les variables d’environnement

Créez un fichier `.env` à la racine du projet et renseignez la clé API du fournisseur IA que vous souhaitez utiliser.

Exemple :

```env
OPENROUTER_API_KEY=votre_cle_api
```

ou :

```env
GROQ_API_KEY=votre_cle_api
```

> Ne partagez jamais vos clés API et ne les ajoutez pas au dépôt Git.


## ⚙️ Configuration

AI Project Auditor utilise des variables d’environnement pour configurer l’accès aux fournisseurs d’intelligence artificielle.

### 🔑 Variables d’environnement

Créez un fichier `.env` à la racine du projet.

Par défaut, AI Project Auditor utilise **OpenRouter**.

Pour utiliser OpenRouter :

```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=votre_cle_api
```

Pour utiliser Groq :

```env
AI_PROVIDER=groq
GROQ_API_KEY=votre_cle_api
```

### 🤖 Modèle IA

Il est également possible de personnaliser le modèle utilisé par chaque fournisseur.

Pour OpenRouter :

```env
OPENROUTER_MODEL=openrouter/free
```

Pour Groq :

```env
GROQ_MODEL=openai/gpt-oss-20b
```

Si aucun modèle n'est indiqué, le projet utilise automatiquement les modèles configurés par défaut.

Les clés API doivent rester privées et ne doivent jamais être publiées dans le dépôt du projet.

> Le fichier `.env` doit être ajouté au `.gitignore`.




## 🚀 Utilisation

Après l'installation et la configuration, l'audit peut être lancé depuis la ligne de commande.

### Lancer un audit

Pour analyser le projet courant :

```bash
node dist/index.js scan
```

Pour analyser un autre projet, indiquez son chemin :

```bash
node dist/index.js scan <chemin-du-projet>
```

### Exemple

```bash
node dist/index.js scan .
```

L'outil va alors :

1. scanner les fichiers du projet ;
2. appliquer les règles SEO et AEO ;
3. calculer les scores ;
4. analyser les fichiers HTML et Markdown avec l'IA ;
5. gérer les éventuelles erreurs d'analyse ;
6. générer le rapport d'audit.

Le rapport final est enregistré dans le fichier :

```text
audit-report.json
```

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
├── .env
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

Les clés API sont stockées dans des variables d'environnement et ne doivent pas être écrites directement dans le code source.

Le fichier `.env` doit rester privé et être exclu du dépôt Git.

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
