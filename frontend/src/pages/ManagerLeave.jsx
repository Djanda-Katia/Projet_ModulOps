import { useState } from "react";

export default function ManagerLeave() {
  const [filter, setFilter] = useState("En attente");

  const requests = [
    { id: 1, name: "Marc Antoine", type: "Congé Payé", start: "12/10/2023", end: "15/10/2023", days: 4, reason: "Voyage familial prévu.", status: "En attente" },
    { id: 2, name: "Sophie Laurent", type: "RTT", start: "20/10/2023", end: "20/10/2023", days: 1, reason: "Rendez-vous administratif.", status: "En attente" },
    { id: 3, name: "Jean Petit", type: "Maladie", start: "05/10/2023", end: "07/10/2023", days: 3, reason: "Certificat médical fourni.", status: "En attente" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Congés</h1>
          <p className="text-gray-500 text-sm">Validez ou rejetez les demandes de congé de votre équipe.</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-blue-600">pending_actions</span>
        <span className="text-sm text-blue-900 font-semibold">5 demandes en attente de validation</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setFilter("En attente")}
            className={`px-6 py-3 text-sm font-bold ${filter === "En attente" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          >
            En attente (5)
          </button>
          <button
            onClick={() => setFilter("Approuvées")}
            className={`px-6 py-3 text-sm font-bold ${filter === "Approuvées" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          >
            Approuvées
          </button>
          <button
            onClick={() => setFilter("Rejetées")}
            className={`px-6 py-3 text-sm font-bold ${filter === "Rejetées" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          >
            Rejetées
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Employé</th>
                <th className="px-6 py-3">Type de congé</th>
                <th className="px-6 py-3">Date début</th>
                <th className="px-6 py-3">Date fin</th>
                <th className="px-6 py-3 text-center">Jours</th>
                <th className="px-6 py-3">Motif</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.filter(r => r.status === filter).map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-semibold">{req.name}</td>
                  <td className="px-6 py-3 text-gray-500">{req.type}</td>
                  <td className="px-6 py-3 text-gray-500">{req.start}</td>
                  <td className="px-6 py-3 text-gray-500">{req.end}</td>
                  <td className="px-6 py-3 text-center font-bold">{req.days}</td>
                  <td className="px-6 py-3 text-gray-500 italic">{req.reason}</td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">{req.status}</span>
                  </td>
                  <td className="px-6 py-3 text-right space-x-2">
                    <button className="text-green-600 hover:bg-green-50 p-1 rounded"><span className="material-symbols-outlined">check</span></button>
                    <button className="text-red-600 hover:bg-red-50 p-1 rounded"><span className="material-symbols-outlined">close</span></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}