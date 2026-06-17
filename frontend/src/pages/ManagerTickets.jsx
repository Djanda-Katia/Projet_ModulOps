import { useState } from "react";

export default function ManagerTickets() {
  const [filter, setFilter] = useState("all");

  const tickets = [
    { id: 1, titre: "Problème Accès VPN", categorie: "Infrastructure", priorite: "Haute", statut: "Ouvert", technicien: "JM", date: "12 Oct 2023" },
    { id: 2, titre: "Mise à jour Logiciel RH", categorie: "Logiciel", priorite: "Moyenne", statut: "En cours", technicien: "SA", date: "14 Oct 2023" },
    { id: 3, titre: "Installation Imprimante 4e", categorie: "Matériel", priorite: "Basse", statut: "Fermé", technicien: "PL", date: "08 Oct 2023" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Tickets</h1>
          <p className="text-gray-500 text-sm">Créez et suivez vos demandes de support technique.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">+ CRÉER UN TICKET</button>
      </div>

      <div className="flex justify-end">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm"
        >
          <option value="all">Tous les statuts</option>
          <option value="Ouvert">Ouvert</option>
          <option value="En cours">En cours</option>
          <option value="Fermé">Fermé</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">Titre</th>
              <th className="px-6 py-3">Catégorie</th>
              <th className="px-6 py-3">Priorité</th>
              <th className="px-6 py-3">Statut</th>
              <th className="px-6 py-3">Technicien</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tickets.filter(t => filter === "all" || t.statut === filter).map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-semibold">{t.titre}</td>
                <td className="px-6 py-3 text-gray-500">{t.categorie}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    t.priorite === "Haute" ? "bg-red-100 text-red-700" :
                    t.priorite === "Moyenne" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>{t.priorite}</span>
                </td>
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    t.statut === "Ouvert" ? "bg-blue-100 text-blue-700" :
                    t.statut === "En cours" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      t.statut === "Ouvert" ? "bg-blue-500" :
                      t.statut === "En cours" ? "bg-amber-500" :
                      "bg-gray-400"
                    }`}></span>
                    {t.statut}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">{t.technicien}</div>
                </td>
                <td className="px-6 py-3 text-gray-500">{t.date}</td>
                <td className="px-6 py-3 text-right">
                  <a href="#" className="text-blue-600 font-bold hover:underline">Voir détails</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}