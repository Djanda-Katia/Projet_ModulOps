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
    if (type?.includes("conge")) return { icon: "calendar_month", color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-200" };
    if (type?.startsWith("ticket")) return { icon: "confirmation_number", color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" };
    if (type?.startsWith("tache")) return { icon: "assignment", color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-200" };
    return { icon: "notifications", color: "text-gray-600", bg: "bg-gray-100", border: "border-gray-200" };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-gray-800 to-black rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <span className="material-symbols-outlined text-9xl">notifications_active</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight mb-2">{title}</h1>
          <p className="text-gray-300 text-sm font-medium">Restez informé des mises à jour, des nouvelles tâches et de l'état de vos tickets.</p>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex bg-gray-100/50 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("non_lues")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'non_lues' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">mark_email_unread</span>
          Nouvelles
          {unreadNotifs.length > 0 && (
            <span className="ml-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-black">{unreadNotifs.length}</span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab("historique"); setCurrentPage(1); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'historique' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">history</span>
          Historique
        </button>
      </div>

      {/* CONTENU */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
        {activeTab === "non_lues" ? (
          <div className="p-6 flex-1 bg-gray-50/30">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 px-2">Activité Récente</h3>
            {unreadNotifs.length > 0 ? (
              <div className="space-y-4">
                {unreadNotifs.map((notif) => {
                  const style = getIcon(notif.type);
                  return (
                    <div key={notif.id} className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm flex items-start gap-5 hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${style.border} ${style.bg} ${style.color}`}>
                        <span className="material-symbols-outlined text-2xl">{style.icon}</span>
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-sm font-bold text-gray-900 leading-snug">{notif.message}</p>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-2">{new Date(notif.created_at).toLocaleString()}</p>
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] mt-2 shrink-0 animate-pulse"></div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center justify-center h-full">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                  <span className="material-symbols-outlined text-5xl text-gray-300" style={{ fontVariationSettings: "'FILL' 1" }}>done_all</span>
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-1">Tout est à jour !</h3>
                <p className="text-gray-400 text-sm">Vous n'avez aucune nouvelle notification.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col flex-1">
            <div className="p-4 border-b border-gray-100 bg-white shrink-0">
              <FilterBar
                onFilterChange={(f) => { setFilters(f); fetchHistory(1, f); }}
                showPerson={false}
                showStatus={true}
                statusFieldName="type"
                statusOptions={[
                  { value: 'ticket', label: '🎟️ Tickets' },
                  { value: 'conge', label: '🏖️ Congés' },
                  { value: 'tache', label: '📋 Tâches' },
                ]}
              />
            </div>
            
            <div className="p-6 flex-1 bg-gray-50/30">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
                  <span className="material-symbols-outlined animate-spin text-4xl">autorenew</span>
                  <p className="font-medium">Chargement de l'historique...</p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notif) => {
                    const style = getIcon(notif.type);
                    return (
                      <div key={notif.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-5 hover:border-gray-200 transition-colors opacity-80 hover:opacity-100">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gray-50 text-gray-400 border border-gray-100`}>
                          <span className="material-symbols-outlined text-xl">{style.icon}</span>
                        </div>
                        <div className="flex-1 pt-0.5">
                          <p className="text-sm font-semibold text-gray-700 leading-snug">{notif.message}</p>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-2">{new Date(notif.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center flex flex-col items-center justify-center h-full">
                  <span className="material-symbols-outlined text-5xl text-gray-200 mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
                  <h3 className="text-xl font-bold text-gray-700 mb-1">Aucune archive</h3>
                  <p className="text-gray-400 text-sm">Aucune notification ne correspond à ce filtre.</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-white">
              <Pagination
                currentPage={currentPage}
                lastPage={lastPage}
                onPageChange={(page) => fetchHistory(page, filters)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
