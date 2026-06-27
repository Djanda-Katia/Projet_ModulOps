import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getConges, decideConge } from "../services/api";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function ManagerLeave() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState('actifs'); // 'actifs', 'historique'
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, id: null, action: null, motif: "" });

  const fetchRequests = async (page = 1, currentFilters = filters, tab = activeTab) => {
    try {
      setLoading(true);
      let finalFilters = { ...currentFilters, classification: tab };
      const data = await getConges(token, { page, ...finalFilters });
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
    if (token) fetchRequests(1, filters, activeTab);
  }, [token, activeTab]);

  const handleFilterChange = (newFilters) => { setFilters(newFilters); fetchRequests(1, newFilters, activeTab); };
  const handlePageChange = (page) => { fetchRequests(page, filters, activeTab); };

  const handleDecision = async (id, statut, motif = "") => {
    try {
      await decideConge(token, id, statut, motif);
      fetchRequests(currentPage, filters, activeTab);
      toast.success(statut === "Rejetée" ? "✅ Congé rejeté/annulé" : "✅ Décision enregistrée avec succès");
      setConfirmConfig({ isOpen: false, id: null, action: null, motif: "" });
    } catch (error) {
      toast.error("❌ Erreur : " + error.message);
    }
  };

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
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <span className="material-symbols-outlined text-9xl">event_available</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight mb-2">Gestion des Congés</h1>
          <p className="text-amber-50 text-sm font-medium">Validez ou rejetez les demandes de votre équipe.</p>
        </div>
        <Link
          to="/manager-leave-config"
          className="shrink-0 bg-white text-orange-600 hover:bg-orange-50 px-6 py-3.5 rounded-xl text-sm font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all transform hover:scale-105 relative z-10"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>settings</span>
          Configuration
        </Link>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex bg-gray-100/50 p-1 rounded-2xl w-fit">
        <button
          onClick={() => { setFilters({}); setActiveTab('actifs'); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'actifs' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">pending_actions</span>
          À Valider & Approuvées
        </button>
        <button
          onClick={() => { setFilters({}); setActiveTab('historique'); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'historique' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">history</span>
          Historique
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
        showPerson={true}
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
             <p className="font-medium">Chargement des congés...</p>
           </div>
        ) : requests.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl py-20 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="material-symbols-outlined text-6xl text-gray-200 mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>event_busy</span>
            <h3 className="text-xl font-bold text-gray-700 mb-1">Aucune demande</h3>
            <p className="text-gray-400 text-sm">Il n'y a aucune demande dans cette catégorie.</p>
          </div>
        ) : (
          <table className="w-full text-left border-separate border-spacing-y-3 min-w-[950px]">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-gray-400 font-bold px-4">
                <th className="px-6 py-2 font-semibold">Employé</th>
                <th className="px-6 py-2 font-semibold">Type de congé</th>
                <th className="px-6 py-2 font-semibold">Dates</th>
                <th className="px-6 py-2 font-semibold text-center">Durée</th>
                <th className="px-6 py-2 font-semibold">Statut</th>
                <th className="px-6 py-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const jours = Math.ceil((new Date(req.date_fin) - new Date(req.date_debut)) / (1000 * 60 * 60 * 24)) + 1;
                return (
                  <tr key={req.id} className="bg-white group hover:shadow-md transition-all duration-300">
                    <td className="p-4 rounded-l-2xl border-y border-l border-gray-100 group-hover:border-orange-200">
                      <div className="flex items-center gap-3 pl-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-black text-gray-600 shadow-inner border border-white">
                          {req.user.prenom[0]}{req.user.nom[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm mb-0.5">{req.user.prenom} {req.user.nom}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{req.user.fonction || "Employé"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-y border-gray-100 group-hover:border-orange-200">
                      <div className="flex items-center gap-3">
                         {catIcon(req.type_conge)}
                         <span className="font-bold text-sm text-gray-800">{req.type_conge}</span>
                      </div>
                      {req.motif && <p className="text-[11px] text-red-400 font-medium mt-1 italic max-w-full break-words" title={req.motif}>Motif : {req.motif}</p>}
                    </td>
                    <td className="px-6 py-4 border-y border-gray-100 group-hover:border-orange-200">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded w-max">{formatDate(req.date_debut)}</span>
                        <span className="text-sm font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded w-max">{formatDate(req.date_fin)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-y border-gray-100 group-hover:border-orange-200 text-center">
                       <span className="text-lg font-black text-gray-800">{jours} <span className="text-xs font-semibold text-gray-500">jours</span></span>
                    </td>
                    <td className="px-6 py-4 border-y border-gray-100 group-hover:border-orange-200">
                      {statusBadge(req)}
                    </td>
                    <td className="px-6 py-4 rounded-r-2xl border-y border-r border-gray-100 group-hover:border-orange-200 text-right pr-6">
                      {req.statut === "En attente" && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setConfirmConfig({ isOpen: true, id: req.id, action: "Approuvée", motif: "" })}
                            className="bg-green-100 hover:bg-green-600 text-green-700 hover:text-white transition-colors w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                            title="Approuver"
                          >
                            <span className="material-symbols-outlined text-[18px] font-bold">check</span>
                          </button>
                          <button
                            onClick={() => setConfirmConfig({ isOpen: true, id: req.id, action: "Rejetée", motif: "" })}
                            className="bg-red-100 hover:bg-red-600 text-red-700 hover:text-white transition-colors w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
                            title="Rejeter"
                          >
                            <span className="material-symbols-outlined text-[18px] font-bold">close</span>
                          </button>
                        </div>
                      )}
                      {req.statut === "Approuvée" && (
                        (() => {
                          const dejaCommence = new Date(req.date_debut) <= new Date(new Date().toDateString());
                          if (dejaCommence) return (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                              <span className="material-symbols-outlined text-[14px]">lock</span>
                              Déjà commencé
                            </span>
                          );
                          return (
                            <button
                              onClick={() => setConfirmConfig({ isOpen: true, id: req.id, action: "Annuler", motif: "" })}
                              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-600 hover:text-white transition-colors uppercase tracking-wide gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">cancel</span> Annuler
                            </button>
                          );
                        })()
                      )}
                      {(req.statut === "Rejetée" || req.statut === "Annulée") && (
                         <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider px-4">Clôturé</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={handlePageChange} />

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