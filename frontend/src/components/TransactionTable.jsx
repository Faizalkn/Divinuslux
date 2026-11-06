export function money(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value || 0);
}

export function formatDate(value) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function TransactionTable({ transactions, onEdit, onDelete, compact = false }) {
  if (!transactions.length) return <div className="empty-state"><div className="empty-icon">✳</div><strong>Nothing to see just yet</strong><span>Your transactions will show up here.</span></div>;
  return (
    <div className="table-responsive">
      <table className="table transaction-table align-middle mb-0">
        <thead><tr><th>TRANSACTION</th><th>CATEGORY</th><th>DATE</th><th>PAYMENT</th><th className="text-end">AMOUNT</th>{!compact && <th className="text-end"> </th>}</tr></thead>
        <tbody>
          {transactions.map((item) => (
            <tr key={item._id}>
              <td><div className="transaction-title"><span className={`transaction-dot ${item.type.toLowerCase()}`}>{item.type === "Income" ? "↗" : "↘"}</span><div><strong>{item.title}</strong><small>{item.type}</small></div></div></td>
              <td><span className="category-pill">{item.category}</span></td>
              <td className="muted-cell">{formatDate(item.date)}</td>
              <td className="muted-cell">{item.paymentMethod}</td>
              <td className={`text-end amount-cell ${item.type.toLowerCase()}`}>{item.type === "Income" ? "+" : "−"}{money(item.amount)}</td>
              {!compact && <td className="text-end action-cell"><button type="button" onClick={() => onEdit(item)} aria-label={`Edit ${item.title}`}>Edit</button><button type="button" className="delete-action" onClick={() => onDelete(item)} aria-label={`Delete ${item.title}`}>Delete</button></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
