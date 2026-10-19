import React, { useState } from 'react';
import * as api from '../../services/api';
import { nineDigitPhone } from '../../services/phone';
import { fieldClass, isKenyanMobile, PHONE_HELP, primaryButton } from '../visitors/shared';

interface BrandKitFormProps {
  initial: api.BrandKit | null;
  onSaved: (kit: api.BrandKit) => void;
  onCancel?: () => void;
}

const STEPS = ['Business', 'Contact', 'Payment and receipts', 'Review'];

const DEFAULT_RECEIPT_NOTE = 'Goods once sold cannot be re-accepted.';

// The brand kit set-up, in the four steps the earlier app's "My Workshop" used: business, contact, how you get
// paid, review. The business name, address and phone are needed, and so are the terms (accepted once). The rest
// is optional. The server checks all of it again; this only walks the person through.
const BrandKitForm: React.FC<BrandKitFormProps> = ({ initial, onSaved, onCancel }) => {
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState(initial?.business_name ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [phone, setPhone] = useState(initial?.phone ? nineDigitPhone(initial.phone) ?? '' : ''); // 9 digits after +254
  const [email, setEmail] = useState(initial?.email ?? '');
  const [taxPin, setTaxPin] = useState(initial?.tax_pin ?? '');
  const [tagline, setTagline] = useState(initial?.tagline ?? '');
  const [paymentDetails, setPaymentDetails] = useState(initial?.payment_details ?? '');
  // The note starts as the usual returns line, also for a brand kit saved before receipts had a note.
  const [receiptNote, setReceiptNote] = useState(initial?.receipt_note || DEFAULT_RECEIPT_NOTE);
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const termsDone = Boolean(initial?.terms_accepted_at);

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (step === 1 && phone !== '' && !isKenyanMobile(phone)) {
      setError(PHONE_HELP);
      return;
    }
    setStep((s) => s + 1);
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const kit = await api.saveBrandKit({
        business_name: businessName,
        address,
        phone: phone ? `+254${phone}` : undefined, // blank means the account's own number
        email,
        tax_pin: taxPin,
        tagline,
        payment_details: paymentDetails,
        receipt_note: receiptNote,
        accept_terms: termsDone ? undefined : agreed,
      });
      onSaved(kit);
    } catch (err: any) {
      setError(err.message || 'Could not save your brand kit.');
    } finally {
      setSaving(false);
    }
  };

  const back = () => {
    setError('');
    setStep((s) => s - 1);
  };

  const row = (label: string, value: string) => (
    <div className="flex justify-between gap-4 p-3 bg-gray-50 rounded-lg text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-right whitespace-pre-line break-words">{value || '—'}</span>
    </div>
  );

  return (
    <div data-testid="brand-kit-form" className="bg-white rounded-xl shadow p-5 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Step {step + 1} of {STEPS.length}</p>
        <h2 className="text-lg font-bold text-brand-navy">{STEPS[step]}</h2>
        <div className="flex gap-1 mt-2" aria-hidden="true">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded ${i <= step ? 'bg-brand-gold' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      {error && <p data-testid="brand-kit-error" className="text-red-500 text-sm text-center">{error}</p>}

      {step === 0 && (
        <form onSubmit={next} className="space-y-4">
          <div>
            <label htmlFor="bkName" className="block text-sm font-medium text-gray-700">Business name</label>
            <input id="bkName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required minLength={2} maxLength={80} placeholder="Mama Mboga Fresh" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="bkAddress" className="block text-sm font-medium text-gray-700">Address</label>
            <textarea id="bkAddress" value={address} onChange={(e) => setAddress(e.target.value)} required minLength={3} maxLength={160} rows={2} placeholder="Stall 4, Gikomba Market, Nairobi" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="bkTagline" className="block text-sm font-medium text-gray-700">One line about you <span className="text-gray-400">(optional)</span></label>
            <input id="bkTagline" value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={80} placeholder="Fresh vegetables daily" className={fieldClass} />
          </div>
          <div className="flex gap-2">
            {onCancel && (
              <button type="button" onClick={onCancel} className="shrink-0 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg">Cancel</button>
            )}
            <button type="submit" className={primaryButton}>Next</button>
          </div>
        </form>
      )}

      {step === 1 && (
        <form onSubmit={next} className="space-y-4">
          <div>
            <label htmlFor="bkPhone" className="block text-sm font-medium text-gray-700">Business phone</label>
            <div className="flex items-center mt-1 bg-gray-100 rounded-lg shadow-inner focus-within:ring-2 focus-within:ring-brand-gold">
              <span className="px-3 text-gray-500 border-r border-gray-300">+254</span>
              <input
                id="bkPhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                placeholder="Leave empty to use your own number"
                className="block w-full pl-3 pr-3 py-3 bg-transparent focus:outline-none sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="bkEmail" className="block text-sm font-medium text-gray-700">Email <span className="text-gray-400">(optional)</span></label>
            <input id="bkEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="bkPin" className="block text-sm font-medium text-gray-700">KRA PIN <span className="text-gray-400">(optional)</span></label>
            <input id="bkPin" value={taxPin} onChange={(e) => setTaxPin(e.target.value.toUpperCase())} maxLength={11} placeholder="A123456789B" className={fieldClass} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={back} className="shrink-0 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg">Back</button>
            <button type="submit" className={primaryButton}>Next</button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={next} className="space-y-4">
          <div>
            <label htmlFor="bkPay" className="block text-sm font-medium text-gray-700">How you get paid <span className="text-gray-400">(optional)</span></label>
            <textarea
              id="bkPay"
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
              maxLength={300}
              rows={4}
              placeholder={'M-Pesa Till: 123456\nBank: ABC Bank, Acc 0123456789'}
              className={fieldClass}
            />
            <p className="text-xs text-gray-500 mt-1">Printed on your invoices and quotes, exactly as you write it.</p>
          </div>
          <div>
            <label htmlFor="bkNote" className="block text-sm font-medium text-gray-700">Note at the bottom of your receipts <span className="text-gray-400">(optional)</span></label>
            <input id="bkNote" value={receiptNote} onChange={(e) => setReceiptNote(e.target.value)} maxLength={160} className={fieldClass} />
            <p className="text-xs text-gray-500 mt-1">For example your returns policy. Change it to suit your shop.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={back} className="shrink-0 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg">Back</button>
            <button type="submit" className={primaryButton}>Review</button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="space-y-2">
            {row('Business', businessName)}
            {row('Address', address)}
            {row('Phone', phone ? `+254 ${phone}` : 'Your own number')}
            {row('Email', email)}
            {row('KRA PIN', taxPin)}
            {row('One line', tagline)}
            {row('How you get paid', paymentDetails)}
            {row('Receipt note', receiptNote)}
          </div>
          {termsDone ? (
            <p className="text-xs text-gray-500">
              Terms accepted on {new Date(initial!.terms_accepted_at).toLocaleDateString('en-GB', { dateStyle: 'medium' })}.
            </p>
          ) : (
            <>
              <div className="text-xs p-3 border rounded-lg bg-gray-50 text-gray-600 h-24 overflow-y-auto">
                By using this service you agree to make documents that are accurate and lawful. The receipts, invoices and
                other documents you make carry your name, address and phone number, and anyone you send them to can see
                those. You are responsible for what you issue.
              </div>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="h-5 w-5" data-testid="brand-kit-terms" />
                <span className="font-semibold text-sm">I agree to the terms</span>
              </label>
            </>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={back} className="shrink-0 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg">Back</button>
            <button type="button" onClick={save} disabled={saving || (!termsDone && !agreed)} className={primaryButton} data-testid="brand-kit-save">
              {saving ? 'Saving…' : termsDone ? 'Save' : 'Complete set-up'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandKitForm;
