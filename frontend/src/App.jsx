import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Importation de nos composants de structure
import Layout from "./components/Layout";

// Importation de nos pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Conges from "./pages/Conges";
import Tickets from "./pages/Tickets";
import Taches from "./pages/Taches";
import AdminProfil from "./pages/AdminProfil";

// 1. Barrière d'authentification de base (Connexion obligatoire)
const CheckAuth = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

// 2. Barrière de cloisonnement strict par Rôle (Anti-fraude URL)
const RoleGate = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user) return null; // Attente du chargement de l'utilisateur

  const currentRole = parseInt(user.role_id);

  // Si le rôle de l'utilisateur n'est pas autorisé, expulsion immédiate
  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Route Publique : Pas de Layout, juste la page de connexion blanche */}
        <Route path="/login" element={<Login />} />

        {/* ========================================================
            TOUTES LES ROUTES CI-DESSOUS SONT SÉCURISÉES ET INCLUSES 
            DANS LE LAYOUT (SIDEBAR + HEADER)
           ======================================================== */}

        {/* 1. DASHBOARD ACCUEIL (Accessible rôles : 1, 2, 3) */}
        <Route
          path="/dashboard"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[1, 2, 3]}>
                <Layout>
                  <Dashboard />
                </Layout>
              </RoleGate>
            </CheckAuth>
          }
        />

        {/* 2. GESTION DES CONGÉS (Accessible rôles : 1, 3) */}
        <Route
          path="/conges"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[1, 3]}>
                <Layout>
                  <Conges />
                </Layout>
              </RoleGate>
            </CheckAuth>
          }
        />

        {/* 3. SUPPORT INFORMATIQUE / TICKETS (Accessible rôles : 1, 2) */}
        <Route
          path="/tickets"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[1, 2]}>
                <Layout>
                  <Tickets />
                </Layout>
              </RoleGate>
            </CheckAuth>
          }
        />

        {/* 4. SUIVI DES TÂCHES (Accessible rôles : 1, 2, 3) */}
        <Route
          path="/taches"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[1, 2, 3]}>
                <Layout>
                  <Taches />
                </Layout>
              </RoleGate>
            </CheckAuth>
          }
        />

        {/* 5. ESPACE PARAMÉTRAGE & COMPTES (Accessible rôle : 4 uniquement) */}
        <Route
          path="/admin"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[4]}>
                <Layout>
                  <AdminProfil />
                </Layout>
              </RoleGate>
            </CheckAuth>
          }
        />

        {/* Redirection globale sécurisée par défaut */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
