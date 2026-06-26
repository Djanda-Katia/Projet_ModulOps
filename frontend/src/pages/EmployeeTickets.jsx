import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getTickets, createTicket, getTechniciens } from "../services/api";
import TicketDetailModal from "../components/TicketDetailModal";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";

export default function EmployeeTickets() {
  const { token } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Pagination et filtres
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filters, setFilters] = useState({});

  // Formulaire de création
  const [form, setForm] = useState({
    titre: "",
    categorie: "Matériel",
    description: "",
    technicien_id: "",
  });

  const [activeTab, setActiveTab] = useState('actifs'); // 'actifs' ou 'historique'

  // Charger les tickets et les techniciens au démarrage
  const fetchTickets = async (page = 1, currentFilters = filters, tab = activeTab) => {
    try {
      setLoading(true);
      
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

  const fetchTechniciens = async () => {
    try {
      const data = await getTechniciens(token);
      setTechniciens(data);
    } catch (error) {
      console.error("Erreur chargement techniciens:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTechniciens();
      fetchTickets(1, filters, activeTab);
    }
  }, [token, activeTab]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchTickets(1, newFilters, activeTab);
  };

  const handlePageChange = (page) => {
    fetchTickets(page, filters, activeTab);
  };

  // Soumettre un nouveau ticket
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTicket(token, form);
      // Recharger la liste après création
      fetchTickets(1, filters, activeTab);
      setShowModal(false);
      setForm({
        titre: "",
        categorie: "Matériel",
        description: "",
        technicien_id: "",
      });
    } catch (error) {
      console.error("Erreur création ticket:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Tickets</h1>
          <p className="text-gray-500 text-sm">Gérez vos demandes de support et suivez leur résolution.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Créer un ticket
        </button>
      </div>

      {/* ── Onglets de classification ── */}
      <div className="flex items-center gap-6 border-b border-gray-200">
        <button
          onClick={() => { setFilters({}); setActiveTab('actifs'); }}
          className={`pb-3 text-sm font-bold transition-all border-b-2 ${
            activeTab === 'actifs' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Demandes en cours
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
        showPerson={true}
        personOptions={techniciens.map(t => ({ value: t.id, label: `${t.prenom} ${t.nom}` }))}
        personPlaceholder="Choisir un technicien"
        statusOptions={activeTab === 'actifs' 
          ? [{ value: 'Ouvert', label: 'Ouvert' }, { value: 'En cours', label: 'En cours' }]
          : [{ value: 'Résolu', label: 'Résolu' }, { value: 'Fermé', label: 'Fermé' }]
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Titre</th>
                <th className="px-6 py-3">Catégorie</th>
                <th className="px-6 py-3">Priorité</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3">Technicien</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-semibold">{ticket.titre}</td>
                    <td className="px-6 py-3 text-gray-500">{ticket.categorie}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        ticket.priorite === "Haute" ? "bg-red-100 text-red-700" :
                        ticket.priorite === "Moyenne" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{ticket.priorite}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        ticket.statut === "Ouvert" ? "bg-blue-100 text-blue-700" :
                        ticket.statut === "En cours" ? "bg-amber-100 text-amber-700" :
                        ticket.statut === "Résolu" ? "bg-purple-100 text-purple-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          ticket.statut === "Ouvert" ? "bg-blue-500" :
                          ticket.statut === "En cours" ? "bg-amber-500" :
                          ticket.statut === "Résolu" ? "bg-purple-500" :
                          "bg-gray-400"
                        }`}></span>
                        {ticket.statut}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                          {ticket.technicien?.nom?.[0]}{ticket.technicien?.prenom?.[0] || "?"}
                        </div>
                        <span>{ticket.technicien ? `${ticket.technicien.prenom} ${ticket.technicien.nom}` : "Non assigné"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
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
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-3 text-center text-gray-500">
                    Aucun ticket trouvé
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

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-blue-600">Créer un ticket</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Titre</label>
                <input
                  type="text"
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Problème de connexion"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Catégorie</label>
                <select
                  value={form.categorie}
                  onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option>Matériel</option>
                  <option>Logiciel</option>
                  <option>Réseau</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Décrivez votre problème..."
                  rows="4"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Technicien</label>
                <select
                  value={form.technicien_id}
                  onChange={(e) => setForm({ ...form, technicien_id: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Choisir un technicien</option>
                  {techniciens.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.prenom} {t.nom}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold uppercase hover:bg-blue-700 transition-all"
              >
                Soumettre le ticket
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          role={1}
          onClose={() => setSelectedTicketId(null)}
          onUpdated={() => fetchTickets(currentPage, filters)}
        />
      )}
    </div>
  );
}