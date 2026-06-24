import React, { createContext, useState, useContext, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const updateUnreadCount = useCallback((count) => {
    setUnreadCount(count);
  }, []);

  // Charge le compteur depuis l'API
  const fetchUnreadCount = useCallback(async (currentToken) => {
    if (!currentToken) return;
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const count = data.filter((n) => !n.lu).length;
      setUnreadCount(count);
    } catch (_) {
      // silencieux
    }
  }, []);

  // Charge au montage et toutes les 60 secondes
  useEffect(() => {
    fetchUnreadCount(token);
    if (!token) return;
    const interval = setInterval(() => fetchUnreadCount(token), 60000);
    return () => clearInterval(interval);
  }, [token, fetchUnreadCount]);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("token", tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
    // Charge immédiatement après login
    fetchUnreadCount(tokenData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setUnreadCount(0);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        unreadCount,
        updateUnreadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};