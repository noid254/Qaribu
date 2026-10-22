import React, { useState } from 'react';
import * as api from '../../services/api';
import { fieldClass, primaryButton } from '../visitors/shared';
import { formatKsh } from './LineEditor';
import ReceiptPreview from './ReceiptPreview';

interface DocumentActionsProps {
  id: string;
  kind: 'invoice' | 'quote';
  // A quote that has not become an invoice, and has not been cancelled, can be made into one.
  canInvoice: boolean;
  // An invoice or quote that has not been cancelled (and, for a quote, not made into an invoice) can be cancelled.
  canCancel: boolean;
  // Called after something is saved, so the page and the lists show the new state.
  onChanged: () => void;
}

// What the shop can do with an invoice or a quote it issued, beyond recording a payment: make a quote into an invoice,
// or cancel one sent in error. Neither edits or deletes: the document stays, and an event is added to its record.
const DocumentActions: React.FC<DocumentActionsProps> = ({ id, kind, canInvoice, canCancel, onChanged }) => {
  const [panel, setPanel] = useState<'' | 'invoice' | 'cancel'>('');
  const [dueDate, setDueDate] = useState('');
  const [deposit, setDeposit] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [made, setMade] = useState<api.CreatedDocument | null>(null);
  const [showMade, setShowMade] = useState(false);

  const close = () => {
    setPanel('');
    setError('');
  };

  const makeInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const doc = await api.invoiceFromQuote(id, { due_date: dueDate || undefined, deposit: deposit.trim() || undefined });
      setMade(doc);
      setPanel('');
      setDueDate('');
      setDeposit('');
      onChanged();
    } catch (err: any) {
      setError(err.message || 'Could not make the invoice.');
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.cancelDocument(id, reason);
      setPanel('');
      setReason('');
      onChanged();
    } catch (err: any) {
      setError(err.message || 'Could not cancel it.');
    } finally {
      setSaving(false);
    }
  };

  if (!made && !canInvoice && !canCancel) return null;

  return (
    <div data-testid="document-actions" className="bg-white border-t p-3 max-w-md w-full mx-auto space-y-2 max-h-72 overflow-y-auto">
      {made && (
        <div data-testid="invoice-made" className="bg-green-50 text-green-800 text-sm rounded-lg p-3 space-y-2">
          <p>
            Invoice {made.number} made for {formatKsh(made.amount)}
            {made.balance_due !== made.amount ? `, ${formatKsh(made.balance_due)} to pay` : ''}.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <a href={made.sms_link} className="text-center bg-brand-gold text-brand-navy font-bold text-xs py-2 rounded-lg">SMS the invoice</a>
            <a href={made.whatsapp_link} target="_blank" rel="noopener noreferrer" className="text-center bg-green-600 text-white font-bold text-xs py-2 rounded-lg">WhatsApp</a>
            <button onClick={() => setShowMade(true)} className="text-center border border-green-700 text-green-800 font-semibold text-xs py-2 rounded-lg">View invoice</button>
          </div>
        </div>
      )}

      {panel === '' && (
        <div className="grid gap-2">
          {kind === 'quote' && canInvoice && (
            <button onClick={() => setPanel('invoice')} data-testid="make-invoice" className={primaryButton}>Make this quote an invoice</button>
          )}
          {canCancel && (
            <button onClick={() => setPanel('cancel')} data-testid="cancel-document" className="border border-red-300 text-red-700 font-semibold py-3 rounded-lg">
              Cancel this {kind}
            </button>
          )}
        </div>
      )}

      {panel === 'invoice' && (
        <form onSubmit={makeInvoice} className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">Make an invoice from this quote</p>
          {error && <p data-testid="document-error" className="text-red-500 text-xs">{error}</p>}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="invDue" className="block text-xs text-gray-500">Due date <span className="text-gray-400">(optional)</span></label>
              <input id="invDue" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="invDeposit" className="block text-xs text-gray-500">Deposit paid <span className="text-gray-400">(optional)</span></label>
              <input id="invDeposit" inputMode="decimal" value={deposit} onChange={(e) => setDeposit(e.target.value)} className={fieldClass} />
            </div>
          </div>
          <p className="text-xs text-gray-500">The customer, items, discount, tax, shipping and note are copied from the quote. With no due date it is due in 30 days. A quote becomes one invoice, and this cannot be undone.</p>
          <div className="flex gap-2">
            <button type="button" onClick={close} className="shrink-0 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg">Back</button>
            <button type="submit" disabled={saving} className={primaryButton} data-testid="make-invoice-save">{saving ? 'Making…' : 'Make invoice'}</button>
          </div>
        </form>
      )}

      {panel === 'cancel' && (
        <form onSubmit={cancel} className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">Cancel this {kind}</p>
          {error && <p data-testid="document-error" className="text-red-500 text-xs">{error}</p>}
          <div>
            <label htmlFor="cancelReason" className="block text-xs text-gray-500">Why is it being cancelled?</label>
            <input id="cancelReason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} className={fieldClass} />
          </div>
          <p className="text-xs text-gray-500">It stays on record, marked cancelled with this reason, and your customer will see that. It cannot be undone. {kind === 'invoice' ? 'An invoice that has payments against it cannot be cancelled.' : ''}</p>
          <div className="flex gap-2">
            <button type="button" onClick={close} className="shrink-0 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg">Back</button>
            <button type="submit" disabled={saving} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg disabled:opacity-60" data-testid="cancel-save">{saving ? 'Cancelling…' : 'Cancel it'}</button>
          </div>
        </form>
      )}
      {showMade && made && <ReceiptPreview id={made.id} number={made.number} kind="invoice" smsLink={made.sms_link} whatsappLink={made.whatsapp_link} onClose={() => setShowMade(false)} />}
    </div>
  );
};

export default DocumentActions;
