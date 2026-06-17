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
          className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">notifications</span>

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
        </div>
      </div>
    </header>
  );
}