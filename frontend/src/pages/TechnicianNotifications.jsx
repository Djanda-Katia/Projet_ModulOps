import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getNotifications, markAllNotificationsAsRead as apiMarkAllRead } from "../services/api";

export default function TechnicianNotifications() {
  const { token, updateUnreadCount } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les notifications depuis l'API
  const loadNotifications = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getNotifications(token);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement notifs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [token]);

  // Mettre à jour le compteur de non-lues dans le contexte global
  useEffect(() => {
    if (updateUnreadCount) {
      const unread = notifications.filter((n) => !n.lu).length;
      updateUnreadCount(unread);
    }
  }, [notifications, updateUnreadCount]);

  // Marquer tout comme lu via l'API
  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await apiMarkAllRead(token);
      // Mise à jour locale de l'interface
      setNotifications(notifications.map(n => ({ ...n, lu: true })));
    } catch (error) {
      console.error("Erreur lors du marquage:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Chargement des notifications...</div>;
  }

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
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Aucune notification pour le moment.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 flex items-start gap-4 ${notif.lu ? "bg-white" : "bg-blue-50"}`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <span className="material-symbols-outlined">confirmation_number</span>
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${notif.lu ? "text-gray-600" : "font-semibold text-gray-900"}`}>
                    {notif.text || notif.message || "Notification sans contenu"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {notif.time || notif.created_at || "À l'instant"}
                  </p>
                </div>
                {!notif.lu && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}