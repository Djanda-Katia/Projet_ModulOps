import { useAuth } from "../context/AuthContext";

export default function EmployeeDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Solde de congés</p>
            <h3 className="text-3xl font-bold text-gray-900">25 jours</h3>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Congés pris</p>
            <h3 className="text-3xl font-bold text-gray-900">10 jours</h3>
          </div>
          <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>event_busy</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Tickets ouverts</p>
            <h3 className="text-3xl font-bold text-gray-900">3</h3>
          </div>
          <div className="p-3 bg-red-100 rounded-lg text-red-600">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Tâches en cours</p>
            <h3 className="text-3xl font-bold text-gray-900">5</h3>
          </div>
          <div className="p-3 bg-green-100 rounded-lg text-green-600">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
          </div>
        </div>
      </div>

      {/* --- MAIN GRID --- */}
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
                <tr>
                  <td className="px-4 py-3">Annuel</td>
                  <td className="px-4 py-3 text-gray-500">12/05 - 15/05</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">En attente</span></td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Maladie</td>
                  <td className="px-4 py-3 text-gray-500">10/05 - 11/05</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">Approuvée</span></td>
                </tr>
                <tr>
                  <td className="px-4 py-3">RTT</td>
                  <td className="px-4 py-3 text-gray-500">20/05 - 20/05</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold">Rejetée</span></td>
                </tr>
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
                <tr>
                  <td className="px-4 py-3 font-semibold">Problème VPN</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">Haute</span></td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">Ouvert</span></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold">Mise à jour logiciel</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">Moyenne</span></td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">En cours</span></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold">Imprimante HS</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">Basse</span></td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">Fermé</span></td>
                </tr>
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
                <tr>
                  <td className="px-4 py-3 font-semibold">Rapport Q3</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">À faire</span></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold">Update Sécurité</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">En cours</span></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold">Audit Paie</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Terminée</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}