import { useState } from "react";

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Rapport Q3", desc: "Compiler les données financières.", assignedBy: "Paul Tchinda", status: "À faire" },
    { id: 2, title: "Update Sécurité IT", desc: "Suivre le module de formation.", assignedBy: "Paul Tchinda", status: "À faire" },
    { id: 3, title: "Audit Paie", desc: "Vérification des écarts.", assignedBy: "Paul Tchinda", status: "En cours" },
    { id: 4, title: "Entretien Onboarding", desc: "Préparer l'arrivée du stagiaire.", assignedBy: "Paul Tchinda", status: "Terminée" },
  ]);

  const updateStatus = (id, newStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const columns = [
    { status: "À faire", color: "gray", bg: "bg-gray-100" },
    { status: "En cours", color: "blue", bg: "bg-blue-100" },
    { status: "Terminée", color: "green", bg: "bg-green-100" },
  ];

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
                {tasks.filter(t => t.status === col.status).length}
              </span>
            </div>

            <div className="space-y-4">
              {tasks.filter(t => t.status === col.status).map((task) => (
                <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h4 className="font-semibold text-gray-900">{task.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{task.desc}</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">PT</span>
                    <span>Assignée par {task.assignedBy}</span>
                  </div>
                  <div className="mt-3">
                    <select
                      value={task.status}
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