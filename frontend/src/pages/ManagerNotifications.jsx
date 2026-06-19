import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
// 1. On importe les fonctions de l'API
import { getNotifications, markAllNotificationsAsRead as apiMarkAllRead } from "../services/api";

export default function ManagerNotifications() {
  const { token, updateUnreadCount } = useAuth();

  // 2. On initialise avec un tableau vide au lieu de fausses données
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3. Fonction pour charger les vraies notifications depuis le backend
  const loadNotifications = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getNotifications(token);
      // On s'assure que data est bien un tableau
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Charger au démarrage
  useEffect(() => {
    loadNotifications();
  }, [token]);

  // Mettre à jour le compteur de notifications non lues dans le contexte
  useEffect(() => {
    const unread = notifications.filter((n) => !n.lu).length;
    if (updateUnreadCount) {
      updateUnreadCount(unread);
    }
  }, [notifications, updateUnreadCount]);

  // 4. Fonction pour tout marquer comme lu (appel API + mise à jour locale)
  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await apiMarkAllRead(token);
      // Après avoir envoyé la requête au serveur, on met à jour l'interface localement
      setNotifications(notifications.map(n => ({ ...n, lu: true })));
    } catch (error) {
      console.error("Erreur lors du marquage des notifications:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Chargement des notifications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button onClick={markAllAsRead} className="text-blue-600 hover:underline text-sm font-semibold">
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
                  {/* On utilise une petite sécurité au cas où le type viendrait du backend différemment */}
                  <span className="material-symbols-outlined">
                    {notif.type === "congé" ? "calendar_month" : "assignment"}
                  </span>
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