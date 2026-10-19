import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';
import { fieldClass, primaryButton } from '../visitors/shared';
import { formatKsh } from './IssueReceipt';
import ReceiptPreview from './ReceiptPreview';

interface ReceiptListProps {
  // 'issued': what this person's business has issued. 'received': what has been issued to this person's number.
  mode: 'issued' | 'received';
  refreshKey: number;
}

const EMPTY: api.ReceiptSearch = { q: '', from: '', to: '' };

// Every receipt, newest first, found by the person's name, a phone number, a receipt number or ID (or the shop's
// name, for what you received) and by day. Receipts are history: they can be opened and searched, never edited or deleted.
const ReceiptList: React.FC<ReceiptListProps> = ({ mode, refreshKey }) => {
  const [typed, setTyped] = useState<api.ReceiptSearch>(EMPTY);
  const [applied, setApplied] = useState<api.ReceiptSearch>(EMPTY);
  const [items, setItems] = useState<api.ReceiptItem[] | null>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<api.ReceiptItem | null>(null);

  useEffect(() => {
    setError('');
    (mode === 'issued' ? api.getReceipts(applied) : api.getMyReceipts(applied))
      .then((res) => setItems(res.receipts))
      .catch((err: Error) => setError(err.message));
  }, [mode, applied, refreshKey]);

  const filtered = Boolean(applied.q || applied.from || applied.to);
  const who = (r: api.ReceiptItem) => (mode === 'issued' ? r.customer_name || r.customer_phone : r.shop_name);

  return (
    <div className="space-y-3">
      <form
        data-testid="receipt-search"
        onSubmit={(e) => {
          e.preventDefault();
          setApplied(typed);
        }}
        className="bg-white rounded-xl shadow p-4 space-y-3"
      >
        <div>
          <label htmlFor={`${mode}-q`} className="block text-sm font-medium text-gray-700">
            {mode === 'issued' ? 'Customer name, phone number, receipt number or ID' : 'Shop, receipt number or ID'}
          </label>
          <input id={`${mode}-q`} value={typed.q} onChange={(e) => setTyped({ ...typed, q: e.target.value })} maxLength={60} className={fieldClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${mode}-from`} className="block text-xs text-gray-500">From</label>
            <input id={`${mode}-from`} type="date" value={typed.from} onChange={(e) => setTyped({ ...typed, from: e.target.value })} className={fieldClass} />
          </div>
          <div>
            <label htmlFor={`${mode}-to`} className="block text-xs text-gray-500">To</label>
            <input id={`${mode}-to`} type="date" value={typed.to} onChange={(e) => setTyped({ ...typed, to: e.target.value })} className={fieldClass} />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className={primaryButton}>Search</button>
          {filtered && (
            <button
              type="button"
              onClick={() => {
                setTyped(EMPTY);
                setApplied(EMPTY);
              }}
              className="shrink-0 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {!error && items === null && <p className="text-sm text-gray-500">Loading…</p>}
      {items !== null && items.length === 0 && (
        <div className="bg-white rounded-xl shadow p-6 text-center text-gray-600">
          {filtered ? 'No receipts match that search.' : mode === 'issued' ? 'You have not issued any receipts yet.' : 'No receipts have been issued to your number yet.'}
        </div>
      )}

      {items?.map((r) => (
        <button key={r.id} onClick={() => setOpen(r)} data-testid="receipt-row" className="w-full text-left bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{who(r)}</p>
              <p className="text-xs text-gray-500">{r.number} · {r.uid}</p>
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

      {open && <ReceiptPreview id={open.id} number={open.number} smsLink={open.sms_link} whatsappLink={open.whatsapp_link} onClose={() => setOpen(null)} />}
    </div>
  );
};

export default ReceiptList;
