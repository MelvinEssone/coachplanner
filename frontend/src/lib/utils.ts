import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, formatStr = "dd/MM/yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr, { locale: fr });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy à HH:mm", { locale: fr });
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: fr });
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h${mins.toString().padStart(2, "0")}`;
}

export function getInitials(nom: string, prenom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    FORMATEUR: "Formateur",
    APPRENANT: "Apprenant",
    MANAGER_RH: "Manager / RH",
    RESPONSABLE_CENTRE: "Responsable Centre",
  };
  return labels[role] || role;
}

export function getStatutLabel(statut: string): string {
  const labels: Record<string, string> = {
    A_VENIR: "À venir",
    EN_COURS: "En cours",
    TERMINEE: "Terminée",
    EN_ATTENTE: "En attente",
    SIGNE: "Signé",
    ARCHIVE: "Archivé",
  };
  return labels[statut] || statut;
}

export function getFrequenceLabel(freq: string): string {
  const labels: Record<string, string> = {
    HEBDOMADAIRE: "Hebdomadaire",
    MENSUELLE: "Mensuelle",
    MANUELLE: "Manuelle",
  };
  return labels[freq] || freq;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
