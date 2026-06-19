import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getManagerDashboard } from "../services/api";

export default function ManagerDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await getManagerDashboard(token);
        setData(result);
      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
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

  const { nb_conges_en_attente, conges_en_attente, suivi_equipe } = data;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Bonjour, Paul Tchinda !</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Congés en attente</p>
          <h3 className="text-3xl font-bold text-gray-900">{nb_conges_en_attente}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Employés actifs</p>
          <h3 className="text-3xl font-bold text-gray-900">{suivi_equipe.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Tâches en cours</p>
          <h3 className="text-3xl font-bold text-gray-900">
            {suivi_equipe.reduce((sum, emp) => sum + emp.taches_stats.en_cours, 0)}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Tâches terminées</p>
          <h3 className="text-3xl font-bold text-gray-900">
            {suivi_equipe.reduce((sum, emp) => sum + emp.taches_stats.terminees, 0)}
          </h3>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Leave Requests */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between">
            <h3 className="font-bold text-gray-900">Demandes de congé en attente</h3>
            <button className="text-blue-600 text-sm font-semibold hover:underline">Voir tout</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Employé</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Jours</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {conges_en_attente.length > 0 ? (
                  conges_en_attente.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">
                        {req.user.prenom} {req.user.nom}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{req.type_conge}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(req.date_debut).toLocaleDateString()} - {new Date(req.date_fin).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-bold text-center">
                        {Math.ceil((new Date(req.date_fin) - new Date(req.date_debut)) / (1000 * 60 * 60 * 24)) + 1}
                      </td>
                      <td className="px-4 py-3 text-center space-x-2">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold uppercase"
                          onClick={() => {/* À implémenter avec l'API */}}
                        >
                          APPROUVER
                        </button>
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold uppercase"
                          onClick={() => {/* À implémenter avec l'API */}}
                        >
                          REJETER
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-3 text-center text-gray-500">
                      Aucune demande en attente
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Team Follow-up */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-4">Suivi de l'équipe</h3>
          <div className="space-y-4">
            {suivi_equipe.map((member) => (
              <div key={member.id} className="p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-xs">
                    {member.prenom[0]}{member.nom[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{member.prenom} {member.nom}</p>
                    <p className="text-xs text-gray-500">{member.fonction}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                    {member.taches_stats.a_faire} À faire
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 rounded-full text-xs">
                    {member.taches_stats.en_cours} En cours
                  </span>
                  <span className="px-2 py-0.5 bg-green-100 rounded-full text-xs">
                    {member.taches_stats.terminees} Terminée
                  </span>
                  <span className="px-2 py-0.5 bg-gray-200 rounded-full text-xs">
                    {member.jours_conges_pris} j. congés
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}