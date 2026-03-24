"use client";

import { useState } from "react";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { BookOpen, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">CoachPlanner</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Email envoyé !</h2>
              <p className="text-gray-500 text-sm mb-6">
                Si cet email est associé à un compte, vous recevrez un lien de réinitialisation.
              </p>
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <Link href="/login" className="text-gray-400 hover:text-gray-600">
                  <ArrowLeft size={20} />
                </Link>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Mot de passe oublié</h2>
                  <p className="text-sm text-gray-500">
                    Entrez votre email pour recevoir un lien de réinitialisation
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="votre@email.fr"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
