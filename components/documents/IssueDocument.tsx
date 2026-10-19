import React, { useState } from 'react';
import * as api from '../../services/api';
import { nineDigitPhone } from '../../services/phone';
import { canPickContacts, fieldClass, isKenyanMobile, PHONE_HELP, primaryButton } from '../visitors/shared';
import LineEditor, { formatKsh, newLine, sumLines, toInputs } from './LineEditor';
import type { Line } from './LineEditor';
import ReceiptPreview from './ReceiptPreview';

interface IssueDocumentProps {
  kind: 'invoice' | 'quote';
  // What the tax rate is when the shop leaves it alone: 16 for a business with a KRA PIN, else 0.
  taxDefault: number;
  onIssued: () => void;
}

const cents = (n: number) => Math.round(n * 100);
const money = (text: string): number => {
  const n = Number(text.replace(/,/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

// An invoice asks a customer to pay; a quote offers a price. The customer, the items, then the adjustments in the
// order the earlier app had them: discount, tax, shipping, and (invoices only) a deposit already paid. The totals
// shown while typing are the same sums the server does, in whole cents; the server's answer is the one printed.
const IssueDocument: React.FC<IssueDocumentProps> = ({ kind, taxDefault, onIssued }) => {
  const isInvoice = kind === 'invoice';
  const [lines, setLines] = useState<Line[]>([newLine()]);
  const [customerName, setCustomerName] = useState('');
  const [customerDetails, setCustomerDetails] = useState('');
  const [phone, setPhone] = useState('');
  const [discount, setDiscount] = useState('');
  const [taxRate, setTaxRate] = useState(''); // empty means the default
  const [shipping, setShipping] = useState('');
  const [deposit, setDeposit] = useState('');
  const [lastDay, setLastDay] = useState(''); // empty means 30 days on
  const [notes, setNotes] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [doc, setDoc] = useState<api.CreatedDocument | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const rate = taxRate.trim() === '' ? taxDefault : Number(taxRate);
  const subtotal = cents(sumLines(lines));
  const taxable = subtotal - cents(money(discount));
  const tax = Number.isFinite(rate) ? Math.round((taxable * rate) / 100) : 0;
  const total = taxable + tax + cents(money(shipping));
  const balance = total - (isInvoice ? cents(money(deposit)) : 0);
  const word = isInvoice ? 'invoice' : 'quote';

  const pickContact = async () => {
    setError('');
    try {
      const [contact] = await (navigator as any).contacts.select(['name', 'tel'], { multiple: false });
      if (!contact) return;
      const name = (contact.name?.[0] ?? '').trim();
      const found = (contact.tel ?? []).map(nineDigitPhone).find((p: string | null) => p !== null) as string | undefined;
      if (name && !customerName) setCustomerName(name);
      if (found) setPhone(found);
      else setError('That contact has no Kenyan mobile number. Type the number instead.');
    } catch {
      // Closed the picker, or the browser refused: they can still type the details.
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
      const input: api.DocumentInput = {
        customer_phone: `+254${phone}`,
        customer_name: customerName,
        customer_details: customerDetails,
        items: toInputs(lines),
        discount,
        tax_rate: taxRate.trim() === '' ? undefined : taxRate,
        shipping,
        notes,
      };
      if (isInvoice) input.deposit = deposit;
      if (lastDay) (isInvoice ? (input.due_date = lastDay) : (input.valid_until = lastDay));
      setDoc(await api.issueDocument(kind, input));
      setCopied(false);
      onIssued();
    } catch (err: any) {
      setError(err.message || `Could not issue the ${word}.`);
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
    setDoc(null);
    setShowPreview(false);
    setLines([newLine()]);
    setCustomerName('');
    setCustomerDetails('');
    setPhone('');
    setDiscount('');
    setTaxRate('');
    setShipping('');
    setDeposit('');
    setLastDay('');
    setNotes('');
    setError('');
  };

  if (doc) {
    return (
      <div data-testid="document-issued" className="bg-white rounded-xl shadow p-5 space-y-4">
        <p className="bg-green-50 text-green-800 text-sm rounded-lg p-3 text-center">
          {isInvoice ? 'Invoice' : 'Quote'} {doc.number} for {formatKsh(isInvoice ? doc.balance_due : doc.amount)} is ready for {doc.customer_phone}.
          <span className="block text-xs text-green-700 mt-1">ID {doc.uid}. It cannot be edited or deleted.</span>
        </p>
        <button onClick={() => setShowPreview(true)} data-testid="view-issued" className={primaryButton}>View the {word}</button>
        <p className="bg-gray-100 rounded-lg p-3 text-sm text-gray-700 break-words">{doc.message}</p>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <p className="text-xs text-gray-500 text-center">SMS is not sent by Qaribu yet. Send it from your phone:</p>
        <div className="grid grid-cols-2 gap-2">
          <a href={doc.sms_link} className="block text-center bg-brand-gold text-brand-navy font-bold py-3 px-2 rounded-lg active-scale">My SMS</a>
          <a href={doc.whatsapp_link} target="_blank" rel="noopener noreferrer" className="block text-center bg-green-600 text-white font-bold py-3 px-2 rounded-lg active-scale">WhatsApp</a>
        </div>
        <button onClick={() => copy(doc.message)} className="block w-full text-center border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg">{copied ? 'Copied' : 'Copy message'}</button>
        <p className="text-xs text-gray-500 text-center">The link opens once for your customer, then asks for a code. Look at it here, not through the link.</p>
        <button onClick={reset} className="block w-full text-center text-sm text-blue-600 hover:underline">Make another {word}</button>
        {showPreview && <ReceiptPreview id={doc.id} number={doc.number} kind={doc.kind} smsLink={doc.sms_link} whatsappLink={doc.whatsapp_link} onClose={() => setShowPreview(false)} />}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <p data-testid="document-error" className="text-red-500 text-sm text-center bg-white rounded-xl shadow p-3">{error}</p>}

      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <p className="text-xs uppercase tracking-wide text-gray-500">{isInvoice ? 'Bill to' : 'Prepared for'}</p>
        <div>
          <label htmlFor="dcName" className="block text-sm font-medium text-gray-700">Customer’s name</label>
          <input id="dcName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required minLength={2} maxLength={80} placeholder="Acme Ltd" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="dcDetails" className="block text-sm font-medium text-gray-700">Address or tax number <span className="text-gray-400">(optional)</span></label>
          <textarea id="dcDetails" value={customerDetails} onChange={(e) => setCustomerDetails(e.target.value)} maxLength={200} rows={2} className={fieldClass} />
        </div>
        {canPickContacts() && (
          <button type="button" onClick={pickContact} className="w-full border border-brand-gold text-brand-navy font-semibold py-2 px-4 rounded-lg">Choose customer from contacts</button>
        )}
        <div>
          <label htmlFor="dcPhone" className="block text-sm font-medium text-gray-700">Customer’s phone</label>
          <div className="flex items-center mt-1 bg-gray-100 rounded-lg shadow-inner focus-within:ring-2 focus-within:ring-brand-gold">
            <span className="px-3 text-gray-500 border-r border-gray-300">+254</span>
            <input
              id="dcPhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
              required
              placeholder="722123456"
              className="block w-full pl-3 pr-3 py-3 bg-transparent focus:outline-none sm:text-sm"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">The {word} belongs to this number. Your customer opens it from the link, then with a code.</p>
        </div>
      </div>

      <LineEditor lines={lines} setLines={setLines} />

      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <p className="text-xs uppercase tracking-wide text-gray-500">Adjustments</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="dcDiscount" className="block text-xs text-gray-500">Discount (KES)</label>
            <input id="dcDiscount" inputMode="decimal" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="dcTax" className="block text-xs text-gray-500">Tax rate (%)</label>
            <input id="dcTax" inputMode="decimal" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} placeholder={String(taxDefault)} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="dcShipping" className="block text-xs text-gray-500">Shipping (KES)</label>
            <input id="dcShipping" inputMode="decimal" value={shipping} onChange={(e) => setShipping(e.target.value)} placeholder="0" className={fieldClass} />
          </div>
          {isInvoice && (
            <div>
              <label htmlFor="dcDeposit" className="block text-xs text-gray-500">Deposit already paid (KES)</label>
              <input id="dcDeposit" inputMode="decimal" value={deposit} onChange={(e) => setDeposit(e.target.value)} placeholder="0" className={fieldClass} />
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Tax is charged on the subtotal after the discount. {taxDefault > 0 ? 'It starts at 16% because your brand kit has a KRA PIN.' : 'It starts at none; add a rate if you charge tax.'}
        </p>
        <div>
          <label htmlFor="dcDay" className="block text-xs text-gray-500">{isInvoice ? 'Due date' : 'Valid until'} <span className="text-gray-400">(30 days from today if left empty)</span></label>
          <input id="dcDay" type="date" value={lastDay} onChange={(e) => setLastDay(e.target.value)} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="dcNotes" className="block text-xs text-gray-500">Note <span className="text-gray-400">(optional)</span></label>
          <textarea id="dcNotes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} rows={2} placeholder="Thank you for your business." className={fieldClass} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 space-y-1 text-sm">
        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatKsh(subtotal / 100)}</span></div>
        {money(discount) > 0 && <div className="flex justify-between text-gray-600"><span>Discount</span><span>- {formatKsh(cents(money(discount)) / 100)}</span></div>}
        {tax > 0 && <div className="flex justify-between text-gray-600"><span>Tax ({rate}%)</span><span>{formatKsh(tax / 100)}</span></div>}
        {money(shipping) > 0 && <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{formatKsh(cents(money(shipping)) / 100)}</span></div>}
        {isInvoice && money(deposit) > 0 && <div className="flex justify-between text-gray-600"><span>Deposit paid</span><span>- {formatKsh(cents(money(deposit)) / 100)}</span></div>}
        <div className="flex justify-between items-baseline pt-2 border-t">
          <span className="font-semibold uppercase tracking-wide text-gray-600">{isInvoice ? 'Balance due' : 'Total'}</span>
          <span data-testid="grand-total" className="text-2xl font-bold text-brand-navy">{formatKsh((isInvoice ? balance : total) / 100)}</span>
        </div>
      </div>

      <button type="submit" disabled={isSending || subtotal <= 0} className={primaryButton}>{isSending ? 'Issuing…' : isInvoice ? 'Issue invoice' : 'Issue quote'}</button>
    </form>
  );
};

export default IssueDocument;
