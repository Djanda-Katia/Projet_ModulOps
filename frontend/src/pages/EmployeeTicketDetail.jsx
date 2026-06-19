import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTicketById, confirmTicket, signalTicket, addTicketComment } from "../services/api";

export default function EmployeeTicketDetail() {
  const { id } = useParams();
  const { user, token } = useAuth(); // ✅ On récupère user ET token

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [comment, setComment] = useState("");

  // Charger le ticket depuis le backend
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await getTicketById(token, id);
        setTicket(data);
        setShowBanner(data.statut === "Résolu");
      } catch (error) {
        console.error("Erreur chargement ticket:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchTicket();
    }
  }, [token, id]);

  // Confirmer la résolution
  const handleConfirm = async () => {
    try {
      await confirmTicket(token, id);
      setTicket((prev) => ({ ...prev, statut: "Fermé" }));
      setShowBanner(false);
    } catch (error) {
      console.error("Erreur confirmation:", error);
    }
  };

  // Signaler un problème
  const handleSignal = async () => {
    try {
      await signalTicket(token, id);
      setTicket((prev) => ({ ...prev, statut: "En cours" }));
      setShowBanner(false);
    } catch (error) {
      console.error("Erreur signalement:", error);
    }
  };

  // Ajouter un commentaire
  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await addTicketComment(token, id, comment);
      const updated = await getTicketById(token, id);
      setTicket(updated);
      setComment("");
    } catch (error) {
      console.error("Erreur commentaire:", error);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (!ticket) return <div className="text-center text-red-500 p-8">Ticket introuvable</div>;

  return (
    <div className="space-y-6">
      <Link to="/employee-tickets" className="flex items-center gap-2 text-blue-600 hover:underline text-sm font-semibold">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Retour à mes tickets
      </Link>

      {showBanner && ticket.statut === "Résolu" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div>
              <h3 className="font-bold text-green-900 text-base">Ce ticket a été marqué comme résolu par le technicien.</h3>
              <p className="text-green-700 text-sm">Confirmez-vous la résolution ?</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={handleConfirm}
              className="flex-1 md:flex-none px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-all uppercase shadow-sm"
            >
              CONFIRMER LA RÉSOLUTION
            </button>
            <button
              onClick={handleSignal}
              className="flex-1 md:flex-none px-6 py-2 border border-red-200 text-red-600 bg-white text-sm font-bold rounded-lg hover:bg-red-50 transition-all uppercase"
            >
              SIGNALER UN PROBLÈME
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-sm text-gray-400 font-mono">#TKT-{ticket.id}</span>
                <h2 className="text-xl font-bold text-gray-900 mt-1">{ticket.titre}</h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">{ticket.categorie}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                ticket.priorite === "Haute" ? "bg-red-100 text-red-700" :
                ticket.priorite === "Moyenne" ? "bg-blue-100 text-blue-700" :
                "bg-gray-100 text-gray-600"
              }`}>
                {ticket.priorite}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                ticket.statut === "Résolu" || ticket.statut === "Fermé" ? "bg-blue-100 text-blue-700" :
                ticket.statut === "En cours" ? "bg-amber-100 text-amber-700" :
                "bg-gray-100 text-gray-600"
              }`}>
                {ticket.statut}
              </span>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Description</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{ticket.description}</p>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">Historique des commentaires</h4>
              <div className="space-y-4">
                {ticket.commentaires && ticket.commentaires.length > 0 ? (
                  ticket.commentaires.map((c) => (
                    <div key={c.id} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-700 font-bold text-xs">
                        {c.auteur.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-900">{c.auteur}</span>
                          <span className="text-xs text-gray-500">{c.date}</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none text-sm text-gray-700">
                          {c.contenu}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Aucun commentaire</p>
                )}
              </div>

              {/* ✅ Zone de commentaire visible UNIQUEMENT pour le technicien assigné */}
              {ticket.technicien_id === user?.id && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white font-bold text-xs">TB</div>
                    <div className="flex-1">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        rows="2"
                        placeholder="Ajouter un commentaire..."
                      ></textarea>
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={handleAddComment}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors uppercase"
                        >
                          Envoyer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">info</span>
              Informations
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Statut</span>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                  ticket.statut === "Résolu" || ticket.statut === "Fermé" ? "bg-blue-100 text-blue-700" :
                  ticket.statut === "En cours" ? "bg-amber-100 text-amber-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {ticket.statut}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Technicien</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px]">
                    {ticket.technicien?.prenom?.[0]}{ticket.technicien?.nom?.[0] || "?"}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {ticket.technicien ? `${ticket.technicien.prenom} ${ticket.technicien.nom}` : "Non assigné"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Date de création</span>
                <span className="text-sm text-gray-900">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Catégorie</span>
                <span className="text-sm text-gray-900">{ticket.categorie}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Priorité</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  ticket.priorite === "Haute" ? "bg-red-100 text-red-700" :
                  ticket.priorite === "Moyenne" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {ticket.priorite}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}