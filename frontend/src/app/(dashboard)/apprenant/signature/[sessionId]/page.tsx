"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { sessionsApi, signaturesApi } from "@/lib/api";
import { Session } from "@/types";
import { SignatureCanvas } from "@/components/ui/SignatureCanvas";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatDuration } from "@/lib/utils";
import { ArrowLeft, PenLine, Shield } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function SignatureSessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState("");
  const [signatureData, setSignatureData] = useState<string>("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [useCheckbox, setUseCheckbox] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const r = await sessionsApi.getById(sessionId);
        setSession(r.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const handleSign = async () => {
    setError("");

    if (useCheckbox && !consentChecked) {
      setError("Veuillez cocher la case pour confirmer votre participation.");
      return;
    }
    if (!useCheckbox && !signatureData) {
      setError("Veuillez apposer votre signature.");
      return;
    }

    try {
      setIsSigning(true);
      const data = useCheckbox
        ? `CONSENT:${new Date().toISOString()}`
        : signatureData;

      await signaturesApi.signSession(sessionId, data);
      setSuccess(true);
      setTimeout(() => router.push("/apprenant/agenda"), 2500);
    } catch (e: any) {
      setError(e.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setIsSigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Session introuvable.</p>
        <Link href="/apprenant/agenda" className="text-blue-600 text-sm mt-2 block hover:underline">
          Retour à l'agenda
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Session attestée !</h2>
        <p className="text-gray-500 text-sm">
          Votre signature a été enregistrée avec succès. Redirection en cours...
        </p>
      </div>
    );
  }

  const alreadySigned = session.signatures && session.signatures.length > 0;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/apprenant/agenda" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Signature de session</h1>
          <p className="text-sm text-gray-500 mt-0.5">Attestation de présence</p>
        </div>
      </div>

      {/* Session info */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">{session.module?.nom}</h2>
          <StatusBadge status={session.statut} />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Formateur</p>
            <p className="font-medium text-gray-700">
              {session.formateur?.prenom} {session.formateur?.nom}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Durée</p>
            <p className="font-medium text-gray-700">{formatDuration(session.dureeMinutes)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Date</p>
            <p className="font-medium text-gray-700 capitalize">
              {format(new Date(session.dateDebut), "EEEE d MMMM yyyy", { locale: fr })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Horaire</p>
            <p className="font-medium text-gray-700">
              {format(new Date(session.dateDebut), "HH:mm")} – {format(new Date(session.dateFin), "HH:mm")}
            </p>
          </div>
        </div>
      </div>

      {alreadySigned ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <Shield size={28} className="mx-auto text-green-600 mb-2" />
          <p className="font-semibold text-green-800">Session déjà signée</p>
          <p className="text-sm text-green-600 mt-1">
            Vous avez déjà attesté votre participation à cette session.
          </p>
        </div>
      ) : session.statut !== "TERMINEE" ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center">
          <p className="font-semibold text-yellow-800">Session non terminée</p>
          <p className="text-sm text-yellow-600 mt-1">
            La signature sera disponible une fois la session terminée.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <PenLine size={18} className="text-blue-600" />
              Apposez votre signature
            </h3>
            <button
              onClick={() => setUseCheckbox(!useCheckbox)}
              className="text-xs text-blue-600 hover:underline"
            >
              {useCheckbox ? "Utiliser le canvas" : "Utiliser une case à cocher"}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {!useCheckbox ? (
            <div className="mb-5">
              <SignatureCanvas
                onSave={setSignatureData}
              />
            </div>
          ) : (
            <div className="mb-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Je certifie avoir participé à cette session de coaching du{" "}
                  <strong>
                    {format(new Date(session.dateDebut), "d MMMM yyyy", { locale: fr })}
                  </strong>{" "}
                  animée par{" "}
                  <strong>
                    {session.formateur?.prenom} {session.formateur?.nom}
                  </strong>
                  . Cette attestation est irrevocable et conforme au règlement eIDAS.
                </span>
              </label>
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-3 mb-5 text-xs text-blue-700 flex items-start gap-2">
            <Shield size={14} className="mt-0.5 flex-shrink-0" />
            <span>
              Votre signature sera horodatée (date, heure, adresse IP) et archivée conformément
              au règlement eIDAS. Elle est irrevocable une fois apposée.
            </span>
          </div>

          <button
            onClick={handleSign}
            disabled={isSigning}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSigning ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <PenLine size={16} />
            )}
            Valider ma participation
          </button>
        </div>
      )}
    </div>
  );
}
