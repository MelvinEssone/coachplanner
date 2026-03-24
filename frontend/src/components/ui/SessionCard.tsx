import { Session } from "@/types";
import { formatDate, formatDuration, getInitials } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { Clock, Calendar, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SessionCardProps {
  session: Session;
  showActions?: boolean;
  currentUserId?: string;
  className?: string;
}

export function SessionCard({ session, showActions, currentUserId, className }: SessionCardProps) {
  const isSigned = session.signatures?.some((s) => s.userId === currentUserId) || false;

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-sm">
            {session.module?.nom || "Module"}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {session.type || "Individuelle"}
          </p>
        </div>
        <StatusBadge status={session.statut} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar size={12} />
          <span>{formatDate(session.dateDebut, "EEE dd MMM yyyy à HH:mm")}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock size={12} />
          <span>{formatDuration(session.dureeMinutes)}</span>
        </div>
        {session.apprenant && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <User size={12} />
            <span>
              {session.apprenant.prenom} {session.apprenant.nom}
            </span>
          </div>
        )}
        {session.formateur && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-[8px] font-bold">
                {getInitials(session.formateur.nom, session.formateur.prenom)}
              </span>
            </div>
            <span>
              {session.formateur.prenom} {session.formateur.nom}
            </span>
          </div>
        )}
      </div>

      {showActions && session.statut !== "TERMINEE" && !isSigned && currentUserId && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <Link
            href={`/apprenant/signature/${session.id}`}
            className="w-full block text-center bg-blue-600 text-white text-xs py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Signer la session
          </Link>
        </div>
      )}

      {isSigned && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Session signée
          </span>
        </div>
      )}
    </div>
  );
}
