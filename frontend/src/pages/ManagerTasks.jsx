import { useState } from "react";

export default function ManagerTasks() {
  const [showModal, setShowModal] = useState(false);

  const [tasks, setTasks] = useState([
    { id: 1, title: "Maintenance Serveur", desc: "Vérification hebdomadaire.", assignee: "Sophie Atangana", initials: "SA", status: "À faire" },
    { id: 2, title: "Mise à jour Onboarding", desc: "Révision du parcours.", assignee: "Jean Kamga", initials: "JK", status: "En cours" },
    { id: 3, title: "Rapport Trimestriel Q2", desc: "Compilation des données.", assignee: "Marie Ewondo", initials: "ME", status: "Terminée" }, // En attente de validation
  ]);

  // Action déclenchée par l'employé (la tâche passe en "Terminée")
  const handleEmployeeComplete = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status: "Terminée" } : task
    ));
  };

  // Action du responsable : VALIDER (Fermer définitivement)
  const handleValidateAndClose = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status: "Fermée" } : task
    ));
  };

  // Action du responsable : ANNULER (Rouvrir la tâche)
  const handleRejectAndReopen = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status: "En cours" } : task
    ));
  };

  // Séparation des tâches selon le nouveau flux
  const todoTasks = tasks.filter(t => t.status === "À faire");
  const ongoingTasks = tasks.filter(t => t.status === "En cours");
  const pendingTasks = tasks.filter(t => t.status === "Terminée"); // En attente de validation
  const closedTasks = tasks.filter(t => t.status === "Fermée");

  return (
    <div className="space-y-8">
      {/* ── EN-TÊTE ── */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Tâches</h1>
          <p className="text-gray-500 text-sm">Créez et assignez des tâches aux employés de votre équipe.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          + CRÉER UNE TÂCHE
        </button>
      </div>

      {/* ── CONTENEUR 1 : TÂCHES ACTIVES (À faire / En cours) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* À faire */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-100/50">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            <h3 className="text-sm font-bold text-gray-700">À faire</h3>
            <span className="ml-auto text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">
              {todoTasks.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Titre</th>
                  <th className="px-6 py-3">Assigné à</th>
                  <th className="px-6 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {todoTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-semibold">{task.title}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">{task.initials}</div>
                        <span className="text-gray-600">{task.assignee}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-bold">À faire</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* En cours */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-blue-50/50">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <h3 className="text-sm font-bold text-blue-700">En cours</h3>
            <span className="ml-auto text-xs bg-blue-100 px-2 py-0.5 rounded-full text-blue-600">
              {ongoingTasks.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Titre</th>
                  <th className="px-6 py-3">Assigné à</th>
                  <th className="px-6 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ongoingTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-semibold">{task.title}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center text-xs font-bold text-blue-600">{task.initials}</div>
                        <span className="text-gray-600">{task.assignee}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">En cours</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── CONTENEUR 2 : VALIDATION (Terminée) ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-orange-50/50">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          <h3 className="text-sm font-bold text-orange-700">En attente de validation</h3>
          <span className="ml-auto text-xs bg-orange-100 px-2 py-0.5 rounded-full text-orange-600">
            {pendingTasks.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Titre</th>
                <th className="px-6 py-3">Assigné à</th>
                <th className="px-6 py-3">Statut actuel</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-semibold">{task.title}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-orange-200 flex items-center justify-center text-xs font-bold text-orange-600">{task.initials}</div>
                      <span className="text-gray-600">{task.assignee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold">Terminée</span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleValidateAndClose(task.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold uppercase transition-colors"
                      >
                        VALIDER
                      </button>
                      <button
                        onClick={() => handleRejectAndReopen(task.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold uppercase transition-colors"
                      >
                        ANNULER
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CONTENEUR 3 : FERMÉES ── */}
      {closedTasks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden opacity-70">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-100/50">
            <span className="w-2 h-2 rounded-full bg-gray-600"></span>
            <h3 className="text-sm font-bold text-gray-600">Historique (Fermées)</h3>
            <span className="ml-auto text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">
              {closedTasks.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Titre</th>
                  <th className="px-6 py-3">Assigné à</th>
                  <th className="px-6 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {closedTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-semibold text-gray-600">{task.title}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">{task.initials}</div>
                        <span className="text-gray-500">{task.assignee}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-600 text-xs font-bold">Fermée</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODALE CRÉER UNE TÂCHE ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-blue-600">Créer une tâche</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Titre de la tâche</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Rapport de fin de mois" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Description</label>
                <textarea className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Détaillez la mission..." rows="3"></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Assigner à</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none h-24" multiple>
                  <option value="marie">Marie Ewondo</option>
                  <option value="jean">Jean Kamga</option>
                  <option value="sophie">Sophie Atangana</option>
                </select>
                <p className="text-xs text-gray-400 mt-2 italic">Maintenez Ctrl/Cmd pour sélectionner plusieurs employés.</p>
              </div>
              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg transition-colors uppercase"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors uppercase"
                >
                  Créer la tâche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}