import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getConges, soumettreConge, getDashboard, signalerCongesNonConfigures, annulerDemandeConge } from "../services/api";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";
import toast from "react-hot-toast";

const formatDate = (iso) => {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conges, setConges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState(null);

  const [signalementEnvoyé, setSignalementEnvoyé] = useState(false);
  const [signalementLoading, setSignalementLoading] = useState(false);

  const [form, setForm] = useState({ type_conge: "Annuel", date_debut: "", date_fin: "", motif: "" });
  const [selectedPeriodeIdx, setSelectedPeriodeIdx] = useState("");

  const [activeTab, setActiveTab] = useState('actifs'); // 'actifs' ou 'historique'
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filters, setFilters] = useState({});

  const fetchCongesData = async (page = 1, currentFilters = filters, tab = activeTab) => {
    try {
      setLoading(true);
      let finalFilters = { ...currentFilters, classification: tab };
      const congesData = await getConges(token, { page, ...finalFilters });
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

  useEffect(() => {
    if (token) {
      fetchDashboardData();
      fetchCongesData(1, filters, activeTab);
    }
  }, [token, activeTab]);

  const handleFilterChange = (newFilters) => { setFilters(newFilters); fetchCongesData(1, newFilters, activeTab); };
  const handlePageChange = (page) => { fetchCongesData(page, filters, activeTab); };

  const handleTypeChange = (type) => {
    setForm({ ...form, type_conge: type, date_debut: "", date_fin: "" });
    setSelectedPeriodeIdx("");
  };

  const handlePeriodeSelect = (idx) => {
    setSelectedPeriodeIdx(idx);
    if (idx === "") {
      setForm((f) => ({ ...f, date_debut: "", date_fin: "" }));
      return;
    }
    const periode = periodes[Number(idx)];
    setForm((f) => ({ ...f, date_debut: periode.start, date_fin: periode.end }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await soumettreConge(token, form);
      setShowModal(false);
      setForm({ type_conge: "Annuel", date_debut: "", date_fin: "", motif: "" });
      setSelectedPeriodeIdx("");
      fetchCongesData(1, filters, activeTab);
      fetchDashboardData();
      toast.success("✅ Demande soumise avec succès !");
    } catch (error) {
      console.error("Erreur soumission:", error);
      toast.error("❌ Erreur : " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnnulerDemande = async (id) => {
    try {
      await annulerDemandeConge(token, id);
      toast.success("✅ Demande annulée avec succès");
      fetchCongesData(currentPage, filters, activeTab);
      fetchDashboardData();
    } catch (error) {
      toast.error("❌ Erreur lors de l'annulation : " + error.message);
    }
  };

  const periodes = dashData?.periode_conges_annuels ?? [];
  const soldeAnnuelTotal = dashData?.stats?.solde_annuel_total ?? 0;
  const soldeAnnuelRestant = dashData?.stats?.solde_annuel_restant ?? 0;
  const congesActifs = dashData?.conges_actifs ?? {};
  const today = getTodayISO();
  const periodeActive = selectedPeriodeIdx !== "" ? periodes[Number(selectedPeriodeIdx)] : null;

  const statusBadge = (conge) => {
    let s = conge.statut;
    if (s === 'Approuvée' && new Date(conge.date_fin) < new Date(new Date().toDateString())) {
      s = 'Terminée';
    }
    switch(s) {
      case 'En attente': return <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>{s}</span>;
      case 'Approuvée': return <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{s}</span>;
      case 'Rejetée': return <span className="flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>{s}</span>;
      case 'Annulée': return <span className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>{s}</span>;
      case 'Terminée': return <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>{s}</span>;
      default: return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{s}</span>;
    }
  };

  const catIcon = (cat) => {
    switch(cat) {
      case 'Annuel': return <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-2 rounded-xl">flight_takeoff</span>;
      case 'Maladie': return <span className="material-symbols-outlined text-red-500 bg-red-50 p-2 rounded-xl">medical_services</span>;
      case 'Exceptionnel': return <span className="material-symbols-outlined text-purple-500 bg-purple-50 p-2 rounded-xl">stars</span>;
      default: return <span className="material-symbols-outlined text-gray-500 bg-gray-50 p-2 rounded-xl">beach_access</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <span className="material-symbols-outlined text-9xl">beach_access</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight mb-2">Mes Congés</h1>
          <p className="text-blue-100 text-sm font-medium">Gérez vos demandes de congés et consultez vos soldes actuels.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="shrink-0 bg-white text-blue-600 hover:bg-blue-50 px-6 py-3.5 rounded-xl text-sm font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all transform hover:scale-105 relative z-10">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          Nouvelle Demande
        </button>
      </div>

      {/* ===== BANNIÈRES DE SOLDE ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Solde annuel */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-5 flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
            <span className="material-symbols-outlined text-3xl">calendar_month</span>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Solde annuel</p>
            {soldeAnnuelTotal > 0 ? (
              <p className="text-2xl font-black text-gray-900">
                {soldeAnnuelRestant} <span className="text-sm font-medium text-gray-400">/ {soldeAnnuelTotal} j</span>
              </p>
            ) : (
              <p className="text-sm font-bold text-red-400">Non configuré</p>
            )}
          </div>
        </div>

        {/* Congé annuel (actif) */}
        <div className={`bg-white shadow-sm border ${congesActifs.Annuel?.actif ? 'border-sky-200' : 'border-gray-100'} rounded-2xl p-5 flex items-center gap-5 hover:shadow-md transition-shadow`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${congesActifs.Annuel?.actif ? 'bg-sky-50 text-sky-600' : 'bg-gray-50 text-gray-400'}`}>
            <span className="material-symbols-outlined text-3xl">flight_takeoff</span>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Congé annuel</p>
            {congesActifs.Annuel?.actif ? (
              congesActifs.Annuel.jours_restants === 1 && congesActifs.Annuel.a_commence ? (
                <p className="text-lg font-black text-amber-600">Dernier jour</p>
              ) : (
                <div>
                  <p className="text-2xl font-black text-sky-700">
                    {congesActifs.Annuel.jours_restants} <span className="text-sm font-medium text-sky-400">j {congesActifs.Annuel.a_commence ? 'restants' : 'au total'}</span>
                  </p>
                  {!congesActifs.Annuel.a_commence && (
                    <p className="text-xs text-sky-400">Débute le {new Date(congesActifs.Annuel.date_debut).toLocaleDateString('fr-FR')}</p>
                  )}
                </div>
              )
            ) : (
              <p className="text-sm font-bold text-gray-400">Aucun</p>
            )}
          </div>
        </div>

        {/* Congé maladie */}
        <div className={`bg-white shadow-sm border ${congesActifs.Maladie?.actif ? 'border-red-200' : 'border-gray-100'} rounded-2xl p-5 flex items-center gap-5 hover:shadow-md transition-shadow`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${congesActifs.Maladie?.actif ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
            <span className="material-symbols-outlined text-3xl">health_and_safety</span>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Congé maladie</p>
            {congesActifs.Maladie?.actif ? (
              congesActifs.Maladie.jours_restants === 1 && congesActifs.Maladie.a_commence ? (
                <p className="text-lg font-black text-amber-600">Dernier jour</p>
              ) : (
                <div>
                  <p className="text-2xl font-black text-red-700">
                    {congesActifs.Maladie.jours_restants} <span className="text-sm font-medium text-red-400">j {congesActifs.Maladie.a_commence ? 'restants' : 'au total'}</span>
                  </p>
                  {!congesActifs.Maladie.a_commence && (
                    <p className="text-xs text-red-400">Débute le {new Date(congesActifs.Maladie.date_debut).toLocaleDateString('fr-FR')}</p>
                  )}
                </div>
              )
            ) : (
              <p className="text-sm font-bold text-gray-400">Aucun</p>
            )}
          </div>
        </div>

        {/* Congé exceptionnel */}
        <div className={`bg-white shadow-sm border ${congesActifs.Exceptionnel?.actif ? 'border-purple-200' : 'border-gray-100'} rounded-2xl p-5 flex items-center gap-5 hover:shadow-md transition-shadow`}>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${congesActifs.Exceptionnel?.actif ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-400'}`}>
            <span className="material-symbols-outlined text-3xl">star</span>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Exceptionnel</p>
            {congesActifs.Exceptionnel?.actif ? (
              congesActifs.Exceptionnel.jours_restants === 1 && congesActifs.Exceptionnel.a_commence ? (
                <p className="text-lg font-black text-amber-600">Dernier jour</p>
              ) : (
                <div>
                  <p className="text-2xl font-black text-purple-700">
                    {congesActifs.Exceptionnel.jours_restants} <span className="text-sm font-medium text-purple-400">j {congesActifs.Exceptionnel.a_commence ? 'restants' : 'au total'}</span>
                  </p>
                  {!congesActifs.Exceptionnel.a_commence && (
                    <p className="text-xs text-purple-400">Débute le {new Date(congesActifs.Exceptionnel.date_debut).toLocaleDateString('fr-FR')}</p>
                  )}
                </div>
              )
            ) : (
              <p className="text-sm font-bold text-gray-400">Aucun</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Onglets de classification ── */}
      <div className="flex bg-gray-100/50 p-1 rounded-2xl w-fit mt-8">
        <button
          onClick={() => { setFilters({}); setActiveTab('actifs'); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'actifs' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">pending_actions</span>
          En Cours & Approuvées
        </button>
        <button
          onClick={() => { setFilters({}); setActiveTab('historique'); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'historique' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">task_alt</span>
          Congés Terminés
        </button>
        <button
          onClick={() => { setFilters({}); setActiveTab('rejetes'); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'rejetes' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">cancel</span>
          Rejetés & Annulés
        </button>
      </div>

      <FilterBar 
        onFilterChange={handleFilterChange} 
        showPerson={false}
        statusOptions={activeTab === 'actifs' 
          ? [{ value: 'En attente', label: 'En attente' }, { value: 'Approuvée', label: 'Approuvée' }]
          : activeTab === 'historique'
          ? [{ value: 'Approuvée', label: 'Terminée' }]
          : [{ value: 'Rejetée', label: 'Rejetée' }, { value: 'Annulée', label: 'Annulée' }]
        }
      />

      {/* PREMIUM LIST LAYOUT */}
      <div className="overflow-x-auto pb-4">
        {loading ? (
           <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
             <span className="material-symbols-outlined animate-spin text-4xl">autorenew</span>
             <p className="font-medium">Chargement de vos congés...</p>
           </div>
        ) : conges.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl py-20 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="material-symbols-outlined text-6xl text-gray-200 mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>event_busy</span>
            <h3 className="text-xl font-bold text-gray-700 mb-1">Aucune demande</h3>
            <p className="text-gray-400 text-sm">Vous n'avez aucune demande dans cette catégorie.</p>
          </div>
        ) : (
          <table className="w-full text-left border-separate border-spacing-y-3 min-w-[900px]">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-gray-400 font-bold px-4">
                <th className="px-6 py-2 font-semibold">Type de congé</th>
                <th className="px-6 py-2 font-semibold">Dates</th>
                <th className="px-6 py-2 font-semibold text-center">Durée</th>
                <th className="px-6 py-2 font-semibold">Statut</th>
                <th className="px-6 py-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {conges.map((conge) => {
                const debut = new Date(conge.date_debut);
                const fin = new Date(conge.date_fin);
                const jours = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)) + 1;
                return (
                  <tr key={conge.id} className="bg-white group hover:shadow-md transition-all duration-300">
                    <td className="p-4 rounded-l-2xl border-y border-l border-gray-100 group-hover:border-blue-200">
                      <div className="flex items-center gap-4 pl-2">
                        {catIcon(conge.type_conge)}
                        <div>
                          <p className="font-bold text-gray-900 text-sm mb-0.5">{conge.type_conge}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Soumis le {new Date(conge.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {conge.motif && <p className="text-[11px] text-red-400 font-medium mt-1 italic max-w-full break-words" title={conge.motif}>Motif : {conge.motif}</p>}
                    </td>
                    <td className="px-6 py-4 border-y border-gray-100 group-hover:border-blue-200">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded w-max">{formatDate(conge.date_debut)}</span>
                        <span className="text-sm font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded w-max">{formatDate(conge.date_fin)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-y border-gray-100 group-hover:border-blue-200 text-center">
                       <span className="text-lg font-black text-gray-800">{jours} <span className="text-xs font-semibold text-gray-500">jours</span></span>
                    </td>
                    <td className="px-6 py-4 border-y border-gray-100 group-hover:border-blue-200">
                      {statusBadge(conge)}
                    </td>
                    <td className="px-6 py-4 rounded-r-2xl border-y border-r border-gray-100 group-hover:border-blue-200 text-right pr-6">
                      {activeTab === 'historique' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          Terminé
                        </span>
                      ) : (() => {
                        const peutAnnuler = (conge.statut === 'En attente' || conge.statut === 'Approuvée');
                        const dejaCommence = new Date(conge.date_debut) <= new Date(new Date().toDateString());
                        if (!peutAnnuler) return <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider px-4">Terminé</span>;
                        if (dejaCommence) return (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                            <span className="material-symbols-outlined text-[14px]">lock</span>
                            Déjà commencé
                          </span>
                        );
                        return (
                          <button
                            onClick={() => setConfirmConfig({ isOpen: true, id: conge.id })}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-600 hover:text-white transition-colors uppercase tracking-wide gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">cancel</span>
                            Annuler
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={handlePageChange} />

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden transform transition-all">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">edit_calendar</span>
                Nouvelle Demande
              </h3>
              <button onClick={() => { setShowModal(false); setSelectedPeriodeIdx(""); }} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form className="p-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Type de congé</label>
                <select value={form.type_conge} onChange={(e) => handleTypeChange(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all">
                  <option value="Annuel">Annuel</option>
                  <option value="Maladie">Maladie</option>
                  <option value="Exceptionnel">Exceptionnel</option>
                </select>
              </div>

              {form.type_conge === "Annuel" && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 space-y-4">
                  <p className="text-xs font-black text-blue-800 uppercase tracking-widest">
                    Périodes Autorisées
                  </p>

                  {periodes.length === 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-2 text-sm font-semibold text-red-600">
                        <span className="material-symbols-outlined">warning</span>
                        <p>Vos congés annuels n'ont pas encore été configurés par votre responsable.</p>
                      </div>
                      {signalementEnvoyé ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-bold flex items-center gap-2">
                          <span className="material-symbols-outlined">check_circle</span> Signalement transmis.
                        </div>
                      ) : (
                        <button type="button" onClick={handleSignaler} disabled={signalementLoading} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm">
                          {signalementLoading ? "Envoi..." : "Signaler au responsable"}
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {periodes.map((p, i) => (
                          <span key={i} className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border border-blue-200 shadow-sm">
                            Du {formatDate(p.start)} au {formatDate(p.end)}
                          </span>
                        ))}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Choisir une période :</label>
                        <select value={selectedPeriodeIdx} onChange={(e) => handlePeriodeSelect(e.target.value)} className="w-full bg-white border border-blue-200 rounded-xl p-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm" required>
                          <option value="">-- Sélectionner une période --</option>
                          {periodes.map((p, i) => (
                            <option key={i} value={i}>Du {formatDate(p.start)} au {formatDate(p.end)}</option>
                          ))}
                        </select>
                      </div>

                      {periodeActive && (
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Date de début</label>
                            <input type="date" value={form.date_debut} min={periodeActive.start} max={form.date_fin || periodeActive.end} onChange={(e) => setForm({ ...form, date_debut: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm" required />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Date de fin</label>
                            <input type="date" value={form.date_fin} min={form.date_debut || periodeActive.start} max={periodeActive.end} onChange={(e) => setForm({ ...form, date_fin: e.target.value })} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm" required />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {form.type_conge !== "Annuel" && (
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Date de début</label>
                    <input type="date" value={form.date_debut} min={today} onChange={(e) => setForm({ ...form, date_debut: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Date de fin</label>
                    <input type="date" value={form.date_fin} min={form.date_debut || today} onChange={(e) => setForm({ ...form, date_fin: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" required />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Motif (optionnel)</label>
                <textarea value={form.motif} onChange={(e) => setForm({ ...form, motif: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none" placeholder="Raison de votre demande..." rows="3" />
              </div>

              <button type="submit" disabled={isSubmitting || (form.type_conge === "Annuel" && periodes.length === 0)} className="w-full bg-blue-600 text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 hover:shadow-lg transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isSubmitting ? <><span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span> Envoi en cours...</> : 'Envoyer la demande'}
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
        confirmText="Confirmer l'annulation"
      />
    </div>
  );
}