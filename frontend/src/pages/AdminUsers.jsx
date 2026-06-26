import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';
import { getUsers } from "../services/api";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [filters, setFilters] = useState({});

  // États des modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // NOUVEL ÉTAT : Modale de confirmation de suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // États des formulaires
  const [newUser, setNewUser] = useState({ nom: "", prenom: "", email: "", password: "", fonction: "", role_id: "1" });
  const [userToEdit, setUserToEdit] = useState(null);

  // ---------------------------------------------------------
  // Dictionnaire pour traduire les ID en noms de rôles
  // ---------------------------------------------------------
  const getRoleDetails = (roleId) => {
    const roleMap = {
      1: { label: "Employé", colorClass: "bg-blue-100 text-blue-700" },
      2: { label: "Responsable", colorClass: "bg-green-100 text-green-700" },
      3: { label: "Technicien", colorClass: "bg-purple-100 text-purple-700" },
      4: { label: "Administrateur", colorClass: "bg-amber-100 text-amber-700" },
    };

    if (typeof roleId === 'string' && isNaN(roleId)) {
      const foundKey = Object.keys(roleMap).find(key => roleMap[key].label === roleId);
      if (foundKey) return roleMap[foundKey];
      return { label: roleId, colorClass: "bg-gray-100 text-gray-700" };
    }

    return roleMap[roleId] || { label: "Inconnu", colorClass: "bg-gray-100 text-gray-500" };
  };
  // ---------------------------------------------------------

  const loadUsers = async (page = 1, currentFilters = filters) => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getUsers(token, { page, ...currentFilters });
      setUsers(data.data || []);
      setCurrentPage(data.current_page || 1);
      setLastPage(data.last_page || 1);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1, filters);
  }, [token]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    loadUsers(1, newFilters);
  };

  const handlePageChange = (page) => {
    loadUsers(page, filters);
  };

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
        toast.success("✅ Utilisateur créé avec succès !");
        setShowCreateModal(false);
        setNewUser({ nom: "", prenom: "", email: "", password: "", fonction: "", role_id: "1" });
        loadUsers(1, filters);
      } else {
        const error = await res.json();
        toast.error("❌ " + (error.message || "Impossible de créer l'utilisateur"));
      }
    } catch (error) {
      toast.error("❌ Impossible de contacter le serveur.");
    }
  };

  // 3. Modifier les infos générales d'un utilisateur
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
        toast.success("✅ Informations mises à jour avec succès !");
        setShowEditModal(false);
        setUserToEdit(null);
        loadUsers(currentPage, filters);
      } else {
        const error = await res.json();
        toast.error("❌ " + (error.message || "Impossible de modifier l'utilisateur"));
      }
    } catch (error) {
      toast.error("❌ Impossible de contacter le serveur.");
    }
  };

  // 4. Supprimer un utilisateur
  const handleDelete = async () => {
    if (!token || !userToDelete) return;

    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("✅ Utilisateur supprimé avec succès.");
        loadUsers(currentPage, filters);
      } else {
        const error = await res.json();
        toast.error("❌ " + (error.message || "Impossible de supprimer l'utilisateur"));
      }
      
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error("❌ Impossible de contacter le serveur.");
      setShowDeleteModal(false);
      setUserToDelete(null);
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

      <FilterBar
        onFilterChange={handleFilterChange}
        showPerson={false}
        showStatus={true}
        statusFieldName="role_id"
        statusOptions={[
          { value: '1', label: 'Employé' },
          { value: '2', label: 'Responsable' },
          { value: '3', label: 'Technicien' },
          { value: '4', label: 'Administrateur' },
        ]}
      />

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
                  const roleData = getRoleDetails(user.role_id || user.role);
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">{user.id}</td>
                      <td className="px-6 py-3 font-semibold">{getFullName(user)}</td>
                      <td className="px-6 py-3 text-gray-500">{user.email}</td>
                      <td className="px-6 py-3 text-gray-500">{user.fonction || "-"}</td>
                      <td className="px-6 py-3">
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
                              onClick={() => {
                                setUserToDelete(user);
                                setShowDeleteModal(true);
                              }}
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

      <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={handlePageChange} />

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

      {/* ============================================================
          NOUVELLE MODALE : Confirmation de suppression
          ============================================================ */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-red-600">Supprimer ce compte ?</h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-red-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6">
                Êtes-vous sûr de vouloir supprimer le compte de <span className="font-bold">{userToDelete.prenom} {userToDelete.nom}</span> ?<br />
                <span className="text-red-500 text-sm font-semibold">Cette action est irréversible et toutes les données associées seront perdues.</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg transition-colors uppercase"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors uppercase"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}