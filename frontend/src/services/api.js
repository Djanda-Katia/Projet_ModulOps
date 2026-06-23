// src/services/api.js

// L'URL de base de ton backend (port 8000)
const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

// Fonction utilitaire pour gérer les réponses du serveur
const handleResponse = async (response) => {
  // Si la réponse n'est pas OK (ex: 500, 404)
  if (!response.ok) {
    let errorMessage = "Une erreur est survenue.";

    try {
      const data = await response.json();
      // On utilise le message d'erreur renvoyé par le Backend (ex: "L'adresse email est déjà utilisée")
      if (data.message) {
        errorMessage = data.message;
      } else if (data.errors) {
        // Si Laravel renvoie un objet "errors" (c'est le cas pour les validations)
        // On prend le premier message d'erreur trouvé
        const firstErrorKey = Object.keys(data.errors)[0];
        if (firstErrorKey) {
          errorMessage = data.errors[firstErrorKey][0];
        }
      }
    } catch {
      // Si on ne peut pas lire le JSON, on garde un message générique
      errorMessage = "Erreur de communication avec le serveur.";
    }

    // On lance une erreur avec le message clair
    throw new Error(errorMessage);
  }

  // Si la réponse est OK, on retourne le JSON
  return response.json();
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

// Fonction pour récupérer la liste des congés
export const getConges = async (token) => {
  const response = await fetch(`${API_BASE}/conges`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// Fonction pour soumettre une demande de congé
export const soumettreConge = async (token, data) => {
  const response = await fetch(`${API_BASE}/conges/demande`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// Fonction pour récupérer la liste des tickets
export const getTickets = async (token) => {
  const response = await fetch(`${API_BASE}/tickets`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// Fonction pour récupérer la liste des techniciens
export const getTechniciens = async (token) => {
  const response = await fetch(`${API_BASE}/techniciens`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// Fonction pour créer un ticket
export const createTicket = async (token, data) => {
  const response = await fetch(`${API_BASE}/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// Récupérer un ticket par ID
export const getTicketById = async (token, id) => {
  const response = await fetch(`${API_BASE}/tickets/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// Confirmer la résolution d'un ticket (Employé)
export const confirmTicket = async (token, id) => {
  const response = await fetch(`${API_BASE}/tickets/${id}/confirmer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// Signaler un problème (rouvrir un ticket)
export const signalTicket = async (token, id) => {
  const response = await fetch(`${API_BASE}/tickets/${id}/signaler`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// Récupérer les commentaires d'un ticket
export const getTicketComments = async (token, id) => {
  const response = await fetch(`${API_BASE}/tickets/${id}/commentaires`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// Ajouter un commentaire à un ticket, avec changement de statut optionnel
export const addTicketComment = async (token, id, contenu, statut = null) => {
  const body = statut ? { contenu, statut } : { contenu };
  const response = await fetch(`${API_BASE}/tickets/${id}/commentaires`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return handleResponse(response);
};

// --- NOTIFICATIONS ---
export const getNotifications = async (token) => {
  const response = await fetch(`${API_BASE}/notifications`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const markAllNotificationsAsRead = async (token) => {
  const notifs = await getNotifications(token);
  for (const n of notifs) {
    if (!n.lu) {
      await fetch(`${API_BASE}/notifications/${n.id}/lu`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
    }
  }
  return true;
};

// --- TÂCHES ---
export const getMyTasks = async (token) => {
  const response = await fetch(`${API_BASE}/mes-taches`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const updateTaskStatus = async (token, id, statut) => {
  const response = await fetch(`${API_BASE}/taches/${id}/statut`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ statut }),
  });
  return handleResponse(response);
};

// --- MANAGER DASHBOARD ---
export const getManagerDashboard = async (token) => {
  const response = await fetch(`${API_BASE}/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

// --- MANAGER LEAVE DECISION ---
export const decideConge = async (token, id, statut, motif = "") => {
  const response = await fetch(`${API_BASE}/conges/decider/${id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ statut, motif }),
  });
  return handleResponse(response);
};

export const validateTask = async (token, id) => {
  const response = await fetch(`${API_BASE}/taches/${id}/valider`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
  });
  return handleResponse(response);
};

export const cancelTask = async (token, id) => {
  const response = await fetch(`${API_BASE}/taches/${id}/annuler`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
  });
  return handleResponse(response);
};

export const createTask = async (token, data) => {
  const response = await fetch(`${API_BASE}/taches`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getEmployes = async (token) => {
  const response = await fetch(`${API_BASE}/employes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};

export const getAllTasks = async (token) => {
  const response = await fetch(`${API_BASE}/toutes-taches`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};