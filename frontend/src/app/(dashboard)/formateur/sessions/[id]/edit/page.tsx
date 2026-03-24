"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { sessionsApi, modulesApi, usersApi } from "@/lib/api";
import { Session, Module, User } from "@/types";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function EditSessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [apprenants, setApprenants] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    apprenantId: "",
    moduleId: "",
    dateDebut: "",
    dateFin: "",
    type: "",
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [sessionRes, modulesRes, apprenantsRes] = await Promise.all([
          sessionsApi.getById(sessionId),
          modulesApi.getAll(),
          usersApi.getAll({ role: "APPRENANT" }),
        ]);

        const s: Session = sessionRes.data.data;
        setSession(s);
        setModules(modulesRes.data.data);
        setApprenants(apprenantsRes.data.data);

        setFormData({
          apprenantId: s.apprenantId,
          moduleId: s.moduleId,
          dateDebut: new Date(s.dateDebut).toISOString().slice(0, 16),
          dateFin: new Date(s.dateFin).toISOString().slice(0, 16),
          type: s.type || "",
          notes: s.notes || "",
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.dateDebut || !formData.dateFin) {
      setError("Veuillez renseigner les dates et heures.");
      return;
    }
    if (new Date(formData.dateFin) <= new Date(formData.dateDebut)) {
      setError("L'heure de fin doit être après l'heure de début.");
      return;
    }

    try {
      setIsSaving(true);
      await sessionsApi.update(sessionId, {
        dateDebut: new Date(formData.dateDebut).toISOString(),
        dateFin: new Date(formData.dateFin).toISOString(),
        type: formData.type || undefined,
        notes: formData.notes || undefined,
      });
      router.push("/formateur/sessions");
    } catch (e: any) {
      setError(e.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const apprenant = apprenants.find((a) => a.id === formData.apprenantId);
  const module = modules.find((m) => m.id === formData.moduleId);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/formateur/sessions"
          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modifier la session</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {module?.nom} — {apprenant?.prenom} {apprenant?.nom}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Apprenant
              </label>
              <div className="border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 text-sm text-gray-500">
                {apprenant?.prenom} {apprenant?.nom}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Module
              </label>
              <div className="border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 text-sm text-gray-500">
                {module?.nom}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date et heure de début <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.dateDebut}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date et heure de fin <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Type de session
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un type</option>
              <option value="individuelle">Individuelle</option>
              <option value="groupe">Groupe</option>
              <option value="presentiel">Présentiel</option>
              <option value="distanciel">Distanciel</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes / Objectifs
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Objectifs, remarques..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/formateur/sessions"
              className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition text-center"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={15} />
              )}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
