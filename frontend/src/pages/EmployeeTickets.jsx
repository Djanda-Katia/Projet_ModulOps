import { useState } from "react";
import { Link } from "react-router-dom";
import { Add, FolderOpen, Sync, CheckCircle, Search } from "@mui/icons-material";

export default function EmployeeTickets() {
  // État local pour le filtre et la liste des tickets (simulée)
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Données simulées (à remplacer par un appel API)
  const tickets = [
    { id: 1, titre: "Problème accès VPN", categorie: "Réseau", priorite: "Haute", statut: "Ouvert", technicien: "Marc Morel", date: "12 Oct 2023" },
    { id: 2, titre: "Mise à jour Logiciel RH", categorie: "Logiciel", priorite: "Moyenne", statut: "En cours", technicien: "Sarah Diallo", date: "10 Oct 2023" },
    { id: 3, titre: "Écran défectueux", categorie: "Matériel", priorite: "Basse", statut: "Fermé", technicien: "Tom Legrand", date: "05 Oct 2023" },
  ];

  // Filtrage local (pour la démo)
  const filteredTickets = statusFilter === "all" 
    ? tickets 
    : tickets.filter(t => t.statut === statusFilter);

  return (
    <div className="space-y-6">
      {/* ── EN-TÊTE ────────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-end">
        <p className="text-gray-500 text-sm">Gérez vos demandes de support et suivez leur résolution.</p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md active:scale-95 transition-all">
          <Add />
          + Créer un ticket
        </button>
      </div>

      {/* ── STATISTIQUES ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Ouverts</p>
            <h3 className="text-3xl font-bold text-blue-600">2</h3>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <FolderOpen />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">En cours</p>
            <h3 className="text-3xl font-bold text-amber-600">1</h3>
          </div>
          <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
            <Sync />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Fermés</p>
            <h3 className="text-3xl font-bold text-gray-500">3</h3>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg text-gray-500">
            <CheckCircle />
          </div>
        </div>
      </div>

      {/* ── FILTRE ──────────────────────────────────────────────────────────── */}
      <div className="flex justify-end">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="Ouvert">Ouvert</option>
            <option value="En cours">En cours</option>
            <option value="Résolu">Résolu</option>
            <option value="Fermé">Fermé</option>
          </select>
        </div>
      </div>

      {/* ── TABLEAU ────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Titre</th>
                <th className="px-6 py-4">Catégorie</th>
                <th className="px-6 py-4">Priorité</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4">Technicien</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold">{ticket.titre}</td>
                  <td className="px-6 py-4 text-gray-500">{ticket.categorie}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      ticket.priorite === "Haute" ? "bg-red-100 text-red-700" :
                      ticket.priorite === "Moyenne" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {ticket.priorite}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      ticket.statut === "Ouvert" ? "bg-blue-100 text-blue-700" :
                      ticket.statut === "En cours" ? "bg-amber-100 text-amber-700" :
                      ticket.statut === "Résolu" ? "bg-purple-100 text-purple-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        ticket.statut === "Ouvert" ? "bg-blue-500" :
                        ticket.statut === "En cours" ? "bg-amber-500" :
                        ticket.statut === "Résolu" ? "bg-purple-500" :
                        "bg-gray-400"
                      }`}></span>
                      {ticket.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                        {ticket.technicien.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span>{ticket.technicien}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{ticket.date}</td>
                  <td className="px-6 py-4 text-right">
                    <Link to="#" className="text-blue-600 font-bold hover:underline text-sm">
                      Voir détails
                    </Link>
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