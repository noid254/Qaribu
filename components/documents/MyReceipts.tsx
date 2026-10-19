import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';
import { formatKsh } from './IssueReceipt';

// The receipts this person has issued, newest first.
const MyReceipts: React.FC<{ refreshKey: number }> = ({ refreshKey }) => {
  const [items, setItems] = useState<api.ReceiptItem[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    api
      .getReceipts()
      .then((res) => setItems(res.receipts))
      .catch((err: Error) => setError(err.message));
  }, [refreshKey]);

  if (error) return <p className="text-red-500 text-sm">{error}</p>;
  if (items === null) return <p className="text-sm text-gray-500">Loading…</p>;
  if (items.length === 0) {
    return <div className="bg-white rounded-xl shadow p-6 text-center text-gray-600">You have not issued any receipts yet.</div>;
  }

  return (
    <div className="space-y-3">
      {items.map((r) => (
        <div key={r.id} data-testid="receipt-row" className="bg-white rounded-xl shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900">{r.number}</p>
              <p className="text-xs text-gray-500">{r.customer_name || r.customer_phone}</p>
            </div>
            <p className="font-bold text-brand-navy">{formatKsh(r.amount)}</p>
          </div>
          {r.purpose && <p className="text-sm text-gray-700 mt-2">{r.purpose}</p>}
          <p className="text-xs text-gray-500 mt-1">
            {new Date(r.issued_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Nairobi' })}
          </p>
        </div>
      ))}
    </div>
  );
};

export default MyReceipts;
