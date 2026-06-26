import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getNotifications, markAllNotificationsAsRead } from "../services/api";
import FilterBar from "./FilterBar";
import Pagination from "./Pagination";

export default function NotificationsList({ title = "Notifications" }) {
  const { token, updateUnreadCount } = useAuth();
  
  const [activeTab, setActiveTab] = useState("non_lues");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // History tab: server-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filters, setFilters] = useState({});

  // Unread tab: all unread loaded once
  const [unreadNotifs, setUnreadNotifs] = useState([]);

  const fetchHistory = async (page = 1, currentFilters = filters) => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getNotifications(token, { page, ...currentFilters });
      setNotifications(data.data || []);
      setCurrentPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnread = async () => {
    if (!token) return;
    try {
      const data = await getNotifications(token, { statut: 'non_lu', per_page: 100 });
      const list = data.data || [];
      setUnreadNotifs(list);
      if (list.length > 0) {
        await markAllNotificationsAsRead(token);
        updateUnreadCount(0);
      }
    } catch (error) {
      console.error("Erreur chargement non lus:", error);
    }
  };

  useEffect(() => {
    fetchUnread();
    fetchHistory(1, filters);
  }, [token]);

  const getIcon = (type) => {
    if (type?.includes("conge")) return "calendar_month";
    if (type?.startsWith("ticket")) return "confirmation_number";
    if (type?.startsWith("tache")) return "assignment";
    return "notifications";
  };

  

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
              setCurrentPage(1);
            }}
          >
            Historique
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
            <div className="p-4 border-b border-gray-100 bg-white shrink-0">
              <FilterBar
                onFilterChange={(f) => { setFilters(f); fetchHistory(1, f); }}
                showPerson={false}
                showStatus={true}
                statusOptions={[
                  { value: 'lu', label: '✓ Lu' },
                  { value: 'non_lu', label: '● Non lu' },
                ]}
              />
            </div>

            {/* Liste Historique */}
            <div className="divide-y divide-gray-100 flex-1 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
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

            <Pagination
              currentPage={currentPage}
              lastPage={lastPage}
              onPageChange={(page) => fetchHistory(page, filters)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
