"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/lib/api";
import { User, Mail, Lock, Check, Camera } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [profileData, setProfileData] = useState({ nom: "", prenom: "" });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (user) {
      setProfileData({ nom: user.nom, prenom: user.prenom });
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    if (!profileData.nom.trim() || !profileData.prenom.trim()) {
      setProfileError("Le nom et le prénom sont obligatoires.");
      return;
    }
    try {
      setIsSavingProfile(true);
      const r = await authApi.updateProfile(profileData);
      updateUser(r.data.data);
      setProfileSuccess("Profil mis à jour avec succès.");
    } catch (e: any) {
      setProfileError(e.response?.data?.message || "Erreur lors de la mise à jour.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setPasswordError("Tous les champs sont obligatoires.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    try {
      setIsSavingPassword(true);
      await authApi.updateProfile({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword } as any);
      setPasswordSuccess("Mot de passe modifié avec succès.");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e: any) {
      setPasswordError(e.response?.data?.message || "Mot de passe actuel incorrect.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const roleLabels: Record<string, string> = {
    FORMATEUR: "Formateur / Coach",
    APPRENANT: "Apprenant",
    MANAGER_RH: "Manager / RH",
    RESPONSABLE_CENTRE: "Responsable de Centre",
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gérez vos informations personnelles</p>
      </div>

      {/* Avatar & role */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
              {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
            </div>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-lg">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
              {roleLabels[user?.role || ""] || user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User size={16} className="text-blue-600" />
          Informations personnelles
        </h2>

        {profileError && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{profileError}</div>}
        {profileSuccess && <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg mb-4">{profileSuccess}</div>}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
              <input
                type="text"
                value={profileData.prenom}
                onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
              <input
                type="text"
                value={profileData.nom}
                onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse e-mail</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full border border-gray-100 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">L'adresse e-mail ne peut pas être modifiée.</p>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
            >
              {isSavingProfile ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check size={15} />
              )}
              Enregistrer
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lock size={16} className="text-blue-600" />
          Changer le mot de passe
        </h2>

        {passwordError && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{passwordError}</div>}
        {passwordSuccess && <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg mb-4">{passwordSuccess}</div>}

        <form onSubmit={handleSavePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe actuel</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nouveau mot de passe</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSavingPassword}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
            >
              {isSavingPassword ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check size={15} />
              )}
              Modifier le mot de passe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
