import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import { Toaster, toast } from 'react-hot-toast'; // Import du système de toasts

// Import de toutes les pages
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Employé
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeLeave from "./pages/EmployeeLeave";
import EmployeeTickets from "./pages/EmployeeTickets";
import EmployeeTicketDetail from "./pages/EmployeeTicketDetail";
import EmployeeTasks from "./pages/EmployeeTasks";
import EmployeeNotifications from "./pages/EmployeeNotifications";

// Technicien
import TechnicianDashboard from "./pages/TechnicianDashboard";
import TechnicianTickets from "./pages/TechnicianTickets";
import TechnicianTicketDetail from "./pages/TechnicianTicketDetail";
import TechnicianNotifications from "./pages/TechnicianNotifications";

// Responsable
import ManagerDashboard from "./pages/ManagerDashboard";
import ManagerLeave from "./pages/ManagerLeave";
import ManagerLeaveConfig from "./pages/ManagerLeaveConfig";
import ManagerTickets from "./pages/ManagerTickets";
import ManagerTicketDetail from "./pages/ManagerTicketDetail";
import ManagerTasks from "./pages/ManagerTasks";
import ManagerNotifications from "./pages/ManagerNotifications.jsx";

// Administrateur
import AdminUsers from "./pages/AdminUsers";
import AdminAudit from "./pages/AdminAudit";
import AdminNotifications from "./pages/AdminNotifications";

const CheckAuth = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

const RoleGate = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  if (!user) return null;
  const currentRole = parseInt(user.role_id);
  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// ============================================================
// INTERCEPTEUR GLOBAL D'ERREURS
// ============================================================
function App() {
  useEffect(() => {
    // Intercepter les erreurs de promesses non gérées
    const handleUnhandledRejection = (event) => {
      const message = event.reason?.message || "Une erreur inattendue est survenue.";
      toast.error(message);
    };
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => window.removeEventListener("unhandledrejection", handleUnhandledRejection);
  }, []);
// ============================================================

  return (
    <Router>
      {/* Le composant Toaster affiche les notifications en bas à droite */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Pages publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ==================== EMPLOYÉ ==================== */}
        <Route
          path="/employee-dashboard"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[1, 2, 3]}>
                <Layout><EmployeeDashboard /></Layout>
              </RoleGate>
            </CheckAuth>
          }
        />
        <Route
          path="/employee-leave"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[1, 3]}>
                <Layout><EmployeeLeave /></Layout>
              </RoleGate>
            </CheckAuth>
          }
        />
        <Route
          path="/employee-tickets"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[1, 2]}>
                <Layout><EmployeeTickets /></Layout>
              </RoleGate>
            </CheckAuth>
          }
        />
        <Route
          path="/employee-tickets/:id"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[1, 2]}>
                <Layout><EmployeeTicketDetail /></Layout>
              </RoleGate>
            </CheckAuth>
          }
        />
        <Route
          path="/employee-tasks"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[1, 2, 3]}>
                <Layout><EmployeeTasks /></Layout>
              </RoleGate>
            </CheckAuth>
          }
        />
        <Route
          path="/employee-notifications"
          element={
            <CheckAuth>
              <Layout><EmployeeNotifications /></Layout>
            </CheckAuth>
          }
        />

        {/* ==================== TECHNICIEN ==================== */}
        <Route
          path="/technician-dashboard"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[2, 3]}>
                <Layout><TechnicianDashboard /></Layout>
              </RoleGate>
            </CheckAuth>
          }
        />
        <Route
          path="/technician-tickets"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[2, 3]}>
                <Layout><TechnicianTickets /></Layout>
              </RoleGate>
            </CheckAuth>
          }
        />
        <Route
          path="/technician-tickets/:id"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[2, 3]}>
                <Layout><TechnicianTicketDetail /></Layout>
              </RoleGate>
            </CheckAuth>
          }
        />
        <Route
          path="/technician-notifications"
          element={
            <CheckAuth>
              <Layout><TechnicianNotifications /></Layout>
            </CheckAuth>
          }
        />

        {/* ==================== RESPONSABLE ==================== */}
        <Route
          path="/manager-dashboard"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[2, 3]}>
                <Layout><ManagerDashboard /></Layout>
              </RoleGate>
            </CheckAuth>
          }
        />
        <Route
          path="/manager-leave"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[2, 3]}>
                <Layout><ManagerLeave /></Layout>
              </RoleGate>
            </CheckAuth>
          }
        />
        <Route
          path="/manager-leave-config"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[2, 3]}>
                <Layout><ManagerLeaveConfig /></Layout>
              </RoleGate>
            </CheckAuth>
          }
        />
        <Route
          path="/manager-tickets"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[2, 3]}>
                <Layout><ManagerTickets /></Layout>
              </RoleGate>
            </CheckAuth>
          }
        />
        <Route
          path="/manager-tickets/:id"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[2, 3]}>
                <Layout><ManagerTicketDetail /></Layout>
              </RoleGate>
            </CheckAuth>
          }
        />
        <Route
          path="/manager-tasks"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[2, 3]}>
                <Layout><ManagerTasks /></Layout>
              </RoleGate>
            </CheckAuth>
          }
        />
        <Route
          path="/manager-notifications"
          element={
            <CheckAuth>
              <Layout><ManagerNotifications /></Layout>
            </CheckAuth>
          }
        />

        {/* ==================== ADMINISTRATEUR ==================== */}
        <Route
          path="/admin-users"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[4]}>
                <Layout><AdminUsers /></Layout>
              </RoleGate>
            </CheckAuth>
          }
        />
        <Route
          path="/admin-audit"
          element={
            <CheckAuth>
              <RoleGate allowedRoles={[4]}>
                <Layout><AdminAudit /></Layout>
              </RoleGate>
            </CheckAuth>
          }
        />
        <Route
          path="/admin-notifications"
          element={
            <CheckAuth>
              <Layout><AdminNotifications /></Layout>
            </CheckAuth>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;