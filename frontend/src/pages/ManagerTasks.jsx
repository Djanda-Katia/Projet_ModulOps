import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllTasks, createTask, validateTask, cancelTask, getEmployes } from "../services/api";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";

export default function ManagerTasks() {
  const { token } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    titre: "",
    description: "",
    employes_ids: [],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState('actifs');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTasks = async (page = 1, currentFilters = filters, tab = activeTab) => {
    try {
      setLoading(true);
      let finalFilters = { ...currentFilters };
      if (!finalFilters.statut) {
        if (tab === 'actifs') finalFilters.statut = 'À faire,En cours';
        else if (tab === 'validation') finalFilters.statut = 'Terminée';
        else finalFilters.statut = 'Fermée';
      }

      const data = await getAllTasks(token, { page, ...finalFilters });
      setTasks(data.data || []);
      setCurrentPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch (error) {
      console.error("Erreur chargement tâches:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployes = async () => {
    try {
      const data = await getEmployes(token);
      setEmployes(data);
    } catch (error) {
      console.error("Erreur chargement employés:", error);
    }
  };

  useEffect(() => {
    if (token && employes.length === 0) {
      fetchEmployes();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchTasks(1, filters, activeTab);
    }
  }, [token, activeTab]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchTasks(1, newFilters, activeTab);
  };

  const handlePageChange = (page) => {
    fetchTasks(page, filters, activeTab);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createTask(token, form);
      fetchTasks(1, filters, activeTab);
      setShowModal(false);
      setForm({ titre: "", description: "", employes_ids: [] });
    } catch (error) {
      console.error("Erreur création tâche:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValidateAndClose = async (id) => {
    try {
      await validateTask(token, id);
      fetchTasks(currentPage, filters, activeTab);
    } catch (error) {
      console.error("Erreur validation:", error);
    }
  };

  const handleRejectAndReopen = async (id) => {
    try {
      await cancelTask(token, id);
      fetchTasks(currentPage, filters, activeTab);
    } catch (error) {
      console.error("Erreur annulation:", error);
    }
  };

  const statusBadge = (s) => {
    switch(s) {
      case 'À faire': return <span className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-200"><span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>{s}</span>;
      case 'En cours': return <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>{s}</span>;
      case 'Terminée': return <span className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>{s}</span>;
      case 'Fermée': return <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{s}</span>;
      default: return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{s}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <span className="material-symbols-outlined text-9xl">engineering</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight mb-2">Gestion des Tâches</h1>
          <p className="text-amber-50 text-sm font-medium">Assignez, suivez et validez le travail de votre équipe.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="shrink-0 bg-white text-orange-600 hover:bg-orange-50 px-6 py-3.5 rounded-xl text-sm font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all transform hover:scale-105 relative z-10">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          Créer une Tâche
        </button>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex bg-gray-100/50 p-1 rounded-2xl w-fit">
        <button
          onClick={() => { setFilters({}); setActiveTab('actifs'); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'actifs' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">play_circle</span>
          En cours & À faire
        </button>
        <button
          onClick={() => { setFilters({}); setActiveTab('validation'); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'validation' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">rule</span>
          À Valider
        </button>
        <button
          onClick={() => { setFilters({}); setActiveTab('historique'); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'historique' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          Historique
        </button>
      </div>

      <FilterBar
        onFilterChange={handleFilterChange}
        showPerson={true}
        personOptions={employes.map(e => ({ value: e.id, label: `${e.prenom} ${e.nom}` }))}
        personPlaceholder="Filtrer par employé"
        statusOptions={
          activeTab === 'actifs' ? [{ value: 'À faire', label: 'À faire' }, { value: 'En cours', label: 'En cours' }]
          : activeTab === 'validation' ? [{ value: 'Terminée', label: 'Terminée' }]
          : [{ value: 'Fermée', label: 'Fermée' }]
        }
      />

      {/* PREMIUM LIST LAYOUT */}
      <div className="overflow-x-auto pb-4">
        {loading ? (
           <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
             <span className="material-symbols-outlined animate-spin text-4xl">autorenew</span>
             <p className="font-medium">Chargement des tâches...</p>
           </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl py-20 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="material-symbols-outlined text-6xl text-gray-200 mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
            <h3 className="text-xl font-bold text-gray-700 mb-1">Aucune tâche trouvée</h3>
            <p className="text-gray-400 text-sm">Il n'y a aucune tâche dans cette catégorie.</p>
          </div>
        ) : (
          <table className="w-full text-left border-separate border-spacing-y-3 min-w-[900px]">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-gray-400 font-bold px-4">
                <th className="px-6 py-2 font-semibold">Tâche</th>
                <th className="px-6 py-2 font-semibold">Assignée à</th>
                <th className="px-6 py-2 font-semibold">Statut</th>
                <th className="px-6 py-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id} className="bg-white group hover:shadow-md transition-all duration-300">
                  <td className="p-4 rounded-l-2xl border-y border-l border-gray-100 group-hover:border-orange-200">
                    <div className="flex items-start gap-4 pl-2">
                      <div className="mt-1">
                         <span className="material-symbols-outlined text-orange-500 bg-orange-50 p-2 rounded-xl">assignment</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm mb-1">{task.titre}</p>
                        <p className="text-xs text-gray-500 font-medium max-w-md line-clamp-2">{task.description || "Aucune description"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-y border-gray-100 group-hover:border-orange-200">
                    {task.employes && task.employes.length > 0 ? (
                      <div className="flex -space-x-2 overflow-hidden">
                        {task.employes.map(e => (
                           <div key={e.id} className="inline-flex items-center gap-2 bg-gray-50 rounded-full pr-3 py-1 border border-gray-200 shadow-sm mr-2 mb-1">
                             <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-[10px] font-black text-gray-600 ml-1 shrink-0">
                               {e?.prenom?.[0] || '?'}{e?.nom?.[0] || '?'}
                             </div>
                             <span className="text-xs font-bold text-gray-700 whitespace-nowrap">{e?.prenom} {e?.nom}</span>
                           </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-gray-400 italic">Non assigné</span>
                    )}
                  </td>
                  <td className="px-6 py-4 border-y border-gray-100 group-hover:border-orange-200">
                    {statusBadge(task.statut)}
                  </td>
                  <td className="px-6 py-4 rounded-r-2xl border-y border-r border-gray-100 group-hover:border-orange-200 text-right pr-6">
                    {activeTab === 'validation' ? (
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleValidateAndClose(task.id)} className="bg-green-100 hover:bg-green-600 text-green-700 hover:text-white transition-colors px-3 py-1.5 rounded-lg text-xs font-bold uppercase flex items-center gap-1 shadow-sm">
                           <span className="material-symbols-outlined text-[16px]">check</span> Valider
                        </button>
                        <button onClick={() => handleRejectAndReopen(task.id)} className="bg-red-100 hover:bg-red-600 text-red-700 hover:text-white transition-colors px-3 py-1.5 rounded-lg text-xs font-bold uppercase flex items-center gap-1 shadow-sm">
                           <span className="material-symbols-outlined text-[16px]">close</span> Rejeter
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider px-4">Aucune action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={handlePageChange} />

      {/* MODALE CRÉER UNE TÂCHE */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden transform transition-all">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-600">edit_document</span>
                Nouvelle Tâche
              </h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form className="p-8 space-y-5" onSubmit={handleCreate}>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Titre de la tâche</label>
                <input type="text" value={form.titre} onChange={e => setForm({...form, titre: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all" required placeholder="Ex: Inventaire du matériel réseau" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all resize-none" rows="3" placeholder="Détails de la mission..." required></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Assigner à (Maintenir Ctrl pour choix multiples)</label>
                <select multiple value={form.employes_ids} onChange={e => setForm({...form, employes_ids: Array.from(e.target.selectedOptions, o => Number(o.value))})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all custom-scrollbar h-32">
                  {employes.map(e => <option key={e.id} value={e.id} className="p-2 hover:bg-gray-100 rounded">{e.prenom} {e.nom}</option>)}
                </select>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-orange-600 text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-orange-700 hover:shadow-lg transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isSubmitting ? <><span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span> Création...</> : 'Créer la tâche'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}