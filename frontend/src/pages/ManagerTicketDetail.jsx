import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

export default function ManagerTicketDetail() {
  const { id } = useParams(); // Récupère l'ID depuis l'URL

  // Simulation des données (normalement, on ferait un fetch vers le backend avec cet ID)
  const ticketData = {
    1: {
      id: 1,
      titre: "Problème Accès VPN",
      description: "Impossible d'établir une connexion stable au VPN depuis le poste PC-RH-04.",
      categorie: "Infrastructure",
      priorite: "Haute",
      statut: "Ouvert",
      technicien: "Jean Michel",
      date: "12 Oct 2023",
    },
    2: {
      id: 2,
      titre: "Mise à jour Logiciel RH",
      description: "Le logiciel RH ne se met pas à jour correctement.",
      categorie: "Logiciel",
      priorite: "Moyenne",
      statut: "En cours",
      technicien: "Sarah Alami",
      date: "14 Oct 2023",
    },
    3: {
      id: 3,
      titre: "Installation Imprimante 4e",
      description: "L'imprimante du bureau 4e ne s'installe pas sur les postes.",
      categorie: "Matériel",
      priorite: "Basse",
      statut: "Résolu",
      technicien: "Paul Legrand",
      date: "08 Oct 2023",
    },
    4: {
      id: 4,
      titre: "Problème écran",
      description: "L'écran du poste de travail clignote constamment.",
      categorie: "Matériel",
      priorite: "Basse",
      statut: "Fermé",
      technicien: "Tom Legrand",
      date: "05 Oct 2023",
    },
  };

  const [ticket, setTicket] = useState(ticketData[id]);
  const [showBanner, setShowBanner] = useState(ticket?.statut === "Résolu");

  // Si l'ID n'existe pas dans les données simulées
  if (!ticket) {
    return <div className="text-center text-red-500 p-8">Ticket introuvable (ID: {id})</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/manager-tickets" className="flex items-center gap-2 text-blue-600 hover:underline text-sm font-semibold">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Retour à mes tickets
      </Link>

      {/* Bannière Résolu - UNIQUEMENT si le statut est "Résolu" */}
      {ticket.statut === "Résolu" && showBanner && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div>
              <h3 className="font-bold text-green-900 text-base">Ce ticket a été marqué comme résolu par le technicien.</h3>
              <p className="text-green-700 text-sm">Confirmez-vous la résolution ?</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                setTicket({ ...ticket, statut: "Fermé" });
                setShowBanner(false);
              }}
              className="flex-1 md:flex-none px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-all uppercase shadow-sm"
            >
              CONFIRMER LA RÉSOLUTION
            </button>
            <button
              onClick={() => {
                setTicket({ ...ticket, statut: "En cours" });
                setShowBanner(false);
              }}
              className="flex-1 md:flex-none px-6 py-2 border border-red-200 text-red-600 bg-white text-sm font-bold rounded-lg hover:bg-red-50 transition-all uppercase"
            >
              SIGNALER UN PROBLÈME
            </button>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Colonne gauche */}
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
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-700 font-bold text-xs">ML</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900">Marc Lemoine <span className="text-gray-500 font-normal">• Technicien</span></span>
                      <span className="text-xs text-gray-500">Il y a 2 heures</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none text-sm text-gray-700">
                      J'ai procédé au remplacement du câble DisplayPort défectueux et mis à jour les pilotes de la carte graphique. Le test de 30 minutes n'a révélé aucun nouveau scintillement.
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white font-bold text-xs">DK</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900">DJANDA Katia <span className="text-gray-500 font-normal">• Demandeur</span></span>
                      <span className="text-xs text-gray-500">Il y a 4 heures</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none text-sm text-gray-700">
                      Merci Marc. Est-ce qu'un remplacement de l'écran est à prévoir si le problème revient demain ?
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white font-bold text-xs">DK</div>
                  <div className="flex-1">
                    <textarea
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      rows="2"
                      placeholder="Ajouter un commentaire..."
                    ></textarea>
                    <div className="mt-2 flex justify-end">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors uppercase">
                        Envoyer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite */}
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
                    {ticket.technicien.split(" ").map(n => n[0]).join("")}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{ticket.technicien}</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Date de création</span>
                <span className="text-sm text-gray-900">{ticket.date}</span>
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