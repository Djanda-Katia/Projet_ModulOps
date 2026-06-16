import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentRole = parseInt(user.role_id);

  return (
    <div className="w-64 h-screen bg-[#00174b] flex flex-col justify-between p-6 text-white shadow-xl">
      {/* LOGO */}
      <div className="flex items-center gap-2 px-2 py-4 mb-8">
        <img src="/src/assets/logo.svg" alt="ModulOps" className="h-10" />
      </div>

      {/* NAVIGATION */}
      <nav className="space-y-2">
        {[1, 2, 3].includes(currentRole) && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? "bg-blue-500" : "hover:bg-blue-800"
              }`
            }
          >
            <span className="material-symbols-outlined">dashboard</span>{" "}
            Dashboard
          </NavLink>
        )}
        {[1, 3].includes(currentRole) && (
          <NavLink
            to="/conges"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? "bg-blue-500" : "hover:bg-blue-800"
              }`
            }
          >
            <span className="material-symbols-outlined">event_available</span>{" "}
            Gestion des congés
          </NavLink>
        )}
        {[1, 2].includes(currentRole) && (
          <NavLink
            to="/tickets"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? "bg-blue-500" : "hover:bg-blue-800"
              }`
            }
          >
            <span className="material-symbols-outlined">
              confirmation_number
            </span>{" "}
            Support Informatique
          </NavLink>
        )}
        {[1, 2, 3].includes(currentRole) && (
          <NavLink
            to="/taches"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? "bg-blue-500" : "hover:bg-blue-800"
              }`
            }
          >
            <span className="material-symbols-outlined">assignment</span> Suivi
            des tâches
          </NavLink>
        )}
        {currentRole === 4 && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? "bg-blue-500" : "hover:bg-blue-800"
              }`
            }
          >
            <span className="material-symbols-outlined">people</span>{" "}
            Administration
          </NavLink>
        )}
      </nav>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
      >
        <span className="material-symbols-outlined">logout</span> Déconnexion
      </button>
    </div>
  );
}
