import { useState } from "react";

export default function TechnicianDashboard() {
  // Simulation des stats
  const stats = {
    total: 14,
    enCours: 4,
    resolus: 8,
    fermes: 2,
  };

  // Simulation des tickets récents
  const tickets = [
    { id: 1, titre: "Panne de climatisation - Serveur 4A", categorie: "Infrastructure", priorite: "Urgent", statut: "En cours", date: "12 Mai, 09:15" },
    { id: 2, titre: "Maintenance préventive Groupe Électrogène", categorie: "Maintenance", priorite: "Moyenne", statut: "Planifié", date: "14 Mai, 14:00" },
    { id: 3, titre: "Fuite hydraulique Poste de contrôle", categorie: "Réparation", priorite: "Élevée", statut: "En attente", date: "12 Mai, 11:30" },
    { id: 4, titre: "Étalonnage Capteurs Température", categorie: "Qualité", priorite: "Faible", statut: "Traité", date: "11 Mai, 16:45" },
  ];

  return (
    <div className="space-y-8">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total tickets assignés</p>
            <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Tickets en cours</p>
            <h3 className="text-3xl font-bold text-amber-600">{stats.enCours}</h3>
          </div>
          <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Tickets résolus</p>
            <h3 className="text-3xl font-bold text-green-600">{stats.resolus}</h3>
          </div>
          <div className="p-3 bg-green-100 rounded-lg text-green-600">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Tickets fermés</p>
            <h3 className="text-3xl font-bold text-gray-500">{stats.fermes}</h3>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg text-gray-500">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>archive</span>
          </div>
        </div>
      </div>

      {/* Tableau des tickets assignés */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Mes tickets assignés</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Titre</th>
                <th className="px-6 py-3">Catégorie</th>
                <th className="px-6 py-3">Priorité</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-semibold">{ticket.titre}</td>
                  <td className="px-6 py-3 text-gray-500">{ticket.categorie}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      ticket.priorite === "Urgent" ? "bg-red-100 text-red-700" :
                      ticket.priorite === "Élevée" ? "bg-red-100 text-red-700" :
                      ticket.priorite === "Moyenne" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {ticket.priorite}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      ticket.statut === "En cours" ? "bg-amber-100 text-amber-700" :
                      ticket.statut === "Planifié" ? "bg-blue-100 text-blue-700" :
                      ticket.statut === "En attente" ? "bg-amber-100 text-amber-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        ticket.statut === "En cours" ? "bg-amber-500" :
                        ticket.statut === "Planifié" ? "bg-blue-500" :
                        ticket.statut === "En attente" ? "bg-amber-500" :
                        "bg-green-500"
                      }`}></span>
                      {ticket.statut}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{ticket.date}</td>
                  <td className="px-6 py-3 text-right">
                    <a href="#" className="text-blue-600 font-bold hover:underline text-sm">Voir détails</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}