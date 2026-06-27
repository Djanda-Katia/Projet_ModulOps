import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.svg";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout, unreadCount } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
    if (toggleSidebar) toggleSidebar();
  };

  const currentRole = parseInt(user.role_id);

  return (
    <div 
      className={`
        w-64 h-screen bg-[#00174b] flex flex-col justify-between p-6 text-white shadow-xl z-50
        fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}
    >
      {/* LOGO */}
      <div className="flex justify-start py-2 mb-1 w-full">
        <img src={logo} alt="ModulOps" className="h-12 w-full object-contain max-w-[180px]" />
      </div>

      <nav className="flex-1 space-y-1.5">
        {/* EMPLOYÉ (rôle 1) */}
        {currentRole === 1 && (
          <>
            <NavLink to="/employee-dashboard" onClick={toggleSidebar} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">dashboard</span> Tableau de bord
            </NavLink>
            <NavLink to="/employee-leave" onClick={toggleSidebar} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">event_available</span> Mes Congés
            </NavLink>
            <NavLink to="/employee-tickets" onClick={toggleSidebar} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">confirmation_number</span> Mes Tickets
            </NavLink>
            <NavLink to="/employee-tasks" onClick={toggleSidebar} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">assignment</span> Mes Tâches
            </NavLink>
            <NavLink to="/employee-notifications" onClick={toggleSidebar} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors justify-between ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">notifications</span> Notifications
              </div>
              {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
            </NavLink>
          </>
        )}

        {/* TECHNICIEN (rôle 3) */}
        {currentRole === 3 && (
          <>
            <NavLink to="/technician-dashboard" onClick={toggleSidebar} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">dashboard</span> Tableau de bord
            </NavLink>
            <NavLink to="/technician-tickets" onClick={toggleSidebar} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">confirmation_number</span> Mes Tickets
            </NavLink>
            <NavLink to="/technician-notifications" onClick={toggleSidebar} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors justify-between ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">notifications</span> Notifications
              </div>
              {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
            </NavLink>
          </>
        )}

        {/* RESPONSABLE (rôle 2) */}
        {currentRole === 2 && (
          <>
            <NavLink to="/manager-dashboard" onClick={toggleSidebar} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">dashboard</span> Tableau de bord
            </NavLink>
            <NavLink to="/manager-leave" onClick={toggleSidebar} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">event_available</span> Gestion des Congés
            </NavLink>
            <NavLink to="/manager-tickets" onClick={toggleSidebar} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">confirmation_number</span> Mes Tickets
            </NavLink>
            <NavLink to="/manager-tasks" onClick={toggleSidebar} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">assignment</span> Gestion des Tâches
            </NavLink>
            <NavLink to="/manager-notifications" onClick={toggleSidebar} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors justify-between ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">notifications</span> Notifications
              </div>
              {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
            </NavLink>
          </>
        )}

        {/* ADMIN (rôle 4) */}
        {currentRole === 4 && (
          <>
            <NavLink to="/admin-users" onClick={toggleSidebar} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">people</span> Gestion Utilisateurs
            </NavLink>
            <NavLink to="/admin-audit" onClick={toggleSidebar} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <span className="material-symbols-outlined">history</span> Journal d'Audit
            </NavLink>
            <NavLink to="/admin-notifications" onClick={toggleSidebar} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors justify-between ${isActive ? "bg-blue-500" : "hover:bg-blue-800"}`}>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">notifications</span> Notifications
              </div>
              {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
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