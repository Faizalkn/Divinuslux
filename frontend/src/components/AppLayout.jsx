import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/", label: "Overview", icon: "◫", end: true },
  { to: "/transactions", label: "Transactions", icon: "↕" },
  { to: "/budgets", label: "Budgets", icon: "◎" },
  { to: "/analytics", label: "Insights", icon: "⌁" }
];

export default function AppLayout({ children }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  function logout() {
    signOut();
    navigate("/login");
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Pennywise home">
          <span className="brand-mark">p.</span><span>pennywise</span>
        </a>
        <div className="side-label">YOUR SPACE</div>
        <nav className="side-nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `side-link${isActive ? " active" : ""}`}>
              <span className="nav-icon">{link.icon}</span>{link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <div className="note-icon">✳</div>
            <strong>Little by little</strong>
            <p>Small steps today make a brighter tomorrow.</p>
          </div>
          <div className="profile-row">
            <div className="avatar">{user?.name?.slice(0, 1).toUpperCase()}</div>
            <div className="profile-copy"><strong>{user?.name}</strong><span>Personal account</span></div>
            <button type="button" className="logout-button" onClick={logout} title="Sign out" aria-label="Sign out">↗</button>
          </div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <span>YOUR MONEY, IN BLOOM</span>
          <div className="topbar-date">{new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(new Date())}</div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
