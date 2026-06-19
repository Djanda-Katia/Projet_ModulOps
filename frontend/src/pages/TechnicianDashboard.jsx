import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getTickets } from "../services/api";

export default function TechnicianDashboard() {
  const { token } = useAuth();
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false); // État pour gérer l'affichage

  // Stats (calculées à partir de tous les tickets chargés)
  const [stats, setStats] = useState({ total: 0, enCours: 0, resolus: 0, fermes: 0 });

  useEffect(() => {
    const loadDashboard = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await getTickets(token);
        const tickets = Array.isArray(data) ? data : [];
        
        // On garde tous les tickets en mémoire
        setAllTickets(tickets);

        // Mettre à jour les stats avec le total réel
        setStats({
          total: tickets.length,
          enCours: tickets.filter(t => t.statut === "En cours" || t.statut === "Ouvert").length,
          resolus: tickets.filter(t => t.statut === "Résolu").length,
          fermes: tickets.filter(t => t.statut === "Fermé").length,
        });
      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [token]);

  // Fonction utilitaire pour extraire le nom du demandeur
  const getDemandeurName = (ticket) => {
    if (!ticket.demandeur) return "Inconnu";
    if (typeof ticket.demandeur === 'object') {
      return ticket.demandeur.nom || ticket.demandeur.name || ticket.demandeur.email || "Inconnu";
    }
    return ticket.demandeur;
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Chargement du tableau de bord...</div>;
  }

  // LOGIQUE D'AFFICHAGE : On affiche les 4 premiers, ou tout si showAll est true
  const displayedTickets = showAll ? allTickets : allTickets.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* 4 Cartes de statistiques */}
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

      {/* Tableau avec limite d'affichage */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-900">Mes tickets assignés</h3>
          
          {/* Le bouton pour Voir plus / Voir moins */}
          {allTickets.length > 4 && (
            <button 
              onClick={() => setShowAll(!showAll)}
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline transition-colors"
            >
              {showAll ? "Voir moins" : `Voir tous (${allTickets.length})`}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Titre</th>
                <th className="px-6 py-3">Catégorie</th>
                <th className="px-6 py-3">Priorité</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedTickets.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-6 text-gray-500">Aucun ticket assigné pour le moment.</td></tr>
              ) : (
                displayedTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-semibold">{ticket.titre}</td>
                    <td className="px-6 py-3 text-gray-500">{ticket.categorie}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        ticket.priorite === "Haute" ? "bg-red-100 text-red-700" :
                        ticket.priorite === "Moyenne" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {ticket.priorite}
                      </span>
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
                    <td className="px-6 py-3 text-gray-500">
                      {ticket.date ? new Date(ticket.date).toLocaleDateString('fr-FR') : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}