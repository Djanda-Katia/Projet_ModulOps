import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getTickets } from "../services/api";

const PERIODS = [
  { value: '7j', label: '7 derniers jours' },
  { value: '30j', label: '30 derniers jours' },
  { value: '90j', label: '3 derniers mois' },
  { value: 'tout', label: 'Tout' },
];

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export default function TechnicianDashboard() {
  const { token } = useAuth();
  const [period, setPeriod] = useState('30j');
  const [stats, setStats] = useState({ total: 0, enCours: 0, resolus: 0, fermes: 0, ouverts: 0 });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async (p) => {
    if (!token) return;
    try {
      setLoading(true);
      // Charger tous les tickets (sans pagination pour les stats du dashboard)
      const params = new URLSearchParams({ per_page: 100 });
      if (p !== 'tout') params.set('periode', p);
      const res = await fetch(`${API_BASE}/api/tickets?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const tickets = data.data || (Array.isArray(data) ? data : []);

      setStats({
        total: tickets.length,
        ouverts: tickets.filter(t => t.statut === "Ouvert").length,
        enCours: tickets.filter(t => t.statut === "En cours").length,
        resolus: tickets.filter(t => t.statut === "Résolu").length,
        fermes: tickets.filter(t => t.statut === "Fermé").length,
      });
      setRecentTickets(tickets.slice(0, 6));
    } catch (err) {
      console.error("Erreur dashboard technicien:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(period); }, [token, period]);

  const statCards = [
    { label: "Total assignés", value: stats.total, color: "blue", icon: "assignment" },
    { label: "Ouverts", value: stats.ouverts, color: "indigo", icon: "inbox" },
    { label: "En cours", value: stats.enCours, color: "amber", icon: "pending_actions" },
    { label: "Résolus", value: stats.resolus, color: "green", icon: "task_alt" },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', text: 'text-blue-700' },
    indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-100 text-indigo-600', text: 'text-indigo-700' },
    amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', text: 'text-amber-700' },
    green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', text: 'text-green-700' },
  };

  const statusBadge = (s) => ({
    'Ouvert': 'bg-indigo-100 text-indigo-700',
    'En cours': 'bg-amber-100 text-amber-700',
    'Résolu': 'bg-green-100 text-green-700',
    'Fermé': 'bg-gray-100 text-gray-600',
  }[s] ?? 'bg-gray-100 text-gray-600');

  const prioriteBadge = (p) => ({
    'Haute': 'bg-red-100 text-red-700',
    'Moyenne': 'bg-blue-100 text-blue-700',
    'Basse': 'bg-gray-100 text-gray-500',
  }[p] ?? 'bg-gray-100 text-gray-500');

  return (
    <div className="space-y-6">
      {/* ── En-tête avec sélecteur de période ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-0.5">Vue d'ensemble de vos tickets assignés</p>
        </div>

        {/* Sélecteur de période */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                period === p.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => {
          const c = colorMap[card.color];
          return (
            <div key={card.label} className={`${c.bg} rounded-2xl p-5 flex flex-col gap-3 border border-white`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{card.label}</span>
                <div className={`w-9 h-9 rounded-xl ${c.icon} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
                </div>
              </div>
              <p className={`text-4xl font-black ${c.text}`}>
                {loading ? <span className="animate-pulse text-gray-300">—</span> : card.value}
              </p>
              <p className="text-xs text-gray-400">{PERIODS.find(p => p.value === period)?.label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Barre de progression ── */}
      {stats.total > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-700">Répartition des tickets</span>
            <span className="text-xs text-gray-400">{stats.total} ticket{stats.total > 1 ? 's' : ''} au total</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            {stats.ouverts > 0 && <div className="bg-indigo-400 transition-all" style={{ width: `${(stats.ouverts / stats.total) * 100}%` }} title={`Ouverts: ${stats.ouverts}`} />}
            {stats.enCours > 0 && <div className="bg-amber-400 transition-all" style={{ width: `${(stats.enCours / stats.total) * 100}%` }} title={`En cours: ${stats.enCours}`} />}
            {stats.resolus > 0 && <div className="bg-green-400 transition-all" style={{ width: `${(stats.resolus / stats.total) * 100}%` }} title={`Résolus: ${stats.resolus}`} />}
            {stats.fermes > 0 && <div className="bg-gray-300 transition-all" style={{ width: `${(stats.fermes / stats.total) * 100}%` }} title={`Fermés: ${stats.fermes}`} />}
          </div>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {[
              { label: 'Ouvert', color: 'bg-indigo-400', val: stats.ouverts },
              { label: 'En cours', color: 'bg-amber-400', val: stats.enCours },
              { label: 'Résolu', color: 'bg-green-400', val: stats.resolus },
              { label: 'Fermé', color: 'bg-gray-300', val: stats.fermes },
            ].map(item => (
              <span key={item.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                {item.label} ({item.val})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Tickets récents ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Tickets récents</h3>
          <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full font-medium">
            {PERIODS.find(p => p.value === period)?.label}
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Chargement...</div>
        ) : recentTickets.length === 0 ? (
          <div className="p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-300 block mb-2">inbox</span>
            <p className="text-gray-400 text-sm">Aucun ticket pour cette période</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Titre</th>
                  <th className="px-6 py-3">Priorité</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3">Demandeur</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTickets.map(ticket => {
                  const auteur = ticket.auteur || ticket.user;
                  const name = auteur ? `${auteur.prenom || ''} ${auteur.nom || ''}`.trim() : '—';
                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-semibold text-gray-900">{ticket.titre}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${prioriteBadge(ticket.priorite)}`}>{ticket.priorite}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusBadge(ticket.statut)}`}>{ticket.statut}</span>
                      </td>
                      <td className="px-6 py-3 text-gray-500">{name}</td>
                      <td className="px-6 py-3 text-gray-400 text-xs">
                        {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('fr-FR') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}