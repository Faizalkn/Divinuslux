import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import client, { getErrorMessage } from "../api/client";
import TransactionModal from "../components/TransactionModal";
import TransactionTable from "../components/TransactionTable";

export default function Transactions() {
  const [params, setParams] = useSearchParams();
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({ startDate: "", endDate: "", category: "", type: "" });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 });
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const { data } = await client.get("/transactions", { params: { ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value)), page } });
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (requestError) { setError(getErrorMessage(requestError)); }
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (params.get("new") === "1") {
      setModal({});
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  async function save(form) {
    setBusy(true);
    try {
      if (modal?._id) await client.put(`/transactions/${modal._id}`, form);
      else await client.post("/transactions", form);
      setModal(null);
      await load();
    } catch (requestError) {
      throw getErrorMessage(requestError);
    } finally { setBusy(false); }
  }

  async function remove(transaction) {
    if (!window.confirm(`Delete “${transaction.title}”? This cannot be undone.`)) return;
    try {
      await client.delete(`/transactions/${transaction._id}`);
      if (transactions.length === 1 && page > 1) setPage((current) => current - 1);
      else await load();
    } catch (requestError) { setError(getErrorMessage(requestError)); }
  }

  function setFilter(key, value) {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  }
  return (
    <div className="page-stack">
      <section className="page-heading-row"><div><div className="eyebrow">EVERY LITTLE THING</div><h1>Transactions</h1><p>Your income and expenses, all in one place.</p></div><button className="btn-primary-custom" onClick={() => setModal({})}><span>＋</span> Add transaction</button></section>
      {error && <div className="alert alert-danger">{error}</div>}
      <section className="panel transactions-panel">
        <div className="filter-bar">
          <label>From<input type="date" value={filters.startDate} onChange={(event) => setFilter("startDate", event.target.value)} /></label>
          <label>To<input type="date" value={filters.endDate} onChange={(event) => setFilter("endDate", event.target.value)} /></label>
          <label>Category<select value={filters.category} onChange={(event) => setFilter("category", event.target.value)}><option value="">All categories</option>{["Food", "Travel", "Utilities", "Entertainment,"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Type<select value={filters.type} onChange={(event) => setFilter("type", event.target.value)}><option value="">All types</option><option>Income</option><option>Expense</option></select></label>
          <button type="button" className="clear-filters" onClick={() => { setPage(1); setFilters({ startDate: "", endDate: "", category: "", type: "" }); }}>Clear</button>
        </div>
        <div className="table-meta">{pagination.total} transaction{pagination.total === 1 ? "" : "s"}</div>
        <TransactionTable transactions={transactions} onEdit={setModal} onDelete={remove} />
        {pagination.pages > 1 && <div className="pagination-bar"><span>Page {pagination.page} of {pagination.pages}</span><div><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>← Previous</button><button type="button" disabled={page >= pagination.pages} onClick={() => setPage((current) => current + 1)}>Next →</button></div></div>}
      </section>
      {modal && <TransactionModal transaction={modal._id ? modal : null} onClose={() => setModal(null)} onSave={save} busy={busy} />}
    </div>
  );
}
