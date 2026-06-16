import { useAuth } from "../context/AuthContext";

export default function Header({ title }) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 w-full sticky top-0 z-30">
      {/* Titre de la page */}
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>

      {/* Droite : Notifications + Profil */}
      <div className="flex items-center gap-6">
        {/* Cloche de notifications */}
        <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profil */}
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