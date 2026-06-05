import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const currentRole = parseInt(user.role_id);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col justify-between p-6">
      {/* Haut de la Sidebar : Logo & Navigation */}
      <div>
        {/* Logo ModulOps */}
        <div className="flex items-center gap-3 px-2 py-4 mb-8">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            M
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900 block tracking-tight">
              ModulOps
            </span>
            <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-widest block -mt-1">
              Business OS
            </span>
          </div>
        </div>

        {/* Menu de navigation principal */}
        <nav className="space-y-1">
          <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase px-3 block mb-2">
            Menu
          </span>

          {/* 1. Dashboard (Accessible uniquement pour Employé 1, Technicien 2, Responsable 3) */}
          {[1, 2, 3].includes(currentRole) && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              📊 Tableau de bord
            </NavLink>
          )}

          {/* 2. Congés (Strictement réservé à l'Employé 1 et au Responsable 3) */}
          {/* LE TECHNICIEN (2) ET L'ADMIN (4) NE VERRONT JAMAIS CET ONGLET */}
          {[1, 3].includes(currentRole) && (
            <NavLink
              to="/conges"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              📅 Gestion des congés
            </NavLink>
          )}

          {/* 3. Tickets (Strictement réservé à l'Employé 1 et au Technicien 2) */}
          {[1, 2].includes(currentRole) && (
            <NavLink
              to="/tickets"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              🛠️ Support Informatique
            </NavLink>
          )}

          {/* 4. Tâches (Accessible par Employé 1, Technicien 2, Responsable 3) */}
          {[1, 2, 3].includes(currentRole) && (
            <NavLink
              to="/taches"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              ✅ Suivi des tâches
            </NavLink>
          )}

          {/* 5. Configuration Admin (Strictement réservé au Super-Admin 4) */}
          {currentRole === 4 && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              ⚙️ Administration
            </NavLink>
          )}
        </nav>
      </div>

      {/* Bas de la Sidebar : Profil & Déconnexion */}
      <div className="border-t border-gray-100 pt-4 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 bg-slate-900 text-white rounded-full flex items-center justify-center font-semibold text-sm">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="truncate">
            <span className="text-sm font-semibold text-slate-800 block truncate">
              {user.name}
            </span>
            <span className="text-xs text-gray-400 block truncate">
              {user.email}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          🚪 Déconnexion
        </button>
      </div>
    </div>
  );
}
