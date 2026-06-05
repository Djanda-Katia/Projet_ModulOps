import React from 'react';

export default function Taches() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-950 tracking-tight">✅ Suivi des tâches</h2>
      <p className="text-sm text-gray-400 mt-1">Gestion des plans d'action et avancement du projet de stage.</p>
      <div className="mt-6 border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
        📋 La liste des tâches collaboratives s'affichera ici.
      </div>
    </div>
  );
}