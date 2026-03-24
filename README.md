# CoachPlanner — SaaS de Gestion des Sessions de Coaching

Plateforme SaaS web permettant de centraliser la planification des sessions de coaching entre formateurs, apprenants, managers/RH et responsables de centre.

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Node.js + Express.js + TypeScript |
| ORM | Prisma |
| Base de données | PostgreSQL |
| Authentification | JWT + Refresh Token |
| Signature numérique | Canvas HTML5 (eIDAS) |
| E-mails | Nodemailer |

---

## Prérequis

- Node.js >= 18
- PostgreSQL >= 14
- npm ou pnpm

---

## Installation

### 1. Cloner & configurer

```bash
git clone <repo>
cd coachplanner
```

### 2. Base de données (Docker)

```bash
docker-compose up -d
```

Ou configurez manuellement PostgreSQL et mettez à jour `.env`.

### 3. Backend

```bash
cd backend
cp .env.example .env
# Éditez .env avec vos valeurs
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

Le backend démarre sur **http://localhost:4000**

### 4. Frontend

```bash
cd frontend
cp .env.example .env.local
# Éditez .env.local si nécessaire
npm install
npm run dev
```

Le frontend démarre sur **http://localhost:3000**

---

## Variables d'environnement

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://coachplanner:coachplanner@localhost:5432/coachplanner"
JWT_SECRET="votre-secret-jwt-super-securise"
JWT_REFRESH_SECRET="votre-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=4000

# Email (optionnel en dev)
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=587
SMTP_USER="votre-user"
SMTP_PASS="votre-password"
EMAIL_FROM="noreply@coachplanner.fr"

# Frontend URL (pour les liens e-mail)
FRONTEND_URL="http://localhost:3000"
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## Structure du projet

```
coachplanner/
├── backend/
│   ├── src/
│   │   ├── index.ts            # Point d'entrée Express
│   │   ├── routes/             # Routes API REST
│   │   │   ├── auth.ts
│   │   │   ├── sessions.ts
│   │   │   ├── modules.ts
│   │   │   ├── users.ts
│   │   │   ├── entreprises.ts
│   │   │   ├── notifications.ts
│   │   │   ├── rapports.ts
│   │   │   ├── signatures.ts
│   │   │   ├── assignments.ts
│   │   │   ├── dashboard.ts
│   │   │   └── export.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts         # Vérification JWT
│   │   │   └── rbac.ts         # Contrôle d'accès par rôle
│   │   └── lib/
│   │       ├── prisma.ts
│   │       ├── jwt.ts
│   │       └── email.ts
│   └── prisma/
│       └── schema.prisma       # Schéma de données
│
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── (auth)/         # Pages non authentifiées
│       │   │   ├── login/
│       │   │   ├── register/
│       │   │   └── forgot-password/
│       │   └── (dashboard)/    # Pages authentifiées
│       │       ├── formateur/
│       │       ├── apprenant/
│       │       ├── manager/
│       │       ├── responsable/
│       │       └── profile/
│       ├── components/
│       │   ├── layout/         # Navbar, Sidebar
│       │   └── ui/             # Composants réutilisables
│       ├── hooks/              # Hooks React
│       ├── lib/                # API client, utilitaires
│       └── types/              # Types TypeScript
│
└── docker-compose.yml
```

---

## Profils utilisateurs

| Rôle | Accès |
|------|-------|
| **Formateur** | Créer/modifier/supprimer des sessions, gérer les modules, voir l'agenda |
| **Apprenant** | Consulter son agenda, signer les sessions terminées, voir l'historique |
| **Manager/RH** | Tableau de bord des apprenants assignés, générer et signer les rapports horaires |
| **Responsable Centre** | Dashboard formateurs, fiches signalétiques, exports CSV |

---

## API REST — Endpoints principaux

```
POST   /api/auth/register          Inscription
POST   /api/auth/login             Connexion
GET    /api/auth/me                Profil courant
PUT    /api/auth/profile           Mettre à jour le profil

GET    /api/sessions               Liste des sessions (selon rôle)
POST   /api/sessions               Créer une session (Formateur)
PUT    /api/sessions/:id           Modifier une session (Formateur)
DELETE /api/sessions/:id           Archiver une session (Formateur)

GET    /api/modules                Liste des modules
POST   /api/modules                Créer un module

POST   /api/signatures/session     Signer une session (Apprenant)
POST   /api/signatures/rapport     Signer un rapport (Manager/RH)

GET    /api/rapports               Liste des rapports
POST   /api/rapports/generate      Générer un rapport horaire

GET    /api/dashboard/formateur    Stats formateur
GET    /api/dashboard/manager      Stats manager
GET    /api/dashboard/responsable  Stats responsable centre

GET    /api/export/csv             Export CSV (Responsable Centre)

GET    /api/notifications          Notifications de l'utilisateur
PUT    /api/notifications/read-all Marquer tout comme lu
```

---

## Conformité

- **RGPD** : Hébergement en UE, droit à l'effacement prévu
- **eIDAS** : Signatures horodatées (date, heure, IP), archivage sécurisé
- **RBAC** : Contrôle d'accès par rôle sur toutes les routes
- **Sécurité** : JWT + bcrypt (coût 12), HTTPS obligatoire en production
