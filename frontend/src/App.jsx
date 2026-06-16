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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeLeave from "./pages/EmployeeLeave";
import EmployeeTickets from "./pages/EmployeeTickets";
import EmployeeTasks from "./pages/EmployeeTasks";
import EmployeeTicketDetail from "./pages/EmployeeTicketDetail";
import EmployeeNotifications from "./pages/EmployeeNotifications";

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
        {/* Route Publique : Pas de Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ========================================================
            ROUTES SÉCURISÉES (CHECK AUTH + LAYOUT)
           ======================================================== */}

        {/* Dashboard (Rôles : 1, 2, 3) */}
        <Route
          path="/employee-dashboard"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[1, 2, 3]}>
                <Layout>
                  <EmployeeDashboard />
                </Layout>
              </RoleGate>
            </CheckAuth>
          }
        />

        {/* Congés (Rôles : 1, 3) */}
        <Route
          path="/employee-leave"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[1, 3]}>
                <Layout>
                  <EmployeeLeave />
                </Layout>
              </RoleGate>
            </CheckAuth>
          }
        />

        {/* Tickets (Rôles : 1, 2) */}
        <Route
          path="/employee-tickets"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[1, 2]}>
                <Layout>
                  <EmployeeTickets />
                </Layout>
              </RoleGate>
            </CheckAuth>
          }
        />

        {/* Détail Ticket (Rôles : 1, 2) */}
        <Route
          path="/employee-tickets/:id"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[1, 2]}>
                <Layout>
                  <EmployeeTicketDetail />
                </Layout>
              </RoleGate>
            </CheckAuth>
          }
        />

        {/* Tâches (Rôles : 1, 2, 3) */}
        <Route
          path="/employee-tasks"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[1, 2, 3]}>
                <Layout>
                  <EmployeeTasks />
                </Layout>
              </RoleGate>
            </CheckAuth>
          }
        />

        {/* Notifications (Tous rôles connectés) */}
        <Route
          path="/employee-notifications"
          element={
            <CheckAuth>
              <Layout>
                <EmployeeNotifications />
              </Layout>
            </CheckAuth>
          }
        />

        {/* Admin (Rôle 4 uniquement) */}
        <Route
          path="/admin"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[4]}>
                <Layout>
                  <EmployeeDashboard /> {/* À remplacer par AdminUsers */}
                </Layout>
              </RoleGate>
            </CheckAuth>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;