import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTicketById, getTicketComments } from "../services/api";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function TechnicianTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  
  const [newComment, setNewComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger le ticket et ses commentaires
  useEffect(() => {
    const loadTicketData = async () => {
      if (!token || !id) return;
      try {
        setLoading(true);
        const ticketData = await getTicketById(token, id);
        setTicket(ticketData);
        setSelectedStatus(ticketData.statut);
        
        const commentsData = await getTicketComments(token, id);
        setComments(Array.isArray(commentsData) ? commentsData : []);
      } catch (error) {
        console.error("Erreur chargement détails ticket:", error);
        navigate("/technician-tickets");
      } finally {
        setLoading(false);
      }
    };
    loadTicketData();
  }, [token, id, navigate]);

  // ===============================================================
  // AFFICHAGE DU NOM ET DE LA DATE
  // ===============================================================
  const getDemandeurDisplay = () => {
    if (!ticket) return "Inconnu";
    
    // 1. On vérifie si le backend a envoyé l'objet auteur (via la relation auteur() du modèle)
    if (ticket.auteur && typeof ticket.auteur === 'object') {
      const a = ticket.auteur;
      if (a.prenom && a.nom) return `${a.prenom} ${a.nom}`;
      return a.nom || a.prenom || a.name || a.email || "Utilisateur";
    }
    
    // 2. Sinon, si le backend a envoyé l'objet user
    if (ticket.user && typeof ticket.user === 'object') {
      const u = ticket.user;
      if (u.prenom && u.nom) return `${u.prenom} ${u.nom}`;
      return u.nom || u.prenom || u.name || u.email || "Utilisateur";
    }
    
    // 3. Fallback sur l'ID
    if (ticket.user_id) return `Utilisateur #${ticket.user_id}`;
    return "Utilisateur inconnu";
  };

  const getDemandeurInitials = () => {
    const name = getDemandeurDisplay();
    if (name === "Utilisateur inconnu" || name === "Inconnu") return "U";
    if (name.startsWith("Utilisateur #")) return "ID";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const cleanDate = dateString.replace('Z', '').replace('T', ' ');
      const dateObj = new Date(cleanDate);
      if (isNaN(dateObj.getTime())) return dateString;
      return dateObj.toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };
  // ===============================================================

  // ===============================================================
  // LA BONNE MÉTHODE : 1 SEULE REQUÊTE VERS /commentaires
  // ===============================================================
  const handleIntervention = async (e) => {
    e.preventDefault();
    if (!token || !newComment.trim()) {
      alert("Vous devez écrire un commentaire !");
      return;
    }

    if (selectedStatus === ticket.statut) {
      alert("Le statut est déjà '" + selectedStatus + "'.");
      return;
    }

    if (!window.confirm(`Confirmer le passage en "${selectedStatus}" ?`)) return;

    setIsSubmitting(true);
    try {
      // 1. Appel à la route /commentaires définie dans ton TicketController
      // Elle accepte BOTH le contenu ET le statut dans le même body.
      const response = await fetch(`${API_BASE}/api/tickets/${id}/commentaires`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          contenu: newComment,
          statut: selectedStatus // Ton backend accepte 'En cours' ou 'Résolu' ici
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'envoi.");
      }

      // 2. Recharger toutes les données fraîches
      const updatedTicket = await getTicketById(token, id);
      setTicket(updatedTicket);
      setSelectedStatus(updatedTicket.statut);

      const updatedComments = await getTicketComments(token, id);
      setComments(Array.isArray(updatedComments) ? updatedComments : []);
      setNewComment(""); 
      
    } catch (error) {
      console.error("Erreur lors de l'intervention:", error);
      alert(`Erreur : ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  // ===============================================================

  if (loading) return <div className="text-center py-10 text-gray-500">Chargement du ticket...</div>;
  if (!ticket) return <div className="text-center text-red-500 p-8">Ticket introuvable</div>;

  const isClosed = ticket.statut === "Fermé";

  return (
    <div className="space-y-6">
      <Link to="/technician-tickets" className="flex items-center gap-2 text-blue-600 hover:underline text-sm font-semibold">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Retour à mes tickets
      </Link>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-400 font-mono">#TK-{ticket.id}</span>
        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">{ticket.categorie}</span>
        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${ ticket.priorite === "Haute" ? "bg-red-100 text-red-700" : ticket.priorite === "Moyenne" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600" }`}>{ticket.priorite}</span>
        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${ ticket.statut === "Ouvert" ? "bg-blue-100 text-blue-700" : ticket.statut === "En cours" ? "bg-amber-100 text-amber-700" : ticket.statut === "Résolu" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600" }`}>{ticket.statut}</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">{ticket.titre}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">Description</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{ticket.description}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-6">Historique des commentaires</h4>
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucun commentaire pour le moment.</p>
              ) : (
                comments.map((comment, index) => {
                  const userName = comment.auteur 
                    ? (comment.auteur.prenom && comment.auteur.nom 
                        ? `${comment.auteur.prenom} ${comment.auteur.nom}` 
                        : comment.auteur.nom || comment.auteur.name || "Technicien")
                    : "Utilisateur";
                  const initials = userName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
                  return (
                    <div key={comment.id || index} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-900">{initials || "U"}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-900">{userName}</span>
                          <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none text-sm text-gray-700">{comment.contenu}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {!isClosed && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900 mb-4">Intervenir sur ce ticket</h4>
                <form onSubmit={handleIntervention} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Votre commentaire</label>
                    <textarea className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows="3" placeholder="Écrivez votre rapport ici..." value={newComment} onChange={(e) => setNewComment(e.target.value)} required></textarea>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold text-gray-500 mb-1">Nouveau statut</label>
                      <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 h-10 text-sm outline-none bg-white cursor-pointer">
                        <option value="Ouvert">Ouvert</option>
                        <option value="En cours">En cours</option>
                        <option value="Résolu">Résolu</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full sm:w-auto h-10 px-8 bg-blue-600 text-white rounded-lg text-sm font-bold uppercase hover:bg-blue-700 disabled:opacity-50 transition-colors" disabled={isSubmitting}>
                      {isSubmitting ? "Envoi..." : "Intervenir"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-blue-600">info</span> Informations</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Statut</span>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${ ticket.statut === "Ouvert" ? "bg-blue-100 text-blue-700" : ticket.statut === "En cours" ? "bg-amber-100 text-amber-700" : ticket.statut === "Résolu" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600" }`}>{ticket.statut}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Demandeur</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">{getDemandeurInitials()}</div>
                  <span className="text-sm font-medium">{getDemandeurDisplay()}</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Date de création</span>
                <span className="text-sm text-gray-900">{formatDate(ticket.created_at || ticket.date)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Dernière mise à jour</span>
                <span className="text-sm text-gray-900">{formatDate(ticket.updated_at)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Catégorie</span>
                <span className="text-sm text-gray-900">{ticket.categorie}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Priorité</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${ ticket.priorite === "Haute" ? "bg-red-100 text-red-700" : ticket.priorite === "Moyenne" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600" }`}>{ticket.priorite}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}