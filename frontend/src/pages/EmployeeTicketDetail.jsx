import { useState } from "react";
import { Link } from "react-router-dom";

export default function EmployeeTicketDetail() {
  // Simuler un statut résolu pour afficher la bannière
  const [status, setStatus] = useState("Résolu");
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="space-y-6">
      {/* Bouton Retour */}
      <div>
        <Link to="/tickets" className="flex items-center gap-2 text-blue-600 hover:underline text-sm font-semibold">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Retour à mes tickets
        </Link>
      </div>

      {/* Bannière Résolu (Conditionnelle) */}
      {showBanner && status === "Résolu" && (
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
              onClick={() => {
                setStatus("Fermé");
                setShowBanner(false);
              }}
              className="flex-1 md:flex-none px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg transition-all uppercase shadow-sm"
            >
              CONFIRMER LA RÉSOLUTION
            </button>
            <button
              onClick={() => {
                setStatus("En cours");
                setShowBanner(false);
              }}
              className="flex-1 md:flex-none px-6 py-2 border border-red-200 text-red-600 bg-white text-sm font-bold rounded-lg hover:bg-red-50 transition-all uppercase"
            >
              SIGNALER UN PROBLÈME
            </button>
          </div>
        </div>
      )}

      {/* Contenu principal : 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Colonne gauche (8/12) : Description et Commentaires */}
        <div className="lg:col-span-8 space-y-6">
          {/* Carte Détails du ticket */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* En-tête */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-sm text-gray-400 font-mono">#TKT-84920</span>
                <h2 className="text-xl font-bold text-gray-900 mt-1">Dysfonctionnement du poste de travail - Écran scintillant</h2>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">Matériel</span>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Priorité Haute</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                status === "Résolu" || status === "Fermé" ? "bg-blue-100 text-blue-700" :
                status === "En cours" ? "bg-amber-100 text-amber-700" :
                "bg-gray-100 text-gray-600"
              }`}>
                {status}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Description</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                L'écran principal de mon poste de travail présente un scintillement constant depuis ce matin. J'ai essayé de redémarrer le système et de vérifier les connectiques HDMI, mais le problème persiste. Cela rend le travail prolongé impossible.
              </p>
            </div>

            {/* Historique des commentaires */}
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">Historique des commentaires</h4>
              <div className="space-y-4">
                {/* Commentaire 1 - Technicien */}
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

                {/* Commentaire 2 - Demandeur (Moi) */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white font-bold text-xs">TB</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900">Thomas Bernard <span className="text-gray-500 font-normal">• Demandeur</span></span>
                      <span className="text-xs text-gray-500">Il y a 4 heures</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none text-sm text-gray-700">
                      Merci Marc. Est-ce qu'un remplacement de l'écran est à prévoir si le problème revient demain ?
                    </div>
                  </div>
                </div>
              </div>

              {/* Zone d'ajout de commentaire */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white font-bold text-xs">TB</div>
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

        {/* Colonne droite (4/12) : Informations */}
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
                  status === "Résolu" || status === "Fermé" ? "bg-blue-100 text-blue-700" :
                  status === "En cours" ? "bg-amber-100 text-amber-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {status}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Technicien</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px]">ML</div>
                  <span className="text-sm font-medium text-gray-900">Marc Lemoine</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Date de création</span>
                <span className="text-sm text-gray-900">12 Mai 2024</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Dernière mise à jour</span>
                <span className="text-sm text-gray-900">Aujourd'hui, 14:42</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Catégorie</span>
                <span className="text-sm text-gray-900">Matériel</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Priorité</span>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">HAUTE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}