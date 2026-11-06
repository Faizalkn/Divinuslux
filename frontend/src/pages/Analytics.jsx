import { useEffect, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, CartesianGrid } from "recharts";
import client, { getErrorMessage } from "../api/client";
import { money } from "../components/TransactionTable";

const colors = ["#537b62", "#d9a25f", "#9d8bb7", "#7b9da7", "#d47d65"];

function monthName(item) {
  return new Date(item._id.year, item._id.month - 1).toLocaleDateString("en", { month: "short", year: "2-digit" });
}

export default function Analytics() {
  const today = new Date();
  const [range, setRange] = useState({
    startDate: new Date(today.getFullYear(), today.getMonth() - 5, 1).toISOString().slice(0, 10),
    endDate: today.toISOString().slice(0, 10)
  });
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    client.get("/analytics", { params: range })
      .then(({ data: result }) => setData(result))
      .catch((requestError) => setError(getErrorMessage(requestError)));
  }, [range]);

  const typeData = (data?.byType || []).map((item) => ({ name: item._id, total: item.total }));
  const categoryData = (data?.byCategory || []).map((item) => ({ name: item._id, value: item.total }));
  const income = typeData.find((item) => item.name === "Income")?.total || 0;
  const expenses = typeData.find((item) => item.name === "Expense")?.total || 0;

  return (
    <div className="page-stack">
      <section className="page-heading-row"><div><div className="eyebrow">THE BIGGER PICTURE</div><h1>Your insights</h1><p>Patterns worth noticing, progress worth celebrating.</p></div><div className="date-range"><label>From<input type="date" value={range.startDate} onChange={(event) => setRange({ ...range, startDate: event.target.value })} /></label><label>To<input type="date" value={range.endDate} onChange={(event) => setRange({ ...range, endDate: event.target.value })} /></label></div></section>
      {error && <div className="alert alert-danger">{error}</div>}
      {!data && !error && <div className="loading-card">Finding your patterns…</div>}
      {data && <>
        <section className="analytics-summary">
          <article className="panel insight-card"><div className="insight-icon income-icon">↗</div><div><span>Total income</span><strong>{money(income)}</strong></div></article>
          <article className="panel insight-card"><div className="insight-icon expense-icon">↘</div><div><span>Total expenses</span><strong>{money(expenses)}</strong></div></article>
          <article className="panel insight-card"><div className="insight-icon balance-icon">✳</div><div><span>Net balance</span><strong className={income - expenses < 0 ? "negative" : ""}>{money(income - expenses)}</strong></div></article>
        </section>
        <section className="chart-grid">
          <article className="panel chart-panel"><div className="section-heading"><div><div className="eyebrow">WHERE IT GOES</div><h2>Spending by category</h2></div></div>
            {categoryData.length ? <div className="chart-area"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={68} outerRadius={102} paddingAngle={4}><Cell key="cell-0" fill={colors[0]} />{categoryData.slice(1).map((entry, index) => <Cell key={entry.name} fill={colors[(index + 1) % colors.length]} />)}</Pie><Tooltip formatter={(value) => money(value)} /><Legend verticalAlign="bottom" height={32} /></PieChart></ResponsiveContainer></div> : <div className="empty-chart">No expenses in this date range.</div>}
          </article>
          <article className="panel chart-panel"><div className="section-heading"><div><div className="eyebrow">MONTH BY MONTH</div><h2>Spending rhythm</h2></div></div>
            {data.monthly.length ? <div className="chart-area"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.monthly} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}><CartesianGrid stroke="#edf0eb" vertical={false} /><XAxis dataKey={monthName} tickLine={false} axisLine={false} tick={{ fill: "#858c83", fontSize: 12 }} /><YAxis tickLine={false} axisLine={false} tick={{ fill: "#858c83", fontSize: 12 }} tickFormatter={money} /><Tooltip formatter={(value) => money(value)} /><Bar dataKey="total" name="Expenses" fill="#6a9476" radius={[6, 6, 0, 0]} maxBarSize={42} /></BarChart></ResponsiveContainer></div> : <div className="empty-chart">No expenses in this date range.</div>}
          </article>
        </section>
      </>}
    </div>
  );
}
