import React from "react";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import TasksPage from "./pages/TasksPage";
import ReportsPage from "./pages/ReportsPage";
import TeamPage from "./pages/TeamPage";
import AdminPage from "./pages/AdminPage";
import MeetingsPage from "./pages/MeetingsPage";
import MeetingRequestsPage from "./pages/MeetingRequestsPage";
import DocumentsPage from "./pages/DocumentsPage";
import CalendarPage from "./pages/CalendarPage";
import VoiceInputPage from "./pages/VoiceInputPage";
import MessagesPage from "./pages/MessagesPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import DailyReportPage from "./pages/DailyReportPage";
import AppLayout from "./components/AppLayout";
import "./App.css";
import SecretariatPage from "./pages/SecretariatPage";
import AuditPage from "./pages/AuditPage";
import LegalPage from "./pages/LegalPage";
import AdvisorPage from "./pages/AdvisorPage";
import PricingPage from "./pages/PricingPage";

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto mb-3"></div>
          جاري التحقق من الجلسة...
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/meeting-requests" element={<MeetingRequestsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/voice" element={<ProtectedRoute roles={["ceo", "admin"]}><VoiceInputPage /></ProtectedRoute>} />
          <Route path="/secretariat" element={<SecretariatPage />} />
          <Route path="/audit" element={<AuditPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/advisor" element={<ProtectedRoute roles={["ceo", "admin"]}><AdvisorPage /></ProtectedRoute>} />
          <Route path="/daily-report" element={<DailyReportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/admin" element={
            <ProtectedRoute roles={["admin"]}><AdminPage /></ProtectedRoute>
          } />
          <Route path="/projects/pricing" element={<PricingPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
  }, []);
  return (
    <div className="App">
      <AuthProvider>
        <ThemeProvider>
          <AppRoutes />
          <Toaster position="top-center" theme="dark" richColors closeButton />
        </ThemeProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
