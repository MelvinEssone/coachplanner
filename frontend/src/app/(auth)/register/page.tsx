"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import { Role } from "@/types";

const ROLES: { value: Role; label: string; description: string }[] = [
  {
    value: "FORMATEUR",
    label: "Formateur",
    description: "Créez et gérez vos sessions de formation",
  },
  {
    value: "APPRENANT",
    label: "Apprenant",
    description: "Consultez votre agenda et signez vos sessions",
  },
  {
    value: "MANAGER_RH",
    label: "Manager / RH",
    description: "Suivez vos apprenants et signez les rapports",
  },
  {
    value: "RESPONSABLE_CENTRE",
    label: "Responsable Centre",
    description: "Supervisez tous les formateurs de votre centre",
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (!selectedRole) {
      setError("Veuillez sélectionner un rôle");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
      });
      router.push("/");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Erreur lors de la création du compte";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">CoachPlanner</h1>
          <p className="text-gray-500 mt-1">Créez votre compte</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex-1 h-2 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-gray-200"}`} />
          <div className={`flex-1 h-2 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`} />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {step === 1 ? (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Choisissez votre rôle</h2>
              <p className="text-sm text-gray-500 mb-6">
                Sélectionnez le rôle qui correspond à votre fonction
              </p>

              <div className="space-y-3">
                {ROLES.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => handleRoleSelect(role.value)}
                    className="w-full text-left p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <p className="font-semibold text-gray-800 group-hover:text-blue-700">
                      {role.label}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">{role.description}</p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  ← Retour
                </button>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-800">Informations personnelles</h2>
                  <p className="text-sm text-gray-500">
                    Rôle sélectionné :{" "}
                    <span className="font-medium text-blue-600">
                      {ROLES.find((r) => r.value === selectedRole)?.label}
                    </span>
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Jean"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Dupont"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="jean.dupont@email.fr"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-10"
                      placeholder="Minimum 8 caractères"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isLoading ? "Création en cours..." : "Créer mon compte"}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
