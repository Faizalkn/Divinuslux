import { useEffect, useState } from "react";

const categories = ["Food", "Travel", "Utilities", "Entertainment"];
const paymentMethods = ["Cash", "UPI", "Credit Card", "Debit Card", "Bank Transfer"];

function dateValue(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return new Date(value).toISOString().slice(0, 10);
}

export default function TransactionModal({ transaction, onClose, onSave, busy }) {
  const [form, setForm] = useState({
    title: "", amount: "", date: dateValue(), category: "Food", type: "Expense", paymentMethod: "UPI"
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (transaction) setForm({
      title: transaction.title,
      amount: transaction.amount,
      date: dateValue(transaction.date),
      category: transaction.category,
      type: transaction.type,
      paymentMethod: transaction.paymentMethod
    });
  }, [transaction]);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }
  async function submit(event) {
    event.preventDefault();
    if (!form.title.trim() || Number(form.amount) <= 0 || !form.date) {
      setError("Enter a title, a positive amount and a date.");
      return;
    }
    setError("");
    try {
      await onSave({ ...form, title: form.title.trim(), amount: Number(form.amount) });
    } catch (saveError) {
      setError(saveError);
    }
  }

  return (
    <div className="modal-backdrop-custom" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="transaction-modal-title">
        <div className="modal-heading">
          <div><div className="eyebrow">KEEP IT UP TO DATE</div><h2 id="transaction-modal-title">{transaction ? "Edit transaction" : "Add a transaction"}</h2></div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">×</button>
        </div>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={submit}>
          <div className="type-toggle">
            {["Expense", "Income"].map((type) => <button key={type} type="button" className={form.type === type ? "selected" : ""} onClick={() => setForm({ ...form, type })}>{type}</button>)}
          </div>
          <label className="form-label">What was it for?</label>
          <input className="form-control field-control mb-3" name="title" value={form.title} onChange={update} placeholder="e.g. Weekly groceries" maxLength="100" required />
          <div className="row g-3">
            <div className="col-6"><label className="form-label">Amount</label><div className="amount-input"><span>₹</span><input className="form-control field-control" name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={update} placeholder="0.00" required /></div></div>
            <div className="col-6"><label className="form-label">Date</label><input className="form-control field-control" name="date" type="date" value={form.date} onChange={update} required /></div>
            <div className="col-6"><label className="form-label">Category</label><select className="form-select field-control" name="category" value={form.category} onChange={update}>{categories.map((item) => <option key={item}>{item}</option>)}</select></div>
            <div className="col-6"><label className="form-label">Paid with</label><select className="form-select field-control" name="paymentMethod" value={form.paymentMethod} onChange={update}>{paymentMethods.map((item) => <option key={item}>{item}</option>)}</select></div>
          </div>
          <div className="modal-actions"><button type="button" className="btn-quiet" onClick={onClose}>Cancel</button><button type="submit" className="btn-primary-custom" disabled={busy}>{busy ? "Saving…" : transaction ? "Save changes" : "Add transaction"}</button></div>
        </form>
      </section>
    </div>
  );
}
