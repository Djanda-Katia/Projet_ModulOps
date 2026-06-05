import React from 'react';

export default function Tickets() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-950 tracking-tight">🛠️ Support Informatique</h2>
      <p className="text-sm text-gray-400 mt-1">Gestion et suivi des tickets d'assistance.</p>
      <div className="mt-6 border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
        🔒 Cet espace est accessible uniquement pour les Employés et les Techniciens.
      </div>
    </div>
  );
}