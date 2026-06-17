import { useState } from "react";

export default function AdminAudit() {
  const logs = [
    { id: 1, action: "Création du compte utilisateur : Marie Ewondo", user: "Hubert Tchakounté", date: "12 Oct 2023, 10:15" },
    { id: 2, action: "Export du journal d'audit global en CSV", user: "Hubert Tchakounté", date: "12 Oct 2023, 11:30" },
    { id: 3, action: "Modification du rôle de Paul Tchinda : Rôle 2 → Rôle 1", user: "Hubert Tchakounté", date: "11 Oct 2023, 14:20" },
    { id: 4, action: "Soumission d'une demande de congé par Luc Kamga", user: "Luc Kamga", date: "10 Oct 2023, 09:05" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal d'Audit</h1>
          <p className="text-gray-500 text-sm">Consultez l'historique des actions importantes effectuées dans l'application.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
          <span className="material-symbols-outlined">download</span>
          EXPORTER CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Utilisateur</th>
              <th className="px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">{log.id}</td>
                <td className="px-6 py-3 font-medium">{log.action}</td>
                <td className="px-6 py-3 text-gray-500">{log.user}</td>
                <td className="px-6 py-3 text-gray-500">{log.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}