import React from 'react';

export default function Dashboard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Tableau de bord</h2>
      <p className="text-sm text-gray-400 mt-1">Bienvenue sur votre espace de suivi général.</p>
      <div className="mt-6 border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
        📊 Les statistiques globales et graphiques d'activité s'afficheront ici.
      </div>
    </div>
  );
}