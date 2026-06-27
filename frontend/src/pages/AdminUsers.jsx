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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [userToDelete, setUserToDelete] = useState(null);
  const [newUser, setNewUser] = useState({ nom: "", prenom: "", email: "", password: "", fonction: "", role_id: "1" });
  const [userToEdit, setUserToEdit] = useState(null);

  const getRoleDetails = (roleId) => {
    const roleMap = {
      1: { label: "Employé", colorClass: "bg-blue-50 text-blue-700 border-blue-200" },
      2: { label: "Responsable", colorClass: "bg-green-50 text-green-700 border-green-200" },
      3: { label: "Technicien", colorClass: "bg-purple-50 text-purple-700 border-purple-200" },
      4: { label: "Administrateur", colorClass: "bg-amber-50 text-amber-700 border-amber-200" },
    };
    if (typeof roleId === 'string' && isNaN(roleId)) {
      const foundKey = Object.keys(roleMap).find(key => roleMap[key].label === roleId);
      if (foundKey) return roleMap[foundKey];
      return { label: roleId, colorClass: "bg-gray-50 text-gray-700 border-gray-200" };
    }
    return roleMap[roleId] || { label: "Inconnu", colorClass: "bg-gray-50 text-gray-500 border-gray-200" };
  };

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

  useEffect(() => { loadUsers(1, filters); }, [token]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    loadUsers(1, newFilters);
  };

  const handlePageChange = (page) => { loadUsers(page, filters); };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!token || !userToEdit) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${userToEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
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

  const getFullName = (user) => {
    if (user.nom && user.prenom) return `${user.prenom} ${user.nom}`;
    if (user.name) return user.name;
    return "Utilisateur inconnu";
  };
  
  const getInitials = (user) => {
      const f = user.prenom ? user.prenom[0] : (user.name ? user.name[0] : "?");
      const l = user.nom ? user.nom[0] : "";
      return (f + l).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <span className="material-symbols-outlined text-9xl">group</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight mb-2">Gestion Utilisateurs</h1>
          <p className="text-gray-300 text-sm font-medium">Administrez les accès, rôles et informations de toute la plateforme.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="shrink-0 bg-white text-gray-900 hover:bg-gray-100 px-6 py-3.5 rounded-xl text-sm font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all transform hover:scale-105 relative z-10"
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
          Créer un compte
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

      {/* PREMIUM LIST LAYOUT */}
      <div className="overflow-x-auto pb-4">
        {loading ? (
           <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
             <span className="material-symbols-outlined animate-spin text-4xl">autorenew</span>
             <p className="font-medium">Chargement des utilisateurs...</p>
           </div>
        ) : users.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl py-20 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="material-symbols-outlined text-6xl text-gray-200 mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>group_off</span>
            <h3 className="text-xl font-bold text-gray-700 mb-1">Aucun utilisateur trouvé</h3>
            <p className="text-gray-400 text-sm">Veuillez modifier vos critères de recherche.</p>
          </div>
        ) : (
          <table className="w-full text-left border-separate border-spacing-y-3 min-w-[1000px]">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-gray-400 font-bold px-4">
                <th className="px-6 py-2 font-semibold">Identité</th>
                <th className="px-6 py-2 font-semibold">Contact</th>
                <th className="px-6 py-2 font-semibold">Fonction</th>
                <th className="px-6 py-2 font-semibold">Rôle</th>
                <th className="px-6 py-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const roleData = getRoleDetails(user.role_id || user.role);
                return (
                  <tr key={user.id} className="bg-white group hover:shadow-md transition-all duration-300">
                    <td className="p-4 rounded-l-2xl border-y border-l border-gray-100 group-hover:border-gray-300">
                      <div className="flex items-center gap-4 pl-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-black text-gray-600 shadow-inner border border-white shrink-0">
                          {getInitials(user)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-[15px] mb-0.5">{getFullName(user)}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">ID: #{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-y border-gray-100 group-hover:border-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-gray-400">mail</span>
                        <span className="text-sm font-semibold text-gray-700">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-y border-gray-100 group-hover:border-gray-300">
                       <span className="text-sm font-bold text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">{user.fonction || "Non défini"}</span>
                    </td>
                    <td className="px-6 py-4 border-y border-gray-100 group-hover:border-gray-300">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${roleData.colorClass}`}>
                        {roleData.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 rounded-r-2xl border-y border-r border-gray-100 group-hover:border-gray-300 text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setUserToEdit(user); setShowEditModal(true); }}
                          className="w-10 h-10 bg-gray-50 hover:bg-blue-600 text-gray-600 hover:text-white transition-colors rounded-xl flex items-center justify-center shadow-sm"
                          title="Modifier"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        {user.role !== "Administrateur" && user.role_id !== "4" && user.role_id !== 4 && (
                          <button
                            onClick={() => { setUserToDelete(user); setShowDeleteModal(true); }}
                            className="w-10 h-10 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-colors rounded-xl flex items-center justify-center shadow-sm"
                            title="Supprimer"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={currentPage} lastPage={lastPage} onPageChange={handlePageChange} />

      {/* Modale Créer */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden transform transition-all">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-800">person_add</span>
                Créer un compte
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form className="p-8 space-y-5" onSubmit={handleCreateSubmit}>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nom</label>
                  <input type="text" value={newUser.nom} onChange={(e) => setNewUser({...newUser, nom: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-gray-500/10 focus:border-gray-500 outline-none transition-all" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Prénom</label>
                  <input type="text" value={newUser.prenom} onChange={(e) => setNewUser({...newUser, prenom: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-gray-500/10 focus:border-gray-500 outline-none transition-all" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email</label>
                <input type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-gray-500/10 focus:border-gray-500 outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Mot de passe</label>
                <input type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-gray-500/10 focus:border-gray-500 outline-none transition-all" required />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Fonction</label>
                  <input type="text" value={newUser.fonction} onChange={(e) => setNewUser({...newUser, fonction: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-gray-500/10 focus:border-gray-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Rôle</label>
                  <select value={newUser.role_id} onChange={(e) => setNewUser({...newUser, role_id: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-gray-500/10 focus:border-gray-500 outline-none transition-all cursor-pointer">
                    <option value="1">Employé</option>
                    <option value="2">Responsable</option>
                    <option value="3">Technicien</option>
                  </select>
                </div>
              </div>
              <button className="w-full bg-gray-900 text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-black hover:shadow-lg transition-all mt-4" type="submit">
                Créer le compte
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modale Modifier */}
      {showEditModal && userToEdit && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden transform transition-all">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">manage_accounts</span>
                Modifier les informations
              </h3>
              <button onClick={() => setShowEditModal(false)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <form className="p-8 space-y-5" onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nom</label>
                  <input type="text" value={userToEdit.nom || ""} onChange={(e) => setUserToEdit({ ...userToEdit, nom: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Prénom</label>
                  <input type="text" value={userToEdit.prenom || ""} onChange={(e) => setUserToEdit({ ...userToEdit, prenom: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Fonction</label>
                <input type="text" value={userToEdit.fonction || ""} onChange={(e) => setUserToEdit({ ...userToEdit, fonction: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md">
                  Enregistrer
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-sm font-black uppercase tracking-widest py-3.5 rounded-xl transition-all">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden transform transition-all">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-red-50/50">
              <h3 className="text-xl font-black text-red-600 flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                Supprimer le compte
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-8">
              <p className="text-gray-700 text-sm mb-6 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement le compte de <span className="font-bold">{userToDelete.prenom} {userToDelete.nom}</span> ?<br /><br />
                <span className="px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg block font-bold text-xs uppercase tracking-wide">
                  Cette action est irréversible et toutes les données associées seront perdues.
                </span>
              </p>
              <div className="flex gap-3">
                <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-black uppercase tracking-widest py-3 rounded-xl transition-all shadow-md">
                  Supprimer
                </button>
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-white border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-sm font-black uppercase tracking-widest py-3 rounded-xl transition-all">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}