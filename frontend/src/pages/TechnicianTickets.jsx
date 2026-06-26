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

  // Pagination et filtres
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filters, setFilters] = useState({});

  const [activeTab, setActiveTab] = useState('actifs'); // 'actifs' ou 'historique'

  const loadTickets = async (page = 1, currentFilters = filters, tab = activeTab) => {
    if (!token) return;
    try {
      setLoading(true);
      
      // Injecter le filtre de statut basé sur l'onglet actif s'il n'y a pas de statut sélectionné dans FilterBar
      let finalFilters = { ...currentFilters };
      if (!finalFilters.statut) {
        finalFilters.statut = tab === 'actifs' ? 'Ouvert,En cours' : 'Résolu,Fermé';
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

  useEffect(() => {
    loadTickets(1, filters, activeTab);
  }, [token, activeTab]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    loadTickets(1, newFilters, activeTab);
  };

  const handlePageChange = (page) => {
    loadTickets(page, filters, activeTab);
  };

  // ===============================================================
  // CORRECTION : Afficher le vrai nom de l'auteur ou du technicien
  // ===============================================================
  const getPersonName = (ticket) => {
    if (ticket.auteur && typeof ticket.auteur === 'object') {
      const a = ticket.auteur;
      if (a.prenom && a.nom) return `${a.prenom} ${a.nom}`;
      return a.nom || a.prenom || a.name || a.email || "Utilisateur";
    }
    if (ticket.technicien && typeof ticket.technicien === 'object') {
      const t = ticket.technicien;
      if (t.prenom && t.nom) return `${t.prenom} ${t.nom}`;
      return t.nom || t.prenom || t.name || t.email || "Technicien";
    }
    if (ticket.user_id) return `Utilisateur #${ticket.user_id}`;
    return "Inconnu";
  };

  const getPersonInitials = (ticket) => {
    const name = getPersonName(ticket);
    if (name === "Inconnu" || name === "Utilisateur" || name === "Technicien") return "?";
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
      return dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Tickets</h1>
          <p className="text-gray-500 text-sm">Gérez et traitez les tickets qui vous sont assignés.</p>
        </div>
      </div>

      {/* ── Onglets de classification ── */}
      <div className="flex items-center gap-6 border-b border-gray-200">
        <button
          onClick={() => { setFilters({}); setActiveTab('actifs'); }}
          className={`pb-3 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'actifs' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          En cours & Ouverts
        </button>
        <button
          onClick={() => { setFilters({}); setActiveTab('historique'); }}
          className={`pb-3 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'historique' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Historique (Résolus & Fermés)
        </button>
      </div>

      <FilterBar 
        onFilterChange={handleFilterChange} 
        showPerson={false}
        statusOptions={activeTab === 'actifs' 
          ? [{ value: 'Ouvert', label: 'Ouvert' }, { value: 'En cours', label: 'En cours' }]
          : [{ value: 'Résolu', label: 'Résolu' }, { value: 'Fermé', label: 'Fermé' }]
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Titre</th>
                <th className="px-6 py-3">Catégorie</th>
                <th className="px-6 py-3">Priorité</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3 text-center">Demandeur</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-6 text-gray-500">Aucun ticket trouvé.</td></tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-semibold">{ticket.titre}</td>
                    <td className="px-6 py-3 text-gray-500">{ticket.categorie}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${ ticket.priorite === "Haute" ? "bg-red-100 text-red-700" : ticket.priorite === "Moyenne" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600" }`}>{ticket.priorite}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${ ticket.statut === "Ouvert" ? "bg-blue-100 text-blue-700" : ticket.statut === "En cours" ? "bg-amber-100 text-amber-700" : ticket.statut === "Résolu" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600" }`}>
                        <span className={`w-2 h-2 rounded-full ${ ticket.statut === "Ouvert" ? "bg-blue-500" : ticket.statut === "En cours" ? "bg-amber-500" : ticket.statut === "Résolu" ? "bg-green-500" : "bg-gray-400" }`}></span>
                        {ticket.statut}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      {/* Affichage du rond avec initiales */}
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold mx-auto">
                        {getPersonInitials(ticket)}
                      </div>
                      {/* Affichage du nom complet en dessous */}
                      <div className="text-[10px] text-gray-400 mt-1 font-medium truncate max-w-[90px]">
                        {getPersonName(ticket)}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(ticket.date || ticket.created_at)}</td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => setSelectedTicketId(ticket.id)}
                        className="text-blue-600 font-bold hover:underline text-sm"
                      >
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))
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

      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          role={3}
          onClose={() => setSelectedTicketId(null)}
          onUpdated={() => loadTickets(currentPage, filters)}
        />
      )}
    </div>
  );
}