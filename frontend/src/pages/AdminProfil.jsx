import React from "react";

export default function AdminProfil() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
      <div className="mb-6">
        <span className="text-xs font-bold text-red-600 uppercase tracking-widest bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
          Zone Sécurisée
        </span>
        <h2 className="text-2xl font-bold text-slate-950 mt-3 tracking-tight">
          Configuration & Administration
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Espace réservé à la gestion des comptes, des rôles et des paramètres
          globaux de l'application.
        </p>
      </div>

      <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
        🛠️ Les fonctionnalités de création de comptes et de gestion des rôles
        seront connectées ici.
      </div>
    </div>
  );
}
