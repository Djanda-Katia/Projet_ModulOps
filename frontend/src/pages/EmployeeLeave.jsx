import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getConges, soumettreConge, getDashboard } from "../services/api";

export default function EmployeeLeave() {
  const { user, token } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [conges, setConges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [solde, setSolde] = useState(0);

  // Formulaire
  const [form, setForm] = useState({
    type_conge: "Annuel",
    date_debut: "",
    date_fin: "",
    motif: "",
  });

  // Charger les données au démarrage (solde + historique)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // On fait les deux appels en parallèle
        const [congesData, dashboardData] = await Promise.all([
          getConges(token),
          getDashboard(token)
        ]);
        setConges(congesData);
        setSolde(dashboardData.stats.solde_conge);
      } catch (error) {
        console.error("Erreur chargement données:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  // Soumettre une nouvelle demande
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Envoi de la demande
      await soumettreConge(token, form);
      
      // 2. Recharger les deux données (solde et liste)
      const [newConges, newDashboard] = await Promise.all([
        getConges(token),
        getDashboard(token)
      ]);
      setConges(newConges);
      setSolde(newDashboard.stats.solde_conge);
      
      // 3. Fermer la modale et réinitialiser le formulaire
      setShowModal(false);
      setForm({
        type_conge: "Annuel",
        date_debut: "",
        date_fin: "",
        motif: "",
      });
    } catch (error) {
      console.error("Erreur soumission:", error);
      alert("Erreur : " + error.message);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-end">
        <p className="text-gray-500 text-sm">Gérez et suivez vos demandes de congés.</p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
        >
          <span className="material-symbols-outlined">add</span>
          + Nouvelle demande
        </button>
      </div>

      {/* Bannière solde (MAINTENANT DYNAMIQUE) */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Solde disponible</p>
            <p className="text-xl font-bold text-blue-900">{solde} jours</p>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-900">Historique de mes demandes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date début</th>
                <th className="px-6 py-4">Date fin</th>
                <th className="px-6 py-4 text-center">Jours</th>
                <th className="px-6 py-4">Motif</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Soumission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {conges.length > 0 ? (
                conges.map((conge) => {
                  const debut = new Date(conge.date_debut);
                  const fin = new Date(conge.date_fin);
                  const jours = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <tr key={conge.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">{conge.type_conge}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(conge.date_debut).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(conge.date_fin).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center font-bold">{jours}</td>
                      <td className="px-6 py-4 text-gray-500 italic">{conge.motif || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          conge.statut === "Approuvée" ? "bg-green-100 text-green-700" :
                          conge.statut === "Rejetée" ? "bg-red-100 text-red-700" :
                          "bg-amber-100 text-amber-800"
                        }`}>
                          {conge.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(conge.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Aucune demande de congé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-blue-600">Nouvelle demande de congé</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Type de congé</label>
                <select
                  value={form.type_conge}
                  onChange={(e) => setForm({ ...form, type_conge: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Annuel">Annuel</option>
                  <option value="Maladie">Maladie</option>
                  <option value="Exceptionnel">Exceptionnel</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Date de début</label>
                  <input
                    type="date"
                    value={form.date_debut}
                    onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Date de fin</label>
                  <input
                    type="date"
                    value={form.date_fin}
                    onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Motif (optionnel)</label>
                <textarea
                  value={form.motif}
                  onChange={(e) => setForm({ ...form, motif: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Veuillez préciser la raison de votre demande..."
                  rows="3"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md"
              >
                Envoyer la demande
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}