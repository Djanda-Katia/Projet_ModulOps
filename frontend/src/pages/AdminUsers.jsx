import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function AdminUsers() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [users, setUsers] = useState([
    { id: 1, name: "Marie Ewondo", email: "marie.employe@entreprise.com", role: "Employé", fonction: "Rédactrice Web" },
    { id: 2, name: "Paul Tchinda", email: "paul.responsable@entreprise.com", role: "Responsable", fonction: "Chef de Projet" },
    { id: 3, name: "Luc Kamga", email: "luc.technicien@entreprise.com", role: "Technicien", fonction: "Technicien Réseau" },
    { id: 4, name: "Hubert Tchakounté", email: "hubert.admin@entreprise.com", role: "Administrateur", fonction: "Admin Principal" },
  ]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!userToEdit) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userToEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userToEdit),
      });

      if (res.ok) {
        setUsers(users.map(u => u.id === userToEdit.id ? userToEdit : u));
        setShowEditModal(false);
        setUserToEdit(null);
      } else {
        alert("Erreur lors de la mise à jour.");
      }
    } catch (error) {
      alert("Impossible de contacter le serveur.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion Utilisateurs</h1>
          <p className="text-gray-500 text-sm">Gérez les comptes des utilisateurs de la plateforme.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          + CRÉER UN COMPTE
        </button>
      </div>

      {/* ← ICI : Le conteneur n'a plus overflow-hidden, il permet le swipe */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Nom Complet</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Fonction</th>
                <th className="px-6 py-3">Rôle</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">{user.id}</td>
                  <td className="px-6 py-3 font-semibold">{user.name}</td>
                  <td className="px-6 py-3 text-gray-500">{user.email}</td>
                  <td className="px-6 py-3 text-gray-500">{user.fonction}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      user.role === "Employé" ? "bg-blue-100 text-blue-700" :
                      user.role === "Responsable" ? "bg-green-100 text-green-700" :
                      user.role === "Technicien" ? "bg-purple-100 text-purple-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>{user.role}</span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setUserToEdit(user);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:underline text-xs font-bold"
                      >
                        Modifier
                      </button>
                      {user.role !== "Administrateur" && (
                        <button
                          onClick={() => {
                            // supprimer
                          }}
                          className="text-red-600 hover:text-red-800 hover:underline text-xs font-bold transition-colors"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale Créer */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-blue-600">Créer un compte</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-red-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-600 mb-2">Nom</label><input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div><label className="block text-sm font-semibold text-gray-600 mb-2">Prénom</label><input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              </div>
              <div><label className="block text-sm font-semibold text-gray-600 mb-2">Email</label><input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-sm font-semibold text-gray-600 mb-2">Mot de passe</label><input type="password" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-sm font-semibold text-gray-600 mb-2">Fonction</label><input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div><label className="block text-sm font-semibold text-gray-600 mb-2">Rôle</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="1">Employé</option>
                  <option value="2">Responsable</option>
                  <option value="3">Technicien</option>
                </select>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold uppercase hover:bg-blue-700 transition-all shadow-md" type="submit">CRÉER LE COMPTE</button>
            </form>
          </div>
        </div>
      )}

      {/* Modale Modifier (Nom, Prénom, Fonction uniquement) */}
      {showEditModal && userToEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-blue-600">Modifier les informations</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-red-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleEditSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Nom</label>
                <input
                  type="text"
                  value={userToEdit.name}
                  onChange={(e) => setUserToEdit({ ...userToEdit, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Prénom</label>
                <input
                  type="text"
                  value={userToEdit.prenom || ""}
                  onChange={(e) => setUserToEdit({ ...userToEdit, prenom: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Fonction</label>
                <input
                  type="text"
                  value={userToEdit.fonction || ""}
                  onChange={(e) => setUserToEdit({ ...userToEdit, fonction: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg transition-colors uppercase">Annuler</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors uppercase">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}