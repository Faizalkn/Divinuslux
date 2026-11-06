import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client, { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import TransactionTable, { money } from "../components/TransactionTable";

function StatCard({ label, value, note, icon, tone }) {
  return <article className={`stat-card ${tone}`}><div className="stat-top"><span>{label}</span><span className="stat-icon">{icon}</span></div><strong>{money(value)}</strong><small>{note}</small></article>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    client.get("/dashboard").then(({ data: result }) => setData(result)).catch((requestError) => setError(getErrorMessage(requestError)));
  }, []);
  const today = new Date();
  return (
    <div className="page-stack">
      <section className="welcome-row">
        <div><div className="eyebrow">{today.toLocaleDateString("en", { month: "long", year: "numeric" }).toUpperCase()}</div><h1>Looking good, {user?.name?.split(" ")[0]} <span className="wave">✳</span></h1><p>Here's the shape of your money right now.</p></div>
        <Link className="btn-primary-custom" to="/transactions?new=1"><span>＋</span> Add transaction</Link>
      </section>
      {error && <div className="alert alert-danger">{error}</div>}
      {!data && !error && <div className="loading-card">Gathering your numbers…</div>}
      {data && <>
        <section className="stats-grid">
          <StatCard label="Total income" value={data.totals.income} note="Across all time" icon="↗" tone="stat-green" />
          <StatCard label="Total expenses" value={data.totals.expenses} note="Across all time" icon="↘" tone="stat-cream" />
          <StatCard label="This month's spending" value={data.totals.currentMonthSpending} note="A fresh month, a fresh start" icon="◷" tone="stat-lilac" />
          <StatCard label="Budget left" value={data.totals.remainingBudget} note={data.totals.monthlyBudget ? `of ${money(data.totals.monthlyBudget)} monthly budget` : "Set a monthly budget"} icon="◎" tone="stat-blue" />
        </section>
        <section className="dashboard-lower">
          <article className="panel recent-panel">
            <div className="section-heading"><div><div className="eyebrow">THE LATEST</div><h2>Recent transactions</h2></div><Link to="/transactions">See all <span>→</span></Link></div>
            <TransactionTable transactions={data.recentTransactions} compact />
          </article>
          <article className="panel spending-panel">
            <div className="eyebrow">A QUICK PULSE</div><h2>Monthly budget</h2>
            <div className="budget-amount"><strong>{money(data.totals.currentMonthSpending)}</strong><span>spent this month</span></div>
            <div className="progress custom-progress" role="progressbar" aria-valuenow={data.totals.monthlyBudget ? Math.min(data.totals.currentMonthSpending / data.totals.monthlyBudget * 100, 100) : 0} aria-valuemin="0" aria-valuemax="100">
              <div className={`progress-bar ${data.totals.monthlyBudget && data.totals.currentMonthSpending >= data.totals.monthlyBudget ? "over" : ""}`} style={{ width: `${data.totals.monthlyBudget ? Math.min(data.totals.currentMonthSpending / data.totals.monthlyBudget * 100, 100) : 0}%` }} />
            </div>
            <div className="budget-scale"><span>$0</span><span>{data.totals.monthlyBudget ? money(data.totals.monthlyBudget) : "No budget set"}</span></div>
            {!data.totals.monthlyBudget ? <Link className="set-budget-link" to="/budgets">Set your monthly budget →</Link> : data.totals.currentMonthSpending >= data.totals.monthlyBudget * 0.8 ? <div className="budget-nudge">You're getting close to your monthly limit.</div> : <div className="budget-nudge calm">You're right on track. Keep it up!</div>}
            <div className="category-mini-list">{data.categorySpend.slice(0, 3).map((item) => <div key={item._id}><span>{item._id}</span><strong>{money(item.total)}</strong></div>)}</div>
          </article>
        </section>
      </>}
    </div>
  );
}
