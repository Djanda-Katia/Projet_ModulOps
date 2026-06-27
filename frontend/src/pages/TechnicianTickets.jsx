import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getTickets } from "../services/api";
import TicketDetailModal from "../components/TicketDetailModal";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";

export default function TechnicianTickets() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filters, setFilters] = useState({});

  const [activeTab, setActiveTab] = useState('actifs'); // 'actifs', 'resolus', 'fermes'

  const loadTickets = async (page = 1, currentFilters = filters, tab = activeTab) => {
    if (!token) return;
    try {
      setLoading(true);
      let finalFilters = { ...currentFilters };
      if (!finalFilters.statut) {
        if (tab === 'actifs') finalFilters.statut = 'Ouvert,En cours';
        else if (tab === 'resolus') finalFilters.statut = 'Résolu';
        else finalFilters.statut = 'Fermé';
      }

      const data = await getTickets(token, { page, ...finalFilters });
      setTickets(data.data || []);
      setCurrentPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch (error) {
      console.error("Erreur chargement tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTickets(1, filters, activeTab); }, [token, activeTab]);

  const handleFilterChange = (newFilters) => { setFilters(newFilters); loadTickets(1, newFilters, activeTab); };
  const handlePageChange = (page) => { loadTickets(page, filters, activeTab); };

  const getPersonName = (ticket) => {
    if (ticket.auteur && typeof ticket.auteur === 'object') {
      const a = ticket.auteur;
      if (a.prenom && a.nom) return `${a.prenom} ${a.nom}`;
      return a.nom || a.prenom || a.name || a.email || "Utilisateur";
    }
    if (ticket.user_id) return `Utilisateur #${ticket.user_id}`;
    return "Inconnu";
  };

  const getPersonInitials = (ticket) => {
    const name = getPersonName(ticket);
    if (name === "Inconnu" || name === "Utilisateur") return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const cleanDate = dateString.replace('Z', '').replace('T', ' ');
      const dateObj = new Date(cleanDate);
      if (isNaN(dateObj.getTime())) return dateString;
      return dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return dateString; }
  };

  const statusBadge = (s) => {
    switch(s) {
      case 'Ouvert': return <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{s}</span>;
      case 'En cours': return <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>{s}</span>;
      case 'Résolu': return <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{s}</span>;
      case 'Fermé': return <span className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>{s}</span>;
      default: return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{s}</span>;
    }
  };

  const prioriteBadge = (p) => {
    switch(p) {
      case 'Haute': return <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-[10px] uppercase font-black tracking-wider border border-red-100">{p}</span>;
      case 'Moyenne': return <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-[10px] uppercase font-black tracking-wider border border-indigo-100">{p}</span>;
      default: return <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] uppercase font-black tracking-wider border border-gray-200">{p}</span>;
    }
  };

  const catIcon = (cat) => {
    switch(cat) {
      case 'Matériel': return <span className="material-symbols-outlined text-purple-500 bg-purple-50 p-2 rounded-xl">computer</span>;
      case 'Logiciel': return <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-2 rounded-xl">code</span>;
      case 'Réseau': return <span className="material-symbols-outlined text-green-500 bg-green-50 p-2 rounded-xl">router</span>;
      default: return <span className="material-symbols-outlined text-gray-500 bg-gray-50 p-2 rounded-xl">help</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <span className="material-symbols-outlined text-9xl">engineering</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight mb-2">Interventions</h1>
          <p className="text-gray-300 text-sm font-medium">Gérez vos tickets assignés, mettez à jour leur statut et résolvez les problèmes.</p>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex bg-gray-100/50 p-1 rounded-2xl w-fit">
        <button
          onClick={() => { setFilters({}); setActiveTab('actifs'); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'actifs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">handyman</span>
          À Traiter
        </button>
        <button
          onClick={() => { setFilters({}); setActiveTab('resolus'); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'resolus' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">done_all</span>
          En Attente de Clôture
        </button>
        <button
          onClick={() => { setFilters({}); setActiveTab('fermes'); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'fermes' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">inventory_2</span>
          Historique des tickets fermés
        </button>
      </div>

      <FilterBar 
        onFilterChange={handleFilterChange} 
        showPerson={false}
        statusOptions={
          activeTab === 'actifs' ? [{ value: 'Ouvert', label: 'Ouvert' }, { value: 'En cours', label: 'En cours' }]
          : activeTab === 'resolus' ? [{ value: 'Résolu', label: 'Résolu' }]
          : [{ value: 'Fermé', label: 'Fermé' }]
        }
      />

      {/* PREMIUM LIST LAYOUT */}
      <div className="overflow-x-auto pb-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
             <span className="material-symbols-outlined animate-spin text-4xl">autorenew</span>
             <p className="font-medium">Chargement des interventions...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl py-20 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="material-symbols-outlined text-6xl text-gray-200 mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>task</span>
            <h3 className="text-xl font-bold text-gray-700 mb-1">Aucune intervention</h3>
            <p className="text-gray-400 text-sm">Votre file d'attente est vide pour cette catégorie.</p>
          </div>
        ) : (
          <table className="w-full text-left border-separate border-spacing-y-3 min-w-[900px]">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-gray-400 font-bold px-4">
                <th className="px-6 py-2 font-semibold">Problème</th>
                <th className="px-6 py-2 font-semibold text-center">Priorité</th>
                <th className="px-6 py-2 font-semibold">Statut</th>
                <th className="px-6 py-2 font-semibold text-center">Demandeur</th>
                <th className="px-6 py-2 font-semibold">Date</th>
                <th className="px-6 py-2 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id} className="bg-white group hover:shadow-md transition-all duration-300">
                  <td className="p-4 rounded-l-2xl border-y border-l border-gray-100 group-hover:border-gray-300">
                    <div className="flex items-center gap-4 pl-2">
                      {catIcon(ticket.categorie)}
                      <div>
                        <p className="font-bold text-gray-900 text-sm mb-0.5">{ticket.titre}</p>
                        <p className="text-xs text-gray-500 font-medium">{ticket.categorie}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-y border-gray-100 group-hover:border-gray-300 text-center">
                    {prioriteBadge(ticket.priorite)}
                  </td>
                  <td className="px-6 py-4 border-y border-gray-100 group-hover:border-gray-300">
                    {statusBadge(ticket.statut)}
                  </td>
                  <td className="px-6 py-4 border-y border-gray-100 group-hover:border-gray-300 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-black shadow-inner">
                        {getPersonInitials(ticket)}
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 truncate max-w-[100px]">{getPersonName(ticket)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-y border-gray-100 group-hover:border-gray-300">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-700">{formatDate(ticket.date || ticket.created_at)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 rounded-r-2xl border-y border-r border-gray-100 group-hover:border-gray-300 text-right pr-6">
                    <button
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-gray-700 transition-colors uppercase tracking-wide"
                    >
                      Traiter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={handlePageChange} />

      {selectedTicketId && (
        <TicketDetailModal ticketId={selectedTicketId} role={3} onClose={() => setSelectedTicketId(null)} onUpdated={() => loadTickets(currentPage, filters, activeTab)} />
      )}
    </div>
  );
}