import { useCallback, useEffect, useState } from "react";
import client, { getErrorMessage } from "../api/client";
import { money } from "../components/TransactionTable";

const categories = ["Overall", "Food", "Travel", "Utilities", "Entertainment"];

export default function Budgets() {
  const current = new Date();
  const [period, setPeriod] = useState({ month: current.getMonth() + 1, year: current.getFullYear() });
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ category: "Overall", amount: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const { data } = await client.get("/budgets", { params: period });
      setBudgets(data.budgets);
    } catch (requestError) { setError(getErrorMessage(requestError)); }
  }, [period]);
  useEffect(() => { load(); }, [load]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await client.put("/budgets", { ...period, category: form.category, amount: Number(form.amount) });
      setMessage(`${form.category} budget saved.`);
      setForm({ ...form, amount: "" });
      await load();
    } catch (requestError) { setError(getErrorMessage(requestError)); }
  }

  async function remove(budget) {
    if (!window.confirm(`Remove the ${budget.category.toLowerCase()} budget?`)) return;
    try {
      await client.delete(`/budgets/${budget._id}`);
      setBudgets((items) => items.filter((item) => item._id !== budget._id));
    } catch (requestError) { setError(getErrorMessage(requestError)); }
  }

  const monthLabel = new Date(period.year, period.month - 1).toLocaleDateString("en", { month: "long", year: "numeric" });
  return (
    <div className="page-stack">
      <section className="page-heading-row"><div><div className="eyebrow">PLAN WITH PURPOSE</div><h1>Your budgets</h1><p>A little intention goes a long way.</p></div><div className="month-picker"><button onClick={() => setPeriod((value) => { const date = new Date(value.year, value.month - 2); return { month: date.getMonth() + 1, year: date.getFullYear() }; })} aria-label="Previous month">←</button><strong>{monthLabel}</strong><button onClick={() => setPeriod((value) => { const date = new Date(value.year, value.month); return { month: date.getMonth() + 1, year: date.getFullYear() }; })} aria-label="Next month">→</button></div></section>
      {error && <div className="alert alert-danger">{error}</div>}{message && <div className="alert alert-success">{message}</div>}
      <section className="budget-overview panel">
        <div className="budget-overview-icon">◎</div><div><div className="eyebrow">YOUR MONTHLY PLAN</div><h2>Give every dollar a direction.</h2><p>Set a spending limit and keep your goals in sight.</p></div>
      </section>
      <div className="budget-columns">
        <section className="panel budget-list-panel"><div className="section-heading"><div><div className="eyebrow">YOUR LIMITS</div><h2>Budgets for {monthLabel}</h2></div><span className="budget-count">{budgets.length}</span></div>
          {budgets.length ? <div className="budget-list">{budgets.map((budget) => {
            const ratio = budget.amount ? budget.spent / budget.amount : 0;
            const warning = ratio >= 0.8;
            return <article className="budget-item" key={budget._id}><div className="budget-item-heading"><div><span className={`budget-category-icon category-${budget.category.toLowerCase()}`}>{budget.category === "Overall" ? "◎" : budget.category.slice(0, 1)}</span><div><strong>{budget.category === "Overall" ? "Overall budget" : budget.category}</strong><small>{money(budget.spent)} of {money(budget.amount)} spent</small></div></div><button className="delete-budget" onClick={() => remove(budget)} aria-label={`Remove ${budget.category} budget`}>×</button></div><div className="progress custom-progress"><div className={`progress-bar ${warning ? "warning" : ""} ${ratio >= 1 ? "over" : ""}`} style={{ width: `${Math.min(ratio * 100, 100)}%` }} /></div><div className={`budget-item-foot ${warning ? "warning-text" : ""}`}>{ratio >= 1 ? "Budget exceeded" : warning ? "You're getting close" : `${money(budget.amount - budget.spent)} remaining`}<span>{Math.round(ratio * 100)}%</span></div></article>;
          })}</div> : <div className="empty-state budget-empty"><div className="empty-icon">◎</div><strong>No budgets for this month</strong><span>Start with an overall limit or set a category goal.</span></div>}
        </section>
        <section className="panel add-budget-panel"><div className="eyebrow">MAKE A PLAN</div><h2>Set a budget</h2><p className="panel-description">Add or update a limit for {monthLabel}.</p><form onSubmit={submit}><label className="form-label">Budget category</label><select className="form-select field-control mb-3" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select><label className="form-label">Monthly limit</label><div className="amount-input mb-4"><span>₹</span><input className="form-control field-control" type="number" min="0.01" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0.00" required /></div><button className="btn-primary-custom w-100">Save budget <span>→</span></button></form></section>
      </div>
    </div>
  );
}
