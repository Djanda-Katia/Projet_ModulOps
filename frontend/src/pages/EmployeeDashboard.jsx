import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { getDashboard } from "../services/api";

const PERIODS = [
  { value: '7j', label: '7 jours' },
  { value: '30j', label: '30 jours' },
  { value: '90j', label: '3 mois' },
  { value: 'tout', label: 'Tout' },
];

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export default function EmployeeDashboard() {
  const { user, token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('tout');

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
    if (token) fetchDashboard();
  }, [token]);

  if (loading) return <div className="text-center py-10 text-gray-400 animate-pulse">Chargement...</div>;
  if (!data) return <div>Erreur de chargement</div>;

  // Filtrer les tickets et congés selon la période
  const filterByPeriod = (items, dateField = 'created_at') => {
    if (!items || period === 'tout') return items || [];
    const days = period === '7j' ? 7 : period === '30j' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return items.filter(item => new Date(item[dateField]) >= cutoff);
  };

  const filteredConges = filterByPeriod(data.conges, 'date_debut');
  const filteredTickets = filterByPeriod(data.tickets);
  const filteredTaches = filterByPeriod(data.taches);


  return (
    <div className="space-y-6">
      {/* ── En-tête avec sélecteur de période ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm">Vue d'ensemble de votre activité</p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                period === p.value ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >{p.label}</button>
          ))}
        </div>
      </div>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Solde annuel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Solde annuel restant</p>
            {data.stats.solde_annuel_total > 0 ? (
              <h3 className="text-3xl font-bold text-gray-900">
                {data.stats.solde_annuel_restant}
                <span className="text-lg font-medium text-gray-400"> / {data.stats.solde_annuel_total} j</span>
              </h3>
            ) : (
              <h3 className="text-base font-semibold text-gray-400 mt-1">Non configuré</h3>
            )}
          </div>
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
          </div>
        </div>

        {/* Congés pris */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Congés annuels pris</p>
            <h3 className="text-3xl font-bold text-gray-900">{data.stats.jours_annuels_pris} <span className="text-lg font-medium text-gray-400">jours</span></h3>
          </div>
          <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>event_busy</span>
          </div>
        </div>

        {/* Congé maladie actif */}
        {(() => {
          const maladie = data.conges_actifs?.Maladie;
          return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Congé maladie</p>
                {maladie?.actif ? (
                  maladie.jours_restants === 0 ? (
                    <h3 className="text-xl font-bold text-amber-600">Dernier jour</h3>
                  ) : (
                    <h3 className="text-3xl font-bold text-gray-900">
                      {maladie.jours_restants}
                      <span className="text-lg font-medium text-gray-400"> j restants</span>
                    </h3>
                  )
                ) : (
                  <h3 className="text-sm font-semibold text-gray-400 mt-1">Aucun congé maladie</h3>
                )}
              </div>
              <div className={`p-3 rounded-lg ${maladie?.actif ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
              </div>
            </div>
          );
        })()}

        {/* Congé exceptionnel actif */}
        {(() => {
          const excep = data.conges_actifs?.Exceptionnel;
          return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Congé exceptionnel</p>
                {excep?.actif ? (
                  excep.jours_restants === 0 ? (
                    <h3 className="text-xl font-bold text-amber-600">Dernier jour</h3>
                  ) : (
                    <h3 className="text-3xl font-bold text-gray-900">
                      {excep.jours_restants}
                      <span className="text-lg font-medium text-gray-400"> j restants</span>
                    </h3>
                  )
                ) : (
                  <h3 className="text-sm font-semibold text-gray-400 mt-1">Aucun congé exceptionnel</h3>
                )}
              </div>
              <div className={`p-3 rounded-lg ${excep?.actif ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
            </div>
          );
        })()}

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
                {filteredConges.length > 0 ? (
                  filteredConges.map((conge) => (
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
                  <tr><td colSpan="3" className="px-4 py-3 text-center text-gray-500">Aucune demande sur cette période</td></tr>
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
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
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
                  <tr><td colSpan="3" className="px-4 py-3 text-center text-gray-500">Aucun ticket sur cette période</td></tr>
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
                {filteredTaches.length > 0 ? (
                  filteredTaches.map((tache) => (
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
                  <tr><td colSpan="2" className="px-4 py-3 text-center text-gray-500">Aucune tâche sur cette période</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}