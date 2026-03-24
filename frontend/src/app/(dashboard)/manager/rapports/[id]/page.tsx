"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { rapportsApi, signaturesApi } from "@/lib/api";
import { RapportHoraire } from "@/types";
import { SignatureCanvas } from "@/components/ui/SignatureCanvas";
import { formatDuration } from "@/lib/utils";
import { ArrowLeft, Shield, FileText, PenLine } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function RapportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rapportId = params.id as string;

  const [rapport, setRapport] = useState<RapportHoraire | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureData, setSignatureData] = useState("");
  const [useCheckbox, setUseCheckbox] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    rapportsApi.getById(rapportId)
      .then((r) => setRapport(r.data.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [rapportId]);

  const handleSign = async () => {
    setError("");
    if (useCheckbox && !consent) {
      setError("Veuillez cocher la case pour confirmer.");
      return;
    }
    if (!useCheckbox && !signatureData) {
      setError("Veuillez apposer votre signature.");
      return;
    }
    try {
      setIsSigning(true);
      const data = useCheckbox ? `CONSENT:${new Date().toISOString()}` : signatureData;
      await signaturesApi.signRapport(rapportId, data);
      setSuccess(true);
      setTimeout(() => router.push("/manager/rapports"), 2000);
    } catch (e: any) {
      setError(e.response?.data?.message || "Erreur lors de la signature.");
    } finally {
      setIsSigning(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  if (!rapport) {
    return <div className="text-center py-16 text-gray-500">Rapport introuvable.</div>;
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Rapport signé !</h2>
        <p className="text-gray-500 text-sm">Redirection en cours...</p>
      </div>
    );
  }

  const isSigned = rapport.statut === "SIGNE" || rapport.statut === "ARCHIVE";

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/manager/rapports" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapport horaire</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {rapport.apprenant?.prenom} {rapport.apprenant?.nom}
          </p>
        </div>
      </div>

      {/* Rapport details */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <FileText size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {rapport.apprenant?.prenom} {rapport.apprenant?.nom}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              Période : {format(new Date(rapport.periodeDebut), "d MMM", { locale: fr })} –{" "}
              {format(new Date(rapport.periodeFin), "d MMM yyyy", { locale: fr })}
            </p>
          </div>
          <div className="ml-auto">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              isSigned ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
            }`}>
              {isSigned ? "Signé" : "En attente"}
            </span>
          </div>
        </div>

        {isSigned && rapport.signature && (
          <div className="border border-green-200 bg-green-50 rounded-xl p-4">
            <p className="text-sm font-medium text-green-800 flex items-center gap-2">
              <Shield size={16} />
              Rapport signé le{" "}
              {format(new Date(rapport.signature.horodatage), "d MMMM yyyy à HH:mm", { locale: fr })}
            </p>
          </div>
        )}
      </div>

      {/* Signature section */}
      {!isSigned && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <PenLine size={18} className="text-blue-600" />
              Signer le rapport
            </h3>
            <button
              onClick={() => setUseCheckbox(!useCheckbox)}
              className="text-xs text-blue-600 hover:underline"
            >
              {useCheckbox ? "Utiliser le canvas" : "Utiliser une case à cocher"}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
          )}

          {!useCheckbox ? (
            <div className="mb-5">
              <SignatureCanvas onSave={setSignatureData} />
            </div>
          ) : (
            <div className="mb-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">
                  Je certifie l'exactitude de ce rapport horaire pour la période du{" "}
                  <strong>{format(new Date(rapport.periodeDebut), "d MMMM yyyy", { locale: fr })}</strong>{" "}
                  au{" "}
                  <strong>{format(new Date(rapport.periodeFin), "d MMMM yyyy", { locale: fr })}</strong>.
                </span>
              </label>
            </div>
          )}

          <div className="bg-blue-50 rounded-lg p-3 mb-5 text-xs text-blue-700 flex items-start gap-2">
            <Shield size={14} className="mt-0.5 flex-shrink-0" />
            <span>Cette signature sera horodatée et archivée conformément au règlement eIDAS.</span>
          </div>

          <button
            onClick={handleSign}
            disabled={isSigning}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSigning ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <PenLine size={16} />}
            Signer le rapport
          </button>
        </div>
      )}
    </div>
  );
}
