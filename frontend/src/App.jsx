import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute, useAuth } from "./context/AuthContext";
import AppLayout from "./components/AppLayout";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
const Analytics = lazy(() => import("./pages/Analytics"));

function PrivatePage({ children }) {
  return <ProtectedRoute><AppLayout>{children}</AppLayout></ProtectedRoute>;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <AuthPage register />} />
      <Route path="/" element={<PrivatePage><Dashboard /></PrivatePage>} />
      <Route path="/transactions" element={<PrivatePage><Transactions /></PrivatePage>} />
      <Route path="/budgets" element={<PrivatePage><Budgets /></PrivatePage>} />
      <Route path="/analytics" element={<PrivatePage><Suspense fallback={<div className="loading-card">Loading your insights…</div>}><Analytics /></Suspense></PrivatePage>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
