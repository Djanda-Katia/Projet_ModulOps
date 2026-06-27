import { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import { Toaster, toast } from 'react-hot-toast';

// ─── Pages publiques (chargées immédiatement, légères) ───────────────────────
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// ─── Pages privées (lazy-loaded : ne chargent que quand on navigue vers elles)
const EmployeeDashboard      = lazy(() => import("./pages/EmployeeDashboard"));
const EmployeeLeave          = lazy(() => import("./pages/EmployeeLeave"));
const EmployeeTickets        = lazy(() => import("./pages/EmployeeTickets"));
const EmployeeTasks          = lazy(() => import("./pages/EmployeeTasks"));
const EmployeeNotifications  = lazy(() => import("./pages/EmployeeNotifications"));

const TechnicianDashboard    = lazy(() => import("./pages/TechnicianDashboard"));
const TechnicianTickets      = lazy(() => import("./pages/TechnicianTickets"));
const TechnicianNotifications= lazy(() => import("./pages/TechnicianNotifications"));

const ManagerDashboard       = lazy(() => import("./pages/ManagerDashboard"));
const ManagerLeave           = lazy(() => import("./pages/ManagerLeave"));
const ManagerLeaveConfig     = lazy(() => import("./pages/ManagerLeaveConfig"));
const ManagerTickets         = lazy(() => import("./pages/ManagerTickets"));
const ManagerTasks           = lazy(() => import("./pages/ManagerTasks"));
const ManagerNotifications   = lazy(() => import("./pages/ManagerNotifications"));

const AdminUsers             = lazy(() => import("./pages/AdminUsers"));
const AdminAudit             = lazy(() => import("./pages/AdminAudit"));
const AdminNotifications     = lazy(() => import("./pages/AdminNotifications"));

// ─── Fallback de chargement (affiché pendant le chargement d'une page) ───────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4 text-gray-400">
      <span className="material-symbols-outlined animate-spin text-5xl text-blue-500">autorenew</span>
      <p className="text-sm font-semibold tracking-wide uppercase">Chargement...</p>
    </div>
  </div>
);

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
        gutter={10}
        containerStyle={{ bottom: 24, right: 24 }}
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '14px',
            padding: '14px 18px',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: 'Inter, system-ui, sans-serif',
            boxShadow: '0 10px 40px -8px rgba(0,0,0,0.20)',
            maxWidth: '380px',
            lineHeight: '1.4',
          },
          success: {
            duration: 3000,
            icon: '✅',
            style: {
              background: '#f0fdf4',
              color: '#166534',
              border: '1px solid #bbf7d0',
            },
          },
          error: {
            duration: 5000,
            icon: '❌',
            style: {
              background: '#fff1f2',
              color: '#9f1239',
              border: '1px solid #fecdd3',
            },
          },
          loading: {
            style: {
              background: '#eff6ff',
              color: '#1e40af',
              border: '1px solid #bfdbfe',
            },
          },
        }}
      />

      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </Router>
  );
}

export default App;