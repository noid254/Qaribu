import React, { useState } from 'react';
import * as api from '../../services/api';
import { nineDigitPhone } from '../../services/phone';
import { canPickContacts, fieldClass, isKenyanMobile, PHONE_HELP, primaryButton } from '../visitors/shared';
import ReceiptPreview from './ReceiptPreview';

export const formatKsh = (amount: number) => `KES ${amount.toLocaleString('en-US', { minimumFractionDigits: amount % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;

interface Line {
  key: number;
  description: string;
  qty: string;
  price: string;
  hasSerial: boolean;
  serial: string;
}

let nextKey = 1;
const newLine = (): Line => ({ key: nextKey++, description: '', qty: '1', price: '', hasSerial: false, serial: '' });

// The same sum the server does, to the cent, so the shop sees the total while typing. The server works it out
// again and its answer is the one on the receipt.
const lineTotal = (l: Line): number => {
  const qty = Number(l.qty);
  const price = Number(l.price.replace(/,/g, ''));
  return Number.isFinite(qty) && Number.isFinite(price) && qty > 0 && price > 0 ? Math.round(qty * price * 100) / 100 : 0;
};

// A shop issues a receipt: the items (each with a quantity and a unit price, and a serial number for items that
// have one, keyed in before issuing) and the customer's phone. The customer gets a link to the receipt page.
// Qaribu does not send SMS yet, so the shop sends it from their own phone with the buttons shown afterwards.
const IssueReceipt: React.FC<{ onIssued: () => void }> = ({ onIssued }) => {
  const [lines, setLines] = useState<Line[]>([newLine()]);
  const [phone, setPhone] = useState(''); // 9 digits after +254
  const [customerName, setCustomerName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<api.CreatedReceipt | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const total = lines.reduce((sum, l) => sum + lineTotal(l), 0);

  const setLine = (key: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const pickContact = async () => {
    setError('');
    try {
      const [contact] = await (navigator as any).contacts.select(['tel'], { multiple: false });
      if (!contact) return;
      const found = (contact.tel ?? []).map(nineDigitPhone).find((p: string | null) => p !== null) as string | undefined;
      if (found) setPhone(found);
      else setError('That contact has no Kenyan mobile number. Type the number instead.');
    } catch {
      // Closed the picker, or the browser refused: they can still type the number.
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isKenyanMobile(phone)) {
      setError(PHONE_HELP);
      return;
    }
    setIsSending(true);
    setError('');
    try {
      const made = await api.issueReceipt({
        customer_phone: `+254${phone}`,
        customer_name: customerName.trim() || undefined,
        items: lines.map((l) => ({
          description: l.description,
          qty: l.hasSerial ? '1' : l.qty,
          unit_price: l.price,
          serial: l.hasSerial ? l.serial : undefined,
        })),
      });
      setReceipt(made);
      setCopied(false);
      onIssued();
    } catch (err: any) {
      setError(err.message || 'Could not issue the receipt.');
    } finally {
      setIsSending(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setError('Could not copy. Select the message and copy it by hand.');
    }
  };

  const reset = () => {
    setReceipt(null);
    setShowPreview(false);
    setLines([newLine()]);
    setPhone('');
    setCustomerName('');
    setError('');
  };

  if (receipt) {
    return (
      <div data-testid="receipt-issued" className="bg-white rounded-xl shadow p-5 space-y-4">
        <p className="bg-green-50 text-green-800 text-sm rounded-lg p-3 text-center">
          Receipt {receipt.number} for {formatKsh(receipt.amount)} is ready for {receipt.customer_phone}.
          <span className="block text-xs text-green-700 mt-1">ID {receipt.uid}. It cannot be edited or deleted.</span>
        </p>
        <button onClick={() => setShowPreview(true)} data-testid="view-issued" className={primaryButton}>View the receipt</button>
        <p className="bg-gray-100 rounded-lg p-3 text-sm text-gray-700 break-words">{receipt.message}</p>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <p className="text-xs text-gray-500 text-center">SMS is not sent by Qaribu yet. Send it from your phone:</p>
        <div className="grid grid-cols-2 gap-2">
          <a href={receipt.sms_link} className="block text-center bg-brand-gold text-brand-navy font-bold py-3 px-2 rounded-lg active-scale">My SMS</a>
          <a href={receipt.whatsapp_link} target="_blank" rel="noopener noreferrer" className="block text-center bg-green-600 text-white font-bold py-3 px-2 rounded-lg active-scale">WhatsApp</a>
        </div>
        <button onClick={() => copy(receipt.message)} className="block w-full text-center border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg">
          {copied ? 'Copied' : 'Copy message'}
        </button>
        <p className="text-xs text-gray-500 text-center">The link opens once for your customer, then asks for a code. Look at it here, not through the link.</p>
        <button onClick={reset} className="block w-full text-center text-sm text-blue-600 hover:underline">Issue another receipt</button>
        {showPreview && (
          <ReceiptPreview id={receipt.id} number={receipt.number} smsLink={receipt.sms_link} whatsappLink={receipt.whatsapp_link} onClose={() => setShowPreview(false)} />
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <p data-testid="receipt-error" className="text-red-500 text-sm text-center bg-white rounded-xl shadow p-3">{error}</p>}

      <div className="space-y-3">
        {lines.map((l, i) => (
          <div key={l.key} data-testid="receipt-line" className="bg-white rounded-xl shadow p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-gray-500">Item {i + 1}</p>
              {lines.length > 1 && (
                <button type="button" onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} className="text-sm text-red-500" aria-label={`Remove item ${i + 1}`}>Remove</button>
              )}
            </div>
            <input
              aria-label={`Item ${i + 1} description`}
              value={l.description}
              onChange={(e) => setLine(l.key, { description: e.target.value })}
              required
              minLength={2}
              maxLength={80}
              placeholder="What was sold"
              className={fieldClass}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500">Quantity</label>
                <input
                  aria-label={`Item ${i + 1} quantity`}
                  inputMode="decimal"
                  value={l.hasSerial ? '1' : l.qty}
                  disabled={l.hasSerial}
                  onChange={(e) => setLine(l.key, { qty: e.target.value })}
                  required
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Unit price (KES)</label>
                <input
                  aria-label={`Item ${i + 1} unit price`}
                  inputMode="decimal"
                  value={l.price}
                  onChange={(e) => setLine(l.key, { price: e.target.value })}
                  required
                  placeholder="0"
                  className={fieldClass}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={l.hasSerial}
                onChange={(e) => setLine(l.key, { hasSerial: e.target.checked, serial: e.target.checked ? l.serial : '' })}
                className="h-4 w-4"
                aria-label={`Item ${i + 1} has a serial number`}
              />
              This item has a serial number
            </label>
            {l.hasSerial && (
              <div>
                <input
                  aria-label={`Item ${i + 1} serial number`}
                  value={l.serial}
                  onChange={(e) => setLine(l.key, { serial: e.target.value.toUpperCase() })}
                  required
                  minLength={3}
                  maxLength={40}
                  placeholder="Serial number, as printed on the item"
                  className={fieldClass}
                />
                <p className="text-xs text-gray-500 mt-1">One serial number means one item, so the quantity is 1. For two, add two items.</p>
              </div>
            )}
            <p className="text-right text-sm text-gray-600">
              Line total <span data-testid="line-total" className="font-semibold text-gray-900">{formatKsh(lineTotal(l))}</span>
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setLines((ls) => [...ls, newLine()])}
        disabled={lines.length >= 30}
        className="w-full border border-brand-gold text-brand-navy font-semibold py-2 px-4 rounded-lg"
      >
        + Add another item
      </button>

      <div className="bg-white rounded-xl shadow p-4 flex justify-between items-baseline">
        <span className="text-sm font-semibold uppercase tracking-wide text-gray-600">Total</span>
        <span data-testid="grand-total" className="text-2xl font-bold text-brand-navy">{formatKsh(total)}</span>
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <div>
          <label htmlFor="rcName" className="block text-sm font-medium text-gray-700">Customer’s name <span className="text-gray-400">(optional)</span></label>
          <input id="rcName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} maxLength={80} placeholder="Printed as ‘Received from’" className={fieldClass} />
        </div>
        {canPickContacts() && (
          <button type="button" onClick={pickContact} className="w-full border border-brand-gold text-brand-navy font-semibold py-2 px-4 rounded-lg">
            Choose customer from contacts
          </button>
        )}
        <div>
          <label htmlFor="rcPhone" className="block text-sm font-medium text-gray-700">Customer’s phone</label>
          <div className="flex items-center mt-1 bg-gray-100 rounded-lg shadow-inner focus-within:ring-2 focus-within:ring-brand-gold">
            <span className="px-3 text-gray-500 border-r border-gray-300">+254</span>
            <input
              id="rcPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
              required
              placeholder="722123456"
              className="block w-full pl-3 pr-3 py-3 bg-transparent focus:outline-none sm:text-sm"
            />
          </div>
        </div>
      </div>

      <button type="submit" disabled={isSending || total <= 0} className={primaryButton}>{isSending ? 'Issuing…' : 'Issue receipt'}</button>
    </form>
  );
};

export default IssueReceipt;
