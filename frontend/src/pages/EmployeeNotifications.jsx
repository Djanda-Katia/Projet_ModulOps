import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getNotifications, markAllNotificationsAsRead } from "../services/api";

export default function EmployeeNotifications() {
  const { token, updateUnreadCount } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les notifications au démarrage
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications(token);
        setNotifications(data);
        // Mise à jour du compteur dans le header
        const unread = data.filter(n => !n.lu).length;
        updateUnreadCount(unread);
      } catch (error) {
        console.error("Erreur chargement notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchNotifications();
    }
  }, [token, updateUnreadCount]);

  // Tout marquer comme lu
  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(token);
      // Mettre à jour l'affichage local
      const updated = notifications.map(n => ({ ...n, lu: true }));
      setNotifications(updated);
      updateUnreadCount(0);
    } catch (error) {
      console.error("Erreur marquage comme lu:", error);
    }
  };

  const getIcon = (type) => {
    if (type === "conge_soumis" || type === "conge_decision") return "calendar_month";
    if (type?.startsWith("ticket")) return "confirmation_number";
    if (type?.startsWith("tache")) return "assignment";
    return "notifications";
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button
          onClick={markAllAsRead}
          className="text-blue-600 hover:underline text-sm font-semibold"
        >
          Tout marquer comme lu
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Mes notifications</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 flex items-start gap-4 ${notif.lu ? "bg-white" : "bg-blue-50"}`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <span className="material-symbols-outlined">{getIcon(notif.type)}</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${notif.lu ? "text-gray-600" : "font-semibold text-gray-900"}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
                {!notif.lu && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>}
              </div>
            ))
          ) : (
            <p className="p-4 text-center text-gray-500">Aucune notification</p>
          )}
        </div>
      </div>
    </div>
  );
}