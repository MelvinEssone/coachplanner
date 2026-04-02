// =========================================================
// COACHPLANNER — DONNÉES DE DÉMONSTRATION COMPLÈTES
// Aujourd'hui : 31/03/2026
// =========================================================

export const DEMO_PASSWORD = "123456789";

// ─── UTILISATEURS ─────────────────────────────────────────
export const DEMO_USERS_MAP: Record<string, DemoUser> = {
  "Melvin.ESSONE@demo.fr": {
    id: "u-melvin", nom: "ESSONE", prenom: "Melvin",
    email: "Melvin.ESSONE@demo.fr", role: "FORMATEUR",
    emailVerified: true, createdAt: "2025-09-01T00:00:00Z",
    entrepriseId: null,
  },
  "Vincent.DEPAUL@demo.fr": {
    id: "u-vincent", nom: "DE PAUL", prenom: "Vincent",
    email: "Vincent.DEPAUL@demo.fr", role: "FORMATEUR",
    emailVerified: true, createdAt: "2025-09-01T00:00:00Z",
    entrepriseId: null,
  },
  "Matthieu.Dupont@demo.fr": {
    id: "u-matthieu", nom: "Dupont", prenom: "Matthieu",
    email: "Matthieu.Dupont@demo.fr", role: "APPRENANT",
    emailVerified: true, createdAt: "2025-10-01T00:00:00Z",
    entrepriseId: "ent-techcorp",
  },
  "Marc.Dujardin@demo.fr": {
    id: "u-marc", nom: "Dujardin", prenom: "Marc",
    email: "Marc.Dujardin@demo.fr", role: "APPRENANT",
    emailVerified: true, createdAt: "2025-10-01T00:00:00Z",
    entrepriseId: "ent-techcorp",
  },
  "Jean.PIERRE@demo.fr": {
    id: "u-jean", nom: "PIERRE", prenom: "Jean",
    email: "Jean.PIERRE@demo.fr", role: "APPRENANT",
    emailVerified: true, createdAt: "2025-10-01T00:00:00Z",
    entrepriseId: "ent-innova",
  },
  "Luc.DARDMON@demo.fr": {
    id: "u-luc", nom: "DARDMON", prenom: "Luc",
    email: "Luc.DARDMON@demo.fr", role: "APPRENANT",
    emailVerified: true, createdAt: "2025-10-01T00:00:00Z",
    entrepriseId: "ent-innova",
  },
  "Sophie.Girage@demo.fr": {
    id: "u-sophie", nom: "Girage", prenom: "Sophie",
    email: "Sophie.Girage@demo.fr", role: "APPRENANT",
    emailVerified: true, createdAt: "2025-10-01T00:00:00Z",
    entrepriseId: "ent-globalrh",
  },
  "Philippe.Leroi@demo.fr": {
    id: "u-philippe", nom: "Leroi", prenom: "Philippe",
    email: "Philippe.Leroi@demo.fr", role: "MANAGER_RH",
    emailVerified: true, createdAt: "2025-09-15T00:00:00Z",
    entrepriseId: "ent-techcorp",
  },
  "Jacques.CHIRAC@demo.fr": {
    id: "u-jacques", nom: "CHIRAC", prenom: "Jacques",
    email: "Jacques.CHIRAC@demo.fr", role: "MANAGER_RH",
    emailVerified: true, createdAt: "2025-09-15T00:00:00Z",
    entrepriseId: "ent-innova",
  },
  "Marie.CLAIRE@demo.fr": {
    id: "u-marie", nom: "CLAIRE", prenom: "Marie",
    email: "Marie.CLAIRE@demo.fr", role: "MANAGER_RH",
    emailVerified: true, createdAt: "2025-09-15T00:00:00Z",
    entrepriseId: "ent-globalrh",
  },
  "Julie.LESCAUT@demo.fr": {
    id: "u-julie", nom: "LESCAUT", prenom: "Julie",
    email: "Julie.LESCAUT@demo.fr", role: "MANAGER_RH",
    emailVerified: true, createdAt: "2025-09-15T00:00:00Z",
    entrepriseId: "ent-techcorp",
  },
  "Marthe.EAU@demo.fr": {
    id: "u-marthe", nom: "EAU", prenom: "Marthe",
    email: "Marthe.EAU@demo.fr", role: "RESPONSABLE_CENTRE",
    emailVerified: true, createdAt: "2025-08-01T00:00:00Z",
    entrepriseId: null,
  },
};

export type DemoUser = {
  id: string; nom: string; prenom: string; email: string;
  role: string; emailVerified: boolean; createdAt: string;
  entrepriseId: string | null;
};

// ─── ENTREPRISES ──────────────────────────────────────────
export const DEMO_ENTREPRISES = [
  { id: "ent-techcorp", nom: "TechCorp Solutions", type: "entreprise", adresse: "12 rue de la Paix, Paris 75001", siret: "12345678901234" },
  { id: "ent-innova", nom: "Innova Group", type: "entreprise", adresse: "5 avenue Victor Hugo, Lyon 69001", siret: "98765432100012" },
  { id: "ent-globalrh", nom: "Global RH Conseil", type: "organisme", adresse: "8 boulevard Haussmann, Paris 75009", siret: "55544433322211" },
];

// ─── MODULES DE FORMATION ─────────────────────────────────
export const DEMO_MODULES = [
  { id: "mod-devpers", nom: "Développement Personnel", description: "Améliorer la confiance en soi, la gestion des émotions et la posture professionnelle", formateurId: "u-melvin", createdAt: "2025-09-05T00:00:00Z" },
  { id: "mod-stress", nom: "Gestion du Stress", description: "Techniques de relaxation, gestion des priorités et prévention du burn-out", formateurId: "u-melvin", createdAt: "2025-09-05T00:00:00Z" },
  { id: "mod-leader", nom: "Leadership & Management", description: "Développer son leadership, animer une équipe et piloter la performance", formateurId: "u-vincent", createdAt: "2025-09-10T00:00:00Z" },
  { id: "mod-commpro", nom: "Communication Professionnelle", description: "Prise de parole, communication assertive et gestion des conflits", formateurId: "u-vincent", createdAt: "2025-09-10T00:00:00Z" },
];

// ─── PROFILS FORMATEURS ───────────────────────────────────
export const DEMO_FORMATEUR_PROFILS = [
  { id: "fp-melvin", userId: "u-melvin", matieres: ["Développement Personnel", "Gestion du Stress", "Bien-être au travail"], statut: "Actif", dateEntree: "2025-09-01", telephone: "+33 6 12 34 56 78" },
  { id: "fp-vincent", userId: "u-vincent", matieres: ["Leadership & Management", "Communication Professionnelle", "Prise de parole"], statut: "Actif", dateEntree: "2025-09-01", telephone: "+33 6 98 76 54 32" },
];

// ─── SESSIONS ─────────────────────────────────────────────
// Aujourd'hui = 31/03/2026 → EN_COURS si dateDebut <= now <= dateFin
const u = DEMO_USERS_MAP;

export const DEMO_SESSIONS = [
  // === MELVIN — Matthieu Dupont ===
  {
    id: "s-01", formateurId: "u-melvin", apprenantId: "u-matthieu", moduleId: "mod-devpers",
    dateDebut: "2026-03-10T09:00:00Z", dateFin: "2026-03-10T11:00:00Z", dureeMinutes: 120,
    type: "Individuelle", statut: "TERMINEE", notes: "Première séance d'exploration. Objectifs posés.", archived: false,
    formateur: u["Melvin.ESSONE@demo.fr"], apprenant: u["Matthieu.Dupont@demo.fr"],
    module: DEMO_MODULES[0], signatures: [{ id: "sig-01", role: "APPRENANT", horodatage: "2026-03-10T11:15:00Z" }],
    createdAt: "2026-03-05T00:00:00Z",
  },
  {
    id: "s-02", formateurId: "u-melvin", apprenantId: "u-matthieu", moduleId: "mod-stress",
    dateDebut: "2026-03-20T14:00:00Z", dateFin: "2026-03-20T16:00:00Z", dureeMinutes: 120,
    type: "Individuelle", statut: "TERMINEE", notes: "Identification des sources de stress. Plan d'action établi.", archived: false,
    formateur: u["Melvin.ESSONE@demo.fr"], apprenant: u["Matthieu.Dupont@demo.fr"],
    module: DEMO_MODULES[1], signatures: [{ id: "sig-02", role: "APPRENANT", horodatage: "2026-03-20T16:10:00Z" }],
    createdAt: "2026-03-05T00:00:00Z",
  },
  {
    id: "s-03", formateurId: "u-melvin", apprenantId: "u-matthieu", moduleId: "mod-devpers",
    dateDebut: "2026-04-07T10:00:00Z", dateFin: "2026-04-07T12:00:00Z", dureeMinutes: 120,
    type: "Individuelle", statut: "A_VENIR", notes: "Point d'avancement sur les objectifs du trimestre.", archived: false,
    formateur: u["Melvin.ESSONE@demo.fr"], apprenant: u["Matthieu.Dupont@demo.fr"],
    module: DEMO_MODULES[0], signatures: [], createdAt: "2026-03-20T00:00:00Z",
  },
  // === MELVIN — Marc Dujardin ===
  {
    id: "s-04", formateurId: "u-melvin", apprenantId: "u-marc", moduleId: "mod-devpers",
    dateDebut: "2026-03-12T09:00:00Z", dateFin: "2026-03-12T11:00:00Z", dureeMinutes: 120,
    type: "Individuelle", statut: "TERMINEE", notes: "Bilan de départ. Identification des axes d'amélioration.", archived: false,
    formateur: u["Melvin.ESSONE@demo.fr"], apprenant: u["Marc.Dujardin@demo.fr"],
    module: DEMO_MODULES[0], signatures: [{ id: "sig-04", role: "APPRENANT", horodatage: "2026-03-12T11:05:00Z" }],
    createdAt: "2026-03-06T00:00:00Z",
  },
  {
    id: "s-05", formateurId: "u-melvin", apprenantId: "u-marc", moduleId: "mod-stress",
    dateDebut: "2026-03-26T09:00:00Z", dateFin: "2026-03-26T11:00:00Z", dureeMinutes: 120,
    type: "Distanciel", statut: "TERMINEE", notes: "Techniques de respiration et gestion des urgences.", archived: false,
    formateur: u["Melvin.ESSONE@demo.fr"], apprenant: u["Marc.Dujardin@demo.fr"],
    module: DEMO_MODULES[1], signatures: [],
    createdAt: "2026-03-10T00:00:00Z",
  },
  // === MELVIN — Jean PIERRE ===
  {
    id: "s-06", formateurId: "u-melvin", apprenantId: "u-jean", moduleId: "mod-stress",
    dateDebut: "2026-03-15T14:00:00Z", dateFin: "2026-03-15T16:00:00Z", dureeMinutes: 120,
    type: "Individuelle", statut: "TERMINEE", notes: "Introduction à la pleine conscience.", archived: false,
    formateur: u["Melvin.ESSONE@demo.fr"], apprenant: u["Jean.PIERRE@demo.fr"],
    module: DEMO_MODULES[1], signatures: [{ id: "sig-06", role: "APPRENANT", horodatage: "2026-03-15T16:20:00Z" }],
    createdAt: "2026-03-08T00:00:00Z",
  },
  {
    id: "s-07", formateurId: "u-melvin", apprenantId: "u-jean", moduleId: "mod-devpers",
    dateDebut: "2026-03-31T10:00:00Z", dateFin: "2026-03-31T12:00:00Z", dureeMinutes: 120,
    type: "Individuelle", statut: "EN_COURS", notes: "Séance en cours — recadrage des priorités professionnelles.", archived: false,
    formateur: u["Melvin.ESSONE@demo.fr"], apprenant: u["Jean.PIERRE@demo.fr"],
    module: DEMO_MODULES[0], signatures: [], createdAt: "2026-03-15T00:00:00Z",
  },
  {
    id: "s-08", formateurId: "u-melvin", apprenantId: "u-jean", moduleId: "mod-devpers",
    dateDebut: "2026-04-14T14:00:00Z", dateFin: "2026-04-14T16:00:00Z", dureeMinutes: 120,
    type: "Individuelle", statut: "A_VENIR", notes: "Bilan de mi-parcours.", archived: false,
    formateur: u["Melvin.ESSONE@demo.fr"], apprenant: u["Jean.PIERRE@demo.fr"],
    module: DEMO_MODULES[0], signatures: [], createdAt: "2026-03-15T00:00:00Z",
  },
  // === MELVIN — Luc DARDMON ===
  {
    id: "s-09", formateurId: "u-melvin", apprenantId: "u-luc", moduleId: "mod-devpers",
    dateDebut: "2026-03-25T09:00:00Z", dateFin: "2026-03-25T11:00:00Z", dureeMinutes: 120,
    type: "Présentiel", statut: "TERMINEE", notes: "Travail sur la confiance en soi et la prise d'initiative.", archived: false,
    formateur: u["Melvin.ESSONE@demo.fr"], apprenant: u["Luc.DARDMON@demo.fr"],
    module: DEMO_MODULES[0], signatures: [{ id: "sig-09", role: "APPRENANT", horodatage: "2026-03-25T11:30:00Z" }],
    createdAt: "2026-03-12T00:00:00Z",
  },
  {
    id: "s-10", formateurId: "u-melvin", apprenantId: "u-luc", moduleId: "mod-stress",
    dateDebut: "2026-04-08T14:00:00Z", dateFin: "2026-04-08T16:00:00Z", dureeMinutes: 120,
    type: "Individuelle", statut: "A_VENIR", notes: "", archived: false,
    formateur: u["Melvin.ESSONE@demo.fr"], apprenant: u["Luc.DARDMON@demo.fr"],
    module: DEMO_MODULES[1], signatures: [], createdAt: "2026-03-25T00:00:00Z",
  },
  // === VINCENT — Sophie Girage ===
  {
    id: "s-11", formateurId: "u-vincent", apprenantId: "u-sophie", moduleId: "mod-leader",
    dateDebut: "2026-03-08T09:00:00Z", dateFin: "2026-03-08T11:00:00Z", dureeMinutes: 120,
    type: "Présentiel", statut: "TERMINEE", notes: "Introduction au leadership situationnel.", archived: false,
    formateur: u["Vincent.DEPAUL@demo.fr"], apprenant: u["Sophie.Girage@demo.fr"],
    module: DEMO_MODULES[2], signatures: [{ id: "sig-11", role: "APPRENANT", horodatage: "2026-03-08T11:45:00Z" }],
    createdAt: "2026-03-02T00:00:00Z",
  },
  {
    id: "s-12", formateurId: "u-vincent", apprenantId: "u-sophie", moduleId: "mod-commpro",
    dateDebut: "2026-03-22T14:00:00Z", dateFin: "2026-03-22T16:00:00Z", dureeMinutes: 120,
    type: "Individuelle", statut: "TERMINEE", notes: "Communication assertive — jeux de rôle.", archived: false,
    formateur: u["Vincent.DEPAUL@demo.fr"], apprenant: u["Sophie.Girage@demo.fr"],
    module: DEMO_MODULES[3], signatures: [],
    createdAt: "2026-03-10T00:00:00Z",
  },
  {
    id: "s-13", formateurId: "u-vincent", apprenantId: "u-sophie", moduleId: "mod-leader",
    dateDebut: "2026-04-10T10:00:00Z", dateFin: "2026-04-10T12:00:00Z", dureeMinutes: 120,
    type: "Présentiel", statut: "A_VENIR", notes: "Animation d'équipe et délégation.", archived: false,
    formateur: u["Vincent.DEPAUL@demo.fr"], apprenant: u["Sophie.Girage@demo.fr"],
    module: DEMO_MODULES[2], signatures: [], createdAt: "2026-03-22T00:00:00Z",
  },
  // === VINCENT — Marc Dujardin ===
  {
    id: "s-14", formateurId: "u-vincent", apprenantId: "u-marc", moduleId: "mod-commpro",
    dateDebut: "2026-03-18T10:00:00Z", dateFin: "2026-03-18T12:00:00Z", dureeMinutes: 120,
    type: "Distanciel", statut: "TERMINEE", notes: "Techniques de communication en visioconférence.", archived: false,
    formateur: u["Vincent.DEPAUL@demo.fr"], apprenant: u["Marc.Dujardin@demo.fr"],
    module: DEMO_MODULES[3], signatures: [{ id: "sig-14", role: "APPRENANT", horodatage: "2026-03-18T12:10:00Z" }],
    createdAt: "2026-03-10T00:00:00Z",
  },
  {
    id: "s-15", formateurId: "u-vincent", apprenantId: "u-marc", moduleId: "mod-leader",
    dateDebut: "2026-04-16T09:00:00Z", dateFin: "2026-04-16T11:00:00Z", dureeMinutes: 120,
    type: "Présentiel", statut: "A_VENIR", notes: "Prise de décision en situation complexe.", archived: false,
    formateur: u["Vincent.DEPAUL@demo.fr"], apprenant: u["Marc.Dujardin@demo.fr"],
    module: DEMO_MODULES[2], signatures: [], createdAt: "2026-03-18T00:00:00Z",
  },
];

// ─── ASSIGNATIONS MANAGER → APPRENANT ─────────────────────
export const DEMO_ASSIGNMENTS_MANAGER = [
  { id: "am-01", managerId: "u-philippe", apprenantId: "u-matthieu", manager: u["Philippe.Leroi@demo.fr"], apprenant: u["Matthieu.Dupont@demo.fr"] },
  { id: "am-02", managerId: "u-philippe", apprenantId: "u-marc", manager: u["Philippe.Leroi@demo.fr"], apprenant: u["Marc.Dujardin@demo.fr"] },
  { id: "am-03", managerId: "u-jacques", apprenantId: "u-jean", manager: u["Jacques.CHIRAC@demo.fr"], apprenant: u["Jean.PIERRE@demo.fr"] },
  { id: "am-04", managerId: "u-jacques", apprenantId: "u-luc", manager: u["Jacques.CHIRAC@demo.fr"], apprenant: u["Luc.DARDMON@demo.fr"] },
  { id: "am-05", managerId: "u-marie", apprenantId: "u-sophie", manager: u["Marie.CLAIRE@demo.fr"], apprenant: u["Sophie.Girage@demo.fr"] },
  { id: "am-06", managerId: "u-marie", apprenantId: "u-marc", manager: u["Marie.CLAIRE@demo.fr"], apprenant: u["Marc.Dujardin@demo.fr"] },
  { id: "am-07", managerId: "u-julie", apprenantId: "u-matthieu", manager: u["Julie.LESCAUT@demo.fr"], apprenant: u["Matthieu.Dupont@demo.fr"] },
  { id: "am-08", managerId: "u-julie", apprenantId: "u-sophie", manager: u["Julie.LESCAUT@demo.fr"], apprenant: u["Sophie.Girage@demo.fr"] },
];

// ─── ASSIGNATIONS RESPONSABLE → FORMATEUR ─────────────────
export const DEMO_ASSIGNMENTS_CENTRE = [
  { id: "ac-01", responsableId: "u-marthe", formateurId: "u-melvin", responsable: u["Marthe.EAU@demo.fr"], formateur: u["Melvin.ESSONE@demo.fr"] },
  { id: "ac-02", responsableId: "u-marthe", formateurId: "u-vincent", responsable: u["Marthe.EAU@demo.fr"], formateur: u["Vincent.DEPAUL@demo.fr"] },
];

// ─── RAPPORTS HORAIRES ────────────────────────────────────
export const DEMO_RAPPORTS = [
  {
    id: "rap-01", managerId: "u-philippe", apprenantId: "u-matthieu",
    periodeDebut: "2026-03-01T00:00:00Z", periodeFin: "2026-03-31T23:59:59Z",
    statut: "EN_ATTENTE", pdfUrl: null, createdAt: "2026-04-01T08:00:00Z",
    manager: u["Philippe.Leroi@demo.fr"], apprenant: u["Matthieu.Dupont@demo.fr"],
    signature: null,
  },
  {
    id: "rap-02", managerId: "u-philippe", apprenantId: "u-marc",
    periodeDebut: "2026-03-01T00:00:00Z", periodeFin: "2026-03-31T23:59:59Z",
    statut: "EN_ATTENTE", pdfUrl: null, createdAt: "2026-04-01T08:00:00Z",
    manager: u["Philippe.Leroi@demo.fr"], apprenant: u["Marc.Dujardin@demo.fr"],
    signature: null,
  },
  {
    id: "rap-03", managerId: "u-philippe", apprenantId: "u-matthieu",
    periodeDebut: "2026-02-01T00:00:00Z", periodeFin: "2026-02-28T23:59:59Z",
    statut: "SIGNE", pdfUrl: "#", createdAt: "2026-03-01T08:00:00Z",
    manager: u["Philippe.Leroi@demo.fr"], apprenant: u["Matthieu.Dupont@demo.fr"],
    signature: { id: "sr-01", horodatage: "2026-03-02T10:30:00Z", managerId: "u-philippe" },
  },
  {
    id: "rap-04", managerId: "u-jacques", apprenantId: "u-jean",
    periodeDebut: "2026-03-01T00:00:00Z", periodeFin: "2026-03-31T23:59:59Z",
    statut: "EN_ATTENTE", pdfUrl: null, createdAt: "2026-04-01T08:00:00Z",
    manager: u["Jacques.CHIRAC@demo.fr"], apprenant: u["Jean.PIERRE@demo.fr"],
    signature: null,
  },
  {
    id: "rap-05", managerId: "u-marie", apprenantId: "u-sophie",
    periodeDebut: "2026-03-01T00:00:00Z", periodeFin: "2026-03-31T23:59:59Z",
    statut: "EN_ATTENTE", pdfUrl: null, createdAt: "2026-04-01T08:00:00Z",
    manager: u["Marie.CLAIRE@demo.fr"], apprenant: u["Sophie.Girage@demo.fr"],
    signature: null,
  },
];

// ─── NOTIFICATIONS ────────────────────────────────────────
export const DEMO_NOTIFICATIONS: Record<string, DemoNotif[]> = {
  "u-melvin": [
    { id: "n-01", type: "SESSION_SIGNEE", message: "Matthieu Dupont a signé la session du 10/03/2026.", lu: false, createdAt: "2026-03-10T11:15:00Z" },
    { id: "n-02", type: "SESSION_SIGNEE", message: "Matthieu Dupont a signé la session du 20/03/2026.", lu: false, createdAt: "2026-03-20T16:10:00Z" },
    { id: "n-03", type: "SESSION_SIGNEE", message: "Marc Dujardin a signé la session du 12/03/2026.", lu: true, createdAt: "2026-03-12T11:05:00Z" },
    { id: "n-04", type: "SESSION_SIGNEE", message: "Jean PIERRE a signé la session du 15/03/2026.", lu: true, createdAt: "2026-03-15T16:20:00Z" },
    { id: "n-05", type: "SESSION_SIGNEE", message: "Luc DARDMON a signé la session du 25/03/2026.", lu: false, createdAt: "2026-03-25T11:30:00Z" },
    { id: "n-06", type: "RAPPEL", message: "Marc Dujardin n'a pas encore signé la session du 26/03/2026.", lu: false, createdAt: "2026-03-28T09:00:00Z" },
  ],
  "u-vincent": [
    { id: "n-11", type: "SESSION_SIGNEE", message: "Sophie Girage a signé la session du 08/03/2026.", lu: false, createdAt: "2026-03-08T11:45:00Z" },
    { id: "n-12", type: "SESSION_SIGNEE", message: "Marc Dujardin a signé la session du 18/03/2026.", lu: true, createdAt: "2026-03-18T12:10:00Z" },
    { id: "n-13", type: "RAPPEL", message: "Sophie Girage n'a pas encore signé la session du 22/03/2026.", lu: false, createdAt: "2026-03-24T09:00:00Z" },
  ],
  "u-matthieu": [
    { id: "n-21", type: "SESSION_CREEE", message: "Nouvelle session planifiée : Développement Personnel le 07/04/2026 à 10h00.", lu: false, createdAt: "2026-03-20T09:00:00Z" },
    { id: "n-22", type: "RAPPEL_SIGNATURE", message: "Rappel : veuillez signer la session du 20/03/2026 — Gestion du Stress.", lu: false, createdAt: "2026-03-21T09:00:00Z" },
  ],
  "u-marc": [
    { id: "n-31", type: "RAPPEL_SIGNATURE", message: "Rappel : veuillez signer la session du 26/03/2026 — Gestion du Stress.", lu: false, createdAt: "2026-03-27T09:00:00Z" },
    { id: "n-32", type: "SESSION_CREEE", message: "Nouvelle session planifiée : Leadership & Management le 16/04/2026 à 09h00.", lu: false, createdAt: "2026-03-18T13:00:00Z" },
  ],
  "u-jean": [
    { id: "n-41", type: "SESSION_EN_COURS", message: "Votre session Développement Personnel a démarré — 31/03/2026 10h00.", lu: false, createdAt: "2026-03-31T10:00:00Z" },
    { id: "n-42", type: "SESSION_CREEE", message: "Nouvelle session planifiée : Développement Personnel le 14/04/2026 à 14h00.", lu: false, createdAt: "2026-03-15T17:00:00Z" },
  ],
  "u-luc": [
    { id: "n-51", type: "SESSION_CREEE", message: "Nouvelle session planifiée : Gestion du Stress le 08/04/2026 à 14h00.", lu: false, createdAt: "2026-03-25T12:00:00Z" },
  ],
  "u-sophie": [
    { id: "n-61", type: "RAPPEL_SIGNATURE", message: "Rappel : veuillez signer la session du 22/03/2026 — Communication Professionnelle.", lu: false, createdAt: "2026-03-23T09:00:00Z" },
    { id: "n-62", type: "SESSION_CREEE", message: "Nouvelle session planifiée : Leadership & Management le 10/04/2026 à 10h00.", lu: false, createdAt: "2026-03-22T16:00:00Z" },
  ],
  "u-philippe": [
    { id: "n-71", type: "RAPPORT_PRET", message: "Rapport horaire de Matthieu Dupont — Mars 2026 — prêt à signer.", lu: false, createdAt: "2026-04-01T08:00:00Z" },
    { id: "n-72", type: "RAPPORT_PRET", message: "Rapport horaire de Marc Dujardin — Mars 2026 — prêt à signer.", lu: false, createdAt: "2026-04-01T08:00:00Z" },
  ],
  "u-jacques": [
    { id: "n-81", type: "RAPPORT_PRET", message: "Rapport horaire de Jean PIERRE — Mars 2026 — prêt à signer.", lu: false, createdAt: "2026-04-01T08:00:00Z" },
  ],
  "u-marie": [
    { id: "n-91", type: "RAPPORT_PRET", message: "Rapport horaire de Sophie Girage — Mars 2026 — prêt à signer.", lu: false, createdAt: "2026-04-01T08:00:00Z" },
  ],
  "u-julie": [
    { id: "n-101", type: "RAPPORT_PRET", message: "Rapport horaire de Matthieu Dupont — Mars 2026 — prêt à signer.", lu: false, createdAt: "2026-04-01T08:00:00Z" },
  ],
  "u-marthe": [
    { id: "n-111", type: "INACTIVITE", message: "Aucune session enregistrée pour Vincent DE PAUL depuis 8 jours.", lu: false, createdAt: "2026-03-30T09:00:00Z" },
  ],
};

type DemoNotif = { id: string; type: string; message: string; lu: boolean; createdAt: string };

// ─── HELPERS ──────────────────────────────────────────────

/** Retourne les sessions filtrées pour un formateur */
export function getSessionsForFormateur(formateurId: string, params?: Record<string, string>) {
  let sessions = DEMO_SESSIONS.filter(s => s.formateurId === formateurId);
  if (params?.statut) sessions = sessions.filter(s => s.statut === params.statut);
  if (params?.moduleId) sessions = sessions.filter(s => s.moduleId === params.moduleId);
  if (params?.apprenantId) sessions = sessions.filter(s => s.apprenantId === params.apprenantId);
  return sessions;
}

/** Retourne les sessions pour un apprenant */
export function getSessionsForApprenant(apprenantId: string, params?: Record<string, string>) {
  let sessions = DEMO_SESSIONS.filter(s => s.apprenantId === apprenantId);
  if (params?.statut) sessions = sessions.filter(s => s.statut === params.statut);
  return sessions;
}

/** Retourne les sessions pour les apprenants d'un manager */
export function getSessionsForManager(managerId: string) {
  const apprenantIds = DEMO_ASSIGNMENTS_MANAGER
    .filter(a => a.managerId === managerId)
    .map(a => a.apprenantId);
  return DEMO_SESSIONS.filter(s => apprenantIds.includes(s.apprenantId));
}

/** Retourne les modules d'un formateur */
export function getModulesForFormateur(formateurId: string) {
  return DEMO_MODULES.filter(m => m.formateurId === formateurId);
}

/** Stats dashboard Formateur */
export function getDashboardFormateur(formateurId: string) {
  const sessions = getSessionsForFormateur(formateurId);
  const terminees = sessions.filter(s => s.statut === "TERMINEE");
  const aVenir = sessions.filter(s => s.statut === "A_VENIR");
  const enCours = sessions.filter(s => s.statut === "EN_COURS");
  const apprenantIds = [...new Set(sessions.map(s => s.apprenantId))];
  const heuresTotal = terminees.reduce((sum, s) => sum + s.dureeMinutes, 0) / 60;
  const sessionsSansSignature = terminees.filter(s => s.signatures.length === 0);
  return {
    totalSessions: sessions.length, sessionsTerminees: terminees.length,
    sessionsAVenir: aVenir.length, sessionsEnCours: enCours.length,
    nbApprenants: apprenantIds.length, heuresTotal,
    sessionsSansSignature: sessionsSansSignature.length,
    recentSessions: sessions.slice(0, 5),
  };
}

/** Stats dashboard Manager */
export function getDashboardManager(managerId: string) {
  const assignments = DEMO_ASSIGNMENTS_MANAGER.filter(a => a.managerId === managerId);
  return assignments.map(a => {
    const sessions = DEMO_SESSIONS.filter(s => s.apprenantId === a.apprenantId);
    const terminees = sessions.filter(s => s.statut === "TERMINEE");
    const aVenir = sessions.filter(s => s.statut === "A_VENIR");
    const heures = terminees.reduce((sum, s) => sum + s.dureeMinutes, 0) / 60;
    const signees = terminees.filter(s => s.signatures.length > 0).length;
    const entreprise = DEMO_ENTREPRISES.find(e => e.id === a.apprenant.entrepriseId);
    return {
      apprenant: a.apprenant, sessionsTotal: terminees.length, heuresTotal: heures,
      sessionsAVenir: aVenir.length, sessionSignees: signees,
      sessionNonSignees: terminees.length - signees,
      dernierContact: terminees[terminees.length - 1]?.dateFin || null,
      entreprise: entreprise?.nom || "—",
    };
  });
}

/** Stats dashboard Responsable Centre */
export function getDashboardResponsable(responsableId: string) {
  const assignments = DEMO_ASSIGNMENTS_CENTRE.filter(a => a.responsableId === responsableId);
  const now = new Date("2026-03-31T12:00:00Z");
  const startWeek = new Date("2026-03-28T00:00:00Z");
  const startMonth = new Date("2026-03-01T00:00:00Z");
  const startTrimestre = new Date("2026-01-01T00:00:00Z");

  return assignments.map(a => {
    const sessions = DEMO_SESSIONS.filter(s => s.formateurId === a.formateurId && s.statut !== "A_VENIR");
    const apprenantIds = [...new Set(sessions.map(s => s.apprenantId))];
    const profil = DEMO_FORMATEUR_PROFILS.find(p => p.userId === a.formateurId);
    const hWeek = sessions.filter(s => new Date(s.dateDebut) >= startWeek).reduce((sum, s) => sum + s.dureeMinutes, 0) / 60;
    const hMonth = sessions.filter(s => new Date(s.dateDebut) >= startMonth).reduce((sum, s) => sum + s.dureeMinutes, 0) / 60;
    const hTrimestre = sessions.filter(s => new Date(s.dateDebut) >= startTrimestre).reduce((sum, s) => sum + s.dureeMinutes, 0) / 60;
    const futuresSessions = DEMO_SESSIONS.filter(s => s.formateurId === a.formateurId && s.statut === "A_VENIR");
    return {
      formateur: a.formateur, profil,
      nbApprenants: apprenantIds.length,
      heuresWeek: hWeek, heuresMonth: hMonth, heuresTrimestre: hTrimestre,
      sessionsRealisees: sessions.length, sessionsPlanifiees: futuresSessions.length,
    };
  });
}
