import React, { useState } from 'react';
import * as api from '../../services/api';
import { nineDigitPhone } from '../../services/phone';
import { canPickContacts, fieldClass, isKenyanMobile, PHONE_HELP, primaryButton } from '../visitors/shared';
import LineEditor, { formatKsh, newLine, sumLines, toInputs } from './LineEditor';
import type { Line } from './LineEditor';
import ReceiptPreview from './ReceiptPreview';

// A shop issues a receipt: the items and the customer's phone. The customer gets a link to the receipt page.
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

  const total = sumLines(lines);

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
      const made = await api.issueReceipt({ customer_phone: `+254${phone}`, customer_name: customerName.trim() || undefined, items: toInputs(lines) });
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

      <LineEditor lines={lines} setLines={setLines} />

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
