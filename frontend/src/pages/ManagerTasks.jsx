import { useState } from "react";

export default function ManagerTasks() {
  const tasks = [
    { id: 1, title: "Rapport Trimestriel Q2", desc: "Compilation des données.", assignee: "ME", status: "Terminée" },
    { id: 2, title: "Mise à jour Onboarding", desc: "Révision du parcours.", assignee: "JK", status: "En cours" },
    { id: 3, title: "Maintenance Serveur", desc: "Vérification hebdomadaire.", assignee: "SA", status: "À faire" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Tâches</h1>
          <p className="text-gray-500 text-sm">Créez et assignez des tâches aux employés de votre équipe.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">+ CRÉER UNE TÂCHE</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">Titre</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Assigné à</th>
              <th className="px-6 py-3">Statut</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-semibold">{task.title}</td>
                <td className="px-6 py-3 text-gray-500 truncate max-w-[150px]">{task.desc}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">{task.assignee}</div>
                    <span className="text-gray-600">{task.assignee === "ME" ? "Marie Ewondo" : task.assignee === "JK" ? "Jean Kamga" : "Sophie Atangana"}</span>
                  </div>
                </td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    task.status === "Terminée" ? "bg-orange-100 text-orange-700" :
                    task.status === "En cours" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>{task.status}</span>
                </td>
                <td className="px-6 py-3">
                  {task.status === "Terminée" ? (
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold uppercase">VALIDER ET FERMER</button>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}