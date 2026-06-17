import { Link } from "react-router-dom";

export default function TechnicianTicketDetail() {
  return (
    <div className="space-y-6">
      <Link to="/technician-tickets" className="flex items-center gap-2 text-blue-600 hover:underline text-sm font-semibold">
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Retour à mes tickets
      </Link>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400 font-mono">#TK-4482</span>
        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">Réseau</span>
        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded uppercase">Haute</span>
        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded uppercase">En cours</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Problème accès VPN — Poste de travail RH</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">Description</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Impossible d'établir une connexion stable au VPN depuis le poste "PC-RH-04". Le client AnyConnect affiche une erreur d'authentification certificat "Certificate Validation Failure" malgré le renouvellement de la session Active Directory.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-6">Historique des commentaires</h4>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">ML</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900">Marie Legrand (RH)</span>
                    <span className="text-xs text-gray-500">Hier, 14:20</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none text-sm text-gray-700">
                    J'ai essayé de redémarrer le routeur local, mais cela n'a rien changé. Pourriez-vous intervenir rapidement ?
                  </div>
                </div>
              </div>
              <div className="flex gap-4 flex-row-reverse">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">PD</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-row-reverse mb-1">
                    <span className="text-sm font-semibold text-gray-900">Patrick Dubois (Technicien)</span>
                    <span className="text-xs text-gray-500">Aujourd'hui, 09:15</span>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg rounded-tr-none text-sm text-gray-700">
                    Bonjour Marie, je prends en charge votre ticket. Je vais vérifier l'état des certificats sur le serveur RADIUS. Je reviens vers vous d'ici 30 minutes.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 mb-4">Ajouter un commentaire</h4>
              <div className="space-y-4">
                <textarea
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  rows="3"
                  placeholder="Écrivez votre réponse ici..."
                ></textarea>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-2">Changer le statut</label>
                    <select className="w-full border border-gray-200 rounded-lg px-4 h-10 text-sm outline-none">
                      <option>En cours</option>
                      <option>Résolu</option>
                    </select>
                  </div>
                  <button className="h-10 px-6 bg-blue-600 text-white rounded-lg text-sm font-bold uppercase hover:bg-blue-700">
                    Publier le commentaire
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">info</span>
              Informations
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Statut</span>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold uppercase">En cours</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Demandeur</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">ML</div>
                  <span className="text-sm font-medium">Marie Legrand</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Date de création</span>
                <span className="text-sm text-gray-900">Hier, 15:20</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Dernière mise à jour</span>
                <span className="text-sm text-gray-900">Aujourd'hui, 09:30</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Catégorie</span>
                <span className="text-sm text-gray-900">Réseau</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Priorité</span>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold uppercase">Haute</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}