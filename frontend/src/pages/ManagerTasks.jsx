import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllTasks, createTask, validateTask, cancelTask, getEmployes } from "../services/api";

export default function ManagerTasks() {
  const { token } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulaire de création
  const [form, setForm] = useState({
    titre: "",
    description: "",
    employes_ids: [],
  });

  // Charger toutes les tâches (pour le responsable) ET la liste des employés
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, employesData] = await Promise.all([
          getAllTasks(token),     // <-- Remplace getMyTasks par getAllTasks
          getEmployes(token),
        ]);
        setTasks(tasksData);
        setEmployes(employesData);
      } catch (error) {
        console.error("Erreur chargement données:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, []);

  // Créer une tâche
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createTask(token, form);
      // Recharger la liste après création
      const updated = await getAllTasks(token);
      setTasks(updated);
      setShowModal(false);
      setForm({ titre: "", description: "", employes_ids: [] });
    } catch (error) {
      console.error("Erreur création tâche:", error);
    }
  };

  // Valider et fermer
  const handleValidateAndClose = async (id) => {
    try {
      await validateTask(token, id);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, statut: "Fermée" } : t));
    } catch (error) {
      console.error("Erreur validation:", error);
    }
  };

  // Annuler et rouvrir
  const handleRejectAndReopen = async (id) => {
    try {
      await cancelTask(token, id);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, statut: "En cours" } : t));
    } catch (error) {
      console.error("Erreur annulation:", error);
    }
  };

  const todoTasks = tasks.filter(t => t.statut === "À faire");
  const ongoingTasks = tasks.filter(t => t.statut === "En cours");
  const pendingTasks = tasks.filter(t => t.statut === "Terminée");
  const closedTasks = tasks.filter(t => t.statut === "Fermée");

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Tâches</h1>
          <p className="text-gray-500 text-sm">Créez et assignez des tâches aux employés de votre équipe.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md transition-all">
          <span className="material-symbols-outlined">add</span> + CRÉER UNE TÂCHE
        </button>
      </div>

      {/* CONTENEUR 1 : TÂCHES ACTIVES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* À faire */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-100/50">
            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
            <h3 className="text-sm font-bold text-gray-700">À faire</h3>
            <span className="ml-auto text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">{todoTasks.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr><th className="px-6 py-3">Titre</th><th className="px-6 py-3">Assigné à</th><th className="px-6 py-3">Statut</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {todoTasks.map(t => (
                  <tr key={t.id}>
                    <td className="px-6 py-3 font-semibold">{t.titre}</td>
                    <td className="px-6 py-3">
                      {t.employes && t.employes.length > 0 ? (
                        <span className="text-gray-600">{t.employes.map(e => `${e.prenom} ${e.nom}`).join(", ")}</span>
                      ) : (
                        <span className="text-gray-400 italic">Non assigné</span>
                      )}
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
            <span className="ml-auto text-xs bg-blue-100 px-2 py-0.5 rounded-full text-blue-600">{ongoingTasks.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr><th className="px-6 py-3">Titre</th><th className="px-6 py-3">Assigné à</th><th className="px-6 py-3">Statut</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ongoingTasks.map(t => (
                  <tr key={t.id}>
                    <td className="px-6 py-3 font-semibold">{t.titre}</td>
                    <td className="px-6 py-3">
                      {t.employes && t.employes.length > 0 ? (
                        <span className="text-gray-600">{t.employes.map(e => `${e.prenom} ${e.nom}`).join(", ")}</span>
                      ) : (
                        <span className="text-gray-400 italic">Non assigné</span>
                      )}
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

      {/* CONTENEUR 2 : VALIDATION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-orange-50/50">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          <h3 className="text-sm font-bold text-orange-700">En attente de validation</h3>
          <span className="ml-auto text-xs bg-orange-100 px-2 py-0.5 rounded-full text-orange-600">{pendingTasks.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr><th className="px-6 py-3">Titre</th><th className="px-6 py-3">Assigné à</th><th className="px-6 py-3">Statut</th><th className="px-6 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingTasks.map(t => (
                <tr key={t.id}>
                  <td className="px-6 py-3 font-semibold">{t.titre}</td>
                  <td className="px-6 py-3">
                    {t.employes && t.employes.length > 0 ? (
                      <span className="text-gray-600">{t.employes.map(e => `${e.prenom} ${e.nom}`).join(", ")}</span>
                    ) : (
                      <span className="text-gray-400 italic">Non assigné</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold">Terminée</span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleValidateAndClose(t.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold uppercase">VALIDER</button>
                      <button onClick={() => handleRejectAndReopen(t.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-bold uppercase">ANNULER</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONTENEUR 3 : FERMÉES */}
      {closedTasks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden opacity-70">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-100/50">
            <span className="w-2 h-2 rounded-full bg-gray-600"></span>
            <h3 className="text-sm font-bold text-gray-600">Historique (Fermées)</h3>
            <span className="ml-auto text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">{closedTasks.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr><th className="px-6 py-3">Titre</th><th className="px-6 py-3">Assigné à</th><th className="px-6 py-3">Statut</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {closedTasks.map(t => (
                  <tr key={t.id}>
                    <td className="px-6 py-3 font-semibold text-gray-600">{t.titre}</td>
                    <td className="px-6 py-3">
                      {t.employes && t.employes.length > 0 ? (
                        <span className="text-gray-500">{t.employes.map(e => `${e.prenom} ${e.nom}`).join(", ")}</span>
                      ) : (
                        <span className="text-gray-400 italic">Non assigné</span>
                      )}
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

      {/* MODALE CRÉER UNE TÂCHE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-blue-600">Créer une tâche</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleCreate}>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Titre</label>
                <input type="text" value={form.titre} onChange={e => setForm({...form, titre: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows="3"></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Assigner à</label>
                <select multiple value={form.employes_ids} onChange={e => setForm({...form, employes_ids: Array.from(e.target.selectedOptions, o => Number(o.value))})} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none h-24">
                  {employes.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
                </select>
                <p className="text-xs text-gray-400 mt-2 italic">Maintenez Ctrl/Cmd pour sélectionner plusieurs employés.</p>
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg">Annuler</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">Créer la tâche</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}