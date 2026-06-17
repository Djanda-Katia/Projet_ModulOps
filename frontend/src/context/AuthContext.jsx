import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // ── SIMULATION (en attendant le vrai backend) ──
  // Décommente l'utilisateur que tu veux tester

  // 🔵 UTILISATEUR EMPLOYÉ (Thomas Bernard)
  // const [user, setUser] = useState({
  //   id: 1,
  //   name: "Thomas Bernard",
  //   email: "thomas.bernard@modulops.com",
  //   role: "Employé",
  //   role_id: 1,
  //  });

  // 🟢 UTILISATEUR RESPONSABLE (DJANDA Katia)
   const [user, setUser] = useState({
    id: 2,
    name: "DJANDA Katia",
    email: "djanda.katia@modulops.com",
    role: "Responsable",
    role_id: 2,
  });

  // 🟡 UTILISATEUR TECHNICIEN (Patrick Dubois)
  // const [user, setUser] = useState({
  //   id: 3,
  //   name: "Patrick Dubois",
  //   email: "patrick.dubois@modulops.com",
  //   role: "Technicien",
  //   role_id: 3,
  // });

  // 🔴 UTILISATEUR ADMINISTRATEUR (Hubert Tchakounté)
  // const [user, setUser] = useState({
  //   id: 4,
  //   name: "Hubert Tchakounté",
  //   email: "hubert.tchakounte@modulops.com",
  //   role: "Administrateur",
  //   role_id: 4,
  // });

  const [token, setToken] = useState("fake-jwt-token");
  const [loading, setLoading] = useState(false);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("token", tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};