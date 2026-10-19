import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';
import { fieldClass, primaryButton } from '../visitors/shared';

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

const Badge: React.FC<{ verified: boolean }> = ({ verified }) => (
  <span
    className={`text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full border ${verified ? 'text-green-700 border-green-600 bg-green-50' : 'text-gray-600 border-gray-300 bg-gray-50'}`}
  >
    {verified ? 'Verified' : 'Unverified'}
  </span>
);

// Your items, kept on the server: one owner for each serial number, and a history of how each came to you. They stay
// when you close the app or sign in on another phone. An item is "verified" when it came to you from a Qaribu receipt
// (the seller confirmed the sale by issuing it), and "unverified" when you registered it on your own word.
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
            <p className="text-gray-700 mb-4">Sign in to register your tools, vehicles and electronics, and to check an item before you buy it.</p>
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
                  }}
                  className={`flex-1 text-sm font-semibold py-2 rounded-md ${tab === t.key ? 'bg-white text-brand-navy shadow' : 'text-gray-600'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'mine' && !openId && <MyAssets assets={assets} error={error} onOpen={setOpenId} onRegister={() => setTab('register')} />}
            {tab === 'mine' && openId && <AssetDetail id={openId} onClose={() => setOpenId('')} />}
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
        <p className="text-xs text-gray-500">Register what you own, or claim an item from a Qaribu receipt that has its serial number on it: open the receipt under Documents, then Received.</p>
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
            <Badge verified={a.verification === 'verified'} />
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
  const [data, setData] = useState<{ asset: api.LedgerAsset; history: api.LedgerEvent[] } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getLedgerAsset(id)
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, [id]);

  if (error) return <p className="text-red-500 text-sm">{error}</p>;
  if (!data) return <p className="text-sm text-gray-500">Loading…</p>;
  const { asset: a, history } = data;
  return (
    <div data-testid="asset-detail" className="bg-white rounded-xl shadow p-5 space-y-4">
      <button onClick={onClose} className="text-sm text-blue-600 hover:underline">&larr; All my assets</button>
      <div className="flex justify-between items-start gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{a.name}</h2>
          <p className="text-sm font-mono text-gray-600">{a.serial}</p>
        </div>
        <Badge verified={a.verification === 'verified'} />
      </div>
      <dl className="text-sm grid grid-cols-3 gap-y-1">
        <dt className="text-gray-500">Kind</dt><dd className="col-span-2">{KIND_LABEL[a.kind]}</dd>
        {a.make_model && (<><dt className="text-gray-500">Make and model</dt><dd className="col-span-2">{a.make_model}</dd></>)}
        {a.year && (<><dt className="text-gray-500">Year</dt><dd className="col-span-2">{a.year}</dd></>)}
        {a.notes && (<><dt className="text-gray-500">Notes</dt><dd className="col-span-2">{a.notes}</dd></>)}
      </dl>
      <p className="text-xs text-gray-500">
        {a.verification === 'verified'
          ? 'Verified: this item came to you with a Qaribu receipt, so the seller confirmed the sale.'
          : 'Unverified: you registered this item on your own word. Claiming it from a Qaribu receipt would verify it.'}
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
  );
};

const RegisterAsset: React.FC<{ onSaved: () => void }> = ({ onSaved }) => {
  const [kind, setKind] = useState<api.AssetKind>('tool');
  const [name, setName] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [year, setYear] = useState('');
  const [serial, setSerial] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const vehicle = kind === 'vehicle';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.registerLedgerAsset({ kind, name, make_model: makeModel, year, serial, notes });
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
      <p className="text-xs text-gray-500">It will show as unverified until you claim it from a Qaribu receipt. Photos are coming later.</p>
      <button type="submit" disabled={saving} className={primaryButton}>{saving ? 'Saving…' : 'Register item'}</button>
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
        <p className="text-sm text-gray-600">Before you buy a tool, a phone or a vehicle, check whether its serial number or plate is already registered to someone.</p>
        <label htmlFor="ckSerial" className="block text-sm font-medium text-gray-700">Serial number or registration plate</label>
        <input id="ckSerial" value={serial} onChange={(e) => setSerial(e.target.value.toUpperCase())} required minLength={3} maxLength={40} className={fieldClass} />
        <button type="submit" disabled={busy} className={primaryButton}>{busy ? 'Checking…' : 'Check'}</button>
      </form>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {result && !result.registered && (
        <div data-testid="check-none" className="bg-white rounded-xl shadow border-l-4 border-amber-500 p-4 text-sm">
          <p className="font-semibold text-gray-900">Not registered</p>
          <p className="text-gray-600 mt-1">Nobody has registered {checked} on Qaribu. That does not prove it is safe to buy: ask the seller for a Qaribu receipt with the serial number on it.</p>
        </div>
      )}
      {result?.matches.map((m, i) => (
        <div key={i} data-testid="check-found" className="bg-white rounded-xl shadow border-l-4 border-green-500 p-4 text-sm space-y-1">
          <div className="flex justify-between items-start gap-2">
            <p className="font-semibold text-gray-900">Registered: {m.name}</p>
            <Badge verified={m.verification === 'verified'} />
          </div>
          <p className="text-gray-600">Owner: {m.owner} · since {day(m.since)}</p>
          <p className="text-xs text-gray-500">The owner's number is hidden except its last digits. {m.verification === 'verified' ? 'It came to them with a Qaribu receipt.' : 'They registered it on their own word.'} If you are buying it, the seller should be this owner.</p>
        </div>
      ))}
    </div>
  );
};

export default AssetsHub;
