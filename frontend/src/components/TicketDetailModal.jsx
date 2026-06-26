import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getTicketById, getTicketComments, deleteTicket, closeTicketEarly } from "../services/api";
import toast from "react-hot-toast";
import ConfirmModal from "./ConfirmModal";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

// ============================================================
// HELPERS
// ============================================================
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString.replace("Z", "").replace("T", " "));
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return dateString; }
};

const statusBadge = (statut) => {
  const map = {
    "Ouvert": "bg-blue-100 text-blue-700",
    "En cours": "bg-amber-100 text-amber-700",
    "Résolu": "bg-green-100 text-green-700",
    "Fermé": "bg-gray-100 text-gray-600",
  };
  return map[statut] ?? "bg-gray-100 text-gray-600";
};

const prioriteBadge = (priorite) => {
  const map = {
    "Haute": "bg-red-100 text-red-700",
    "Moyenne": "bg-blue-100 text-blue-700",
    "Basse": "bg-gray-100 text-gray-600",
  };
  return map[priorite] ?? "bg-gray-100 text-gray-600";
};

const getAuthorName = (ticket) => {
  if (ticket?.auteur?.prenom && ticket?.auteur?.nom)
    return `${ticket.auteur.prenom} ${ticket.auteur.nom}`;
  if (ticket?.user?.prenom && ticket?.user?.nom)
    return `${ticket.user.prenom} ${ticket.user.nom}`;
  return ticket?.user_id ? `Utilisateur #${ticket.user_id}` : "Inconnu";
};

const initials = (name) => {
  if (!name || name === "Inconnu") return "?";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

// ============================================================
// COMPOSANT
// ============================================================
export default function TicketDetailModal({ ticketId, role, onClose, onUpdated }) {
  const { token } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Technicien
  const [newComment, setNewComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(""); // vide = pas de changement de statut
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Employé / Responsable — signalement
  const [showSignalForm, setShowSignalForm] = useState(false);
  const [signalMessage, setSignalMessage] = useState("");

  const [showEarlyCloseForm, setShowEarlyCloseForm] = useState(false);
  const [earlyCloseMotif, setEarlyCloseMotif] = useState("");

  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false });

  // ---- Charger le ticket ----
  const loadData = async () => {
    if (!token || !ticketId) return;
    try {
      setLoading(true);
      const [t, c] = await Promise.all([
        getTicketById(token, ticketId),
        getTicketComments(token, ticketId),
      ]);
      setTicket(t);
      setSelectedStatus(t.statut);
      setComments(Array.isArray(c) ? c : []);
    } catch (err) {
      console.error("Erreur chargement ticket modal:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [ticketId, token]);

  // ---- Technicien : intervenir ----
  const handleIntervention = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return toast.error("❌ Le commentaire est obligatoire.");
    setIsSubmitting(true);
    try {
      const body = { contenu: newComment };
      // N'envoyer le statut que s'il est différent du statut actuel ET valide
      if (selectedStatus && selectedStatus !== ticket?.statut && ["Ouvert", "En cours", "Résolu"].includes(selectedStatus)) {
        body.statut = selectedStatus;
      }
      const res = await fetch(`${API_BASE}/tickets/${ticketId}/commentaires`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Accept": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erreur");
      }
      setNewComment("");
      await loadData();
      toast.success("✅ Intervention enregistrée avec succès");
      if (onUpdated) onUpdated();
    } catch (err) {
      toast.error(`❌ Erreur : ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---- Employé : confirmer résolution ----
  const handleConfirm = async () => {
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}/confirmer`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur confirmation");
      toast.success("✅ Résolution confirmée avec succès");
      await loadData();
      if (onUpdated) onUpdated();
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  // ---- Employé : signaler problème ----
  const handleSignal = async () => {
    if (!signalMessage.trim()) return toast.error("❌ Veuillez décrire le problème.");
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}/signaler`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: signalMessage }),
      });
      if (!res.ok) throw new Error("Erreur signalement");
      setShowSignalForm(false);
      setSignalMessage("");
      toast.success("✅ Signalement envoyé");
      await loadData();
      if (onUpdated) onUpdated();
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  // ---- Employé : supprimer le ticket (si Ouvert) ----
  const handleDelete = async () => {
    try {
      await deleteTicket(token, ticketId);
      toast.success("✅ Ticket supprimé avec succès");
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      toast.error("❌ Erreur lors de la suppression du ticket.");
    }
  };

  // ---- Employé : fermer anticipément (si En cours) ----
  const handleEarlyClose = async () => {
    if (!earlyCloseMotif.trim()) return toast.error("❌ Veuillez donner un motif de fermeture.");
    try {
      await closeTicketEarly(token, ticketId, earlyCloseMotif);
      setShowEarlyCloseForm(false);
      setEarlyCloseMotif("");
      toast.success("✅ Ticket fermé avec succès");
      await loadData();
      if (onUpdated) onUpdated();
    } catch (err) {
      toast.error("❌ Erreur lors de la fermeture du ticket.");
    }
  };

  // ============================================================
  // RENDU
  // ============================================================
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            {ticket && (
              <>
                <span className="text-xs text-gray-400 font-mono">#TK-{ticket.id}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusBadge(ticket.statut)}`}>{ticket.statut}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${prioriteBadge(ticket.priorite)}`}>{ticket.priorite}</span>
                {ticket.statut === "En cours" && comments.some(c => c.contenu?.startsWith("⚠️")) && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold animate-pulse">Signalé</span>
                )}
              </>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-gray-500">Chargement...</div>
          ) : !ticket ? (
            <div className="text-center text-red-500">Ticket introuvable</div>
          ) : (
            <>
              {/* Titre + infos */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{ticket.titre}</h2>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-semibold">{ticket.categorie}</span>
                  <span className="text-gray-400">Demandeur : <strong className="text-gray-700">{getAuthorName(ticket)}</strong></span>
                  {ticket.technicien && (
                    <span className="text-gray-400">Technicien : <strong className="text-gray-700">{ticket.technicien.prenom} {ticket.technicien.nom}</strong></span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Description</p>
                <p className="text-gray-600 text-sm leading-relaxed">{ticket.description}</p>
              </div>

              {/* Actions supplémentaires Employé/Responsable (Supprimer / Fermer) */}
              {role !== 3 && ticket.statut === "Ouvert" && (
                <div className="flex justify-end">
                  <button onClick={() => setConfirmConfig({ isOpen: true })} className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1 transition-colors">
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Annuler et supprimer ce ticket
                  </button>
                </div>
              )}

              {role !== 3 && ticket.statut === "En cours" && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-orange-600">lock_clock</span>
                      <div>
                        <p className="font-bold text-orange-900 text-sm">Problème résolu ?</p>
                        <p className="text-orange-700 text-xs">Vous pouvez fermer ce ticket si le problème s'est résolu.</p>
                      </div>
                    </div>
                    {!showEarlyCloseForm && (
                      <button onClick={() => setShowEarlyCloseForm(true)} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg transition-colors">
                        Fermer le ticket
                      </button>
                    )}
                  </div>
                  {showEarlyCloseForm && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-orange-200/50">
                      <textarea
                        value={earlyCloseMotif}
                        onChange={(e) => setEarlyCloseMotif(e.target.value)}
                        className="w-full border border-orange-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none resize-none"
                        rows="2"
                        placeholder="Motif de la fermeture..."
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button onClick={handleEarlyClose} className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors">
                          Confirmer la fermeture
                        </button>
                        <button onClick={() => { setShowEarlyCloseForm(false); setEarlyCloseMotif(""); }} className="px-4 py-2 border border-orange-200 text-orange-600 bg-white text-sm rounded-lg hover:bg-orange-100">
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Bannière Résolu (Employé/Responsable) */}
              {role !== 3 && ticket.statut === "Résolu" && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <div>
                      <p className="font-bold text-green-900 text-sm">Ce ticket a été marqué comme résolu.</p>
                      <p className="text-green-700 text-xs">Confirmez-vous la résolution ou signalez un problème ?</p>
                    </div>
                  </div>
                  {!showSignalForm ? (
                    <div className="flex gap-3">
                      <button onClick={handleConfirm} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2 rounded-lg transition-colors uppercase">
                        ✓ Confirmer la résolution
                      </button>
                      <button onClick={() => setShowSignalForm(true)} className="flex-1 border border-red-200 text-red-600 bg-white hover:bg-red-50 text-sm font-bold py-2 rounded-lg transition-colors uppercase">
                        ⚠ Signaler un problème
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        value={signalMessage}
                        onChange={(e) => setSignalMessage(e.target.value)}
                        className="w-full border border-red-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none"
                        rows="3"
                        placeholder="Décrivez le problème persistant..."
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button onClick={handleSignal} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2 rounded-lg transition-colors">
                          Envoyer le signalement
                        </button>
                        <button onClick={() => { setShowSignalForm(false); setSignalMessage(""); }} className="px-4 py-2 border border-gray-200 text-gray-500 text-sm rounded-lg hover:bg-gray-50">
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Historique des commentaires */}
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Historique des commentaires</p>
                {comments.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">Aucun commentaire pour le moment.</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment, i) => {
                      const name = comment.auteur?.prenom && comment.auteur?.nom
                        ? `${comment.auteur.prenom} ${comment.auteur.nom}`
                        : "Utilisateur";
                      const isSignal = comment.contenu?.startsWith("⚠️");
                      return (
                        <div key={comment.id || i} className={`flex gap-3 ${isSignal ? "bg-red-50 border border-red-100 rounded-xl p-3" : ""}`}>
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isSignal ? "bg-red-200 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                            {initials(name)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-gray-900">{name}</span>
                              <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                            </div>
                            <div className={`p-3 rounded-lg rounded-tl-none text-sm ${isSignal ? "text-red-700 bg-red-50" : "bg-gray-50 text-gray-700"}`}>
                              {comment.contenu}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Formulaire technicien */}
              {role === 3 && ticket.statut !== "Fermé" && (
                <div className="border-t border-gray-100 pt-5">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Intervenir sur ce ticket</p>
                  <form onSubmit={handleIntervention} className="space-y-3">
                    <textarea
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      rows="3"
                      placeholder="Écrivez votre rapport d'intervention..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                    />
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Nouveau statut</label>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 h-10 text-sm outline-none bg-white cursor-pointer"
                        >
                          {ticket.statut === "Ouvert" && <option value="Ouvert">Ouvert</option>}
                          <option value="En cours">En cours</option>
                          <option value="Résolu">Résolu</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold uppercase transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? "Envoi..." : "Publier"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        title="Supprimer ce ticket ?"
        message="Êtes-vous sûr de vouloir supprimer ce ticket ? Cette action est irréversible."
        onCancel={() => setConfirmConfig({ isOpen: false })}
        onConfirm={handleDelete}
        isDanger={true}
        confirmText="Supprimer"
      />
    </div>
  );
}
