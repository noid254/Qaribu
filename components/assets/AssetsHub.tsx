import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';
import { nineDigitPhone } from '../../services/phone';
import { canPickContacts, fieldClass, isKenyanMobile, PHONE_HELP, primaryButton } from '../visitors/shared';

interface AssetsHubProps {
  isAuthenticated: boolean;
  onSignIn: () => void;
  onBack: () => void;
  start: 'mine' | 'register' | 'check';
}

type TabKey = 'mine' | 'register' | 'check';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'mine', label: 'My assets' },
  { key: 'register', label: 'Register' },
  { key: 'check', label: 'Check' },
];

const KIND_LABEL: Record<api.AssetKind, string> = { vehicle: 'Vehicle', tool: 'Tool', electronics: 'Electronics', other: 'Other' };

const day = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { dateStyle: 'medium', timeZone: 'Africa/Nairobi' });

// The server says "you" for the person looking and the last digits of a phone for anyone else.
const who = (v: string, fallback: string) => v || fallback;
const EVENT_TEXT: Record<string, (e: api.LedgerEvent) => string> = {
  registered: (e) => `Registered by ${who(e.to, 'its owner')}`,
  claimed_from_receipt: (e) => `Claimed by ${who(e.to, 'its owner')} from receipt ${e.receipt_number}${e.shop_name ? ` from ${e.shop_name}` : ''}`,
  transferred: (e) => `Passed from ${who(e.from, 'the seller')} to ${who(e.to, 'the new owner')}${e.receipt_number ? ` with receipt ${e.receipt_number}` : ''}`,
};

// The tick. A verified item has one; every other item says plainly that it is unverified.
const Tick: React.FC<{ verified: boolean }> = ({ verified }) => (
  <span
    data-testid={verified ? 'tick' : 'unverified'}
    className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${verified ? 'text-green-700 border-green-600 bg-green-50' : 'text-gray-600 border-gray-300 bg-gray-50'}`}
  >
    {verified ? '✓ Verified' : 'Unverified'}
  </span>
);

// Your items, kept on the server: one owner for each serial number, a history of how each came to you, and a transfer
// that needs a code from you and a code from the buyer. An item has a tick when its ownership was backed by someone
// else (a Qaribu receipt from the seller, or a transfer from an owner whose item had one); every other item is unverified.
const AssetsHub: React.FC<AssetsHubProps> = ({ isAuthenticated, onSignIn, onBack, start }) => {
  const [tab, setTab] = useState<TabKey>(start);
  const [assets, setAssets] = useState<api.LedgerAsset[] | null>(null);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState('');

  const load = () => {
    setError('');
    api
      .getLedgerAssets()
      .then((r) => setAssets(r.assets))
      .catch((err: Error) => setError(err.message));
  };

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white px-4 py-4 flex items-center">
        <button onClick={onBack} className="mr-3 text-xl" aria-label="Back">&larr;</button>
        <h1 className="text-lg font-bold">My assets</h1>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {!isAuthenticated && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-700 mb-4">Sign in to register your tools, vehicles and electronics, transfer them, and check an item before you buy it.</p>
            <button onClick={onSignIn} className="w-full bg-brand-gold text-brand-navy font-bold py-2 px-4 rounded-lg active-scale">Sign in</button>
          </div>
        )}

        {isAuthenticated && (
          <>
            <div className="flex gap-1 bg-gray-200 rounded-lg p-1" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => {
                    setTab(t.key);
                    setOpenId('');
                    if (t.key === 'mine') load();
                  }}
                  className={`flex-1 text-sm font-semibold py-2 rounded-md ${tab === t.key ? 'bg-white text-brand-navy shadow' : 'text-gray-600'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'mine' && !openId && <MyAssets assets={assets} error={error} onOpen={setOpenId} onRegister={() => setTab('register')} />}
            {tab === 'mine' && openId && (
              <AssetDetail
                id={openId}
                onClose={() => {
                  setOpenId('');
                  load();
                }}
              />
            )}
            {tab === 'register' && (
              <RegisterAsset
                onSaved={() => {
                  load();
                  setTab('mine');
                }}
              />
            )}
            {tab === 'check' && <CheckAsset />}
          </>
        )}
      </div>
    </div>
  );
};

const MyAssets: React.FC<{ assets: api.LedgerAsset[] | null; error: string; onOpen: (id: string) => void; onRegister: () => void }> = ({ assets, error, onOpen, onRegister }) => {
  if (error) return <p className="text-red-500 text-sm">{error}</p>;
  if (assets === null) return <p className="text-sm text-gray-500">Loading…</p>;
  if (assets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-center text-gray-600 space-y-3">
        <p>You have not registered any items yet.</p>
        <p className="text-xs text-gray-500">Register what you own, or claim an item from a Qaribu receipt that has its serial number on it: open the receipt under Documents, then Received. Someone transferring an item to you will send you a link.</p>
        <button onClick={onRegister} className={primaryButton}>Register an item</button>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {assets.map((a) => (
        <button key={a.id} onClick={() => onOpen(a.id)} data-testid="asset-row" className="w-full text-left bg-white rounded-xl shadow p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate">{a.name}</p>
              <p className="text-xs font-mono text-gray-500">{a.serial}</p>
            </div>
            <Tick verified={a.verification === 'verified'} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {KIND_LABEL[a.kind]}
            {a.make_model ? ` · ${a.make_model}` : ''}
            {a.year ? ` · ${a.year}` : ''} · added {day(a.created_at)}
            <span className="text-blue-600"> · View</span>
          </p>
        </button>
      ))}
    </div>
  );
};

const AssetDetail: React.FC<{ id: string; onClose: () => void }> = ({ id, onClose }) => {
  const [data, setData] = useState<{ asset: api.LedgerAsset; history: api.LedgerEvent[]; transfer: api.OpenTransfer | null } | null>(null);
  const [error, setError] = useState('');

  const load = () =>
    api
      .getLedgerAsset(id)
      .then(setData)
      .catch((err: Error) => setError(err.message));

  useEffect(() => {
    void load();
  }, [id]);

  if (error) return <p className="text-red-500 text-sm">{error}</p>;
  if (!data) return <p className="text-sm text-gray-500">Loading…</p>;
  const { asset: a, history, transfer } = data;
  const verified = a.verification === 'verified';
  return (
    <div className="space-y-3">
      <div data-testid="asset-detail" className="bg-white rounded-xl shadow p-5 space-y-4">
        <button onClick={onClose} className="text-sm text-blue-600 hover:underline">&larr; All my assets</button>
        <div className="flex justify-between items-start gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{a.name}</h2>
            <p className="text-sm font-mono text-gray-600">{a.serial}</p>
          </div>
          <Tick verified={verified} />
        </div>
        <dl className="text-sm grid grid-cols-3 gap-y-1">
          <dt className="text-gray-500">Kind</dt><dd className="col-span-2">{KIND_LABEL[a.kind]}</dd>
          {a.make_model && (<><dt className="text-gray-500">Make and model</dt><dd className="col-span-2">{a.make_model}</dd></>)}
          {a.year && (<><dt className="text-gray-500">Year</dt><dd className="col-span-2">{a.year}</dd></>)}
          {a.notes && (<><dt className="text-gray-500">Notes</dt><dd className="col-span-2">{a.notes}</dd></>)}
        </dl>
        <p className="text-xs text-gray-500">
          {verified
            ? 'Verified: someone other than you backed this ownership, a Qaribu receipt from the seller or a transfer from an owner whose item was verified.'
            : 'Unverified: you registered this on your own word. You are still its registered owner and can transfer it. Claiming it from a Qaribu receipt would verify it.'}
        </p>
        <div>
          <h3 className="text-xs uppercase tracking-wide text-gray-500 mb-2">History</h3>
          <ol className="space-y-2 border-l-2 border-gray-200 pl-3">
            {history.map((e, i) => (
              <li key={i} className="text-sm">
                <p className="text-gray-900">{(EVENT_TEXT[e.event] ?? (() => e.event))(e)}</p>
                <p className="text-xs text-gray-500">{new Date(e.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Nairobi' })}</p>
              </li>
            ))}
          </ol>
          <p className="text-xs text-gray-400 mt-2">The history cannot be edited or deleted.</p>
        </div>
      </div>
      <TransferPanel assetId={a.id} assetName={a.name} verified={verified} transfer={transfer} onChange={load} />
    </div>
  );
};

// Handing an item to someone else. You choose the buyer's phone and confirm with a code sent to YOUR phone; then your buyer
// is sent a link, gets a code on THEIR phone, and accepts. Only then does the item move. The tick stays as it was.
const TransferPanel: React.FC<{ assetId: string; assetName: string; verified: boolean; transfer: api.OpenTransfer | null; onChange: () => Promise<unknown> | void }> = ({
  assetId,
  assetName,
  verified,
  transfer,
  onChange,
}) => {
  const [phone, setPhone] = useState(''); // 9 digits after +254
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState<api.SentTransfer | null>(null);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError('');
    setNote('');
    try {
      await fn();
    } catch (err: any) {
      setError(err.message || 'That did not work.');
    } finally {
      setBusy(false);
    }
  };

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

  const begin = (e: React.FormEvent) =>
    run(async () => {
      e.preventDefault();
      if (!isKenyanMobile(phone)) throw new Error(PHONE_HELP);
      await api.startTransfer(assetId, `+254${phone}`);
      setStarting(false);
      setPhone('');
      setNote('We sent a code to your phone.');
      await onChange();
    });

  const confirm = (e: React.FormEvent) =>
    run(async () => {
      e.preventDefault();
      const done = await api.confirmTransfer(transfer!.id, code);
      setSent(done);
      setCode('');
      await onChange();
    });

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setError('Could not copy. Select the message and copy it by hand.');
    }
  };

  const cancel = () =>
    run(async () => {
      await api.cancelTransfer(transfer!.id);
      setSent(null);
      await onChange();
      setNote('The transfer was cancelled.');
    });

  const link = sent ?? (transfer?.status === 'in_progress' && transfer.link ? { message: transfer.message ?? '', sms_link: transfer.sms_link ?? '', whatsapp_link: transfer.whatsapp_link ?? '', link: transfer.link, sms: 'not_configured' as const } : null);

  return (
    <div data-testid="transfer-panel" className="bg-white rounded-xl shadow p-5 space-y-3">
      <h3 className="font-semibold text-gray-900">Transfer this item</h3>
      {error && <p data-testid="transfer-error" className="text-red-500 text-sm">{error}</p>}
      {note && <p data-testid="transfer-note" className="bg-green-50 text-green-800 text-sm rounded-lg p-2">{note}</p>}

      {!transfer && !starting && (
        <>
          <p className="text-sm text-gray-600">
            Hand {assetName} to someone else. You confirm with a code on your phone, then they accept with a code on theirs.{' '}
            {verified ? 'It keeps its tick.' : 'It stays unverified: a transfer never makes the tick.'}
          </p>
          <button onClick={() => setStarting(true)} data-testid="transfer-start" className={primaryButton}>Transfer to someone</button>
        </>
      )}

      {!transfer && starting && (
        <form onSubmit={begin} className="space-y-3">
          {canPickContacts() && (
            <button type="button" onClick={pickContact} className="w-full border border-brand-gold text-brand-navy font-semibold py-2 px-4 rounded-lg">Choose the buyer from contacts</button>
          )}
          <div>
            <label htmlFor="xferPhone" className="block text-sm font-medium text-gray-700">The buyer’s phone</label>
            <div className="flex items-center mt-1 bg-gray-100 rounded-lg shadow-inner focus-within:ring-2 focus-within:ring-brand-gold">
              <span className="px-3 text-gray-500 border-r border-gray-300">+254</span>
              <input id="xferPhone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))} required placeholder="722123456" className="block w-full pl-3 pr-3 py-3 bg-transparent focus:outline-none sm:text-sm" />
            </div>
          </div>
          <p className="text-xs text-gray-500">We will send a code to YOUR phone to confirm it is you. Only after that is the buyer told.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStarting(false)} className="shrink-0 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg">Cancel</button>
            <button type="submit" disabled={busy} className={primaryButton} data-testid="transfer-begin">{busy ? 'Sending…' : 'Send me a code'}</button>
          </div>
        </form>
      )}

      {transfer?.status === 'pending' && (
        <form onSubmit={confirm} className="space-y-3">
          <p className="text-sm text-gray-700">Enter the 6-digit code we sent to your phone. Then the buyer ({transfer.buyer}) is told.</p>
          <input id="xferCode" aria-label="The code sent to your phone" inputMode="numeric" maxLength={6} pattern="[0-9]{6}" required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className={fieldClass} />
          <div className="flex gap-2">
            <button type="button" onClick={cancel} disabled={busy} className="shrink-0 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg" data-testid="transfer-cancel">Cancel</button>
            <button type="submit" disabled={busy} className={primaryButton} data-testid="transfer-confirm">{busy ? 'Checking…' : 'Confirm and send'}</button>
          </div>
          <button type="button" onClick={() => run(async () => { await api.resendTransferCode(transfer.id); setNote('We sent a new code.'); })} disabled={busy} className="block w-full text-center text-sm text-blue-600 hover:underline" data-testid="transfer-resend">
            Send the code again
          </button>
        </form>
      )}

      {transfer?.status === 'in_progress' && (
        <div data-testid="transfer-sent" className="space-y-3">
          <p className="bg-amber-50 text-amber-900 text-sm rounded-lg p-3">
            Waiting for the buyer ({transfer.buyer}) to accept. It becomes theirs only when they enter a code sent to their phone. It lapses after 7 days.
          </p>
          {link && (
            <>
              <p className="text-xs text-gray-500">We sent them this, if SMS is on. You can send it yourself too:</p>
              <p className="bg-gray-100 rounded-lg p-3 text-sm text-gray-700 break-words">{link.message}</p>
              <div className="grid grid-cols-2 gap-2">
                <a href={link.sms_link} className="block text-center bg-brand-gold text-brand-navy font-bold py-3 px-2 rounded-lg active-scale">My SMS</a>
                <a href={link.whatsapp_link} target="_blank" rel="noopener noreferrer" className="block text-center bg-green-600 text-white font-bold py-3 px-2 rounded-lg active-scale">WhatsApp</a>
              </div>
              <button onClick={() => copy(link.message)} className="block w-full text-center border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg">{copied ? 'Copied' : 'Copy message'}</button>
            </>
          )}
          <button onClick={cancel} disabled={busy} className="block w-full text-center text-sm text-red-600 hover:underline" data-testid="transfer-cancel">Cancel this transfer</button>
        </div>
      )}
    </div>
  );
};

const RegisterAsset: React.FC<{ onSaved: () => void }> = ({ onSaved }) => {
  const [kind, setKind] = useState<api.AssetKind>('tool');
  const [name, setName] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [year, setYear] = useState('');
  const [serial, setSerial] = useState('');
  const [notes, setNotes] = useState('');
  const [nick, setNick] = useState('');
  const [accountName, setAccountName] = useState('');
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const vehicle = kind === 'vehicle';

  // The name shown to people who check the item is the name on the account, which can be a nickname.
  useEffect(() => {
    api
      .getMe()
      .then((me) => {
        setAccountName(me.account.name);
        setNick(me.account.name);
      })
      .catch(() => undefined);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (nick.trim() && nick.trim() !== accountName) await api.setMyName(nick.trim());
      await api.registerLedgerAsset({ kind, name, make_model: makeModel, year, serial, notes, consent_show_name: consent });
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Could not register the item.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-xl shadow p-5 space-y-4">
      {error && <p data-testid="asset-error" className="text-red-500 text-sm text-center">{error}</p>}
      <div>
        <label htmlFor="asKind" className="block text-sm font-medium text-gray-700">What is it?</label>
        <select id="asKind" value={kind} onChange={(e) => setKind(e.target.value as api.AssetKind)} className={fieldClass}>
          <option value="tool">Tool</option>
          <option value="electronics">Electronics</option>
          <option value="vehicle">Vehicle (car, boda boda)</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="asName" className="block text-sm font-medium text-gray-700">{vehicle ? 'Make and model' : 'Item name'}</label>
        <input id="asName" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={80} placeholder={vehicle ? 'Toyota Fielder' : 'Bosch Power Drill'} className={fieldClass} />
      </div>
      <div>
        <label htmlFor="asSerial" className="block text-sm font-medium text-gray-700">{vehicle ? 'Registration plate' : 'Serial number'}</label>
        <input id="asSerial" value={serial} onChange={(e) => setSerial(e.target.value.toUpperCase())} required minLength={3} maxLength={40} placeholder={vehicle ? 'KDA 123X' : 'As printed on the item'} className={fieldClass} />
        <p className="text-xs text-gray-500 mt-1">One serial number belongs to one owner. Spaces and capital letters do not matter.</p>
      </div>
      {!vehicle && (
        <div>
          <label htmlFor="asModel" className="block text-sm font-medium text-gray-700">Make and model <span className="text-gray-400">(optional)</span></label>
          <input id="asModel" value={makeModel} onChange={(e) => setMakeModel(e.target.value)} maxLength={80} className={fieldClass} />
        </div>
      )}
      <div>
        <label htmlFor="asYear" className="block text-sm font-medium text-gray-700">Year <span className="text-gray-400">(optional)</span></label>
        <input id="asYear" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="2021" className={fieldClass} />
      </div>
      <div>
        <label htmlFor="asNotes" className="block text-sm font-medium text-gray-700">Notes <span className="text-gray-400">(optional)</span></label>
        <textarea id="asNotes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} rows={2} className={fieldClass} />
      </div>
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <label htmlFor="asNick" className="block text-sm font-medium text-gray-700">The name people see when they check this item</label>
        <input id="asNick" value={nick} onChange={(e) => setNick(e.target.value)} required maxLength={80} placeholder="Your name, or a nickname" className={fieldClass} />
        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} data-testid="consent-show-name" className="h-5 w-5 mt-0.5" />
          <span>I agree that this name will be shown to people who check this item.</span>
        </label>
      </div>
      <p className="text-xs text-gray-500">It shows as unverified until it is backed by a Qaribu receipt. You are still its registered owner. Photos are coming later.</p>
      <button type="submit" disabled={saving || !consent} className={primaryButton}>{saving ? 'Saving…' : 'Register item'}</button>
    </form>
  );
};

const CheckAsset: React.FC = () => {
  const [serial, setSerial] = useState('');
  const [result, setResult] = useState<api.OwnershipResult | null>(null);
  const [checked, setChecked] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setResult(null);
    try {
      setResult(await api.checkOwnership(serial));
      setChecked(serial);
    } catch (err: any) {
      setError(err.message || 'Could not check that.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="bg-white rounded-xl shadow p-5 space-y-3">
        <p className="text-sm text-gray-600">Buying a phone, a tool or a vehicle? Check its serial number or plate to see who it is registered to, and whether it has the tick.</p>
        <label htmlFor="ckSerial" className="block text-sm font-medium text-gray-700">Serial number or registration plate</label>
        <input id="ckSerial" value={serial} onChange={(e) => setSerial(e.target.value.toUpperCase())} required minLength={3} maxLength={40} className={fieldClass} />
        <button type="submit" disabled={busy} className={primaryButton}>{busy ? 'Checking…' : 'Check'}</button>
      </form>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {result && !result.registered && (
        <div data-testid="check-none" className="bg-white rounded-xl shadow border-l-4 border-amber-500 p-4 text-sm">
          <p className="font-semibold text-gray-900">Not registered</p>
          <p className="text-gray-600 mt-1">Nobody has registered {checked} on Qaribu. That does not prove it is safe to buy: ask the seller to register it and transfer it to you, or to issue you a Qaribu receipt with the serial number on it.</p>
        </div>
      )}
      {result?.matches.map((m, i) => (
        <div key={i} data-testid="check-found" className={`bg-white rounded-xl shadow border-l-4 p-4 text-sm space-y-1 ${m.verified ? 'border-green-500' : 'border-gray-300'}`}>
          <div className="flex justify-between items-start gap-2">
            <p className="font-semibold text-gray-900">Registered: {m.name}</p>
            <Tick verified={m.verified} />
          </div>
          <p data-testid="check-owner" className="text-gray-700">Owner: {m.owner || 'name not shown'} · since {day(m.since)}</p>
          <p className="text-xs text-gray-500">
            {m.verified ? 'Someone other than the owner backed this ownership.' : 'The owner registered this on their own word, so it has no tick.'} The name is the one the owner chose, and a nickname is allowed. If you are buying it, the seller should be this owner, and the transfer is confirmed with a code from both of you.
          </p>
        </div>
      ))}
    </div>
  );
};

export default AssetsHub;
