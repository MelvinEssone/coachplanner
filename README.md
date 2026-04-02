# CoachPlanner — SaaS de Gestion des Sessions de Coaching

> Plateforme SaaS web centralisant la planification des sessions de coaching entre formateurs, apprenants, managers/RH et responsables de centre de formation.

[![GitHub](https://img.shields.io/badge/GitHub-MelvinEssone%2Fcoachplanner-blue?logo=github)](https://github.com/MelvinEssone/coachplanner)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## Sommaire

- [Stack technique](#stack-technique)
- [Architecture monorepo](#architecture-monorepo)
- [Installation rapide](#installation-rapide)
- [Mode démo](#mode-démo)
- [Commandes disponibles](#commandes-disponibles)
- [Variables d'environnement](#variables-denvironnement)
- [Structure du projet](#structure-du-projet)
- [Profils utilisateurs](#profils-utilisateurs)
- [Fonctionnalités clés](#fonctionnalités-clés)
- [API REST](#api-rest)
- [Conformité](#conformité)

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Node.js + Express.js + TypeScript |
| ORM | Prisma |
| Base de données | PostgreSQL |
| Authentification | JWT + Refresh Token (httpOnly) |
| Signature numérique | Canvas HTML5 — conforme eIDAS |
| E-mails transactionnels | Nodemailer (SMTP / SendGrid) |
| PDF | PDFKit |
| State management | Zustand |
| Validation | Zod + React Hook Form |

---

## Architecture monorepo

Le projet est organisé en **monorepo npm workspaces** avec un `package.json` racine qui orchestre les deux packages :

```
coachplanner/                  ← racine — package.json unifié
├── package.json               ← workspaces + scripts globaux
├── docker-compose.yml         ← PostgreSQL local
├── frontend/                  ← workspace Next.js
│   └── package.json
└── backend/                   ← workspace Express + Prisma
    └── package.json
```

---

## Installation rapide

### Prérequis

- Node.js >= 18
- npm >= 9
- Docker (recommandé pour PostgreSQL)

### 1. Cloner le dépôt

```bash
git clone https://github.com/MelvinEssone/coachplanner.git
cd coachplanner
```

### 2. Installer toutes les dépendances (racine)

```bash
npm install
```

> Cette commande installe les dépendances des deux workspaces (`frontend` et `backend`) en une seule passe.

### 3. Démarrer PostgreSQL (Docker)

```bash
docker-compose up -d
```

> Ou configurez manuellement PostgreSQL et mettez à jour `backend/.env`.

### 4. Configurer les variables d'environnement

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Éditez les fichiers selon votre environnement
```

### 5. Initialiser la base de données

```bash
npm run db:migrate
npm run db:generate
```

### 6. Lancer l'application

```bash
npm run dev
```

> Démarre **frontend** (port 3000) et **backend** (port 4000) simultanément grâce à `concurrently`.

---

## Mode démo

L'application intègre un **mode démo complet** qui ne nécessite **aucun backend actif**. Toutes les données sont mockées côté client via un intercepteur Axios (`demoInterceptor.ts`).

### Comptes de démonstration

| Prénom | NOM | Rôle | Email | Mot de passe |
|--------|-----|------|-------|--------------|
| Melvin | ESSONE | Formateur | Melvin.ESSONE@demo.fr | 123456789 |
| Vincent | DE PAUL | Formateur | Vincent.DEPAUL@demo.fr | 123456789 |
| Matthieu | Dupont | Apprenant | Matthieu.Dupont@demo.fr | 123456789 |
| Marc | Dujardin | Apprenant | Marc.Dujardin@demo.fr | 123456789 |
| Jean | PIERRE | Apprenant | Jean.PIERRE@demo.fr | 123456789 |
| Luc | DARDMON | Apprenant | Luc.DARDMON@demo.fr | 123456789 |
| Sophie | Girage | Apprenant | Sophie.Girage@demo.fr | 123456789 |
| Philippe | Leroi | Manager / RH | Philippe.Leroi@demo.fr | 123456789 |
| Jacques | CHIRAC | Manager / RH | Jacques.CHIRAC@demo.fr | 123456789 |
| Marie | CLAIRE | Manager / RH | Marie.CLAIRE@demo.fr | 123456789 |
| Julie | LESCAUT | Manager / RH | Julie.LESCAUT@demo.fr | 123456789 |
| Marthe | EAU | Responsable Centre | Marthe.EAU@demo.fr | 123456789 |

> Le mode démo s'active automatiquement dès qu'un token `demo-token` est détecté dans le localStorage.

---

## Commandes disponibles

Toutes les commandes s'exécutent **depuis la racine** du projet.

### Développement

```bash
npm run dev              # Lance frontend + backend en parallèle
npm run dev:frontend     # Frontend seul  → http://localhost:3000
npm run dev:backend      # Backend seul   → http://localhost:4000
```

### Build & Production

```bash
npm run build            # Build complet (backend puis frontend)
npm run build:frontend   # Build Next.js uniquement
npm run build:backend    # Compilation TypeScript backend uniquement
npm run start            # Démarre les deux serveurs compilés
```

### Base de données

```bash
npm run db:migrate       # Applique les migrations Prisma
npm run db:generate      # Génère le client Prisma
npm run db:seed          # Peuple la base avec des données de test
npm run db:studio        # Ouvre Prisma Studio (interface visuelle)
```

### Qualité

```bash
npm run lint             # Lint du frontend (ESLint + Next.js)
```

---

## Variables d'environnement

### Backend — `backend/.env`

```env
# Base de données
DATABASE_URL="postgresql://coachplanner:coachplanner@localhost:5432/coachplanner"

# JWT
JWT_SECRET="votre-secret-jwt-super-securise-min-32-chars"
JWT_REFRESH_SECRET="votre-refresh-secret-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Serveur
PORT=4000
NODE_ENV=development

# Email (optionnel en développement)
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=587
SMTP_USER="votre-user"
SMTP_PASS="votre-password"
EMAIL_FROM="noreply@coachplanner.fr"

# Frontend (pour les liens dans les e-mails)
FRONTEND_URL="http://localhost:3000"
```

### Frontend — `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Structure du projet

```
coachplanner/
├── package.json                          # Racine monorepo (workspaces)
├── package-lock.json
├── docker-compose.yml                    # PostgreSQL local
├── .gitignore
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma                 # Schéma de données (12 entités)
│   │   └── migrations/                   # Migrations versionnées
│   └── src/
│       ├── index.ts                      # Point d'entrée Express
│       ├── routes/
│       │   ├── auth.ts                   # Inscription / connexion / profil
│       │   ├── sessions.ts               # CRUD sessions
│       │   ├── modules.ts                # Modules de formation
│       │   ├── users.ts                  # Gestion utilisateurs
│       │   ├── entreprises.ts            # Entreprises / organismes
│       │   ├── notifications.ts          # Notifications in-app
│       │   ├── rapports.ts               # Rapports horaires
│       │   ├── signatures.ts             # Signatures numériques
│       │   ├── assignments.ts            # Assignations manager ↔ apprenant
│       │   ├── dashboard.ts              # Stats par rôle
│       │   └── export.ts                 # Export CSV / PDF
│       ├── middleware/
│       │   ├── auth.ts                   # Vérification JWT
│       │   └── rbac.ts                   # Contrôle d'accès par rôle (RBAC)
│       ├── lib/
│       │   ├── prisma.ts                 # Client Prisma singleton
│       │   ├── jwt.ts                    # Helpers JWT
│       │   └── email.ts                  # Envoi d'e-mails
│       └── types/
│           └── index.ts                  # Types TypeScript partagés
│
└── frontend/
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── .env.example
    └── src/
        ├── app/
        │   ├── (auth)/                   # Pages publiques
        │   │   ├── login/                # Connexion + comptes démo
        │   │   ├── register/             # Inscription avec choix du rôle
        │   │   └── forgot-password/      # Réinitialisation mot de passe
        │   └── (dashboard)/              # Pages authentifiées (layout protégé)
        │       ├── layout.tsx            # Layout sidebar + navbar
        │       ├── dashboard/            # Redirection selon rôle
        │       ├── formateur/
        │       │   ├── dashboard/        # Stats + jauges apprenants
        │       │   ├── sessions/         # Liste, création, édition
        │       │   ├── agenda/           # Vue calendrier formateur
        │       │   └── modules/          # Gestion modules
        │       ├── apprenant/
        │       │   ├── agenda/           # Calendrier personnel
        │       │   ├── historique/       # Sessions signées
        │       │   └── signature/[id]/   # Signature numérique (canvas)
        │       ├── manager/
        │       │   ├── dashboard/        # Suivi apprenants
        │       │   ├── rapports/         # Rapports horaires
        │       │   └── parametres/       # Fréquence rapports
        │       ├── responsable/
        │       │   ├── dashboard/        # Vue globale formateurs
        │       │   ├── formateurs/       # Liste + fiches signalétiques
        │       │   └── export/           # Export CSV / PDF
        │       └── profile/              # Profil utilisateur
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.tsx            # Top bar + notifications + avatar
        │   │   └── Sidebar.tsx           # Navigation latérale (role-based)
        │   └── ui/
        │       ├── SessionCard.tsx       # Carte session avec statut
        │       ├── SignatureCanvas.tsx   # Canvas de signature HTML5
        │       ├── StatCard.tsx          # Indicateur KPI
        │       └── StatusBadge.tsx       # Badge À venir / En cours / Terminée
        ├── hooks/
        │   ├── useAuth.ts               # Store Zustand auth + mode démo
        │   └── useNotifications.ts      # Polling notifications
        ├── lib/
        │   ├── api.ts                   # Client Axios + intercepteurs
        │   ├── auth.ts                  # Helpers localStorage
        │   ├── mockData.ts              # Données de démonstration
        │   ├── demoInterceptor.ts       # Adaptateur Axios mode démo
        │   └── utils.ts                 # Fonctions utilitaires
        └── types/
            └── index.ts                 # Types TypeScript
```

---

## Profils utilisateurs

| Rôle | Écrans principaux | Droits |
|------|-------------------|--------|
| **Formateur** | Dashboard (jauges), Sessions, Agenda, Modules | Créer / modifier / supprimer des sessions |
| **Apprenant** | Agenda, Signature session, Historique | Consulter, signer les sessions terminées |
| **Manager / RH** | Dashboard apprenants, Rapports horaires, Paramètres | Suivre, signer les rapports périodiques |
| **Responsable Centre** | Dashboard formateurs, Fiches signalétiques, Export | Piloter, exporter les données |

---

## Fonctionnalités clés

### Dashboard Formateur
- Indicateurs globaux : sessions totales, heures ce mois, apprenants actifs
- **Jauge 1 — Heures par module** : segmentée par couleur par module de formation
- **Jauge 2 — Avancement des sessions** : Terminées (vert) / En cours (ambre) / À venir (bleu)
- Sessions récentes avec statut de signature
- Prochaines sessions planifiées

### Signature numérique (eIDAS)
- Canvas HTML5 interactif (souris ou tactile)
- Horodatage automatique (date, heure, adresse IP)
- Archivage PDF sécurisé
- Sessions marquées « Attestée par l'apprenant »

### Dashboard Responsable Centre
- Volume horaire par formateur (graphique en barres)
- Tableau synthétique multi-formateurs
- Filtres : semaine / mois / trimestre / plage personnalisée
- Export CSV et PDF

### Notifications
- Cloche in-app avec badge de comptage
- E-mails transactionnels (création, modification, annulation de session)
- Rappels automatiques (signatures en attente, rapports non signés)

---

## API REST

```
# Authentification
POST   /api/auth/register          Inscription
POST   /api/auth/login             Connexion → JWT + Refresh Token
POST   /api/auth/refresh           Rafraîchir le token
GET    /api/auth/me                Profil de l'utilisateur connecté
PUT    /api/auth/profile           Mettre à jour nom / avatar
POST   /api/auth/forgot-password   Demande de réinitialisation
POST   /api/auth/reset-password    Réinitialisation avec token

# Sessions
GET    /api/sessions               Liste (filtrée selon le rôle)
POST   /api/sessions               Créer une session (Formateur)
GET    /api/sessions/:id           Détail d'une session
PUT    /api/sessions/:id           Modifier (Formateur)
DELETE /api/sessions/:id           Archiver (Formateur)

# Modules
GET    /api/modules                Liste des modules
POST   /api/modules                Créer un module
PUT    /api/modules/:id            Modifier
DELETE /api/modules/:id            Supprimer

# Utilisateurs
GET    /api/users                  Liste (filtrée par rôle)
GET    /api/users/:id              Détail utilisateur

# Entreprises
GET    /api/entreprises            Liste
POST   /api/entreprises            Créer
PUT    /api/entreprises/:id        Modifier

# Signatures
POST   /api/signatures/session     Signer une session (Apprenant)
POST   /api/signatures/rapport     Signer un rapport (Manager/RH)

# Rapports horaires
GET    /api/rapports               Liste des rapports (Manager)
POST   /api/rapports/generate      Générer un rapport
GET    /api/rapports/:id/pdf       Télécharger le PDF signé

# Dashboards
GET    /api/dashboard/formateur    Stats formateur
GET    /api/dashboard/apprenant    Stats apprenant
GET    /api/dashboard/manager      Stats manager
GET    /api/dashboard/responsable  Stats responsable centre

# Assignations
POST   /api/assignments/manager    Assigner apprenant ↔ manager
DELETE /api/assignments/manager    Retirer une assignation
POST   /api/assignments/centre     Assigner formateur ↔ responsable
DELETE /api/assignments/centre     Retirer une assignation

# Notifications
GET    /api/notifications          Notifications de l'utilisateur
PUT    /api/notifications/:id/read Marquer comme lu
PUT    /api/notifications/read-all Tout marquer comme lu

# Export
GET    /api/export/csv             Export CSV (Responsable Centre)
```

---

## Conformité

| Réglementation | Implémentation |
|---|---|
| **RGPD** | Hébergement UE, droit à l'effacement, politique de confidentialité |
| **eIDAS** | Signatures horodatées (date, heure, IP), hash SHA-256, archivage inaltérable |
| **RBAC** | Contrôle d'accès par rôle sur toutes les routes API |
| **Sécurité** | JWT + bcrypt (coût ≥ 12), HTTPS, rate limiting, protection CSRF |
| **Conservation** | Documents signés conservés 5 ans minimum (obligation légale formation pro) |

---

## Roadmap

- [x] v1.0 — Authentification, sessions, dashboards, signatures, notifications
- [ ] v1.1 — Déploiement Vercel + Railway (PostgreSQL)
- [ ] v2.0 — Application mobile native (iOS / Android)
- [ ] v2.1 — Module visioconférence intégré
- [ ] v2.2 — IA de recommandation de créneaux
- [ ] v2.3 — Intégration LMS externes (Moodle, etc.)

---

## Auteur

**Melvin ESSONE** — [GitHub](https://github.com/MelvinEssone)

---

*Basé sur le Cahier des Charges Fonctionnel CoachPlanner v1.3 — Mars 2026*
