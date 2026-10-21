import React, { useState } from 'react';
import * as api from '../../services/api';
import { fieldClass, primaryButton } from '../visitors/shared';
import { formatKsh } from './LineEditor';
import ReceiptPreview from './ReceiptPreview';

const METHODS: { key: api.PayMethod; label: string }[] = [
  { key: 'mpesa', label: 'M-Pesa' },
  { key: 'cash', label: 'Cash' },
  { key: 'bank', label: 'Bank transfer' },
  { key: 'card', label: 'Card' },
  { key: 'other', label: 'Other' },
];

interface PaymentPanelProps {
  invoiceId: string;
  balance: number;
  // Called after a payment is saved, so the invoice and the lists show the new balance.
  onPaid: () => void;
}

// The shop records a payment against an invoice it issued. It issues a receipt for the customer and the balance goes
// down; the invoice itself is never edited. Leave the amount empty to take the whole balance.
const PaymentPanel: React.FC<PaymentPanelProps> = ({ invoiceId, balance, onPaid }) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<api.PayMethod>('mpesa');
  const [reference, setReference] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<api.CreatedPayment | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const made = await api.recordPayment(invoiceId, { amount: amount.trim() === '' ? undefined : amount, method, reference });
      setDone(made);
      setOpen(false);
      setAmount('');
      setReference('');
      onPaid();
    } catch (err: any) {
      setError(err.message || 'Could not record the payment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="payment-panel" className="bg-white border-t p-3 max-w-md w-full mx-auto space-y-2 max-h-72 overflow-y-auto">
      {done && (
        <div data-testid="payment-done" className="bg-green-50 text-green-800 text-sm rounded-lg p-3 space-y-2">
          <p>
            Payment of {formatKsh(done.amount)} recorded as receipt {done.number}.{' '}
            {done.paid_in_full ? 'The invoice is paid in full.' : `${formatKsh(done.balance_due)} is still to pay.`}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <a href={done.sms_link} className="text-center bg-brand-gold text-brand-navy font-bold text-xs py-2 rounded-lg">SMS the receipt</a>
            <a href={done.whatsapp_link} target="_blank" rel="noopener noreferrer" className="text-center bg-green-600 text-white font-bold text-xs py-2 rounded-lg">WhatsApp</a>
            <button onClick={() => setShowReceipt(true)} className="text-center border border-green-700 text-green-800 font-semibold text-xs py-2 rounded-lg">View receipt</button>
          </div>
        </div>
      )}

      {!open && balance > 0 && (
        <button onClick={() => setOpen(true)} data-testid="record-payment" className={primaryButton}>Record a payment ({formatKsh(balance)} due)</button>
      )}

      {open && (
        <form onSubmit={submit} className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">Record a payment</p>
          {error && <p data-testid="payment-error" className="text-red-500 text-xs">{error}</p>}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="payAmount" className="block text-xs text-gray-500">Amount (KES)</label>
              <input id="payAmount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={String(balance)} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="payMethod" className="block text-xs text-gray-500">Paid by</label>
              <select id="payMethod" value={method} onChange={(e) => setMethod(e.target.value as api.PayMethod)} className={fieldClass}>
                {METHODS.map((m) => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="payRef" className="block text-xs text-gray-500">Reference <span className="text-gray-400">(optional, such as the M-Pesa code)</span></label>
            <input id="payRef" value={reference} onChange={(e) => setReference(e.target.value)} maxLength={40} className={fieldClass} />
          </div>
          <p className="text-xs text-gray-500">Leave the amount empty to take the whole {formatKsh(balance)}. This issues a receipt to your customer, and cannot be undone.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(false)} className="shrink-0 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving} className={primaryButton} data-testid="payment-save">{saving ? 'Saving…' : 'Save payment'}</button>
          </div>
        </form>
      )}
      {showReceipt && done && <ReceiptPreview id={done.id} number={done.number} smsLink={done.sms_link} whatsappLink={done.whatsapp_link} onClose={() => setShowReceipt(false)} />}
    </div>
  );
};

export default PaymentPanel;