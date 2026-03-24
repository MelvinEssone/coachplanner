export type Role = 'FORMATEUR' | 'APPRENANT' | 'MANAGER_RH' | 'RESPONSABLE_CENTRE';
export type SessionStatut = 'A_VENIR' | 'EN_COURS' | 'TERMINEE';
export type RapportStatut = 'EN_ATTENTE' | 'SIGNE' | 'ARCHIVE';
export type FrequenceRapport = 'HEBDOMADAIRE' | 'MENSUELLE' | 'MANUELLE';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  avatar?: string | null;
  emailVerified: boolean;
  createdAt: string;
  entrepriseId?: string | null;
  entreprise?: Entreprise | null;
  formateurProfil?: FormateurProfil | null;
  managerSettings?: ManagerSettings | null;
}

export interface Entreprise {
  id: string;
  nom: string;
  type: string;
  adresse?: string | null;
  siret?: string | null;
  createdAt: string;
}

export interface FormateurProfil {
  id: string;
  userId: string;
  matieres: string[];
  statut: string;
  dateEntree?: string | null;
  telephone?: string | null;
}

export interface ManagerSettings {
  id: string;
  managerId: string;
  frequenceRapport: FrequenceRapport;
}

export interface Module {
  id: string;
  nom: string;
  description?: string | null;
  formateurId: string;
  formateur?: { id: string; nom: string; prenom: string };
  createdAt: string;
  _count?: { sessions: number };
}

export interface Session {
  id: string;
  formateurId: string;
  apprenantId: string;
  moduleId: string;
  dateDebut: string;
  dateFin: string;
  dureeMinutes: number;
  type?: string | null;
  statut: SessionStatut;
  notes?: string | null;
  archived: boolean;
  createdAt: string;
  formateur?: { id: string; nom: string; prenom: string; email: string; avatar?: string | null };
  apprenant?: { id: string; nom: string; prenom: string; email: string; avatar?: string | null };
  module?: { id: string; nom: string };
  signatures?: SessionSignature[];
}

export interface SessionSignature {
  id: string;
  sessionId: string;
  userId: string;
  signatureData: string;
  horodatage: string;
  ipAddress?: string | null;
  user?: { id: string; nom: string; prenom: string; role: Role };
}

export interface Notification {
  id: string;
  destinataireId: string;
  type: string;
  message: string;
  lu: boolean;
  createdAt: string;
}

export interface RapportHoraire {
  id: string;
  managerId: string;
  apprenantId: string;
  periodeDebut: string;
  periodeFin: string;
  statut: RapportStatut;
  pdfUrl?: string | null;
  createdAt: string;
  manager?: { id: string; nom: string; prenom: string };
  apprenant?: { id: string; nom: string; prenom: string; email: string };
  signature?: SignatureRapport | null;
}

export interface SignatureRapport {
  id: string;
  rapportId: string;
  managerId: string;
  signatureData: string;
  horodatage: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
