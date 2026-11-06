import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("expense-token");
    if (!token) {
      setLoading(false);
      return () => { active = false; };
    }
    client.get("/auth/me")
      .then(({ data }) => { if (active) setUser(data.user); })
      .catch(() => { if (active) localStorage.removeItem("expense-token"); })
      .finally(() => { if (active) setLoading(false); });
    const expire = () => {
      localStorage.removeItem("expense-token");
      setUser(null);
    };
    window.addEventListener("expense-session-expired", expire);
    return () => {
      active = false;
      window.removeEventListener("expense-session-expired", expire);
    };
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async signIn(credentials) {
      const { data } = await client.post("/auth/login", credentials);
      localStorage.setItem("expense-token", data.token);
      setUser(data.user);
    },
    async signUp(details) {
      const { data } = await client.post("/auth/register", details);
      localStorage.setItem("expense-token", data.token);
      setUser(data.user);
    },
    signOut() {
      localStorage.removeItem("expense-token");
      setUser(null);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [loading, user, navigate]);
  if (loading || !user) return <div className="loading-screen">Getting your workspace ready…</div>;
  return children;
}
