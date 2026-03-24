"use client";

import { useState, useEffect } from "react";
import { modulesApi } from "@/lib/api";
import { Module } from "@/types";
import { formatDate } from "@/lib/utils";
import { Plus, Edit, Trash2, BookOpen, X, Check } from "lucide-react";

export default function FormateurModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({ nom: "", description: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchModules = async () => {
    try {
      setIsLoading(true);
      const r = await modulesApi.getAll();
      setModules(r.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const openCreate = () => {
    setEditingModule(null);
    setFormData({ nom: "", description: "" });
    setError("");
    setShowForm(true);
  };

  const openEdit = (mod: Module) => {
    setEditingModule(mod);
    setFormData({ nom: mod.nom, description: mod.description || "" });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim()) {
      setError("Le nom du module est obligatoire.");
      return;
    }
    try {
      setIsSaving(true);
      if (editingModule) {
        await modulesApi.update(editingModule.id, formData);
      } else {
        await modulesApi.create(formData);
      }
      setShowForm(false);
      fetchModules();
    } catch (e: any) {
      setError(e.response?.data?.message || "Une erreur est survenue.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce module ?")) return;
    try {
      await modulesApi.delete(id);
      fetchModules();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modules de formation</h1>
          <p className="text-sm text-gray-500 mt-0.5">{modules.length} module(s)</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={16} />
          Nouveau module
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                {editingModule ? "Modifier le module" : "Nouveau module"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nom du module <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="Ex: Leadership & Management"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du module..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check size={15} />
                  )}
                  {editingModule ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : modules.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
          <BookOpen size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">Aucun module créé</p>
          <p className="text-gray-400 text-sm mt-1">Créez votre premier module de formation</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Plus size={14} />
            Créer un module
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <div key={mod.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-blue-200 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen size={20} className="text-blue-600" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(mod)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(mod.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">{mod.nom}</h3>
              {mod.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{mod.description}</p>
              )}
              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {mod._count?.sessions ?? 0} session(s)
                </span>
                <span className="text-xs text-gray-400">{formatDate(mod.createdAt, "dd/MM/yyyy")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
