import { useAuth } from "../context/AuthContext";
import { Menu } from "@mui/icons-material";
import { Link } from "react-router-dom";

export default function Header({ toggleSidebar }) {
  const { user, unreadCount } = useAuth();

  if (!user) return null;

  const getNotificationsRoute = () => {
    const roleId = parseInt(user.role_id);
    if (roleId === 1) return "/employee-notifications";
    if (roleId === 2) return "/manager-notifications";
    if (roleId === 3) return "/technician-notifications";
    if (roleId === 4) return "/admin-notifications";
    return "/employee-notifications";
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-8 w-full sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden transition-colors"
        >
          <Menu />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Bon retour !</h1>
      </div>

      <div className="flex items-center gap-6">
        <Link
          to={getNotificationsRoute()}
          className="relative p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-blue-100 group"
          title="Voir les notifications"
        >
          <span className="material-symbols-outlined text-[26px] group-hover:animate-wiggle" style={{ fontVariationSettings: "'FILL' 0" }}>notifications</span>

          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-gray-800">{user.prenom} {user.nom}</p>
            <p className="text-xs text-gray-500 capitalize">{user.fonction}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
           {user.prenom ? user.prenom.charAt(0).toUpperCase() : "U"}{user.nom ? user.nom.charAt(0).toUpperCase() : "U"}
          </div>
        </div>
      </div>
    </header>
  );
}