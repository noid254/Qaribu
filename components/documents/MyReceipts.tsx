import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';
import { formatKsh } from './IssueReceipt';
import ReceiptPreview from './ReceiptPreview';

// Every receipt this person has issued, newest first. Opening one shows the receipt as the customer sees it.
const MyReceipts: React.FC<{ refreshKey: number }> = ({ refreshKey }) => {
  const [items, setItems] = useState<api.ReceiptItem[] | null>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<api.ReceiptItem | null>(null);

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
        <button key={r.id} onClick={() => setOpen(r)} data-testid="receipt-row" className="w-full text-left bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">{r.number}</p>
              <p className="text-xs text-gray-500">{r.customer_name || r.customer_phone}</p>
            </div>
            <p className="font-bold text-brand-navy shrink-0">{formatKsh(r.amount)}</p>
          </div>
          <p className="text-sm text-gray-700 mt-2 truncate">
            {r.first_item}
            {r.item_count > 1 && <span className="text-gray-500"> and {r.item_count - 1} more</span>}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(r.issued_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Nairobi' })}
            <span className="text-blue-600"> · View</span>
          </p>
        </button>
      ))}
      {open && <ReceiptPreview number={open.number} url={open.receipt_url} smsLink={open.sms_link} whatsappLink={open.whatsapp_link} onClose={() => setOpen(null)} />}
    </div>
  );
};

export default MyReceipts;
