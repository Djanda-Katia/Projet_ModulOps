import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getConges, decideConge } from "../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";

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
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, id: null, action: null, motif: "" });

  const fetchRequests = async (page = 1, currentFilters = filters) => {
    try {
      setLoading(true);
      const data = await getConges(token, { page, ...currentFilters });
      setRequests(data.data || []);
      setCurrentPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch (error) {
      console.error("Erreur chargement congés:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchRequests(1, filters);
  }, [token]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchRequests(1, newFilters);
  };

  const handlePageChange = (page) => {
    fetchRequests(page, filters);
  };

  const handleDecision = async (id, statut, motif = "") => {
    try {
      await decideConge(token, id, statut, motif);
      fetchRequests(currentPage, filters);
      toast.success(statut === "Rejetée" ? "✅ Congé rejeté/annulé" : "✅ Décision enregistrée avec succès");
    } catch (error) {
      toast.error("❌ Erreur : " + error.message);
    }
  };

  

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

      <FilterBar
        onFilterChange={handleFilterChange}
        showPerson={false}
        statusOptions={[
          { value: 'En attente', label: 'En attente' },
          { value: 'Approuvée', label: 'Approuvée' },
          { value: 'Rejetée', label: 'Rejetée' }
        ]}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
              {requests.length > 0 ? (
                requests.map((req) => {
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
                              onClick={() => setConfirmConfig({ isOpen: true, id: req.id, action: "Approuvée", motif: "" })}
                              className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors"
                              title="Approuver"
                            >
                              <span className="material-symbols-outlined">check</span>
                            </button>
                            <button
                              onClick={() => setConfirmConfig({ isOpen: true, id: req.id, action: "Rejetée", motif: "" })}
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
                                setConfirmConfig({ isOpen: true, id: req.id, action: "Annuler", motif: "" });
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

      <Pagination
        currentPage={currentPage}
        lastPage={lastPage}
        onPageChange={handlePageChange}
      />

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.action === "Approuvée" ? "Approuver le congé ?" : confirmConfig.action === "Rejetée" ? "Rejeter le congé ?" : "Annuler le congé approuvé ?"}
        message={
          confirmConfig.action === "Approuvée" 
            ? "Êtes-vous sûr de vouloir approuver cette demande de congé ?" 
            : confirmConfig.action === "Rejetée"
              ? "Êtes-vous sûr de vouloir rejeter cette demande de congé ?"
              : "Voulez-vous vraiment annuler ce congé approuvé ? Le solde de l'employé sera remboursé."
        }
        onCancel={() => setConfirmConfig({ isOpen: false, id: null, action: null, motif: "" })}
        onConfirm={() => handleDecision(confirmConfig.id, confirmConfig.action === "Annuler" ? "Rejetée" : confirmConfig.action, confirmConfig.motif)}
        isDanger={confirmConfig.action === "Rejetée" || confirmConfig.action === "Annuler"}
        confirmText="Confirmer"
        showInput={confirmConfig.action === "Rejetée"}
        inputPlaceholder="Motif du rejet (optionnel)..."
        inputValue={confirmConfig.motif}
        onInputChange={(val) => setConfirmConfig({ ...confirmConfig, motif: val })}
      />
    </div>
  );
}