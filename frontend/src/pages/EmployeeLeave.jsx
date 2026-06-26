import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getConges, soumettreConge, getDashboard, signalerCongesNonConfigures, annulerDemandeConge } from "../services/api";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";

// Formate une date ISO en jj/mm/aaaa
const formatDate = (iso) => {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

// Retourne la date du jour au format yyyy-mm-dd (fuseau Cameroun UTC+1)
const getTodayISO = () => {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const cam = new Date(utcMs + 3600000);
  const y = cam.getFullYear();
  const m = String(cam.getMonth() + 1).padStart(2, "0");
  const d = String(cam.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function EmployeeLeave() {
  const { token } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, id: null });
  const [conges, setConges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState(null);

  const [signalementEnvoyé, setSignalementEnvoyé] = useState(false);
  const [signalementLoading, setSignalementLoading] = useState(false);

  // Formulaire
  const [form, setForm] = useState({
    type_conge: "Annuel",
    date_debut: "",
    date_fin: "",
    motif: "",
  });

  // Pour le type Annuel : période sélectionnée dans le select
  const [selectedPeriodeIdx, setSelectedPeriodeIdx] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filters, setFilters] = useState({});

  // Fonction de chargement des données
  const fetchCongesData = async (page = 1, currentFilters = filters) => {
    try {
      setLoading(true);
      const congesData = await getConges(token, { page, ...currentFilters });
      setConges(congesData.data || []);
      setCurrentPage(congesData.current_page || 1);
      setLastPage(congesData.last_page || 1);
    } catch (error) {
      console.error("Erreur chargement congés:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const dash = await getDashboard(token);
      setDashData(dash);
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
    }
  };

  // Charger les données au démarrage
  useEffect(() => {
    if (token) {
      fetchDashboardData();
      fetchCongesData(1, filters);
    }
  }, [token]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchCongesData(1, newFilters);
  };

  const handlePageChange = (page) => {
    fetchCongesData(page, filters);
  };

  // Quand le type change, réinitialiser les dates et la période
  const handleTypeChange = (type) => {
    setForm({ ...form, type_conge: type, date_debut: "", date_fin: "" });
    setSelectedPeriodeIdx("");
  };

  // Quand l'employé choisit une période annuelle
  const handlePeriodeSelect = (idx) => {
    setSelectedPeriodeIdx(idx);
    if (idx === "") {
      setForm((f) => ({ ...f, date_debut: "", date_fin: "" }));
      return;
    }
    const periode = periodes[Number(idx)];
    setForm((f) => ({ ...f, date_debut: periode.start, date_fin: periode.end }));
  };

  // Envoyer un signalement au responsable
  const handleSignaler = async () => {
    setSignalementLoading(true);
    try {
      await signalerCongesNonConfigures(token);
      setSignalementEnvoyé(true);
      toast.success("✅ Signalement envoyé à votre responsable.");
    } catch (error) {
      toast.error("❌ Erreur : " + error.message);
    } finally {
      setSignalementLoading(false);
    }
  };

  // Soumettre une nouvelle demande
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await soumettreConge(token, form);
      setShowModal(false);
      setForm({ type_conge: "Annuel", date_debut: "", date_fin: "", motif: "" });
      setSelectedPeriodeIdx("");
      fetchCongesData(1, filters); // Rafraîchir les données
      toast.success("✅ Demande soumise avec succès !");
    } catch (error) {
      console.error("Erreur soumission:", error);
      toast.error("❌ Erreur : " + error.message);
    }
  };

  // Annuler une demande
  const handleAnnulerDemande = async (id) => {
    try {
      await annulerDemandeConge(token, id);
      toast.success("✅ Demande annulée avec succès");
      fetchCongesData(currentPage, filters); // Rafraîchir
    } catch (error) {
      toast.error("❌ Erreur lors de l'annulation : " + error.message);
    }
  };

  

  const periodes = dashData?.periode_conges_annuels ?? [];
  const soldeAnnuelTotal = dashData?.stats?.solde_annuel_total ?? 0;
  const soldeAnnuelRestant = dashData?.stats?.solde_annuel_restant ?? 0;
  const congesActifs = dashData?.conges_actifs ?? {};
  const today = getTodayISO();

  // Période sélectionnée pour les dates min/max (type Annuel)
  const periodeActive = selectedPeriodeIdx !== "" ? periodes[Number(selectedPeriodeIdx)] : null;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-end">
        <p className="text-gray-500 text-sm">Gérez et suivez vos demandes de congés.</p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
        >
          <span className="material-symbols-outlined">add</span>
          + Nouvelle demande
        </button>
      </div>

      {/* ===== BANNIÈRES DE SOLDE ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Solde annuel */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
            <span className="material-symbols-outlined">calendar_month</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Congé annuel</p>
            {soldeAnnuelTotal > 0 ? (
              <p className="text-xl font-bold text-blue-900">
                {soldeAnnuelRestant} <span className="text-sm font-normal text-blue-600">/ {soldeAnnuelTotal} jours</span>
              </p>
            ) : (
              <p className="text-sm font-semibold text-blue-400 mt-0.5">Non configuré</p>
            )}
          </div>
        </div>

        {/* Congé maladie */}
        <div className={`border rounded-xl p-4 flex items-center gap-4 ${congesActifs.Maladie?.actif ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${congesActifs.Maladie?.actif ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
            <span className="material-symbols-outlined">health_and_safety</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Congé maladie</p>
            {congesActifs.Maladie?.actif ? (
              congesActifs.Maladie.jours_restants === 0 ? (
                <p className="text-lg font-bold text-amber-600">Dernier jour — {formatDate(congesActifs.Maladie.date_fin)}</p>
              ) : (
                <p className="text-xl font-bold text-red-800">
                  {congesActifs.Maladie.jours_restants} <span className="text-sm font-normal text-red-600">jours restants</span>
                </p>
              )
            ) : (
              <p className="text-sm font-semibold text-gray-400 mt-0.5">Aucun congé maladie</p>
            )}
          </div>
        </div>

        {/* Congé exceptionnel */}
        <div className={`border rounded-xl p-4 flex items-center gap-4 ${congesActifs.Exceptionnel?.actif ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${congesActifs.Exceptionnel?.actif ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
            <span className="material-symbols-outlined">star</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Congé exceptionnel</p>
            {congesActifs.Exceptionnel?.actif ? (
              congesActifs.Exceptionnel.jours_restants === 0 ? (
                <p className="text-lg font-bold text-amber-600">Dernier jour — {formatDate(congesActifs.Exceptionnel.date_fin)}</p>
              ) : (
                <p className="text-xl font-bold text-purple-800">
                  {congesActifs.Exceptionnel.jours_restants} <span className="text-sm font-normal text-purple-600">jours restants</span>
                </p>
              )
            ) : (
              <p className="text-sm font-semibold text-gray-400 mt-0.5">Aucun congé exceptionnel</p>
            )}
          </div>
        </div>

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

      {/* Tableau historique */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-900">Historique de mes demandes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date début</th>
                <th className="px-6 py-4">Date fin</th>
                <th className="px-6 py-4 text-center">Jours</th>
                <th className="px-6 py-4">Motif</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Soumission</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {conges.length > 0 ? (
                conges.map((conge) => {
                  const debut = new Date(conge.date_debut);
                  const fin = new Date(conge.date_fin);
                  const jours = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)) + 1;
                  return (
                    <tr key={conge.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">{conge.type_conge}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(conge.date_debut).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-gray-500">{new Date(conge.date_fin).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-center font-bold">{jours}</td>
                      <td className="px-6 py-4 text-gray-500 italic">{conge.motif || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          conge.statut === "Approuvée" ? "bg-green-100 text-green-700" :
                          conge.statut === "Rejetée" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-800"
                        }`}>
                          {conge.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{new Date(conge.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        {(conge.statut === "En attente" || conge.statut === "Approuvée") && (
                          <button
                            onClick={() => setConfirmConfig({ isOpen: true, id: conge.id })}
                            className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                          >
                            Annuler ma demande
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">Aucune demande de congé</td>
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

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-blue-600">Nouvelle demande de congé</h3>
              <button onClick={() => { setShowModal(false); setSelectedPeriodeIdx(""); }} className="text-gray-400 hover:text-red-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form className="p-6 space-y-4" onSubmit={handleSubmit}>

              {/* Type de congé */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Type de congé</label>
                <select
                  value={form.type_conge}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Annuel">Annuel</option>
                  <option value="Maladie">Maladie</option>
                  <option value="Exceptionnel">Exceptionnel</option>
                </select>
              </div>

              {/* ===== ANNUEL : Affichage des périodes autorisées ===== */}
              {form.type_conge === "Annuel" && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                    Périodes autorisées par votre responsable
                  </p>

                  {periodes.length === 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-red-600">
                        ⚠️ Vos congés annuels n'ont pas encore été configurés par votre responsable.
                      </p>
                      {signalementEnvoyé ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 font-medium">
                          ✅ Votre signalement a bien été transmis à votre responsable.
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSignaler}
                          disabled={signalementLoading}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
                        >
                          {signalementLoading ? "Envoi en cours..." : "Signaler au responsable"}
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {periodes.map((p, i) => (
                          <span key={i} className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-300">
                            Du {formatDate(p.start)} au {formatDate(p.end)}
                          </span>
                        ))}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-blue-700 mb-1">
                          Choisir une période :
                        </label>
                        <select
                          value={selectedPeriodeIdx}
                          onChange={(e) => handlePeriodeSelect(e.target.value)}
                          className="w-full bg-white border border-blue-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                        >
                          <option value="">-- Sélectionner une période --</option>
                          {periodes.map((p, i) => (
                            <option key={i} value={i}>
                              Du {formatDate(p.start)} au {formatDate(p.end)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Affinage des dates dans la période */}
                      {periodeActive && (
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Date de début</label>
                            <input
                              type="date"
                              value={form.date_debut}
                              min={periodeActive.start}
                              max={form.date_fin || periodeActive.end}
                              onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
                              className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Date de fin</label>
                            <input
                              type="date"
                              value={form.date_fin}
                              min={form.date_debut || periodeActive.start}
                              max={periodeActive.end}
                              onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
                              className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              required
                            />
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-blue-500">
                        Solde restant : <strong>{soldeAnnuelRestant} / {soldeAnnuelTotal} jours</strong>
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* ===== MALADIE / EXCEPTIONNEL : dates libres mais >= aujourd'hui ===== */}
              {form.type_conge !== "Annuel" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Date de début</label>
                      <input
                        type="date"
                        value={form.date_debut}
                        min={today}
                        onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Date de fin</label>
                      <input
                        type="date"
                        value={form.date_fin}
                        min={form.date_debut || today}
                        onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Motif */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Motif (optionnel)</label>
                <textarea
                  value={form.motif}
                  onChange={(e) => setForm({ ...form, motif: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Veuillez préciser la raison de votre demande..."
                  rows="3"
                />
              </div>

              <button
                type="submit"
                disabled={form.type_conge === "Annuel" && periodes.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Envoyer la demande
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL CONFIRMATION ===== */}
      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title="Annuler la demande ?"
        message="Êtes-vous sûr de vouloir annuler cette demande de congé ? Cette action est irréversible."
        onCancel={() => setConfirmConfig({ isOpen: false, id: null })}
        onConfirm={() => handleAnnulerDemande(confirmConfig.id)}
        isDanger={true}
        confirmText="Annuler la demande"
      />
    </div>
  );
}