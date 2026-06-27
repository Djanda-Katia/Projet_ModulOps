import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyTasks, updateTaskStatus } from "../services/api";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";

export default function EmployeeTasks() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState('actifs'); // 'actifs', 'terminees', 'historique'

  const fetchTasks = async (page = 1, currentFilters = filters, tab = activeTab) => {
    try {
      setLoading(true);
      let finalFilters = { ...currentFilters };
      if (!finalFilters.statut) {
        if (tab === 'actifs') finalFilters.statut = 'À faire,En cours';
        else if (tab === 'terminees') finalFilters.statut = 'Terminée';
        else finalFilters.statut = 'Fermée';
      }
      const data = await getMyTasks(token, { page, ...finalFilters });
      setTasks(data.data || []);
      setCurrentPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch (error) {
      console.error("Erreur chargement tâches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTasks(1, filters, activeTab);
  }, [token, activeTab]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchTasks(1, newFilters, activeTab);
  };

  const handlePageChange = (page) => {
    fetchTasks(page, filters, activeTab);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await updateTaskStatus(token, id, newStatus);
      // Reload current tab instead of just updating local state so it matches the filters/tabs properly
      fetchTasks(currentPage, filters, activeTab);
    } catch (error) {
      console.error("Erreur mise à jour statut:", error);
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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <span className="material-symbols-outlined text-9xl">checklist</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight mb-2">Mes Tâches</h1>
          <p className="text-blue-100 text-sm font-medium">Consultez vos missions et mettez à jour votre avancement.</p>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex bg-gray-100/50 p-1 rounded-2xl w-fit">
        <button
          onClick={() => { setFilters({}); setActiveTab('actifs'); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'actifs' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">play_circle</span>
          En cours & À faire
        </button>
        <button
          onClick={() => { setFilters({}); setActiveTab('terminees'); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'terminees' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          À valider (Terminées)
        </button>
        <button
          onClick={() => { setFilters({}); setActiveTab('historique'); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'historique' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">inventory_2</span>
          Historique des tâches fermées
        </button>
      </div>

      <FilterBar
        onFilterChange={handleFilterChange}
        showPerson={false}
        statusOptions={
          activeTab === 'actifs' ? [{ value: 'À faire', label: 'À faire' }, { value: 'En cours', label: 'En cours' }]
          : activeTab === 'terminees' ? [{ value: 'Terminée', label: 'Terminée' }]
          : [{ value: 'Fermée', label: 'Fermée' }]
        }
      />

      {/* PREMIUM LIST LAYOUT */}
      <div className="overflow-x-auto pb-4">
        {loading ? (
           <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
             <span className="material-symbols-outlined animate-spin text-4xl">autorenew</span>
             <p className="font-medium">Chargement de vos tâches...</p>
           </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl py-20 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="material-symbols-outlined text-6xl text-gray-200 mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
            <h3 className="text-xl font-bold text-gray-700 mb-1">Aucune tâche trouvée</h3>
            <p className="text-gray-400 text-sm">Vous êtes à jour dans cette catégorie.</p>
          </div>
        ) : (
          <table className="w-full text-left border-separate border-spacing-y-3 min-w-[900px]">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-gray-400 font-bold px-4">
                <th className="px-6 py-2 font-semibold">Tâche</th>
                <th className="px-6 py-2 font-semibold">Assigné par</th>
                <th className="px-6 py-2 font-semibold">Statut</th>
                <th className="px-6 py-2 font-semibold text-right">Mettre à jour</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id} className="bg-white group hover:shadow-md transition-all duration-300">
                  <td className="p-4 rounded-l-2xl border-y border-l border-gray-100 group-hover:border-blue-200">
                    <div className="flex items-start gap-4 pl-2">
                      <div className="mt-1">
                         <span className="material-symbols-outlined text-indigo-500 bg-indigo-50 p-2 rounded-xl">assignment</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm mb-1">{task.titre}</p>
                        <p className="text-xs text-gray-500 font-medium max-w-md line-clamp-2">{task.description || "Aucune description"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-y border-gray-100 group-hover:border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-black text-gray-600 shadow-inner border border-white">
                         {task.assigne_par?.prenom && task.assigne_par?.nom ? `${task.assigne_par.prenom[0]}${task.assigne_par.nom[0]}`.toUpperCase() : "?"}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                         {task.assigne_par?.prenom ? `${task.assigne_par.prenom} ${task.assigne_par.nom}` : "Inconnu"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-y border-gray-100 group-hover:border-blue-200">
                    {statusBadge(task.statut)}
                  </td>
                  <td className="px-6 py-4 rounded-r-2xl border-y border-r border-gray-100 group-hover:border-blue-200 text-right pr-6">
                    {activeTab === 'actifs' ? (
                      <select
                        value={task.statut}
                        onChange={(e) => updateStatus(task.id, e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-700 outline-none hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <option value="À faire">À faire</option>
                        <option value="En cours">En cours</option>
                        <option value="Terminée">Terminer</option>
                      </select>
                    ) : (
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4">Verrouillé</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={handlePageChange} />
    </div>
  );
}