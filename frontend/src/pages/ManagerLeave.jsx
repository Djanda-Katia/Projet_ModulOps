import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getConges, decideConge } from "../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

// ===============================================================
// FONCTION FORMAT DD/MM/YYYY (strict)
// ===============================================================
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";

  // Récupère le jour, le mois et l'année
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0 en JS
  const year = date.getFullYear();

  // Retourne le format DD/MM/YYYY
  return `${day}/${month}/${year}`;
};
// ===============================================================

export default function ManagerLeave() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("En attente");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getConges(token);
        setRequests(data);
      } catch (error) {
        console.error("Erreur chargement congés:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRequests();
    }
  }, [token]);

  const handleDecision = async (id, statut) => {
    let motif = "";
    if (statut === "Rejetée") {
      motif = prompt("Motif du rejet :");
      if (motif === null) return;
    }
    try {
      await decideConge(token, id, statut, motif);
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === id ? { ...req, statut: statut, motif: motif || req.motif } : req
        )
      );
      toast.success(statut === "Rejetée" ? "Congé rejeté/annulé" : "Décision enregistrée");
    } catch (error) {
      toast.error("Erreur : " + error.message);
    }
  };

  const countPending = requests.filter(r => r.statut === "En attente").length;
  const countApproved = requests.filter(r => r.statut === "Approuvée").length;
  const countRejected = requests.filter(r => r.statut === "Rejetée").length;

  const filteredRequests = requests.filter(r => r.statut === activeTab);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Congés</h1>
          <p className="text-gray-500 text-sm">Validez ou rejetez les demandes de congé de votre équipe.</p>
        </div>
        <Link
          to="/manager-leave-config"
          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md transition-all"
        >
          <span className="material-symbols-outlined">settings</span>
          Gérer les congés annuels
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-blue-600">pending_actions</span>
        <span className="text-sm text-blue-900 font-semibold">{countPending} demandes en attente de validation</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                filteredRequests.map((req) => {
                  const jours = Math.ceil(
                    (new Date(req.date_fin) - new Date(req.date_debut)) / (1000 * 60 * 60 * 24)
                  ) + 1;

                  return (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-semibold">
                        {req.user.prenom} {req.user.nom}
                      </td>
                      <td className="px-6 py-3 text-gray-500">{req.type_conge}</td>
                      <td className="px-6 py-3 text-gray-500">{formatDate(req.date_debut)}</td>
                      <td className="px-6 py-3 text-gray-500">{formatDate(req.date_fin)}</td>
                      <td className="px-6 py-3 text-center font-bold">{jours}</td>
                      <td className="px-6 py-3 text-gray-500 italic">{req.motif || "-"}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          req.statut === "Approuvée" ? "bg-green-100 text-green-700" :
                          req.statut === "Rejetée" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-800"
                        }`}>
                          {req.statut}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right space-x-2">
                        {req.statut === "En attente" && (
                          <>
                            <button
                              onClick={() => handleDecision(req.id, "Approuvée")}
                              className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors"
                              title="Approuver"
                            >
                              <span className="material-symbols-outlined">check</span>
                            </button>
                            <button
                              onClick={() => handleDecision(req.id, "Rejetée")}
                              className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                              title="Rejeter"
                            >
                              <span className="material-symbols-outlined">close</span>
                            </button>
                          </>
                        )}
                        {req.statut === "Approuvée" && (
                          <button
                            onClick={() => {
                              if(window.confirm("Voulez-vous vraiment annuler ce congé approuvé ? Le solde de l'employé sera remboursé.")) {
                                handleDecision(req.id, "Rejetée");
                              }
                            }}
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                          >
                            Annuler
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
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