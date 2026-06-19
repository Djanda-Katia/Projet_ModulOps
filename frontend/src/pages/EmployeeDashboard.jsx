import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { getDashboard } from "../services/api";

export default function EmployeeDashboard() {
  const { user, token } = useAuth(); // On récupère le token et l'utilisateur
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await getDashboard(token);
        setData(result);
      } catch (error) {
        console.error("Erreur dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboard();
    }
  }, [token]);

  if (loading) return <div>Chargement...</div>;
  if (!data) return <div>Erreur de chargement</div>;

  return (
    <div className="space-y-8">
      {/* --- STAT CARDS (Maintenant dynamiques) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Solde de congés</p>
            <h3 className="text-3xl font-bold text-gray-900">{data.stats.solde_conge} jours</h3>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Congés pris</p>
            <h3 className="text-3xl font-bold text-gray-900">{data.stats.jours_conges_pris} jours</h3>
          </div>
          <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>event_busy</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Tickets ouverts</p>
            <h3 className="text-3xl font-bold text-gray-900">{data.stats.tickets_ouverts}</h3>
          </div>
          <div className="p-3 bg-red-100 rounded-lg text-red-600">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Tâches en cours</p>
            <h3 className="text-3xl font-bold text-gray-900">{data.stats.taches_en_cours}</h3>
          </div>
          <div className="p-3 bg-green-100 rounded-lg text-green-600">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
          </div>
        </div>
      </div>

      {/* --- MAIN GRID (Tableaux dynamiques) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Congés */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-900">Mes dernières demandes de congé</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Dates</th>
                  <th className="px-4 py-2">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {data.conges && data.conges.length > 0 ? (
                  data.conges.map((conge) => (
                    <tr key={conge.id}>
                      <td className="px-4 py-3">{conge.type_conge}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(conge.date_debut).toLocaleDateString()} - {new Date(conge.date_fin).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          conge.statut === "En attente" ? "bg-amber-100 text-amber-800" :
                          conge.statut === "Approuvée" ? "bg-green-100 text-green-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {conge.statut}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" className="px-4 py-3 text-center text-gray-500">Aucune demande</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tickets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-900">Mes tickets récents</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2">Titre</th>
                  <th className="px-4 py-2">Priorité</th>
                  <th className="px-4 py-2">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {data.tickets && data.tickets.length > 0 ? (
                  data.tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="px-4 py-3 font-semibold">{ticket.titre}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          ticket.priorite === "Haute" ? "bg-red-100 text-red-700" :
                          ticket.priorite === "Moyenne" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {ticket.priorite}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          ticket.statut === "Ouvert" ? "bg-blue-100 text-blue-700" :
                          ticket.statut === "En cours" ? "bg-amber-100 text-amber-700" :
                          ticket.statut === "Résolu" ? "bg-purple-100 text-purple-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {ticket.statut}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" className="px-4 py-3 text-center text-gray-500">Aucun ticket</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tâches */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-900">Mes tâches récentes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2">Titre</th>
                  <th className="px-4 py-2">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {data.taches && data.taches.length > 0 ? (
                  data.taches.map((tache) => (
                    <tr key={tache.id}>
                      <td className="px-4 py-3 font-semibold">{tache.titre}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          tache.statut === "À faire" ? "bg-gray-100 text-gray-600" :
                          tache.statut === "En cours" ? "bg-blue-100 text-blue-700" :
                          tache.statut === "Terminée" || tache.statut === "Fermée" ? "bg-green-100 text-green-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {tache.statut}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="2" className="px-4 py-3 text-center text-gray-500">Aucune tâche</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}