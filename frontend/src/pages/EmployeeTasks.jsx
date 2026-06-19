import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyTasks, updateTaskStatus } from "../services/api";

export default function EmployeeTasks() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les tâches au démarrage
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getMyTasks(token);
        setTasks(data);
      } catch (error) {
        console.error("Erreur chargement tâches:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTasks();
    }
  }, [token]);

  // Mettre à jour le statut d'une tâche
  const updateStatus = async (id, newStatus) => {
    try {
      await updateTaskStatus(token, id, newStatus);
      // Mettre à jour localement
      setTasks(tasks.map(t => t.id === id ? { ...t, statut: newStatus } : t));
    } catch (error) {
      console.error("Erreur mise à jour statut:", error);
    }
  };

  const columns = [
    { status: "À faire", color: "gray", bg: "bg-gray-100" },
    { status: "En cours", color: "blue", bg: "bg-blue-100" },
    { status: "Terminée", color: "green", bg: "bg-green-100" },
  ];

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mes Tâches</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div key={col.status} className={`${col.bg} p-4 rounded-xl min-h-[500px]`}>
            <div className="flex items-center gap-2 mb-4">
              <span className={`w-3 h-3 rounded-full bg-${col.color}-500`}></span>
              <h3 className="font-bold text-gray-800">{col.status}</h3>
              <span className="ml-auto text-xs bg-white px-2 py-0.5 rounded-full">
                {tasks.filter(t => t.statut === col.status).length}
              </span>
            </div>

            <div className="space-y-4">
              {tasks.filter(t => t.statut === col.status).map((task) => (
                <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="font-semibold text-gray-900">{task.titre}</h4>
                  <p className="text-sm text-gray-500 mt-1">{task.description || "Aucune description"}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">
                      {task.assigne_par?.prenom?.[0]}{task.assigne_par?.nom?.[0] || "?"}
                    </span>
                    <span>Assignée par {task.assigne_par ? `${task.assigne_par.prenom} ${task.assigne_par.nom}` : "Inconnu"}</span>
                  </div>
                  <div className="mt-3">
                    <select
                      value={task.statut}
                      onChange={(e) => updateStatus(task.id, e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded px-3 py-1.5 text-sm outline-none"
                    >
                      <option value="À faire">À faire</option>
                      <option value="En cours">En cours</option>
                      <option value="Terminée">Terminée</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}