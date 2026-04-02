"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { DEMO_SESSIONS, DEMO_MODULES, DEMO_USERS_MAP } from "@/lib/mockData";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import {
  Calendar, Users, Clock, TrendingUp, Plus,
  CheckCircle2, AlertCircle, ArrowRight, BookOpen,
  BarChart2, Activity,
} from "lucide-react";

const TODAY = new Date("2026-03-31T11:00:00Z");

function StatCard({
  label, value, sub, icon: Icon, color,
}: { label: string; value: string | number; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function FormateurDashboardPage() {
  const { user } = useAuth();

  // Determine which formateur id to use
  const formateurId = useMemo(() => {
    if (!user) return null;
    // map demo users by email
    const found = Object.values(DEMO_USERS_MAP).find(
      (u) => u.email.toLowerCase() === user.email.toLowerCase()
    );
    return found?.id ?? user.id;
  }, [user]);

  const mySessions = useMemo(
    () => DEMO_SESSIONS.filter((s) => s.formateurId === formateurId),
    [formateurId]
  );

  // ── Stats ────────────────────────────────────────────────
  const totalSessions   = mySessions.length;
  const terminees       = mySessions.filter((s) => s.statut === "TERMINEE");
  const aVenir          = mySessions.filter((s) => s.statut === "A_VENIR");
  const enCours         = mySessions.filter((s) => s.statut === "EN_COURS");
  const totalHeures     = Math.round(mySessions.reduce((acc, s) => acc + s.dureeMinutes, 0) / 60);
  const heuresMois      = Math.round(
    mySessions
      .filter((s) => {
        const d = new Date(s.dateDebut);
        return d.getMonth() === TODAY.getMonth() && d.getFullYear() === TODAY.getFullYear();
      })
      .reduce((acc, s) => acc + s.dureeMinutes, 0) / 60
  );

  // Apprenants uniques
  const uniqueApprenants = [...new Set(mySessions.map((s) => s.apprenantId))].length;

  // Sessions non signées (terminées sans signature apprenant)
  const nonSignees = terminees.filter((s) => s.signatures.length === 0);

  // Prochaines sessions (à venir, triées par date)
  const prochaines = [...aVenir]
    .sort((a, b) => new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime())
    .slice(0, 4);

  // Sessions récentes terminées
  const recentes = [...terminees]
    .sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime())
    .slice(0, 5);

  // Heures par module
  const heuresParModule = DEMO_MODULES
    .filter((m) => m.formateurId === formateurId)
    .map((m) => {
      const sessionsMod = mySessions.filter((s) => s.moduleId === m.id);
      const heures = Math.round(sessionsMod.reduce((acc, s) => acc + s.dureeMinutes, 0) / 60);
      const pct = totalHeures > 0 ? Math.round((heures / totalHeures) * 100) : 0;
      return { ...m, heures, pct, count: sessionsMod.length };
    })
    .sort((a, b) => b.heures - a.heures);

  const moduleColors: Record<string, string> = {
    "mod-devpers": "bg-blue-500",
    "mod-stress":  "bg-green-500",
    "mod-leader":  "bg-purple-500",
    "mod-commpro": "bg-orange-500",
  };
  const moduleDot: Record<string, string> = {
    "mod-devpers": "bg-blue-500",
    "mod-stress":  "bg-green-500",
    "mod-leader":  "bg-purple-500",
    "mod-commpro": "bg-orange-500",
  };
  const moduleBg: Record<string, string> = {
    "mod-devpers": "bg-blue-50 text-blue-700",
    "mod-stress":  "bg-green-50 text-green-700",
    "mod-leader":  "bg-purple-50 text-purple-700",
    "mod-commpro": "bg-orange-50 text-orange-700",
  };
  const moduleBorder: Record<string, string> = {
    "mod-devpers": "border-blue-200",
    "mod-stress":  "border-green-200",
    "mod-leader":  "border-purple-200",
    "mod-commpro": "border-orange-200",
  };

  // Max heures par apprenant (pour normaliser les jauges)
  const maxHeuresApprenant = Math.max(
    ...([...new Set(mySessions.map((s) => s.apprenantId))].map((id) =>
      Math.round(mySessions.filter((s) => s.apprenantId === id).reduce((acc, s) => acc + s.dureeMinutes, 0) / 60)
    )),
    1
  );

  // Répartition apprenants avec détail par module
  const apprenantStats = [...new Set(mySessions.map((s) => s.apprenantId))].map((id) => {
    const sessions = mySessions.filter((s) => s.apprenantId === id);
    const apprenant = sessions[0]?.apprenant;
    const heuresTotal = Math.round(sessions.reduce((acc, s) => acc + s.dureeMinutes, 0) / 60);
    const signees = sessions.filter((s) => s.statut === "TERMINEE" && s.signatures.length > 0).length;
    const termTotal = sessions.filter((s) => s.statut === "TERMINEE").length;
    const nbAVenir   = sessions.filter((s) => s.statut === "A_VENIR").length;
    const nbEnCours  = sessions.filter((s) => s.statut === "EN_COURS").length;
    const nbTerminee = sessions.filter((s) => s.statut === "TERMINEE").length;
    const nbTotal    = sessions.length;

    // Heures par module pour cet apprenant
    const parModule = DEMO_MODULES
      .filter((m) => m.formateurId === formateurId)
      .map((m) => {
        const mins = sessions.filter((s) => s.moduleId === m.id).reduce((acc, s) => acc + s.dureeMinutes, 0);
        const heures = Math.round(mins / 60);
        const pct = heuresTotal > 0 ? Math.round((heures / heuresTotal) * 100) : 0;
        return { moduleId: m.id, nom: m.nom, heures, pct };
      })
      .filter((m) => m.heures > 0);

    return { id, apprenant, heuresTotal, sessions: sessions.length, signees, termTotal, parModule, nbAVenir, nbEnCours, nbTerminee, nbTotal };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.prenom} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Voici un aperçu de votre activité de coaching
          </p>
        </div>
        <Link
          href="/formateur/sessions/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={16} />
          Nouvelle session
        </Link>
      </div>

      {/* Alertes */}
      {enCours.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <Activity size={18} className="text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800 font-medium">
            {enCours.length} session{enCours.length > 1 ? "s" : ""} en cours actuellement
          </p>
          <Link href="/formateur/sessions" className="ml-auto text-xs text-yellow-700 underline">Voir →</Link>
        </div>
      )}
      {nonSignees.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            {nonSignees.length} session{nonSignees.length > 1 ? "s terminées non signées" : " terminée non signée"} — relance automatique envoyée
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Sessions totales"    value={totalSessions} sub={`${terminees.length} terminées`}      icon={Calendar}   color="bg-blue-500" />
        <StatCard label="Apprenants actifs"   value={uniqueApprenants}  sub="en suivi ce trimestre"            icon={Users}      color="bg-indigo-500" />
        <StatCard label="Heures ce mois"      value={`${heuresMois}h`}  sub={`${totalHeures}h au total`}      icon={Clock}      color="bg-green-500" />
        <StatCard label="Taux de signature"   value={`${terminees.length > 0 ? Math.round(((terminees.length - nonSignees.length) / terminees.length) * 100) : 0}%`} sub={`${terminees.length - nonSignees.length}/${terminees.length} signées`} icon={CheckCircle2} color="bg-emerald-500" />
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Prochaines sessions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={17} className="text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-800">Prochaines sessions</h2>
              {aVenir.length > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {aVenir.length}
                </span>
              )}
            </div>
            <Link href="/formateur/sessions" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>

          {prochaines.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune session planifiée</p>
              <Link href="/formateur/sessions/new" className="inline-block mt-3 text-xs text-blue-600 hover:underline">
                Planifier une session →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {prochaines.map((s) => (
                <div key={s.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-700 leading-none">
                      {new Date(s.dateDebut).toLocaleDateString("fr-FR", { day: "2-digit" })}
                    </span>
                    <span className="text-[9px] text-blue-500 uppercase">
                      {new Date(s.dateDebut).toLocaleDateString("fr-FR", { month: "short" })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {s.apprenant?.prenom} {s.apprenant?.nom}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {s.module?.nom} · {new Date(s.dateDebut).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} – {new Date(s.dateFin).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${moduleBg[s.moduleId] ?? "bg-gray-100 text-gray-600"}`}>
                      {s.type}
                    </span>
                    <StatusBadge status={s.statut as "A_VENIR" | "EN_COURS" | "TERMINEE"} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Heures par module */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <BookOpen size={17} className="text-indigo-500" />
            <h2 className="text-sm font-semibold text-gray-800">Répartition par module</h2>
          </div>
          <div className="p-5 space-y-4">
            {heuresParModule.map((m) => (
              <div key={m.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-medium text-gray-700 truncate flex-1">{m.nom}</p>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{m.heures}h · {m.count} séances</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${moduleColors[m.id] ?? "bg-blue-400"} transition-all`}
                    style={{ width: `${m.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Apprenants + Sessions récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Suivi apprenants — heures par module */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={17} className="text-indigo-500" />
              <h2 className="text-sm font-semibold text-gray-800">Heures par apprenant</h2>
            </div>
            {/* Légende modules */}
            <div className="flex items-center gap-3 flex-wrap justify-end">
              {DEMO_MODULES.filter((m) => m.formateurId === formateurId).map((m) => (
                <span key={m.id} className="flex items-center gap-1 text-[10px] text-gray-500">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${moduleDot[m.id]}`} />
                  {m.nom.split(" ").slice(0, 2).join(" ")}
                </span>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {apprenantStats
              .sort((a, b) => b.heuresTotal - a.heuresTotal)
              .map(({ id, apprenant, heuresTotal, sessions, signees, termTotal, parModule, nbAVenir, nbEnCours, nbTerminee, nbTotal }) => {
                const pctTerminee = nbTotal > 0 ? Math.round((nbTerminee / nbTotal) * 100) : 0;
                const pctEnCours  = nbTotal > 0 ? Math.round((nbEnCours  / nbTotal) * 100) : 0;
                const pctAVenir   = nbTotal > 0 ? Math.round((nbAVenir   / nbTotal) * 100) : 0;
                return (
                  <div key={id} className="px-5 py-4">

                    {/* Ligne identité */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {apprenant?.prenom?.charAt(0)}{apprenant?.nom?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 leading-tight">
                          {apprenant?.prenom} {apprenant?.nom}
                        </p>
                        <p className="text-xs text-gray-400">{sessions} sessions · {heuresTotal}h</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end">
                          <CheckCircle2 size={11} className={signees === termTotal && termTotal > 0 ? "text-green-500" : "text-gray-300"} />
                          <span className="text-[10px] text-gray-400">{signees}/{termTotal} signées</span>
                        </div>
                      </div>
                    </div>

                    {/* ── Jauge 1 : heures par module ── */}
                    <div className="mb-1.5">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Heures par module</p>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex" title={`${heuresTotal}h au total`}>
                        {parModule.map((m, i) => (
                          <div
                            key={m.moduleId}
                            className={`h-full transition-all ${moduleColors[m.moduleId] ?? "bg-gray-400"} ${i > 0 ? "border-l-2 border-white" : ""}`}
                            style={{ width: `${Math.round((m.heures / maxHeuresApprenant) * 100)}%` }}
                            title={`${m.nom} : ${m.heures}h`}
                          />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {parModule.map((m) => (
                          <span key={m.moduleId} className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${moduleBg[m.moduleId]} ${moduleBorder[m.moduleId]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${moduleDot[m.moduleId]}`} />
                            {m.nom.split(" ").slice(0, 2).join(" ")} · {m.heures}h
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* ── Jauge 2 : statut des sessions ── */}
                    <div className="mt-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Avancement des sessions</p>
                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                        {nbTerminee > 0 && (
                          <div
                            className="h-full bg-emerald-500 transition-all"
                            style={{ width: `${pctTerminee}%` }}
                            title={`Terminées : ${nbTerminee}`}
                          />
                        )}
                        {nbEnCours > 0 && (
                          <div
                            className="h-full bg-amber-400 border-l-2 border-white transition-all"
                            style={{ width: `${pctEnCours}%` }}
                            title={`En cours : ${nbEnCours}`}
                          />
                        )}
                        {nbAVenir > 0 && (
                          <div
                            className="h-full bg-blue-300 border-l-2 border-white transition-all"
                            style={{ width: `${pctAVenir}%` }}
                            title={`À venir : ${nbAVenir}`}
                          />
                        )}
                      </div>
                      {/* Compteurs sous la jauge */}
                      <div className="flex items-center gap-3 mt-1.5">
                        {nbTerminee > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {nbTerminee} terminée{nbTerminee > 1 ? "s" : ""} ({pctTerminee}%)
                          </span>
                        )}
                        {nbEnCours > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            {nbEnCours} en cours
                          </span>
                        )}
                        {nbAVenir > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                            {nbAVenir} à venir
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
          </div>
        </div>

        {/* Sessions récentes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 size={17} className="text-green-500" />
              <h2 className="text-sm font-semibold text-gray-800">Sessions récentes</h2>
            </div>
            <div className="flex gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full inline-block" />Signée</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-300 rounded-full inline-block" />En attente</span>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {recentes.map((s) => {
              const signed = s.signatures.length > 0;
              return (
                <div key={s.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${signed ? "bg-green-400" : "bg-red-300"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">
                      <span className="font-medium">{s.apprenant?.prenom} {s.apprenant?.nom}</span>
                      <span className="text-gray-400 mx-1">·</span>
                      {s.module?.nom}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(s.dateDebut, "dd/MM/yyyy")} · {Math.round(s.dureeMinutes / 60)}h</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${signed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                    {signed ? "Signée" : "En attente"}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="px-5 py-3 border-t border-gray-50">
            <Link href="/formateur/sessions" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              Toutes les sessions <ArrowRight size={11} />
            </Link>
          </div>
        </div>

      </div>

      {/* Vue rapide agenda semaine */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={18} />
              <h2 className="text-sm font-semibold">Résumé du trimestre</h2>
            </div>
            <p className="text-blue-100 text-xs">T1 2026 — Janvier à Mars</p>
          </div>
          <Link
            href="/formateur/agenda"
            className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-medium transition"
          >
            Voir l'agenda →
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{terminees.length}</p>
            <p className="text-blue-100 text-xs mt-0.5">Sessions réalisées</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{totalHeures}h</p>
            <p className="text-blue-100 text-xs mt-0.5">Heures de coaching</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold">{uniqueApprenants}</p>
            <p className="text-blue-100 text-xs mt-0.5">Apprenants suivis</p>
          </div>
        </div>
      </div>

    </div>
  );
}
