import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo4.png";

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
      
      {/* LOGO AGRANDI ET COMPACT */}
      <div className="flex justify-start py-3 mb-2">
        <img src={logo} alt="ModulOps" className="h-12 w-auto object-contain" />
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-1.5">
        {currentRole === 1 && (
          <>
            <NavLink to="/employee-dashboard" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">dashboard</span> Dashboard
            </NavLink>
            <NavLink to="/employee-leave" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">event_available</span> Mes Congés
            </NavLink>
            <NavLink to="/employee-tickets" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">confirmation_number</span> Mes Tickets
            </NavLink>
            <NavLink to="/employee-tasks" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">assignment</span> Mes Tâches
            </NavLink>
            <NavLink to="/employee-notifications" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">notifications</span> Notifications
            </NavLink>
          </>
        )}

        {currentRole === 3 && (
          <>
            <NavLink to="/technician-dashboard" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">dashboard</span> Dashboard
            </NavLink>
            <NavLink to="/technician-tickets" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">confirmation_number</span> Mes Tickets
            </NavLink>
            <NavLink to="/technician-notifications" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">notifications</span> Notifications
            </NavLink>
          </>
        )}

        {currentRole === 2 && (
          <>
            <NavLink to="/manager-dashboard" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">dashboard</span> Dashboard
            </NavLink>
            <NavLink to="/manager-leave" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">event_available</span> Gestion des Congés
            </NavLink>
            <NavLink to="/manager-tickets" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">confirmation_number</span> Mes Tickets
            </NavLink>
            <NavLink to="/manager-tasks" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">assignment</span> Gestion des Tâches
            </NavLink>
            <NavLink to="/manager-notifications" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">notifications</span> Notifications
            </NavLink>
          </>
        )}

        {currentRole === 4 && (
          <>
            <NavLink to="/admin-users" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">people</span> Gestion Utilisateurs
            </NavLink>
            <NavLink to="/admin-audit" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">history</span> Journal d'Audit
            </NavLink>
            <NavLink to="/admin-notifications" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">notifications</span> Notifications
            </NavLink>
          </>
        )}
      </nav>

      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-900/30 rounded-lg transition-colors">
        <span className="material-symbols-outlined">logout</span> Déconnexion
      </button>
    </div>
  );
}