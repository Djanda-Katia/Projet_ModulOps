import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getTicketById, getTicketComments, deleteTicket, closeTicketEarly } from "../services/api";
import toast from "react-hot-toast";
import ConfirmModal from "./ConfirmModal";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

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
    "Ouvert": "bg-blue-50 text-blue-700 border-blue-200",
    "En cours": "bg-amber-50 text-amber-700 border-amber-200",
    "Résolu": "bg-green-50 text-green-700 border-green-200",
    "Fermé": "bg-gray-50 text-gray-700 border-gray-200",
  };
  return map[statut] ?? "bg-gray-50 text-gray-700 border-gray-200";
};

const prioriteBadge = (priorite) => {
  const map = {
    "Haute": "bg-red-50 text-red-700 border-red-200",
    "Moyenne": "bg-blue-50 text-blue-700 border-blue-200",
    "Basse": "bg-gray-50 text-gray-700 border-gray-200",
  };
  return map[priorite] ?? "bg-gray-50 text-gray-700 border-gray-200";
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

  const handleIntervention = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return toast.error("❌ Le commentaire est obligatoire.");
    setIsSubmitting(true);
    try {
      const body = { contenu: newComment };
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

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden transform transition-all">

        {/* HEADER MODAL */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 relative overflow-hidden">
          <div className="flex flex-col gap-1 z-10 relative">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-600 text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Détails du Ticket</h2>
            </div>
            {ticket && (
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-10">Référence : #TK-{ticket.id}</p>
            )}
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm z-10 relative">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto flex-1 p-8 space-y-8 bg-gray-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-4">
              <span className="material-symbols-outlined animate-spin text-4xl">autorenew</span>
              <span className="font-medium">Chargement des données...</span>
            </div>
          ) : !ticket ? (
            <div className="text-center text-red-500 font-bold text-lg">Ticket introuvable</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* COLONNE GAUCHE : INFOS PRINCIPALES */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{ticket.titre}</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-wider ${statusBadge(ticket.statut)}`}>
                      {ticket.statut}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-wider ${prioriteBadge(ticket.priorite)}`}>
                      Priorité {ticket.priorite}
                    </span>
                    <span className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-full font-bold text-xs uppercase tracking-wider">
                      {ticket.categorie}
                    </span>
                    {ticket.statut === "En cours" && comments.some(c => c.contenu?.startsWith("⚠️")) && (
                      <span className="px-4 py-1.5 bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">warning</span> Signalé
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">Description du problème</p>
                  <p className="text-gray-700 text-[15px] leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                </div>

                {/* Actions supplémentaires Employé/Responsable */}
                {role !== 3 && ticket.statut === "Ouvert" && (
                  <div className="flex justify-end pt-2">
                    <button onClick={() => setConfirmConfig({ isOpen: true })} className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all uppercase tracking-wide">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Annuler et supprimer ce ticket
                    </button>
                  </div>
                )}

                {role !== 3 && ticket.statut === "En cours" && (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[28px]">lock_clock</span>
                        </div>
                        <div>
                          <p className="font-black text-orange-900 text-base mb-0.5">Le problème est résolu ?</p>
                          <p className="text-orange-700 text-sm">Vous pouvez fermer ce ticket vous-même si le problème ne nécessite plus d'assistance.</p>
                        </div>
                      </div>
                      {!showEarlyCloseForm && (
                        <button onClick={() => setShowEarlyCloseForm(true)} className="px-5 py-2.5 bg-white border-2 border-orange-200 hover:border-orange-600 text-orange-600 text-sm font-black rounded-xl transition-colors shrink-0 uppercase tracking-wide shadow-sm">
                          Fermer le ticket
                        </button>
                      )}
                    </div>
                    {showEarlyCloseForm && (
                      <div className="mt-5 pt-5 border-t border-orange-200/50 space-y-4">
                        <textarea
                          value={earlyCloseMotif}
                          onChange={(e) => setEarlyCloseMotif(e.target.value)}
                          className="w-full bg-white border border-orange-200 rounded-xl p-4 text-sm font-medium focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none resize-none shadow-sm"
                          rows="2"
                          placeholder="Veuillez indiquer brièvement pourquoi vous fermez le ticket..."
                          autoFocus
                        />
                        <div className="flex gap-3">
                          <button onClick={handleEarlyClose} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-sm font-black uppercase tracking-wider py-3 rounded-xl transition-all shadow-sm">
                            Confirmer la fermeture
                          </button>
                          <button onClick={() => { setShowEarlyCloseForm(false); setEarlyCloseMotif(""); }} className="flex-1 bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-sm font-black uppercase tracking-wider py-3 rounded-xl transition-all">
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Bannière Résolu (Employé/Responsable) */}
                {role !== 3 && ticket.statut === "Résolu" && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </div>
                      <div>
                        <p className="font-black text-green-900 text-lg mb-0.5">Intervention terminée</p>
                        <p className="text-green-700 text-sm">Le technicien a marqué ce ticket comme résolu. Veuillez confirmer la résolution ou signaler un problème persistant.</p>
                      </div>
                    </div>
                    {!showSignalForm ? (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={handleConfirm} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-black uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[20px]">thumb_up</span> Confirmer la résolution
                        </button>
                        <button onClick={() => setShowSignalForm(true)} className="flex-1 bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 text-sm font-black uppercase tracking-wider py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[20px]">warning</span> Signaler un problème
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <textarea
                          value={signalMessage}
                          onChange={(e) => setSignalMessage(e.target.value)}
                          className="w-full bg-white border border-red-200 rounded-xl p-4 text-sm font-medium focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none resize-none shadow-sm"
                          rows="3"
                          placeholder="Décrivez précisément le problème que vous rencontrez encore..."
                          autoFocus
                        />
                        <div className="flex gap-3">
                          <button onClick={handleSignal} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-black uppercase tracking-wider py-3 rounded-xl transition-all shadow-sm">
                            Envoyer le signalement
                          </button>
                          <button onClick={() => { setShowSignalForm(false); setSignalMessage(""); }} className="flex-1 bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-black uppercase tracking-wider py-3 rounded-xl transition-all">
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* COLONNE DROITE : INFOS SECONDAIRES ET CHAT */}
              <div className="space-y-6">
                {/* Personnes impliquées */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Demandeur</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-black text-gray-600 shadow-inner border border-white">
                        {initials(getAuthorName(ticket))}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{getAuthorName(ticket)}</p>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{formatDate(ticket.created_at)}</p>
                      </div>
                    </div>
                  </div>
                  {ticket.technicien && (
                    <div className="pt-4 border-t border-gray-50">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Technicien Assigné</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-sm font-black text-blue-700 shadow-inner border border-white">
                          {ticket.technicien.prenom[0]}{ticket.technicien.nom[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{ticket.technicien.prenom} {ticket.technicien.nom}</p>
                          <p className="text-[11px] text-blue-500 font-bold uppercase tracking-wider">Support IT</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Historique des commentaires */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col max-h-[500px]">
                  <div className="p-4 border-b border-gray-50 shrink-0">
                    <p className="text-xs font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-gray-400">forum</span> Historique
                    </p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
                    {comments.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 gap-2 py-8">
                        <span className="material-symbols-outlined text-4xl opacity-50">chat_bubble</span>
                        <p className="text-xs font-bold uppercase tracking-wider">Aucun commentaire</p>
                      </div>
                    ) : (
                      comments.map((comment, i) => {
                        const name = comment.auteur?.prenom && comment.auteur?.nom
                          ? `${comment.auteur.prenom} ${comment.auteur.nom}`
                          : "Utilisateur";
                        const isSignal = comment.contenu?.startsWith("⚠️") || comment.contenu?.startsWith("❌");
                        const isSystem = comment.contenu?.startsWith("🔒");
                        
                        return (
                          <div key={comment.id || i} className="flex gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 shadow-inner border border-white mt-1 ${isSignal ? "bg-red-100 text-red-700" : isSystem ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                              {initials(name)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-baseline justify-between mb-1">
                                <span className="text-[13px] font-black text-gray-900">{name}</span>
                                <span className="text-[10px] font-bold text-gray-400">{formatDate(comment.created_at)}</span>
                              </div>
                              <div className={`p-3.5 rounded-2xl rounded-tl-none text-sm font-medium shadow-sm border ${isSignal ? "bg-red-50 text-red-800 border-red-100" : isSystem ? "bg-orange-50 text-orange-800 border-orange-100" : "bg-gray-50 text-gray-800 border-gray-100"}`}>
                                {comment.contenu}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Formulaire technicien */}
                  {role === 3 && ticket.statut !== "Fermé" && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
                      <form onSubmit={handleIntervention} className="space-y-3">
                        <textarea
                          className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none resize-none transition-all shadow-sm"
                          rows="2"
                          placeholder="Votre rapport d'intervention..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          required
                        />
                        <div className="flex gap-2 items-center">
                          <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-1/2 bg-white border border-gray-200 rounded-xl h-10 px-3 text-xs font-bold text-gray-700 outline-none cursor-pointer shadow-sm focus:border-blue-500"
                          >
                            {ticket.statut === "Ouvert" && <option value="Ouvert">Ouvert</option>}
                            <option value="En cours">En cours</option>
                            <option value="Résolu">Résolu</option>
                          </select>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-1/2 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 shadow-sm"
                          >
                            {isSubmitting ? "..." : "Publier"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
