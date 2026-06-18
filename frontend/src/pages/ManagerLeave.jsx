import { useState } from "react";

export default function ManagerLeave() {
  const [activeTab, setActiveTab] = useState("En attente");

  // Données initiales (seulement des demandes en attente)
  const [requests, setRequests] = useState([
    { id: 1, name: "Marc Antoine", type: "Congé Payé", start: "12/10/2023", end: "15/10/2023", days: 4, reason: "Voyage familial prévu.", status: "En attente" },
    { id: 2, name: "Sophie Laurent", type: "RTT", start: "20/10/2023", end: "20/10/2023", days: 1, reason: "Rendez-vous administratif.", status: "En attente" },
    { id: 3, name: "Jean Petit", type: "Maladie", start: "05/10/2023", end: "07/10/2023", days: 3, reason: "Certificat médical fourni.", status: "En attente" },
  ]);

  const handleDecision = (id, newStatus) => {
    // On met à jour la ligne existante, on ne la supprime pas
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === id ? { ...req, status: newStatus } : req
      )
    );
  };

  // Compteurs dynamiques
  const countPending = requests.filter(r => r.status === "En attente").length;
  const countApproved = requests.filter(r => r.status === "Approuvée").length;
  const countRejected = requests.filter(r => r.status === "Rejetée").length;

  // Filtrage selon l'onglet (activeTab utilise maintenant le même singulier que status)
  const filteredRequests = requests.filter(r => r.status === activeTab);

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
        <span className="text-sm text-blue-900 font-semibold">{countPending} demandes en attente de validation</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("En attente")}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "En attente"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            En attente ({countPending})
          </button>
          <button
            onClick={() => setActiveTab("Approuvée")}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "Approuvée"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Approuvées ({countApproved})
          </button>
          <button
            onClick={() => setActiveTab("Rejetée")}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === "Rejetée"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Rejetées ({countRejected})
          </button>
        </div>

        {/* Tableau */}
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
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-semibold">{req.name}</td>
                    <td className="px-6 py-3 text-gray-500">{req.type}</td>
                    <td className="px-6 py-3 text-gray-500">{req.start}</td>
                    <td className="px-6 py-3 text-gray-500">{req.end}</td>
                    <td className="px-6 py-3 text-center font-bold">{req.days}</td>
                    <td className="px-6 py-3 text-gray-500 italic">{req.reason}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        req.status === "Approuvée" ? "bg-green-100 text-green-700" :
                        req.status === "Rejetée" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right space-x-2">
                      {req.status === "En attente" && (
                        <>
                          <button
                            onClick={() => handleDecision(req.id, "Approuvée")}
                            className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors"
                          >
                            <span className="material-symbols-outlined">check</span>
                          </button>
                          <button
                            onClick={() => handleDecision(req.id, "Rejetée")}
                            className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                          >
                            <span className="material-symbols-outlined">close</span>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-400 text-sm">
                    Aucune demande dans cet onglet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}