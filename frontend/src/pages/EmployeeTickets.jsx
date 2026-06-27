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

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    titre: "",
    categorie: "Matériel",
    description: "",
    technicien_id: "",
  });

  const [activeTab, setActiveTab] = useState('actifs'); // 'actifs', 'resolus', 'fermes'

  const fetchTickets = async (page = 1, currentFilters = filters, tab = activeTab) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createTicket(token, form);
      fetchTickets(1, filters, activeTab);
      setShowModal(false);
      setForm({ titre: "", categorie: "Matériel", description: "", technicien_id: "" });
      toast.success("✅ Ticket créé avec succès !");
    } catch (error) {
      console.error("Erreur création ticket:", error);
      toast.error("❌ Erreur : " + error.message);
    } finally {
      setIsSubmitting(false);
    }
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Mes Tickets</h1>
          <p className="text-blue-100 text-sm font-medium">Suivez, gérez et interagissez avec vos demandes d'assistance en toute simplicité.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="shrink-0 bg-white text-blue-600 hover:bg-blue-50 px-6 py-3.5 rounded-xl text-sm font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all transform hover:scale-105"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          Nouveau Ticket
        </button>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex bg-gray-100/50 p-1 rounded-2xl w-fit">
        <button
          onClick={() => { setFilters({}); setActiveTab('actifs'); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'actifs' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">pending_actions</span>
          En cours
        </button>
        <button
          onClick={() => { setFilters({}); setActiveTab('resolus'); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'resolus' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">task_alt</span>
          À valider (Résolus)
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
        showPerson={true}
        personOptions={techniciens.map(t => ({ value: t.id, label: `${t.prenom} ${t.nom}` }))}
        personPlaceholder="Choisir un technicien"
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
             <p className="font-medium">Chargement de vos tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl py-20 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="material-symbols-outlined text-6xl text-gray-200 mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>inbox</span>
            <h3 className="text-xl font-bold text-gray-700 mb-1">Aucun ticket trouvé</h3>
            <p className="text-gray-400 text-sm">Vous n'avez aucun ticket dans cette catégorie pour le moment.</p>
          </div>
        ) : (
          <table className="w-full text-left border-separate border-spacing-y-3 min-w-[900px]">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-gray-400 font-bold px-4">
                <th className="px-6 py-2 font-semibold">Détails du ticket</th>
                <th className="px-6 py-2 font-semibold text-center">Priorité</th>
                <th className="px-6 py-2 font-semibold">Statut</th>
                <th className="px-6 py-2 font-semibold">Assigné à</th>
                <th className="px-6 py-2 font-semibold">Création</th>
                <th className="px-6 py-2 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id} className="bg-white group hover:shadow-md transition-all duration-300">
                  <td className="p-4 rounded-l-2xl border-y border-l border-gray-100 group-hover:border-blue-200">
                    <div className="flex items-center gap-4 pl-2">
                      {catIcon(ticket.categorie)}
                      <div>
                        <p className="font-bold text-gray-900 text-sm mb-0.5">{ticket.titre}</p>
                        <p className="text-xs text-gray-500 font-medium">{ticket.categorie}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-y border-gray-100 group-hover:border-blue-200 text-center">
                    {prioriteBadge(ticket.priorite)}
                  </td>
                  <td className="px-6 py-4 border-y border-gray-100 group-hover:border-blue-200">
                    {statusBadge(ticket.statut)}
                  </td>
                  <td className="px-6 py-4 border-y border-gray-100 group-hover:border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-black text-gray-600 shadow-inner border border-white">
                        {ticket.technicien ? `${ticket.technicien.prenom[0]}${ticket.technicien.nom[0]}` : "?"}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {ticket.technicien ? `${ticket.technicien.prenom} ${ticket.technicien.nom}` : "Non assigné"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-y border-gray-100 group-hover:border-blue-200">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-700">{new Date(ticket.created_at).toLocaleDateString()}</span>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase">{new Date(ticket.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 rounded-r-2xl border-y border-r border-gray-100 group-hover:border-blue-200 text-right pr-6">
                    <button
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                      title="Voir détails"
                    >
                      <span className="material-symbols-outlined text-[20px]">arrow_forward_ios</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={handlePageChange} />

      {/* CREATE TICKET MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden transform transition-all">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">edit_document</span>
                Nouveau Ticket
              </h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form className="p-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Titre du problème</label>
                <input type="text" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" placeholder="Ex: Problème de connexion WiFi" required />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Catégorie</label>
                  <select value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all">
                    <option>Matériel</option>
                    <option>Logiciel</option>
                    <option>Réseau</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Technicien</label>
                  <select value={form.technicien_id} onChange={(e) => setForm({ ...form, technicien_id: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all">
                    <option value="">(Non assigné)</option>
                    {techniciens.map((t) => (
                      <option key={t.id} value={t.id}>{t.prenom} {t.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Description détaillée</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none" placeholder="Décrivez votre problème en détail..." rows="4" required></textarea>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-blue-700 hover:shadow-lg transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isSubmitting ? <><span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span> Envoi...</> : 'Soumettre le ticket'}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedTicketId && (
        <TicketDetailModal ticketId={selectedTicketId} role={1} onClose={() => setSelectedTicketId(null)} onUpdated={() => fetchTickets(currentPage, filters, activeTab)} />
      )}
    </div>
  );
}