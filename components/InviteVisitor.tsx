import React, { useEffect, useState } from 'react';
import * as api from '../services/api';
import { nineDigitPhone } from '../services/phone';

interface InviteVisitorProps {
  isAuthenticated: boolean;
  onSignIn: () => void;
  onBack: () => void;
}

type Tab = 'invite' | 'expected';

const STATUS_LABEL: Record<api.VisitStatus, string> = {
  waiting: 'Waiting',
  arrived: 'Arrived',
  left: 'Left',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

const STATUS_STYLE: Record<api.VisitStatus, string> = {
  waiting: 'bg-amber-100 text-amber-800',
  arrived: 'bg-green-100 text-green-800',
  left: 'bg-gray-200 text-gray-700',
  expired: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-200 text-gray-600',
};

const clock = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' }) : '';

// Contact picking is a browser feature (Chrome on Android, over HTTPS); elsewhere the host types the number.
const canPickContacts = () => typeof navigator !== 'undefined' && 'contacts' in navigator && typeof window !== 'undefined' && 'ContactsManager' in window;

// A host invites a visitor and sees who is expected. Qaribu sends the invite by SMS from its server and says
// plainly whether that worked; if it did not, the host can send the same message from their own phone.
// Nothing here asks for the visitor's ID: the gateman records it at the gate.
const InviteVisitor: React.FC<InviteVisitorProps> = ({ isAuthenticated, onSignIn, onBack }) => {
  const [tab, setTab] = useState<Tab>('invite');
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

  const [expected, setExpected] = useState<{ log_times: boolean; passes: api.PassRow[] } | null>(null);
  const [expectedLoading, setExpectedLoading] = useState(false);
  const [expectedError, setExpectedError] = useState('');

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

  const loadExpected = () => {
    if (!premise) return;
    setExpectedLoading(true);
    setExpectedError('');
    api
      .getPasses(premise)
      .then((res) => setExpected({ log_times: res.premise.log_times, passes: res.passes }))
      .catch((err: Error) => setExpectedError(err.message))
      .finally(() => setExpectedLoading(false));
  };

  useEffect(() => {
    if (isAuthenticated && tab === 'expected') loadExpected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, tab, premise]);

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

  const field = 'mt-1 block w-full px-3 py-3 bg-gray-100 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-gold sm:text-sm';
  const hasPremises = isAuthenticated && !isLoading && !loadError && premises.length > 0;
  const premiseName = premises.find((p) => p.slug === premise)?.name ?? '';

  const premisePicker =
    premises.length > 1 ? (
      <div>
        <label htmlFor="premise" className="block text-sm font-medium text-gray-700">Premise</label>
        <select id="premise" value={premise} onChange={(e) => setPremise(e.target.value)} className={field}>
          {premises.map((p) => (
            <option key={p.slug} value={p.slug}>{p.name}</option>
          ))}
        </select>
      </div>
    ) : (
      <p className="text-sm text-gray-600">Premise: <span className="font-semibold">{premiseName}</span></p>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white px-4 py-4 flex items-center">
        <button onClick={onBack} className="mr-3 text-xl" aria-label="Back">&larr;</button>
        <h1 className="text-lg font-bold">Visitors</h1>
      </div>

      <div className="max-w-md mx-auto p-4">
        {!isAuthenticated && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-700 mb-4">Sign in to invite visitors and see who is expected.</p>
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

        {hasPremises && (
          <div className="flex bg-gray-200 rounded-lg p-1 mb-4" role="tablist">
            {(['invite', 'expected'] as Tab[]).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-md text-sm font-semibold ${tab === t ? 'bg-white shadow text-brand-navy' : 'text-gray-600'}`}
              >
                {t === 'invite' ? 'Invite' : 'Expected'}
              </button>
            ))}
          </div>
        )}

        {hasPremises && tab === 'invite' && !invite && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-5 space-y-4">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {premisePicker}

            {canPickContacts() && (
              <button type="button" onClick={pickContact} className="w-full border border-brand-gold text-brand-navy font-semibold py-2 px-4 rounded-lg">
                Choose from contacts
              </button>
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
              {isSending ? 'Sending…' : 'Send invite'}
            </button>
          </form>
        )}

        {hasPremises && tab === 'invite' && invite && (
          <div className="bg-white rounded-xl shadow p-5 space-y-4">
            {invite.sms === 'sent' ? (
              <p data-testid="sms-status" className="bg-green-50 text-green-800 text-sm rounded-lg p-3 text-center">
                Invite sent by SMS to {invite.visitor_phone}.
              </p>
            ) : (
              <p data-testid="sms-status" className="bg-amber-50 text-amber-800 text-sm rounded-lg p-3 text-center">
                {invite.sms === 'failed'
                  ? 'We could not send the SMS to ' + invite.visitor_phone + '.'
                  : 'SMS sending is not set up yet.'}{' '}
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
        )}

        {hasPremises && tab === 'expected' && (
          <div className="space-y-3">
            {premisePicker}
            <button onClick={loadExpected} disabled={expectedLoading} className="text-sm text-blue-600 hover:underline">
              {expectedLoading ? 'Refreshing…' : 'Refresh'}
            </button>
            {expectedError && <p className="text-red-500 text-sm">{expectedError}</p>}

            {expected && expected.passes.length === 0 && !expectedLoading && (
              <div className="bg-white rounded-xl shadow p-6 text-center text-gray-600">No visitors in the last 7 days.</div>
            )}

            {expected?.passes.map((p) => (
              <div key={p.id} data-testid="expected-row" className="bg-white rounded-xl shadow p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{p.visitor_name}</p>
                    <p className="text-xs text-gray-500">{p.visitor_phone}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLE[p.status]}`}>{STATUS_LABEL[p.status]}</span>
                </div>
                <p className="text-sm text-gray-700 mt-2">{p.purpose}</p>
                {p.host_label && <p className="text-xs text-gray-500">Invited by {p.host_label}</p>}
                {expected.log_times && (p.arrived_at || p.left_at) && (
                  <p className="text-xs text-gray-600 mt-2">
                    {p.arrived_at && <>In {clock(p.arrived_at)}</>}
                    {p.left_at && <> · Out {clock(p.left_at)}</>}
                  </p>
                )}
                {p.key && (
                  <p className="text-xs text-gray-600 mt-2">
                    Key <span className="font-bold tracking-widest">{p.key}</span> · valid until {clock(p.expires_at)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteVisitor;
