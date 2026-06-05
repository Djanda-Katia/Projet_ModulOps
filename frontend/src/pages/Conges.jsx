import React from 'react';

export default function Conges() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-950 tracking-tight">📅 Gestion des congés</h2>
      <p className="text-sm text-gray-400 mt-1">Demandes de congés et suivi des soldes.</p>
      <div className="mt-6 border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
        🔒 Cet espace est strictement réservé aux Employés et aux Responsables.
      </div>
    </div>
  );
}