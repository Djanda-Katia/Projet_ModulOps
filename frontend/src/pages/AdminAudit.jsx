import { useState } from "react";

export default function AdminAudit() {
  // FAUSSES DONNÉES TEMPORAIRES (En attendant le Backend)
  const logs = [
    { id: 1, action: "Création du compte utilisateur : Marie Ewondo", user: "Hubert Tchakounté", date: "2023-10-12T10:15:00" },
    { id: 2, action: "Export du journal d'audit global en CSV", user: "Hubert Tchakounté", date: "2023-10-12T11:30:00" },
    { id: 3, action: "Modification du rôle de Paul Tchinda : Rôle 2 → Rôle 1", user: "Hubert Tchakounté", date: "2023-10-11T14:20:00" },
    { id: 4, action: "Soumission d'une demande de congé par Luc Kamga", user: "Luc Kamga", date: "2023-10-10T09:05:00" },
    { id: 5, action: "Connexion de l'utilisateur Dave Alicia", user: "Dave Alicia", date: "2023-10-09T08:30:00" },
  ];

  // Formateur de date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      alert("Aucune donnée à exporter.");
      return;
    }
    const headers = ["ID", "Action", "Utilisateur", "Date"];
    const rows = logs.map(log => [log.id, log.action, log.user, log.date]);
    const csvContent = [headers.join(";"), ...rows.map(row => row.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `audit_logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal d'Audit</h1>
          <p className="text-gray-500 text-sm">Consultez l'historique des actions importantes effectuées dans l'application.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          EXPORTER CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 w-16">ID</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3 w-48">Utilisateur</th>
                <th className="px-6 py-3 w-40">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-gray-500">
                    Aucune action enregistrée pour le moment.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-gray-400 font-mono text-xs">{log.id}</td>
                    <td className="px-6 py-3 font-medium text-gray-800">{log.action}</td>
                    <td className="px-6 py-3 text-gray-500">{log.user}</td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(log.date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}