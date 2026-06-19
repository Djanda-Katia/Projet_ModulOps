import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getNotifications, markAllNotificationsAsRead as apiMarkAllRead } from "../services/api";

export default function AdminNotifications() {
  const { token, updateUnreadCount } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Charger les vraies notifications depuis le backend
  const loadNotifications = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getNotifications(token);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [token]);

  // 2. Mettre à jour le compteur de notifications non lues dans le contexte global
  useEffect(() => {
    if (updateUnreadCount) {
      // Attention : ton backend utilise peut-être "lu" au lieu de "read"
      const unread = notifications.filter((n) => !n.lu && !n.read).length;
      updateUnreadCount(unread);
    }
  }, [notifications, updateUnreadCount]);

  // 3. Marquer toutes les notifications comme lues via l'API
  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await apiMarkAllRead(token);
      // Mise à jour locale de l'interface pour un feedback immédiat
      setNotifications(notifications.map(n => ({ ...n, lu: true, read: true })));
    } catch (error) {
      console.error("Erreur lors du marquage:", error);
      alert("Impossible de marquer les notifications comme lues.");
    }
  };

  // 4. Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "À l'instant";
    try {
      const cleanDate = dateString.replace('Z', '').replace('T', ' ');
      const dateObj = new Date(cleanDate);
      if (isNaN(dateObj.getTime())) return dateString;
      return dateObj.toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // 5. Choisir la bonne icône selon le type
  const getIcon = (type) => {
    switch(type) {
      case 'user': return 'person_add';
      case 'export': return 'download';
      case 'role': return 'manage_accounts';
      case 'ticket': return 'confirmation_number';
      default: return 'notifications';
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
          className="text-blue-600 hover:underline text-sm font-semibold disabled:opacity-50"
          disabled={notifications.length === 0}
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
            notifications.map((notif) => {
              // On gère le cas où le backend utilise "lu" ou "read"
              const isRead = notif.lu || notif.read;
              
              return (
                <div 
                  key={notif.id} 
                  className={`p-4 flex items-start gap-4 ${isRead ? "bg-white" : "bg-blue-50"}`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <span className="material-symbols-outlined">
                      {getIcon(notif.type)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${isRead ? "text-gray-600" : "font-semibold text-gray-900"}`}>
                      {notif.message || notif.text}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(notif.created_at || notif.time)}
                    </p>
                  </div>
                  {!isRead && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}