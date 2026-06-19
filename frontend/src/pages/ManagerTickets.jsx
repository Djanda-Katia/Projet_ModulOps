import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getTickets, createTicket, getTechniciens } from "../services/api";

export default function ManagerTickets() {
  const { token } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulaire de création
  const [form, setForm] = useState({
    titre: "",
    categorie: "Matériel",
    description: "",
    technicien_id: "",
  });

  // 3. Charger les tickets UNE SEULE FOIS au démarrage (dépendances vides)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsData, techniciensData] = await Promise.all([
          getTickets(token),
          getTechniciens(token),
        ]);
        setTickets(ticketsData);
        setTechniciens(techniciensData);
      } catch (error) {
        console.error("Erreur chargement tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, []); // <-- Tableau vide : exécuté UNE SEULE FOIS

  // 2. Soumettre un nouveau ticket (mise à jour locale sans rechargement)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newTicket = await createTicket(token, form);
      // Ajout du nouveau ticket au tableau local (sans recharger)
      setTickets(prev => [...prev, newTicket.data]);
      setShowModal(false);
      setForm({
        titre: "",
        categorie: "Matériel",
        description: "",
        technicien_id: "",
      });
    } catch (error) {
      console.error("Erreur création ticket:", error);
    }
  };

  // 1. Statistiques recalculées automatiquement à chaque changement de tickets
  const stats = useMemo(() => {
    return {
      ouvert: tickets.filter(t => t.statut === "Ouvert").length,
      enCours: tickets.filter(t => t.statut === "En cours").length,
      ferme: tickets.filter(t => t.statut === "Fermé" || t.statut === "Résolu").length,
    };
  }, [tickets]); // <-- Se recalcule à chaque modification de tickets

  // Filtrer les tickets selon le statut
  const filtered = statusFilter === "all" 
    ? tickets 
    : tickets.filter(t => t.statut === statusFilter);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <p className="text-gray-500 text-sm">Créez et suivez vos demandes de support technique.</p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          + CRÉER UN TICKET
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Ouverts</p>
            <h3 className="text-3xl font-bold text-blue-600">{stats.ouvert}</h3>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>folder_open</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">En cours</p>
            <h3 className="text-3xl font-bold text-amber-600">{stats.enCours}</h3>
          </div>
          <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Fermés</p>
            <h3 className="text-3xl font-bold text-gray-500">{stats.ferme}</h3>
          </div>
          <div className="p-3 bg-gray-100 rounded-lg text-gray-500">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
        </div>
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
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Titre</th>
                <th className="px-6 py-3">Catégorie</th>
                <th className="px-6 py-3">Priorité</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3">Technicien</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? (
                filtered.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-semibold">{ticket.titre}</td>
                    <td className="px-6 py-3 text-gray-500">{ticket.categorie}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        ticket.priorite === "Haute" ? "bg-red-100 text-red-700" :
                        ticket.priorite === "Moyenne" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{ticket.priorite}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        ticket.statut === "Ouvert" ? "bg-blue-100 text-blue-700" :
                        ticket.statut === "En cours" ? "bg-amber-100 text-amber-700" :
                        ticket.statut === "Résolu" ? "bg-purple-100 text-purple-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          ticket.statut === "Ouvert" ? "bg-blue-500" :
                          ticket.statut === "En cours" ? "bg-amber-500" :
                          ticket.statut === "Résolu" ? "bg-purple-500" :
                          "bg-gray-400"
                        }`}></span>
                        {ticket.statut}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                          {ticket.technicien?.nom?.[0]}{ticket.technicien?.prenom?.[0] || "?"}
                        </div>
                        <span>{ticket.technicien ? `${ticket.technicien.prenom} ${ticket.technicien.nom}` : "Non assigné"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link to={`/manager-tickets/${ticket.id}`} className="text-blue-600 font-bold hover:underline text-sm">
                        Voir détails
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-3 text-center text-gray-500">
                    Aucun ticket trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-blue-600">Créer un ticket</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Titre</label>
                <input
                  type="text"
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Problème de connexion"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Catégorie</label>
                <select
                  value={form.categorie}
                  onChange={(e) => setForm({ ...form, categorie: e.target.value })}
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
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Décrivez votre problème..."
                  rows="4"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Technicien</label>
                <select
                  value={form.technicien_id}
                  onChange={(e) => setForm({ ...form, technicien_id: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Choisir un technicien</option>
                  {techniciens.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.prenom} {t.nom}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold uppercase hover:bg-blue-700 transition-all"
              >
                Soumettre le ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}