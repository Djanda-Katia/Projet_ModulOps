import { useState } from "react";
import { Link } from "react-router-dom";

export default function TechnicianTickets() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const tickets = [
    { id: 1, titre: "Problème Connexion VPN", categorie: "Infrastructure", priorite: "Haute", statut: "Ouvert", demandeur: "AL", date: "12 Oct 2023" },
    { id: 2, titre: "Mise à jour Logiciel RH", categorie: "Applications", priorite: "Moyenne", statut: "En cours", demandeur: "JM", date: "11 Oct 2023" },
    { id: 3, titre: "Accès Imprimante Bureau 4", categorie: "Matériel", priorite: "Basse", statut: "Résolu", demandeur: "SC", date: "10 Oct 2023" },
    { id: 4, titre: "Demande Nouveau Poste Fixe", categorie: "Matériel", priorite: "Moyenne", statut: "Fermé", demandeur: "EB", date: "08 Oct 2023" },
  ];

  const filtered = statusFilter === "all" ? tickets : tickets.filter(t => t.statut === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Tickets</h1>
          <p className="text-gray-500 text-sm">Gérez et traitez les tickets qui vous sont assignés.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          + Créer un ticket
        </button>
      </div>

      <div className="flex justify-end">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none cursor-pointer"
        >
          <option value="all">Tous les statuts</option>
          <option value="Ouvert">Ouvert</option>
          <option value="En cours">En cours</option>
          <option value="Résolu">Résolu</option>
          <option value="Fermé">Fermé</option>
        </select>
      </div>

      {/* ← ICI : Le conteneur n'a plus overflow-hidden, il permet le swipe */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Titre</th>
                <th className="px-6 py-3">Catégorie</th>
                <th className="px-6 py-3">Priorité</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3 text-center">Demandeur</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-semibold">{ticket.titre}</td>
                  <td className="px-6 py-3 text-gray-500">{ticket.categorie}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      ticket.priorite === "Haute" ? "bg-red-100 text-red-700" :
                      ticket.priorite === "Moyenne" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{ticket.priorite}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      ticket.statut === "Ouvert" ? "bg-blue-100 text-blue-700" :
                      ticket.statut === "En cours" ? "bg-amber-100 text-amber-700" :
                      ticket.statut === "Résolu" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        ticket.statut === "Ouvert" ? "bg-blue-500" :
                        ticket.statut === "En cours" ? "bg-amber-500" :
                        ticket.statut === "Résolu" ? "bg-green-500" :
                        "bg-gray-400"
                      }`}></span>
                      {ticket.statut}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">{ticket.demandeur}</div>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{ticket.date}</td>
                  <td className="px-6 py-3 text-right">
                    <Link to={`/technician-tickets/${ticket.id}`} className="text-blue-600 font-bold hover:underline text-sm">
                      Voir détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-blue-600">Créer un ticket</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Titre</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Problème de connexion" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Catégorie</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Matériel</option>
                  <option>Logiciel</option>
                  <option>Réseau</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Description</label>
                <textarea className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Décrivez votre problème..." rows="4"></textarea>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold uppercase" type="submit">
                Soumettre le ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}