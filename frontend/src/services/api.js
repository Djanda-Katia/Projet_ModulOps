// src/services/api.js

// L'URL de base de ton backend (port 8000)
const API_BASE = "http://127.0.0.1:8000/api";

// Fonction utilitaire pour gérer les réponses du serveur
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    // Si le serveur renvoie une erreur (401, 500, etc.), on la lance
    throw new Error(data.message || "Une erreur est survenue");
  }
  return data;
};

// Fonction pour se connecter (LOGIN)
export const login = async (email, password) => {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

// Fonction pour récupérer le dashboard (protégée)
export const getDashboard = async (token) => {
  const response = await fetch(`${API_BASE}/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};