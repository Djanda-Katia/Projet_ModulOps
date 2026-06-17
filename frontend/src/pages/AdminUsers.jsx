import { useState } from "react";

export default function AdminUsers() {
  const users = [
    { id: 1, name: "Marie Ewondo", email: "marie.employe@entreprise.com", role: "Employé", fonction: "Rédactrice Web" },
    { id: 2, name: "Paul Tchinda", email: "paul.responsable@entreprise.com", role: "Responsable", fonction: "Chef de Projet" },
    { id: 3, name: "Luc Kamga", email: "luc.technicien@entreprise.com", role: "Technicien", fonction: "Technicien Réseau" },
    { id: 4, name: "Hubert Tchakounté", email: "hubert.admin@entreprise.com", role: "Administrateur", fonction: "Admin Principal" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion Utilisateurs</h1>
          <p className="text-gray-500 text-sm">Gérez les comptes des utilisateurs de la plateforme.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">+ CRÉER UN COMPTE</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
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
                  {user.role !== "Administrateur" ? (
                    <button className="text-blue-600 hover:underline text-xs font-bold">Modifier rôle</button>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}