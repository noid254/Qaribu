import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';
import { fieldClass, primaryButton } from '../visitors/shared';
import { formatKsh } from './LineEditor';
import ReceiptPreview from './ReceiptPreview';

interface DocumentListProps {
  onOpenAssets?: () => void;
  // 'issued': what this person's business has issued. 'received': what has been issued to this person's number.
  mode: 'issued' | 'received';
  refreshKey: number;
}

const EMPTY: api.ReceiptSearch = { q: '', from: '', to: '' };
const KINDS: { key: api.DocumentKind | ''; label: string }[] = [
  { key: '', label: 'All' },
  { key: 'receipt', label: 'Receipts' },
  { key: 'invoice', label: 'Invoices' },
  { key: 'quote', label: 'Quotes' },
];

const dayText = (ymd: string) => new Date(`${ymd}T00:00:00Z`).toLocaleDateString('en-GB', { dateStyle: 'medium', timeZone: 'UTC' });

// Every receipt, invoice and quote, newest first, found by the person's name, a phone number, a number or ID (or the
// shop's name, for what you received), by kind, and by day. They are history: they can be opened and searched, never
// edited or deleted, so nothing here does either.
const DocumentList: React.FC<DocumentListProps> = ({ mode, refreshKey, onOpenAssets }) => {
  const [typed, setTyped] = useState<api.ReceiptSearch>(EMPTY);
  const [applied, setApplied] = useState<api.ReceiptSearch>(EMPTY);
  const [kind, setKind] = useState<api.DocumentKind | ''>('');
  const [items, setItems] = useState<api.ReceiptItem[] | null>(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<api.ReceiptItem | null>(null);
  const [paidKey, setPaidKey] = useState(0);

  useEffect(() => {
    setError('');
    (mode === 'issued' ? api.getIssuedDocuments(kind, applied) : api.getReceivedDocuments(kind, applied))
      .then((res) => setItems(res.documents))
      .catch((err: Error) => setError(err.message));
  }, [mode, applied, kind, refreshKey, paidKey]);

  // The open document, as the refreshed list now has it (after a payment its balance has changed).
  const current = open ? (items?.find((i) => i.id === open.id) ?? open) : null;
  const filtered = Boolean(applied.q || applied.from || applied.to || kind);
  const who = (r: api.ReceiptItem) => (mode === 'issued' ? r.customer_name || r.customer_phone : r.shop_name);
  const when = (r: api.ReceiptItem) =>
    r.kind === 'invoice' && r.due_date ? ` · Due ${dayText(r.due_date)}` : r.kind === 'quote' && r.valid_until ? ` · Valid until ${dayText(r.valid_until)}` : '';

  return (
    <div className="space-y-3">
      <div className="flex gap-1 flex-wrap" role="group" aria-label="Kind of document">
        {KINDS.map((k) => (
          <button
            key={k.key || 'all'}
            type="button"
            aria-pressed={kind === k.key}
            onClick={() => setKind(k.key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${kind === k.key ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-gray-600 border-gray-300'}`}
          >
            {k.label}
          </button>
        ))}
      </div>

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
            {mode === 'issued' ? 'Customer name, phone number, number or ID' : 'Shop, number or ID'}
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
                setKind('');
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
          {filtered ? 'Nothing matches that search.' : mode === 'issued' ? 'You have not issued anything yet.' : 'Nothing has been issued to your number yet.'}
        </div>
      )}

      {items?.map((r) => (
        <button key={r.id} onClick={() => setOpen(r)} data-testid="receipt-row" className="w-full text-left bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {who(r)}
                {r.kind !== 'receipt' && <span className="ml-2 align-middle text-[10px] uppercase tracking-wide font-semibold text-gray-500 border border-gray-300 rounded-full px-2 py-0.5">{r.kind}</span>}
              </p>
              <p className="text-xs text-gray-500">{r.number} · {r.uid}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-brand-navy">{formatKsh(r.amount)}</p>
              {r.cancelled && <p className="text-xs font-semibold text-red-700">Cancelled</p>}
              {!r.cancelled && r.kind === 'quote' && r.decision && !r.invoiced && <p className={`text-xs font-semibold ${r.decision === 'accepted' ? 'text-green-700' : 'text-red-700'}`}>{r.decision === 'accepted' ? 'Accepted' : 'Declined'}</p>}
              {!r.cancelled && r.kind === 'quote' && r.invoiced && <p className="text-xs font-semibold text-green-700">Invoiced</p>}
              {!r.cancelled && r.kind === 'invoice' && r.balance_due !== null && (
                <p className={`text-xs font-semibold ${r.balance_due <= 0 ? 'text-green-700' : 'text-amber-700'}`}>{r.balance_due <= 0 ? 'Paid' : `Balance ${formatKsh(r.balance_due)}`}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-700 mt-2 truncate">
            {r.first_item}
            {r.item_count > 1 && <span className="text-gray-500"> and {r.item_count - 1} more</span>}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(r.issued_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Nairobi' })}
            {when(r)}
            <span className="text-blue-600"> · View</span>
          </p>
        </button>
      ))}

      {current && <ReceiptPreview id={current.id} number={current.number} kind={current.kind} smsLink={current.sms_link} whatsappLink={current.whatsapp_link} claimable={mode === 'received' && (current.kind === 'receipt' || (current.kind === 'invoice' && !current.cancelled && current.balance_due !== null && current.balance_due <= 0))} onOpenAssets={onOpenAssets} payable={mode === 'issued' && current.kind === 'invoice' && !current.cancelled && (current.balance_due ?? 0) > 0 ? { balance: current.balance_due ?? 0 } : undefined} onPaid={() => setPaidKey((n) => n + 1)} actions={mode === 'issued' && (current.kind === 'invoice' || current.kind === 'quote') && !current.cancelled ? { canInvoice: current.kind === 'quote' && !current.invoiced && current.decision !== 'declined', canCancel: !current.invoiced } : undefined} answerable={mode === 'received' && current.kind === 'quote' && !current.cancelled && !current.invoiced && !current.decision} onChanged={() => setPaidKey((n) => n + 1)} onClose={() => setOpen(null)} />}
    </div>
  );
};

export default DocumentList;