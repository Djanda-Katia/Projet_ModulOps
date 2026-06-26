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

  const fetchTasks = async (page = 1, currentFilters = filters) => {
    try {
      setLoading(true);
      const data = await getMyTasks(token, { page, ...currentFilters });
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
    if (token) fetchTasks(1, filters);
  }, [token]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchTasks(1, newFilters);
  };

  const handlePageChange = (page) => {
    fetchTasks(page, filters);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await updateTaskStatus(token, id, newStatus);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, statut: newStatus } : t));
    } catch (error) {
      console.error("Erreur mise à jour statut:", error);
    }
  };

  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mes Tâches</h1>
      </div>

      <FilterBar
        onFilterChange={handleFilterChange}
        showPerson={false}
        statusOptions={[
          { value: 'À faire', label: 'À faire' },
          { value: 'En cours', label: 'En cours' },
          { value: 'Terminée', label: 'Terminée' },
          { value: 'Fermée', label: 'Fermée' }
        ]}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Titre</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Assigné par</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.length > 0 ? tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-semibold">{task.titre}</td>
                  <td className="px-6 py-3 text-gray-500">{task.description || "-"}</td>
                  <td className="px-6 py-3">
                    {task.assigne_par ? `${task.assigne_par.prenom} ${task.assigne_par.nom}` : "Inconnu"}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      task.statut === 'À faire' ? 'bg-gray-100 text-gray-600' :
                      task.statut === 'En cours' ? 'bg-blue-100 text-blue-700' :
                      task.statut === 'Terminée' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>{task.statut}</span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <select
                      value={task.statut}
                      onChange={(e) => updateStatus(task.id, e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-sm outline-none"
                    >
                      <option value="À faire">À faire</option>
                      <option value="En cours">En cours</option>
                      <option value="Terminée">Terminée</option>
                    </select>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-6 text-center text-gray-400">Aucune tâche trouvée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={handlePageChange} />
    </div>
  );
}