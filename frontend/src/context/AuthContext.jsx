import React, { createContext, useState, useEffect, useContext } from "react";

// 1. Création de l'antenne radio (le Context)
const AuthContext = createContext(null);

// 2. Le composant "Provider" qui va envelopper notre application et diffuser les données
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Au chargement de l'application, on vérifie si un utilisateur était déjà stocké
    const savedUser = localStorage.getItem("user");
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, [token]);

  // Fonction pour connecter l'utilisateur (utilisée par la page Login)
  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("token", tokenData);
    localStorage.setItem("user", JSON.stringify(userData)); // On transforme l'objet en texte pour le stocker
  };

  // Fonction pour déconnecter l'utilisateur
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

// 3. Un "Hook" personnalisé pour utiliser facilement l'authentification dans nos pages
export const useAuth = () => {
  return useContext(AuthContext);
};
