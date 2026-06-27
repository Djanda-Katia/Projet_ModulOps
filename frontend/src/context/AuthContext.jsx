import React, { createContext, useState, useContext, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || sessionStorage.getItem("token") || null;
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
      const res = await fetch(`${API_BASE}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch (_) {
      // silencieux
    }
  }, []);

  // Charge au montage et toutes les 10 secondes
  useEffect(() => {
    fetchUnreadCount(token);
    if (!token) return;
    const interval = setInterval(() => fetchUnreadCount(token), 60000);
    return () => clearInterval(interval);
  }, [token, fetchUnreadCount]);

  const login = (userData, tokenData, rememberMe = false) => {
    setUser(userData);
    setToken(tokenData);
    if (rememberMe) {
      localStorage.setItem("token", tokenData);
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      sessionStorage.setItem("token", tokenData);
      sessionStorage.setItem("user", JSON.stringify(userData));
    }
    // Charge immédiatement après login
    fetchUnreadCount(tokenData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setUnreadCount(0);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
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