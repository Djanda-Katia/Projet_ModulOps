import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getManagerDashboard } from "../services/api";
import { useNavigate } from "react-router-dom";
import PeriodSelector, { filterByPeriod, getPeriodApiParam } from "../components/PeriodSelector";

const PERIOD_LABELS = {
  today: "Aujourd'hui", week: 'Cette semaine', '7j': '7 derniers jours',
  '30j': '30 derniers jours', '6m': '6 derniers mois', year: 'Cette année',
  last_year: 'Année précédente'
};

export default function ManagerDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signalements, setSignalements] = useState([]);
  const [period, setPeriod] = useState('30j');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const apiParams = getPeriodApiParam(period);
        const result = await getManagerDashboard(token, apiParams);
        setData(result);
        setSignalements(result.signalements_non_lus ?? []);
      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchDashboard();
  }, [token, period]);

  if (loading) return <div className="text-center py-10 text-gray-400 animate-pulse font-medium">Chargement des statistiques...</div>;
  if (!data) return <div className="text-center py-10 text-red-500 font-medium">Erreur de chargement du tableau de bord</div>;

  const { nb_conges_en_attente, conges_en_attente, suivi_equipe } = data;

  // Données déjà filtrées par le backend
  const filteredConges = conges_en_attente ?? [];
  const filteredSuiviEquipe = suivi_equipe ?? [];

  const totalTasksEnCours = filteredSuiviEquipe.reduce((sum, emp) => sum + (emp.taches_stats?.en_cours ?? 0), 0);
  const totalTasksTerminees = filteredSuiviEquipe.reduce((sum, emp) => sum + (emp.taches_stats?.terminees ?? 0), 0);
  const totalTasksAFaire = filteredSuiviEquipe.reduce((sum, emp) => sum + (emp.taches_stats?.a_faire ?? 0), 0);
  const totalTasks = totalTasksEnCours + totalTasksTerminees + totalTasksAFaire;

  return (
    <div className="space-y-6">

      {/* ── En-tête avec sélecteur de période ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Manager</h1>
          <p className="text-gray-500 text-sm mt-0.5">Vue d'ensemble de votre équipe et de leurs requêtes</p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} compact />
      </div>

      {/* ===== BANNIÈRE : Signalements ===== */}
      {signalements.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm relative">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-500 text-2xl mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>notification_important</span>
            <div>
              <p className="font-bold text-amber-800 text-sm">
                {signalements.length} signalement{signalements.length > 1 ? 's' : ''} — Congés annuels non configurés
              </p>
              <ul className="mt-1 space-y-0.5">
                {signalements.map(s => (
                  <li key={s.id} className="text-amber-700 text-sm">{s.message}</li>
                ))}
              </ul>
            </div>
          </div>
          <button
            onClick={() => navigate('/manager-leave-config')}
            className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm whitespace-nowrap"
          >
            Configurer maintenant
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-2xl p-5 flex flex-col gap-3 border border-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Congés en attente</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
            </div>
          </div>
          <p className="text-4xl font-black text-blue-700">{filteredConges.length}</p>
          <p className="text-xs text-gray-400">Demandes à valider</p>
        </div>

        <div className="bg-indigo-50 rounded-2xl p-5 flex flex-col gap-3 border border-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Équipe</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
            </div>
          </div>
          <p className="text-4xl font-black text-indigo-700">{suivi_equipe.length}</p>
          <p className="text-xs text-gray-400">Employés actifs supervisés</p>
        </div>

        <div className="bg-amber-50 rounded-2xl p-5 flex flex-col gap-3 border border-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tâches en cours</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>engineering</span>
            </div>
          </div>
          <p className="text-4xl font-black text-amber-700">{totalTasksEnCours}</p>
          <p className="text-xs text-gray-400">Dans toute l'équipe</p>
        </div>

        <div className="bg-green-50 rounded-2xl p-5 flex flex-col gap-3 border border-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tâches terminées</span>
            <div className="w-9 h-9 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
            </div>
          </div>
          <p className="text-4xl font-black text-green-700">{totalTasksTerminees}</p>
          <p className="text-xs text-gray-400">Tâches accomplies</p>
        </div>
      </div>

      {/* --- BARRE DE PROGRESSION TÂCHES ÉQUIPE --- */}
      {totalTasks > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-700">Répartition des tâches de l'équipe</span>
            <span className="text-xs text-gray-400">{totalTasks} total</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            {totalTasksAFaire > 0 && <div className="bg-gray-300 transition-all" style={{ width: `${(totalTasksAFaire / totalTasks) * 100}%` }} title={`À faire: ${totalTasksAFaire}`} />}
            {totalTasksEnCours > 0 && <div className="bg-amber-400 transition-all" style={{ width: `${(totalTasksEnCours / totalTasks) * 100}%` }} title={`En cours: ${totalTasksEnCours}`} />}
            {totalTasksTerminees > 0 && <div className="bg-green-400 transition-all" style={{ width: `${(totalTasksTerminees / totalTasks) * 100}%` }} title={`Terminées: ${totalTasksTerminees}`} />}
          </div>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {[
              { label: 'À faire', color: 'bg-gray-300', val: totalTasksAFaire },
              { label: 'En cours', color: 'bg-amber-400', val: totalTasksEnCours },
              { label: 'Terminées', color: 'bg-green-400', val: totalTasksTerminees },
            ].map(item => (
              <span key={item.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                {item.label} ({item.val})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Leave Requests */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-gray-900 text-sm">Demandes de congé en attente</h3>
              <span className="text-xs text-gray-400 bg-white border border-gray-200 px-2.5 py-1 rounded-full font-medium shadow-sm">
                {PERIOD_LABELS[period]}
              </span>
            </div>
            <button onClick={() => navigate('/manager-leave')} className="text-blue-600 text-xs font-bold hover:underline">Gérer tout</button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Employé</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3 text-center">Jours</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredConges.length > 0 ? (
                  filteredConges.slice(0, 6).map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 font-semibold text-gray-800">
                        {req.user.prenom} {req.user.nom}
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        <span className="block">{req.type_conge}</span>
                        <span className="text-[10px] text-gray-400">{new Date(req.date_debut).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-3 font-bold text-center text-gray-700">
                        {Math.ceil((new Date(req.date_fin) - new Date(req.date_debut)) / (1000 * 60 * 60 * 24)) + 1}
                      </td>
                      <td className="px-6 py-3 text-center">
                         <button
                           onClick={() => navigate('/manager-leave')}
                           className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                         >
                           Voir
                         </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                      Aucune demande en attente
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Team Follow-up */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-sm">Suivi de l'équipe</h3>
            <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full font-medium">
              {PERIOD_LABELS[period]}
            </span>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-1 custom-scrollbar">
            {filteredSuiviEquipe.map((member) => (
              <div key={member.id} className="p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow bg-gray-50/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    {member.prenom[0]}{member.nom[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{member.prenom} {member.nom}</p>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider">{member.fonction}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                   <div className="bg-gray-100/80 rounded-lg p-2 text-center">
                     <p className="text-[10px] text-gray-500 font-semibold uppercase">À faire</p>
                     <p className="text-lg font-bold text-gray-700 leading-none mt-1">{member.taches_stats.a_faire}</p>
                   </div>
                   <div className="bg-amber-50 rounded-lg p-2 text-center">
                     <p className="text-[10px] text-amber-600 font-semibold uppercase">En cours</p>
                     <p className="text-lg font-bold text-amber-700 leading-none mt-1">{member.taches_stats.en_cours}</p>
                   </div>
                   <div className="bg-green-50 rounded-lg p-2 text-center">
                     <p className="text-[10px] text-green-600 font-semibold uppercase">Terminées</p>
                     <p className="text-lg font-bold text-green-700 leading-none mt-1">{member.taches_stats.terminees}</p>
                   </div>
                   <div className="bg-blue-50 rounded-lg p-2 text-center">
                     <p className="text-[10px] text-blue-600 font-semibold uppercase">Congés Pris</p>
                     <p className="text-lg font-bold text-blue-700 leading-none mt-1">{member.jours_conges_pris}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}