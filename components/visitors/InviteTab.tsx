import React, { useState } from 'react';
import * as api from '../../services/api';
import { nineDigitPhone } from '../../services/phone';
import { canPickContacts, fieldClass, isKenyanMobile, PHONE_HELP, primaryButton } from './shared';

// A host invites a visitor. Qaribu sends the invite by SMS from its server and says plainly whether that
// worked; if it did not, the host can send the same message from their own phone. Nothing here asks for the
// visitor's ID: the gateman records it at the gate.
const InviteTab: React.FC<{ premise: api.Membership }> = ({ premise }) => {
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState(''); // 9 digits after +254
  const [purpose, setPurpose] = useState('');
  const [hostLabel, setHostLabel] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [invite, setInvite] = useState<api.CreatedInvite | null>(null);
  const [copied, setCopied] = useState(false);

  const pickContact = async () => {
    setError('');
    try {
      const [contact] = await (navigator as any).contacts.select(['name', 'tel'], { multiple: false });
      if (!contact) return;
      const name = (contact.name?.[0] ?? '').trim();
      const phone = (contact.tel ?? []).map(nineDigitPhone).find((p: string | null) => p !== null) as string | undefined;
      if (name) setVisitorName(name);
      if (phone) setVisitorPhone(phone);
      else setError('That contact has no Kenyan mobile number. Type the number instead.');
    } catch {
      // The host closed the picker, or the browser refused: they can still type the details.
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isKenyanMobile(visitorPhone)) {
      setError(PHONE_HELP);
      return;
    }
    setIsSending(true);
    setError('');
    try {
      const created = await api.createInvite({
        premise: premise.slug,
        visitor_name: visitorName,
        visitor_phone: `+254${visitorPhone}`,
        purpose,
        host_label: hostLabel.trim() || undefined,
      });
      setInvite(created);
      setCopied(false);
    } catch (err: any) {
      setError(err.message || 'Could not create the invite.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setError('Could not copy. Select the message and copy it by hand.');
    }
  };

  const reset = () => {
    setInvite(null);
    setVisitorName('');
    setVisitorPhone('');
    setPurpose('');
    setError('');
  };

  if (invite) {
    return (
      <div className="bg-white rounded-xl shadow p-5 space-y-4">
        {invite.sms === 'sent' ? (
          <p data-testid="sms-status" className="bg-green-50 text-green-800 text-sm rounded-lg p-3 text-center">
            Invite sent by SMS to {invite.visitor_phone}.
          </p>
        ) : (
          <p data-testid="sms-status" className="bg-amber-50 text-amber-800 text-sm rounded-lg p-3 text-center">
            {invite.sms === 'failed' ? 'We could not send the SMS to ' + invite.visitor_phone + '.' : 'SMS sending is not set up yet.'}{' '}
            The invite is ready. Send it from your phone with a button below.
          </p>
        )}

        <p className="text-center text-sm text-gray-600">Gate pass key for {invite.visitor_phone}</p>
        <p className="text-center text-4xl font-bold tracking-widest">{invite.key}</p>
        <p className="text-center text-xs text-gray-500">
          One use only. Valid until {new Date(invite.expires_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}.
        </p>

        <p className="bg-gray-100 rounded-lg p-3 text-sm text-gray-700 break-words">{invite.message}</p>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <p className="text-xs text-gray-500 text-center">{invite.sms === 'sent' ? 'Send it again from your phone:' : 'Send it yourself:'}</p>
        <div className="grid grid-cols-2 gap-2">
          <a href={invite.sms_link} className="block text-center bg-brand-gold text-brand-navy font-bold py-3 px-2 rounded-lg active-scale">
            My SMS
          </a>
          <a href={invite.whatsapp_link} target="_blank" rel="noopener noreferrer" className="block text-center bg-green-600 text-white font-bold py-3 px-2 rounded-lg active-scale">
            WhatsApp
          </a>
        </div>
        <button onClick={() => handleCopy(invite.message)} className="block w-full text-center border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg">
          {copied ? 'Copied' : 'Copy message'}
        </button>
        <button onClick={reset} className="block w-full text-center text-sm text-blue-600 hover:underline">
          Invite another visitor
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-5 space-y-4">
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {canPickContacts() && (
        <button type="button" onClick={pickContact} className="w-full border border-brand-gold text-brand-navy font-semibold py-2 px-4 rounded-lg">
          Choose from contacts
        </button>
      )}

      <div>
        <label htmlFor="visitorName" className="block text-sm font-medium text-gray-700">Visitor’s name</label>
        <input id="visitorName" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} required maxLength={80} className={fieldClass} />
      </div>

      <div>
        <label htmlFor="visitorPhone" className="block text-sm font-medium text-gray-700">Visitor’s phone</label>
        <div className="flex items-center mt-1 bg-gray-100 rounded-lg shadow-inner focus-within:ring-2 focus-within:ring-brand-gold">
          <span className="px-3 text-gray-500 border-r border-gray-300">+254</span>
          <input
            id="visitorPhone"
            type="tel"
            value={visitorPhone}
            onChange={(e) => setVisitorPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
            required
            placeholder="722123456"
            className="block w-full pl-3 pr-3 py-3 bg-transparent focus:outline-none sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">Purpose of the visit</label>
        <input id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} required minLength={3} maxLength={100} placeholder="Dinner with family" className={fieldClass} />
      </div>

      <div>
        <label htmlFor="hostLabel" className="block text-sm font-medium text-gray-700">Who is inviting? <span className="text-gray-400">(optional)</span></label>
        <input id="hostLabel" value={hostLabel} onChange={(e) => setHostLabel(e.target.value)} maxLength={80} placeholder="Maina, 2nd floor B2" className={fieldClass} />
        <p className="text-xs text-gray-500 mt-1">Shown in the message, so the visitor knows who sent it.</p>
      </div>

      <button type="submit" disabled={isSending} className={primaryButton}>
        {isSending ? 'Sending…' : 'Send invite'}
      </button>
    </form>
  );
};

export default InviteTab;
