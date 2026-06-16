import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function EmployeeLeave() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

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

      {/* Bannière solde */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Solde disponible</p>
            <p className="text-xl font-bold text-blue-900">25 jours</p>
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
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold">Annuel</td>
                <td className="px-6 py-4 text-gray-500">15/07/2023</td>
                <td className="px-6 py-4 text-gray-500">30/07/2023</td>
                <td className="px-6 py-4 text-center font-bold">12</td>
                <td className="px-6 py-4 text-gray-500 italic">Vacances été</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">Approuvée</span>
                </td>
                <td className="px-6 py-4 text-gray-500">10/06/2023</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold">Maladie</td>
                <td className="px-6 py-4 text-gray-500">05/09/2023</td>
                <td className="px-6 py-4 text-gray-500">07/09/2023</td>
                <td className="px-6 py-4 text-center font-bold">3</td>
                <td className="px-6 py-4 text-gray-500 italic">Certificat joint</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">En attente</span>
                </td>
                <td className="px-6 py-4 text-gray-500">04/09/2023</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold">Exceptionnel</td>
                <td className="px-6 py-4 text-gray-500">20/10/2023</td>
                <td className="px-6 py-4 text-gray-500">21/10/2023</td>
                <td className="px-6 py-4 text-center font-bold">1</td>
                <td className="px-6 py-4 text-gray-500 italic">Déménagement</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">Rejetée</span>
                </td>
                <td className="px-6 py-4 text-gray-500">15/10/2023</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">Affichage de 1 à 3 sur 12 entrées</span>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded bg-blue-600 text-white text-sm font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-600 rounded text-sm font-bold">2</button>
            <button className="p-1 rounded hover:bg-gray-200 text-gray-500">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
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
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Type de congé</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Annuel</option>
                  <option>Maladie</option>
                  <option>Exceptionnel</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Date de début</label>
                  <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Date de fin</label>
                  <input type="date" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Motif (optionnel)</label>
                <textarea className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Veuillez préciser la raison de votre demande..." rows="3"></textarea>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-blue-600">info</span>
                <p className="text-sm text-blue-900">Solde disponible après cette demande : <span className="font-bold">20 jours</span></p>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md" type="submit">
                Envoyer la demande
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}