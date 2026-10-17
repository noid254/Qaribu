import React, { useEffect, useState } from 'react';
import * as api from '../services/api';

interface InviteVisitorProps {
  isAuthenticated: boolean;
  onSignIn: () => void;
  onBack: () => void;
}

// A host invites a visitor. Qaribu writes the message and gives links that open the host's own SMS app and
// WhatsApp with it ready to send; the host taps Send. Nothing here asks for the visitor's ID: the gateman
// records it at the gate.
const InviteVisitor: React.FC<InviteVisitorProps> = ({ isAuthenticated, onSignIn, onBack }) => {
  const [premises, setPremises] = useState<api.HostPremise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [premise, setPremise] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState(''); // 9 digits after +254
  const [purpose, setPurpose] = useState('');
  const [hostLabel, setHostLabel] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [invite, setInvite] = useState<api.CreatedInvite | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setLoadError('');
    api
      .getMe()
      .then((me) => {
        setPremises(me.premises);
        setPremise((current) => current || me.premises[0]?.slug || '');
      })
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (visitorPhone.length !== 9) {
      setError('Enter the visitor’s 9-digit phone number.');
      return;
    }
    setIsSending(true);
    setError('');
    try {
      const created = await api.createInvite({
        premise,
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

  const handleCopy = async () => {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite.message);
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

  const field = 'mt-1 block w-full px-3 py-3 bg-gray-100 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-gold sm:text-sm';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white px-4 py-4 flex items-center">
        <button onClick={onBack} className="mr-3 text-xl" aria-label="Back">&larr;</button>
        <h1 className="text-lg font-bold">Invite a visitor</h1>
      </div>

      <div className="max-w-md mx-auto p-4">
        {!isAuthenticated && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-700 mb-4">Sign in to send a gate pass key to your visitor.</p>
            <button onClick={onSignIn} className="w-full bg-brand-gold text-brand-navy font-bold py-2 px-4 rounded-lg active-scale">
              Sign in
            </button>
          </div>
        )}

        {isAuthenticated && isLoading && <p className="text-center text-gray-500">Loading…</p>}
        {isAuthenticated && loadError && <p className="text-center text-red-500">{loadError}</p>}

        {isAuthenticated && !isLoading && !loadError && premises.length === 0 && (
          <div className="bg-white rounded-xl shadow p-6 text-center text-gray-700">
            This account is not a host of a premise that uses gate pass yet. Ask your building manager to add you.
          </div>
        )}

        {isAuthenticated && !isLoading && premises.length > 0 && !invite && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-5 space-y-4">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            {premises.length > 1 ? (
              <div>
                <label htmlFor="premise" className="block text-sm font-medium text-gray-700">Premise</label>
                <select id="premise" value={premise} onChange={(e) => setPremise(e.target.value)} className={field}>
                  {premises.map((p) => (
                    <option key={p.slug} value={p.slug}>{p.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-sm text-gray-600">Premise: <span className="font-semibold">{premises[0]?.name}</span></p>
            )}

            <div>
              <label htmlFor="visitorName" className="block text-sm font-medium text-gray-700">Visitor’s name</label>
              <input id="visitorName" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} required maxLength={80} className={field} />
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
              <input id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} required minLength={3} maxLength={100} placeholder="Dinner with family" className={field} />
            </div>

            <div>
              <label htmlFor="hostLabel" className="block text-sm font-medium text-gray-700">Who is inviting? <span className="text-gray-400">(optional)</span></label>
              <input id="hostLabel" value={hostLabel} onChange={(e) => setHostLabel(e.target.value)} maxLength={80} placeholder="Maina, 2nd floor B2" className={field} />
              <p className="text-xs text-gray-500 mt-1">Shown in the message, so the visitor knows who sent it.</p>
            </div>

            <button type="submit" disabled={isSending} className="w-full bg-brand-gold text-brand-navy font-bold py-3 px-4 rounded-lg disabled:bg-gray-400 active-scale">
              {isSending ? 'Creating…' : 'Create invite'}
            </button>
          </form>
        )}

        {invite && (
          <div className="bg-white rounded-xl shadow p-5 space-y-4">
            <p className="text-center text-sm text-gray-600">Gate pass key for {invite.visitor_phone}</p>
            <p className="text-center text-4xl font-bold tracking-widest">{invite.key}</p>
            <p className="text-center text-xs text-gray-500">
              One use only. Valid until {new Date(invite.expires_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}.
            </p>

            <p className="bg-gray-100 rounded-lg p-3 text-sm text-gray-700 break-words">{invite.message}</p>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <a href={invite.sms_link} className="block w-full text-center bg-brand-gold text-brand-navy font-bold py-3 px-4 rounded-lg active-scale">
              Send by SMS
            </a>
            <a href={invite.whatsapp_link} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-green-600 text-white font-bold py-3 px-4 rounded-lg active-scale">
              Send by WhatsApp
            </a>
            <button onClick={handleCopy} className="block w-full text-center border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg">
              {copied ? 'Copied' : 'Copy message'}
            </button>
            <button onClick={reset} className="block w-full text-center text-sm text-blue-600 hover:underline">
              Invite another visitor
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteVisitor;
