import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { getNotifications, markAllNotificationsAsRead } from "../services/api";

export default function NotificationsList({ title = "Notifications" }) {
  const { token, updateUnreadCount } = useAuth();
  
  const [activeTab, setActiveTab] = useState("non_lues"); // "non_lues" ou "historique"
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states for history
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filter states for history
  const [typeFilter, setTypeFilter] = useState("all");
  const [senderFilter, setSenderFilter] = useState("all"); // employe, responsable, technicien, admin, all
  const [dateOrder, setDateOrder] = useState("desc"); // desc = récent d'abord, asc = ancien d'abord
  const [dateRange, setDateRange] = useState("all"); // 7d, 30d, 3m, 6m, 12m, all
  const [searchQuery, setSearchQuery] = useState(""); // pour filtrer par personne / mot clé

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await getNotifications(token);
        setNotifications(data);
        
        // S'il y a des non-lues, on les marque automatiquement comme lues
        const unreadCount = data.filter(n => !n.lu).length;
        if (unreadCount > 0) {
          // On marque tout comme lu en arrière plan
          await markAllNotificationsAsRead(token);
          // On met à jour le compteur global du header à 0
          updateUnreadCount(0);
        }
      } catch (error) {
        console.error("Erreur chargement notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token, updateUnreadCount]);

  const getIcon = (type) => {
    if (type?.includes("conge")) return "calendar_month";
    if (type?.startsWith("ticket")) return "confirmation_number";
    if (type?.startsWith("tache")) return "assignment";
    return "notifications";
  };

  // Les notifications "nouvelles" sont celles qui ÉTAIENT non-lues à l'ouverture de la page
  // Vu qu'on ne met pas à jour le state `notifications` (on garde lu: false localement
  // pour qu'elles restent dans l'onglet "Non lues" jusqu'au rafraîchissement)
  const unreadNotifs = notifications.filter(n => !n.lu);
  
  // Pour l'historique : application des filtres et tri
  const filteredHistory = useMemo(() => {
    let result = [...notifications];

    // 1. Filtre par type
    if (typeFilter !== "all") {
      result = result.filter(n => n.type?.includes(typeFilter));
    }

    // 2. Filtre par recherche (mot clé / nom)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => n.message?.toLowerCase().includes(q));
    }

    // 3. Filtre par expéditeur (Rôle)
    if (senderFilter !== "all") {
      result = result.filter(n => {
        const msg = n.message || "";
        if (senderFilter === "employe") return msg.includes("L'employé");
        if (senderFilter === "responsable") return msg.includes("Le responsable");
        if (senderFilter === "technicien") return msg.includes("Le technicien");
        if (senderFilter === "admin") return msg.includes("L'administrateur");
        return true;
      });
    }

    // 4. Filtre par période (Date Range)
    if (dateRange !== "all") {
      const now = new Date().getTime();
      const ranges = {
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
        "3m": 90 * 24 * 60 * 60 * 1000,
        "6m": 180 * 24 * 60 * 60 * 1000,
        "12m": 365 * 24 * 60 * 60 * 1000,
      };
      if (ranges[dateRange]) {
        result = result.filter(n => {
          const dateN = new Date(n.created_at).getTime();
          return (now - dateN) <= ranges[dateRange];
        });
      }
    }

    // 4. Tri par date
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [notifications, typeFilter, senderFilter, searchQuery, dateOrder, dateRange]);

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) return <div className="text-gray-500 py-10 text-center">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
        {/* Onglets */}
        <div className="flex border-b border-gray-100 px-4 pt-4 bg-gray-50 shrink-0">
          <button
            className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${
              activeTab === "non_lues"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("non_lues")}
          >
            Nouvelles ({unreadNotifs.length})
          </button>
          <button
            className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${
              activeTab === "historique"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => {
              setActiveTab("historique");
              setCurrentPage(1); // Reset page quand on change d'onglet
            }}
          >
            Voir l'historique ({notifications.length})
          </button>
        </div>

        {activeTab === "non_lues" ? (
          /* ONGLET NON LUES */
          <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
            {unreadNotifs.length > 0 ? (
              unreadNotifs.map((notif) => (
                <div key={notif.id} className="p-4 flex items-start gap-4 bg-blue-50/50 hover:bg-blue-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <span className="material-symbols-outlined">{getIcon(notif.type)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(notif.created_at).toLocaleString()}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center text-gray-500 h-full min-h-[300px]">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">done_all</span>
                <p>Vous n'avez aucune nouvelle notification.</p>
              </div>
            )}
          </div>
        ) : (
          /* ONGLET HISTORIQUE */
          <div className="flex flex-col flex-1">
            {/* Filtres Historique */}
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between sm:items-center bg-white shrink-0">
              <span className="text-sm font-semibold text-gray-600 hidden sm:block">Filtres</span>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {/* Recherche textuelle (Personne, mot-clé) */}
                <div className="relative flex-1 sm:w-48">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
                  <input 
                    type="text" 
                    placeholder="Chercher (nom, mot)..." 
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* Filtre Type */}
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all flex-1 sm:flex-none"
                >
                  <option value="all">Catégories</option>
                  <option value="conge">Congés</option>
                  <option value="ticket">Tickets</option>
                  <option value="tache">Tâches</option>
                </select>

                {/* Filtre Expéditeur */}
                <select
                  value={senderFilter}
                  onChange={(e) => { setSenderFilter(e.target.value); setCurrentPage(1); }}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all flex-1 sm:flex-none"
                >
                  <option value="all">Venant de (Tous)</option>
                  <option value="employe">Employés</option>
                  <option value="responsable">Responsables</option>
                  <option value="technicien">Techniciens</option>
                </select>

                {/* Filtres de Date / Tri */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <select
                    value={dateRange}
                    onChange={(e) => { setDateRange(e.target.value); setCurrentPage(1); }}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all flex-1 sm:flex-none"
                  >
                    <option value="all">Toute la période</option>
                    <option value="7d">7 derniers jours</option>
                    <option value="30d">30 derniers jours</option>
                    <option value="3m">3 derniers mois</option>
                    <option value="6m">6 derniers mois</option>
                    <option value="12m">12 derniers mois</option>
                  </select>

                  <select
                    value={dateOrder}
                    onChange={(e) => { setDateOrder(e.target.value); setCurrentPage(1); }}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all flex-1 sm:flex-none"
                  >
                    <option value="desc">Plus récents</option>
                    <option value="asc">Plus anciens</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Liste Historique */}
            <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
              {paginatedHistory.length > 0 ? (
                paginatedHistory.map((notif) => (
                  <div key={notif.id} className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                      <span className="material-symbols-outlined">{getIcon(notif.type)}</span>
                    </div>
                    <div className="flex-1 opacity-80">
                      <p className="text-sm text-gray-800">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(notif.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Aucune notification trouvée pour ce filtre.
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                <span className="text-xs text-gray-500 font-semibold">
                  Page {currentPage} sur {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50 hover:bg-gray-100 font-semibold text-gray-600 transition-colors"
                  >
                    Précédent
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50 hover:bg-gray-100 font-semibold text-gray-600 transition-colors"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
