import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // États des modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // États des formulaires
  const [newUser, setNewUser] = useState({ nom: "", prenom: "", email: "", password: "", fonction: "", role_id: "1" });
  const [userToEdit, setUserToEdit] = useState(null);

  // ---------------------------------------------------------
  // CORRECTION ICI : Dictionnaire pour traduire les ID en noms de rôles
  // ---------------------------------------------------------
  const getRoleDetails = (roleId) => {
    // Si ton backend renvoie directement le nom (ex: "Employé"), tu peux ignorer ça.
    // Si ton backend renvoie un ID (ex: 1, 2, 3), ce dictionnaire fait la traduction.
    const roleMap = {
      1: { label: "Employé", colorClass: "bg-blue-100 text-blue-700" },
      2: { label: "Responsable", colorClass: "bg-green-100 text-green-700" },
      3: { label: "Technicien", colorClass: "bg-purple-100 text-purple-700" },
      4: { label: "Administrateur", colorClass: "bg-amber-100 text-amber-700" },
    };

    // Si le rôle est déjà un texte (ex: "Employé"), on le retourne directement
    if (typeof roleId === 'string' && isNaN(roleId)) {
      const foundKey = Object.keys(roleMap).find(key => roleMap[key].label === roleId);
      if (foundKey) return roleMap[foundKey];
      return { label: roleId, colorClass: "bg-gray-100 text-gray-700" };
    }

    // Si c'est un ID (nombre ou string numérique)
    return roleMap[roleId] || { label: "Inconnu", colorClass: "bg-gray-100 text-gray-500" };
  };
  // ---------------------------------------------------------

  // 1. Charger les utilisateurs depuis l'API
  const loadUsers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } else {
        console.error("Erreur chargement utilisateurs");
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [token]);

  // 2. Créer un utilisateur
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewUser({ nom: "", prenom: "", email: "", password: "", fonction: "", role_id: "1" });
        loadUsers(); // Recharger la liste
      } else {
        const error = await res.json();
        alert(`Erreur : ${error.message || "Impossible de créer l'utilisateur"}`);
      }
    } catch (error) {
      alert("Impossible de contacter le serveur.");
    }
  };

  // 3. Modifier un utilisateur
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!token || !userToEdit) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userToEdit.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(userToEdit),
      });

      if (res.ok) {
        setShowEditModal(false);
        setUserToEdit(null);
        loadUsers(); // Recharger la liste
      } else {
        const error = await res.json();
        alert(`Erreur : ${error.message || "Impossible de modifier l'utilisateur"}`);
      }
    } catch (error) {
      alert("Impossible de contacter le serveur.");
    }
  };

  // 4. Supprimer un utilisateur
  const handleDelete = async (userId) => {
    if (!token) return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (res.ok) {
        loadUsers(); // Recharger la liste
      } else {
        const error = await res.json();
        alert(`Erreur : ${error.message || "Impossible de supprimer l'utilisateur"}`);
      }
    } catch (error) {
      alert("Impossible de contacter le serveur.");
    }
  };

  // Helpers pour l'affichage du nom
  const getFullName = (user) => {
    if (user.nom && user.prenom) return `${user.prenom} ${user.nom}`;
    if (user.name) return user.name;
    return "Utilisateur inconnu";
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Chargement des utilisateurs...</div>;
  }

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
              {users.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-6 text-gray-500">Aucun utilisateur trouvé.</td></tr>
              ) : (
                users.map((user) => {
                  // ICI on récupère le détail du rôle
                  const roleData = getRoleDetails(user.role_id || user.role);
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">{user.id}</td>
                      <td className="px-6 py-3 font-semibold">{getFullName(user)}</td>
                      <td className="px-6 py-3 text-gray-500">{user.email}</td>
                      <td className="px-6 py-3 text-gray-500">{user.fonction || "-"}</td>
                      <td className="px-6 py-3">
                        {/* On utilise les données du mapping */}
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${roleData.colorClass}`}>
                          {roleData.label}
                        </span>
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
                          {user.role !== "Administrateur" && user.role_id !== "4" && user.role_id !== 4 && (
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 hover:text-red-800 hover:underline text-xs font-bold transition-colors"
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
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
            <form className="p-6 space-y-4" onSubmit={handleCreateSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Nom</label>
                  <input 
                    type="text" 
                    value={newUser.nom}
                    onChange={(e) => setNewUser({...newUser, nom: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">Prénom</label>
                  <input 
                    type="text" 
                    value={newUser.prenom}
                    onChange={(e) => setNewUser({...newUser, prenom: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Email</label>
                <input 
                  type="email" 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Mot de passe</label>
                <input 
                  type="password" 
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Fonction</label>
                <input 
                  type="text" 
                  value={newUser.fonction}
                  onChange={(e) => setNewUser({...newUser, fonction: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Rôle</label>
                <select 
                  value={newUser.role_id}
                  onChange={(e) => setNewUser({...newUser, role_id: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="1">Employé</option>
                  <option value="2">Responsable</option>
                  <option value="3">Technicien</option>
                  <option value="4">Administrateur</option>
                </select>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold uppercase hover:bg-blue-700 transition-all shadow-md" type="submit">CRÉER LE COMPTE</button>
            </form>
          </div>
        </div>
      )}

      {/* Modale Modifier */}
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
                  value={userToEdit.nom || ""}
                  onChange={(e) => setUserToEdit({ ...userToEdit, nom: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Prénom</label>
                <input
                  type="text"
                  value={userToEdit.prenom || ""}
                  onChange={(e) => setUserToEdit({ ...userToEdit, prenom: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
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