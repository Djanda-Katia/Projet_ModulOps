import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user } = useAuth();

  if (!user) return null;

  // Fonction pour afficher le nom du rôle proprement avec un style adapté
  const getRoleBadge = (roleId) => {
    switch (parseInt(roleId)) {
      case 1:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            💻 Employé
          </span>
        );
      case 2:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-100">
            🛠️ Technicien
          </span>
        );
      case 3:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-100">
            👑 Responsable
          </span>
        );
      case 4:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-700 border border-red-100">
            🛡️ Administrateur
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-50 text-gray-700">
            Utilisateur
          </span>
        );
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 w-full">
      {/* Partie gauche : Message de bienvenue */}
      <div>
        <h1 className="text-sm font-medium text-slate-600">
          Bonjour,{" "}
          <span className="font-semibold text-slate-900">
            {user.name || "Collaborateur"}
          </span>{" "}
          👋
        </h1>
      </div>

      {/* Partie droite : Badge Rôle + Notifications */}
      <div className="flex items-center gap-4">
        {/* Affichage du badge de rôle dynamique */}
        {getRoleBadge(user.role_id)}

        {/* Cloche de notifications épurée */}
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all relative">
          🔔
          {/* Petit point rouge pour simuler une notification non lue */}
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
}
