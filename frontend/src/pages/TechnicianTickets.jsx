import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTickets, createTicket } from "../services/api";

export default function TechnicianTickets() {
  const { token } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulaire de création
  const [newTicket, setNewTicket] = useState({ titre: "", categorie: "Matériel", description: "" });

  // Charger les tickets depuis le backend
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

  // Filtrer les tickets selon le statut
  const filtered = statusFilter === "all" 
    ? tickets 
    : tickets.filter(t => t.statut === statusFilter);

  // Gérer la soumission du formulaire
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      await createTicket(token, newTicket);
      setShowModal(false);
      setNewTicket({ titre: "", categorie: "Matériel", description: "" });
      loadTickets(); // Recharger la liste après création
    } catch (error) {
      console.error("Erreur création ticket:", error);
      alert("Impossible de créer le ticket.");
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Chargement des tickets...</div>;
  }

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
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold mx-auto">
                        {ticket.demandeur ? ticket.demandeur.substring(0, 2).toUpperCase() : "?"}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{ticket.date || ticket.created_at || "N/A"}</td>
                    <td className="px-6 py-3 text-right">
                      <Link to={`/technician-tickets/${ticket.id}`} className="text-blue-600 font-bold hover:underline text-sm">
                        Voir détails
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Création */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-blue-600">Créer un ticket</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Titre</label>
                <input 
                  type="text" 
                  value={newTicket.titre}
                  onChange={(e) => setNewTicket({...newTicket, titre: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Ex: Problème de connexion" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Catégorie</label>
                <select 
                  value={newTicket.categorie}
                  onChange={(e) => setNewTicket({...newTicket, categorie: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option>Matériel</option>
                  <option>Logiciel</option>
                  <option>Réseau</option>
                  <option>Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Description</label>
                <textarea 
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Décrivez votre problème..." 
                  rows="4"
                  required
                ></textarea>
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