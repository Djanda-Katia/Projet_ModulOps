import { useState } from "react";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([
    { id: 1, type: "user", text: "Nouveau compte créé pour Sophie Martin.", time: "À l'instant", read: false },
    { id: 2, type: "export", text: "Le rapport d'audit \"Journal_Audit_Q3_2023.csv\" a été exporté.", time: "Il y a 1 heure", read: false },
    { id: 3, type: "role", text: "Le rôle de Paul Tchinda a été modifié.", time: "Hier, 14:30", read: true },
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button onClick={markAllAsRead} className="text-blue-600 hover:underline text-sm font-semibold">Tout marquer comme lu</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Mes notifications</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {notifications.map((notif) => (
            <div key={notif.id} className={`p-4 flex items-start gap-4 ${notif.read ? "bg-white" : "bg-blue-50"}`}>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <span className="material-symbols-outlined">person_add</span>
              </div>
              <div className="flex-1">
                <p className={`text-sm ${notif.read ? "text-gray-600" : "font-semibold text-gray-900"}`}>{notif.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{notif.time}</p>
              </div>
              {!notif.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}