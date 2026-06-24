import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getTickets } from "../services/api";
import TicketDetailModal from "../components/TicketDetailModal";

export default function TechnicianTickets() {
  const { token } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const loadTickets = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getTickets(token);
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [token]);

  const filtered = statusFilter === "all" 
    ? tickets 
    : tickets.filter(t => t.statut === statusFilter);

  // ===============================================================
  // CORRECTION : Afficher le vrai nom de l'auteur ou du technicien
  // ===============================================================
  const getPersonName = (ticket) => {
    // 1. Vérifier si le backend a envoyé l'auteur (Le créateur du ticket : Employé ou Responsable)
    if (ticket.auteur && typeof ticket.auteur === 'object') {
      const a = ticket.auteur;
      // Si on a le prénom et le nom séparés
      if (a.prenom && a.nom) return `${a.prenom} ${a.nom}`;
      // Sinon on cherche le premier champ disponible
      return a.nom || a.prenom || a.name || a.email || "Utilisateur";
    }

    // 2. Vérifier si le backend a envoyé le technicien assigné (Si c'est le technicien qui regarde ses tickets)
    if (ticket.technicien && typeof ticket.technicien === 'object') {
      const t = ticket.technicien;
      if (t.prenom && t.nom) return `${t.prenom} ${t.nom}`;
      return t.nom || t.prenom || t.name || t.email || "Technicien";
    }

    // 3. Fallback ultime (si le backend ne renvoie que l'ID)
    if (ticket.user_id) return `Utilisateur #${ticket.user_id}`;
    return "Inconnu";
  };

  const getPersonInitials = (ticket) => {
    const name = getPersonName(ticket);
    if (name === "Inconnu" || name === "Utilisateur" || name === "Technicien") return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };
  // ===============================================================

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const cleanDate = dateString.replace('Z', '').replace('T', ' ');
      const dateObj = new Date(cleanDate);
      if (isNaN(dateObj.getTime())) return dateString;
      return dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Chargement des tickets...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Tickets</h1>
          <p className="text-gray-500 text-sm">Gérez et traitez les tickets qui vous sont assignés.</p>
        </div>
      </div>

      <div className="flex justify-end">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none cursor-pointer">
          <option value="all">Tous les statuts</option>
          <option value="Ouvert">Ouvert</option>
          <option value="En cours">En cours</option>
          <option value="Résolu">Résolu</option>
          <option value="Fermé">Fermé</option>
        </select>
      </div>

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
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-6 text-gray-500">Aucun ticket trouvé.</td></tr>
              ) : (
                filtered.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-semibold">{ticket.titre}</td>
                    <td className="px-6 py-3 text-gray-500">{ticket.categorie}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${ ticket.priorite === "Haute" ? "bg-red-100 text-red-700" : ticket.priorite === "Moyenne" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600" }`}>{ticket.priorite}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${ ticket.statut === "Ouvert" ? "bg-blue-100 text-blue-700" : ticket.statut === "En cours" ? "bg-amber-100 text-amber-700" : ticket.statut === "Résolu" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600" }`}>
                        <span className={`w-2 h-2 rounded-full ${ ticket.statut === "Ouvert" ? "bg-blue-500" : ticket.statut === "En cours" ? "bg-amber-500" : ticket.statut === "Résolu" ? "bg-green-500" : "bg-gray-400" }`}></span>
                        {ticket.statut}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      {/* Affichage du rond avec initiales */}
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold mx-auto">
                        {getPersonInitials(ticket)}
                      </div>
                      {/* Affichage du nom complet en dessous */}
                      <div className="text-[10px] text-gray-400 mt-1 font-medium truncate max-w-[90px]">
                        {getPersonName(ticket)}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(ticket.date || ticket.created_at)}</td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => setSelectedTicketId(ticket.id)}
                        className="text-blue-600 font-bold hover:underline text-sm"
                      >
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTicketId && (
        <TicketDetailModal
          ticketId={selectedTicketId}
          role={3}
          onClose={() => setSelectedTicketId(null)}
          onUpdated={() => loadTickets()}
        />
      )}
    </div>
  );
}