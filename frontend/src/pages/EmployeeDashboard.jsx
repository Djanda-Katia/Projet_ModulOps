import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { getDashboard } from "../services/api";
import PeriodSelector, { getPeriodApiParam } from "../components/PeriodSelector";

const PERIOD_LABELS = {
  today: "Aujourd'hui", week: 'Cette semaine', '7j': '7 derniers jours',
  '30j': '30 derniers jours', '6m': '6 derniers mois', year: 'Cette année',
  last_year: 'Année précédente'
};

export default function EmployeeDashboard() {
  const { user, token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30j');

  const fetchDashboard = useCallback(async (currentPeriod) => {
    try {
      setLoading(true);
      const apiParams = getPeriodApiParam(currentPeriod);
      const result = await getDashboard(token, apiParams);
      setData(result);
    } catch (error) {
      console.error("Erreur dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchDashboard(period);
  }, [token, period, fetchDashboard]);

  if (loading) return <div className="text-center py-10 text-gray-400 animate-pulse font-medium">Chargement des statistiques...</div>;
  if (!data) return <div className="text-center py-10 text-red-500 font-medium">Erreur de chargement du tableau de bord</div>;

  // Données déjà filtrées par le backend
  const filteredConges = data.conges ?? [];
  const filteredTickets = data.tickets ?? [];
  const filteredTaches = data.taches ?? [];

  const statsTickets = {
    total: filteredTickets.length,
    ouverts: filteredTickets.filter(t => t.statut === 'Ouvert').length,
    enCours: filteredTickets.filter(t => t.statut === 'En cours').length,
    resolus: filteredTickets.filter(t => t.statut === 'Résolu').length,
    fermes: filteredTickets.filter(t => t.statut === 'Fermé').length,
  };

  const statsTaches = {
    total: filteredTaches.length,
    aFaire: filteredTaches.filter(t => t.statut === 'À faire').length,
    enCours: filteredTaches.filter(t => t.statut === 'En cours').length,
    terminees: filteredTaches.filter(t => ['Terminée', 'Fermée'].includes(t.statut)).length,
  };

  const statusBadge = (s) => ({
    'Ouvert': 'bg-indigo-100 text-indigo-700',
    'En cours': 'bg-amber-100 text-amber-700',
    'Résolu': 'bg-green-100 text-green-700',
    'Fermé': 'bg-gray-100 text-gray-600',
    'À faire': 'bg-gray-100 text-gray-600',
    'Terminée': 'bg-green-100 text-green-700',
  }[s] ?? 'bg-gray-100 text-gray-600');

  const prioriteBadge = (p) => ({
    'Haute': 'bg-red-100 text-red-700',
    'Moyenne': 'bg-blue-100 text-blue-700',
    'Basse': 'bg-gray-100 text-gray-500',
  }[p] ?? 'bg-gray-100 text-gray-500');

  const congeStatutBadge = (s) => ({
    'En attente': 'bg-amber-100 text-amber-800',
    'Approuvée':  'bg-green-100 text-green-800',
    'Rejetée':   'bg-red-100 text-red-800',
    'Annulée':   'bg-gray-100 text-gray-500 line-through',
  }[s] ?? 'bg-gray-100 text-gray-600');

  return (
    <div className="space-y-6">
      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mon Tableau de Bord</h1>
          <p className="text-gray-500 text-sm mt-0.5">Vue d'ensemble de votre activité et de vos requêtes</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} compact />
      </div>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Solde annuel */}
        <div className="bg-blue-50 rounded-2xl p-5 flex flex-col gap-3 border border-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Solde Annuel</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
            </div>
          </div>
          {data.stats.solde_annuel_total > 0 ? (
            <p className="text-4xl font-black text-blue-700 flex items-baseline gap-1">
              {data.stats.solde_annuel_restant}
              <span className="text-lg font-medium text-blue-400">/ {data.stats.solde_annuel_total}</span>
            </p>
          ) : (
             <p className="text-lg font-bold text-gray-400 mt-2">Non configuré</p>
          )}
          <p className="text-xs text-gray-400">Jours de congés restants</p>
        </div>

        {/* Congés pris */}
        <div className="bg-orange-50 rounded-2xl p-5 flex flex-col gap-3 border border-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Congés Annuels Pris</span>
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>event_busy</span>
            </div>
          </div>
          <p className="text-4xl font-black text-orange-700">{data.stats.jours_annuels_pris}</p>
          <p className="text-xs text-gray-400">Jours annuels consommés</p>
        </div>

        {/* Tâches actives */}
        <div className="bg-indigo-50 rounded-2xl p-5 flex flex-col gap-3 border border-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tâches actives</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
            </div>
          </div>
          <p className="text-4xl font-black text-indigo-700">{statsTaches.enCours + statsTaches.aFaire}</p>
          <p className="text-xs text-gray-400">{typeof period === 'object' ? 'Période personnalisée' : PERIOD_LABELS[period]}</p>
        </div>
      </div>

      {/* --- PROGRESS BARS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statsTickets.total > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-700">Répartition de vos tickets</span>
              <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-1 rounded-full">{typeof period === 'object' ? 'Période personnalisée' : PERIOD_LABELS[period]}</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
              {statsTickets.ouverts > 0 && <div className="bg-indigo-400 transition-all" style={{ width: `${(statsTickets.ouverts / statsTickets.total) * 100}%` }} />}
              {statsTickets.enCours > 0 && <div className="bg-amber-400 transition-all" style={{ width: `${(statsTickets.enCours / statsTickets.total) * 100}%` }} />}
              {statsTickets.resolus > 0 && <div className="bg-green-400 transition-all" style={{ width: `${(statsTickets.resolus / statsTickets.total) * 100}%` }} />}
              {statsTickets.fermes > 0 && <div className="bg-gray-300 transition-all" style={{ width: `${(statsTickets.fermes / statsTickets.total) * 100}%` }} />}
            </div>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {[
                { label: 'Ouvert', color: 'bg-indigo-400', val: statsTickets.ouverts },
                { label: 'En cours', color: 'bg-amber-400', val: statsTickets.enCours },
                { label: 'Résolu', color: 'bg-green-400', val: statsTickets.resolus },
                { label: 'Fermé', color: 'bg-gray-300', val: statsTickets.fermes },
              ].map(item => (
                <span key={item.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  {item.label} ({item.val})
                </span>
              ))}
            </div>
          </div>
        )}

        {statsTaches.total > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-700">Progression de vos tâches</span>
              <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-1 rounded-full">{typeof period === 'object' ? 'Période personnalisée' : PERIOD_LABELS[period]}</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
              {statsTaches.aFaire > 0 && <div className="bg-gray-300 transition-all" style={{ width: `${(statsTaches.aFaire / statsTaches.total) * 100}%` }} />}
              {statsTaches.enCours > 0 && <div className="bg-blue-400 transition-all" style={{ width: `${(statsTaches.enCours / statsTaches.total) * 100}%` }} />}
              {statsTaches.terminees > 0 && <div className="bg-green-400 transition-all" style={{ width: `${(statsTaches.terminees / statsTaches.total) * 100}%` }} />}
            </div>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {[
                { label: 'À faire', color: 'bg-gray-300', val: statsTaches.aFaire },
                { label: 'En cours', color: 'bg-blue-400', val: statsTaches.enCours },
                { label: 'Terminées', color: 'bg-green-400', val: statsTaches.terminees },
              ].map(item => (
                <span key={item.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  {item.label} ({item.val})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Congés */}
        {(() => {
          const today = new Date(); today.setHours(0,0,0,0);
          // Actifs = en attente ou approuvés dont la date de fin >= aujourd'hui
          const congesActifsListe = data.conges.filter(c =>
            c.statut === 'En attente' ||
            (c.statut === 'Approuvée' && new Date(c.date_fin) >= today)
          );
          // Historique = tout le reste (passés, rejetés, annulés)
          const congesHistorique = data.conges.filter(c =>
            c.statut === 'Rejetée' ||
            c.statut === 'Annulée' ||
            (c.statut === 'Approuvée' && new Date(c.date_fin) < today)
          );

          const renderRow = (conge) => (
            <tr key={conge.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3 font-semibold text-gray-800 text-sm">{conge.type_conge}</td>
              <td className="px-5 py-3 text-gray-500 text-xs">
                {new Date(conge.date_debut).toLocaleDateString('fr-FR')} → {new Date(conge.date_fin).toLocaleDateString('fr-FR')}
              </td>
              <td className="px-5 py-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${congeStatutBadge(conge.statut)}`}>
                  {conge.statut}
                </span>
              </td>
            </tr>
          );

          return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Actifs / À venir */}
              <div className="px-6 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-sm font-bold text-gray-900">Congés actifs / à venir</h3>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{congesActifsListe.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-2.5">Type</th>
                      <th className="px-5 py-2.5">Période</th>
                      <th className="px-5 py-2.5">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {congesActifsListe.length > 0
                      ? congesActifsListe.map(renderRow)
                      : <tr><td colSpan="3" className="px-6 py-6 text-center text-gray-400 text-sm">Aucun congé actif ou à venir</td></tr>
                    }
                  </tbody>
                </table>
              </div>

              {/* Historique */}
              {congesHistorique.length > 0 && (
                <>
                  <div className="px-6 py-3 border-t border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Historique</h3>
                    <span className="text-xs text-gray-400">{congesHistorique.length} entrée{congesHistorique.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <tbody className="divide-y divide-gray-100">
                        {congesHistorique.slice(0, 5).map(renderRow)}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          );
        })()}


        {/* Tickets */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-900">Tickets récents</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{PERIOD_LABELS[period]}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Titre</th>
                  <th className="px-6 py-3">Priorité</th>
                  <th className="px-6 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredTickets.length > 0 ? (
                  filteredTickets.slice(0, 5).map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-semibold text-gray-800 truncate max-w-[150px]">{ticket.titre}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${prioriteBadge(ticket.priorite)}`}>
                          {ticket.priorite}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusBadge(ticket.statut)}`}>
                          {ticket.statut}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-400">Aucun ticket sur cette période</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}