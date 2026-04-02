// =========================================================
// DEMO INTERCEPTOR — Intercepte les appels API en mode démo
// =========================================================
import { AxiosRequestConfig, AxiosResponse } from "axios";
import {
  DEMO_USERS_MAP, DEMO_MODULES, DEMO_SESSIONS, DEMO_ENTREPRISES,
  DEMO_ASSIGNMENTS_MANAGER, DEMO_ASSIGNMENTS_CENTRE, DEMO_NOTIFICATIONS,
  DEMO_RAPPORTS, DEMO_FORMATEUR_PROFILS,
  getSessionsForFormateur, getSessionsForApprenant,
  getSessionsForManager, getModulesForFormateur,
  getDashboardFormateur, getDashboardManager, getDashboardResponsable,
} from "./mockData";

function makeResponse(data: unknown, config: AxiosRequestConfig): AxiosResponse {
  return { data, status: 200, statusText: "OK", headers: {}, config } as AxiosResponse;
}

function ok(data: unknown, config: AxiosRequestConfig) {
  return Promise.resolve(makeResponse({ data, success: true }, config));
}

function okList(data: unknown[], total: number | undefined, config: AxiosRequestConfig) {
  return Promise.resolve(makeResponse({ data, total: total ?? data.length, success: true }, config));
}

// Récupère l'utilisateur connecté depuis localStorage
function getCurrentUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("cp_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function demoAdapter(config: AxiosRequestConfig): Promise<AxiosResponse> {
  const url = (config.url || "").replace(/^\/api/, "").replace(/\/$/, "");
  const method = (config.method || "get").toLowerCase();
  const params = (config.params || {}) as Record<string, string>;
  const currentUser = getCurrentUser();
  const userId = currentUser?.id || "";

  // ─── AUTH ──────────────────────────────────────────────
  if (url === "/auth/me") {
    if (currentUser) return ok(currentUser, config);
    return Promise.reject({ response: { status: 401, data: { error: "Non authentifié" } } });
  }

  if (url === "/auth/login" && method === "post") {
    const body = JSON.parse(config.data || "{}");
    const user = DEMO_USERS_MAP[body.email];
    if (user && body.password === "123456789") {
      return ok({ user, accessToken: "demo-token", refreshToken: "demo-refresh" }, config);
    }
    return Promise.reject({ response: { status: 401, data: { error: "Email ou mot de passe incorrect" } } });
  }

  if (url === "/auth/register" && method === "post") {
    return Promise.reject({ response: { status: 400, data: { error: "La création de compte n'est pas disponible en mode démo." } } });
  }

  if (url === "/auth/profile" && method === "put") {
    return ok(currentUser, config);
  }

  // ─── SESSIONS ─────────────────────────────────────────
  if (url === "/sessions" && method === "get") {
    const role = currentUser?.role;
    let sessions;
    if (role === "FORMATEUR") {
      sessions = getSessionsForFormateur(userId, params);
    } else if (role === "APPRENANT") {
      sessions = getSessionsForApprenant(userId, params);
    } else if (role === "MANAGER_RH") {
      sessions = getSessionsForManager(userId);
    } else {
      sessions = DEMO_SESSIONS;
    }
    return okList(sessions, sessions.length, config);
  }

  if (url.match(/^\/sessions\/([^/]+)$/) && method === "get") {
    const id = url.split("/")[2];
    const session = DEMO_SESSIONS.find(s => s.id === id);
    if (session) return ok(session, config);
    return Promise.reject({ response: { status: 404, data: { error: "Session introuvable" } } });
  }

  if (url === "/sessions" && method === "post") {
    const body = JSON.parse(config.data || "{}");
    const module = DEMO_MODULES.find(m => m.id === body.moduleId);
    const apprenant = Object.values(DEMO_USERS_MAP).find(u => u.id === body.apprenantId);
    const newSession = {
      id: "s-new-" + Date.now(), formateurId: userId,
      apprenantId: body.apprenantId, moduleId: body.moduleId,
      dateDebut: body.dateDebut, dateFin: body.dateFin,
      dureeMinutes: Math.round((new Date(body.dateFin).getTime() - new Date(body.dateDebut).getTime()) / 60000),
      type: body.type || "Individuelle", statut: "A_VENIR", notes: body.notes || "",
      archived: false, formateur: currentUser, apprenant, module, signatures: [],
      createdAt: new Date().toISOString(),
    };
    DEMO_SESSIONS.push(newSession as typeof DEMO_SESSIONS[0]);
    return ok(newSession, config);
  }

  if (url.match(/^\/sessions\/([^/]+)$/) && (method === "put" || method === "patch")) {
    const id = url.split("/")[2];
    const idx = DEMO_SESSIONS.findIndex(s => s.id === id);
    if (idx >= 0) {
      const body = JSON.parse(config.data || "{}");
      DEMO_SESSIONS[idx] = { ...DEMO_SESSIONS[idx], ...body };
      return ok(DEMO_SESSIONS[idx], config);
    }
    return Promise.reject({ response: { status: 404, data: { error: "Session introuvable" } } });
  }

  if (url.match(/^\/sessions\/([^/]+)$/) && method === "delete") {
    const id = url.split("/")[2];
    const idx = DEMO_SESSIONS.findIndex(s => s.id === id);
    if (idx >= 0) {
      DEMO_SESSIONS[idx].archived = true;
      return ok({ message: "Session archivée" }, config);
    }
    return Promise.reject({ response: { status: 404 } });
  }

  // ─── MODULES ──────────────────────────────────────────
  if (url === "/modules" && method === "get") {
    const role = currentUser?.role;
    const mods = role === "FORMATEUR" ? getModulesForFormateur(userId) : DEMO_MODULES;
    return okList(mods, mods.length, config);
  }

  if (url === "/modules" && method === "post") {
    const body = JSON.parse(config.data || "{}");
    const newMod = { id: "mod-" + Date.now(), nom: body.nom, description: body.description || "", formateurId: userId, createdAt: new Date().toISOString() };
    DEMO_MODULES.push(newMod);
    return ok(newMod, config);
  }

  if (url.match(/^\/modules\/([^/]+)$/) && method === "put") {
    const id = url.split("/")[2];
    const idx = DEMO_MODULES.findIndex(m => m.id === id);
    if (idx >= 0) {
      const body = JSON.parse(config.data || "{}");
      DEMO_MODULES[idx] = { ...DEMO_MODULES[idx], ...body };
      return ok(DEMO_MODULES[idx], config);
    }
  }

  if (url.match(/^\/modules\/([^/]+)$/) && method === "delete") {
    return ok({ message: "Module supprimé" }, config);
  }

  // ─── USERS ────────────────────────────────────────────
  if (url === "/users" && method === "get") {
    let users = Object.values(DEMO_USERS_MAP);
    if (params?.role) users = users.filter(u => u.role === params.role);
    if (params?.search) {
      const q = params.search.toLowerCase();
      users = users.filter(u => u.nom.toLowerCase().includes(q) || u.prenom.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return okList(users, users.length, config);
  }

  if (url.match(/^\/users\/([^/]+)$/) && method === "get") {
    const id = url.split("/")[2];
    const user = Object.values(DEMO_USERS_MAP).find(u => u.id === id);
    if (user) return ok(user, config);
    return Promise.reject({ response: { status: 404 } });
  }

  // ─── ENTREPRISES ──────────────────────────────────────
  if (url === "/entreprises" && method === "get") {
    return okList(DEMO_ENTREPRISES, DEMO_ENTREPRISES.length, config);
  }

  if (url === "/entreprises" && method === "post") {
    const body = JSON.parse(config.data || "{}");
    const newEnt = { id: "ent-" + Date.now(), ...body };
    DEMO_ENTREPRISES.push(newEnt);
    return ok(newEnt, config);
  }

  // ─── NOTIFICATIONS ────────────────────────────────────
  if (url === "/notifications" && method === "get") {
    const notifs = DEMO_NOTIFICATIONS[userId] || [];
    const filtered = params?.unreadOnly === "true" ? notifs.filter(n => !n.lu) : notifs;
    return okList(filtered, filtered.length, config);
  }

  if (url.match(/^\/notifications\/([^/]+)\/read$/) && method === "put") {
    const id = url.split("/")[2];
    const notifs = DEMO_NOTIFICATIONS[userId] || [];
    const n = notifs.find(n => n.id === id);
    if (n) n.lu = true;
    return ok({ message: "Marquée comme lue" }, config);
  }

  if (url === "/notifications/read-all" && method === "put") {
    (DEMO_NOTIFICATIONS[userId] || []).forEach(n => { n.lu = true; });
    return ok({ message: "Toutes marquées comme lues" }, config);
  }

  // ─── SIGNATURES ───────────────────────────────────────
  if (url === "/signatures/session" && method === "post") {
    const body = JSON.parse(config.data || "{}");
    const session = DEMO_SESSIONS.find(s => s.id === body.sessionId);
    if (session) {
      session.signatures.push({ id: "sig-" + Date.now(), role: "APPRENANT", horodatage: new Date().toISOString() });
      return ok({ message: "Session signée avec succès", pdfUrl: "#" }, config);
    }
    return Promise.reject({ response: { status: 404, data: { error: "Session introuvable" } } });
  }

  if (url === "/signatures/rapport" && method === "post") {
    const body = JSON.parse(config.data || "{}");
    const rapport = DEMO_RAPPORTS.find(r => r.id === body.rapportId);
    if (rapport) {
      rapport.statut = "SIGNE";
      rapport.signature = { id: "sr-" + Date.now(), horodatage: new Date().toISOString(), managerId: userId };
      return ok({ message: "Rapport signé avec succès", pdfUrl: "#" }, config);
    }
    return Promise.reject({ response: { status: 404, data: { error: "Rapport introuvable" } } });
  }

  // ─── RAPPORTS ─────────────────────────────────────────
  if (url === "/rapports" && method === "get") {
    let rapports = DEMO_RAPPORTS.filter(r => r.managerId === userId);
    if (params?.statut) rapports = rapports.filter(r => r.statut === params.statut);
    if (params?.apprenantId) rapports = rapports.filter(r => r.apprenantId === params.apprenantId);
    return okList(rapports, rapports.length, config);
  }

  if (url.match(/^\/rapports\/([^/]+)$/) && method === "get") {
    const id = url.split("/")[2];
    const rapport = DEMO_RAPPORTS.find(r => r.id === id);
    if (rapport) {
      const sessions = DEMO_SESSIONS.filter(s => s.apprenantId === rapport.apprenantId && s.statut === "TERMINEE");
      return ok({ ...rapport, sessions }, config);
    }
    return Promise.reject({ response: { status: 404 } });
  }

  if (url === "/rapports/generate" && method === "post") {
    const body = JSON.parse(config.data || "{}");
    const apprenant = Object.values(DEMO_USERS_MAP).find(u => u.id === body.apprenantId);
    const newRap = {
      id: "rap-" + Date.now(), managerId: userId, apprenantId: body.apprenantId,
      periodeDebut: body.periodeDebut, periodeFin: body.periodeFin,
      statut: "EN_ATTENTE", pdfUrl: null, createdAt: new Date().toISOString(),
      manager: currentUser, apprenant, signature: null,
    };
    DEMO_RAPPORTS.push(newRap as typeof DEMO_RAPPORTS[0]);
    return ok(newRap, config);
  }

  // ─── DASHBOARD ────────────────────────────────────────
  if (url === "/dashboard/formateur" && method === "get") {
    return ok(getDashboardFormateur(userId), config);
  }

  if (url === "/dashboard/manager" && method === "get") {
    const rows = getDashboardManager(userId);
    const stats = {
      totalApprenants: rows.length,
      totalSessions: rows.reduce((s, r) => s + r.sessionsTotal, 0),
      totalHeures: rows.reduce((s, r) => s + r.heuresTotal, 0),
      sessionsEnAttente: rows.reduce((s, r) => s + r.sessionNonSignees, 0),
    };
    const apprenants = rows.map(r => ({
      apprenant: { ...r.apprenant, entreprise: DEMO_ENTREPRISES.find(e => e.id === r.apprenant.entrepriseId) },
      sessionCount: r.sessionsTotal,
      totalHeures: r.heuresTotal,
      prochaineSession: r.sessionsAVenir > 0
        ? DEMO_SESSIONS.find(s => s.apprenantId === r.apprenant.id && s.statut === "A_VENIR")?.dateDebut || null
        : null,
      sessionSignees: r.sessionSignees,
      sessionEnAttente: r.sessionNonSignees,
    }));
    return ok({ stats, apprenants }, config);
  }

  if (url === "/dashboard/apprenant" && method === "get") {
    const sessions = getSessionsForApprenant(userId);
    const terminees = sessions.filter(s => s.statut === "TERMINEE");
    const aVenir = sessions.filter(s => s.statut === "A_VENIR");
    const heures = terminees.reduce((sum, s) => sum + s.dureeMinutes, 0) / 60;
    const nonSignees = terminees.filter(s => s.signatures.length === 0);
    return ok({ sessionsTotal: sessions.length, sessionsTerminees: terminees.length, sessionsAVenir: aVenir.length, heuresTotal: heures, nonSignees: nonSignees.length, recentSessions: sessions.slice(0, 5) }, config);
  }

  if (url === "/dashboard/responsable" && method === "get") {
    const rows = getDashboardResponsable(userId);
    const stats = {
      totalFormateurs: rows.length,
      totalApprenants: rows.reduce((s, r) => s + r.nbApprenants, 0),
      totalHeuresMois: rows.reduce((s, r) => s + r.heuresMonth, 0),
      totalSessionsMois: rows.reduce((s, r) => s + r.sessionsRealisees, 0),
    };
    const formateurs = rows.map(r => ({
      formateur: {
        ...r.formateur,
        formateurProfil: r.profil ? { matieres: r.profil.matieres, statut: r.profil.statut } : undefined,
      },
      apprenantCount: r.nbApprenants,
      heuresSemaine: r.heuresWeek,
      heuresMois: r.heuresMonth,
      heuresTotales: r.heuresTrimestre,
      sessionsPlanifiees: r.sessionsPlanifiees,
      sessionsRealisees: r.sessionsRealisees,
    }));
    return ok({ stats, formateurs }, config);
  }

  // ─── ASSIGNMENTS ──────────────────────────────────────
  if (url === "/assignments/manager" && method === "get") {
    const role = currentUser?.role;
    const list = role === "FORMATEUR"
      ? DEMO_ASSIGNMENTS_MANAGER
      : DEMO_ASSIGNMENTS_MANAGER.filter(a => a.managerId === userId);
    return okList(list, list.length, config);
  }

  if (url === "/assignments/manager" && method === "post") {
    const body = JSON.parse(config.data || "{}");
    const newA = { id: "am-" + Date.now(), managerId: body.managerId || userId, apprenantId: body.apprenantId, manager: currentUser, apprenant: Object.values(DEMO_USERS_MAP).find(u => u.id === body.apprenantId) };
    DEMO_ASSIGNMENTS_MANAGER.push(newA as typeof DEMO_ASSIGNMENTS_MANAGER[0]);
    return ok(newA, config);
  }

  if (url === "/assignments/centre" && method === "get") {
    const list = DEMO_ASSIGNMENTS_CENTRE.filter(a => a.responsableId === userId);
    return okList(list, list.length, config);
  }

  if (url === "/assignments/centre" && method === "post") {
    const body = JSON.parse(config.data || "{}");
    const newA = { id: "ac-" + Date.now(), responsableId: userId, formateurId: body.formateurId, responsable: currentUser, formateur: Object.values(DEMO_USERS_MAP).find(u => u.id === body.formateurId) };
    DEMO_ASSIGNMENTS_CENTRE.push(newA as typeof DEMO_ASSIGNMENTS_CENTRE[0]);
    return ok(newA, config);
  }

  // ─── PROFIL FORMATEUR ─────────────────────────────────
  if (url.match(/^\/users\/([^/]+)\/profil$/) && method === "get") {
    const id = url.split("/")[2];
    const profil = DEMO_FORMATEUR_PROFILS.find(p => p.userId === id);
    if (profil) return ok(profil, config);
    return Promise.reject({ response: { status: 404 } });
  }

  // ─── EXPORT ───────────────────────────────────────────
  if (url === "/export/csv") {
    const csv = "id,formateur,apprenant,module,dateDebut,dureeMinutes,statut\n" +
      DEMO_SESSIONS.map(s => `${s.id},${s.formateur?.prenom} ${s.formateur?.nom},${s.apprenant?.prenom} ${s.apprenant?.nom},${s.module?.nom},${s.dateDebut},${s.dureeMinutes},${s.statut}`).join("\n");
    return Promise.resolve({ data: new Blob([csv], { type: "text/csv" }), status: 200, statusText: "OK", headers: {}, config } as AxiosResponse);
  }

  // ─── Fallback ──────────────────────────────────────────
  console.warn(`[DEMO] Endpoint non mocké : ${method.toUpperCase()} ${url}`);
  return ok(null, config);
}
