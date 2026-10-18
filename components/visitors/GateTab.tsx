import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';
import { clock, fieldClass, primaryButton } from './shared';

const STATE_TEXT: Record<api.PassState, string> = {
  valid: 'Valid',
  used: 'Already used',
  expired: 'Expired',
  unavailable: 'Not valid',
};

const STATE_STYLE: Record<api.PassState, string> = {
  valid: 'bg-green-100 text-green-800',
  used: 'bg-red-100 text-red-700',
  expired: 'bg-red-100 text-red-700',
  unavailable: 'bg-red-100 text-red-700',
};

// The gate, for a signed-in gateman (or an owner or manager standing in): type the key the visitor gives,
// see who it is for, ask for their ID and record it, and admit. Every step is recorded against the person.
// Where the premise records times, it also lists who is inside with a Check out button.
const GateTab: React.FC<{ premise: api.Membership }> = ({ premise }) => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ code: string; data: Awaited<ReturnType<typeof api.gateCheck>> } | null>(null);
  const [idNumber, setIdNumber] = useState('');
  const [inside, setInside] = useState<api.InsideVisitor[] | null>(null);
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  const loadInside = () =>
    api
      .getGate(premise.slug)
      .then((g) => setInside(g.inside))
      .catch((err: Error) => setNotice({ text: err.message, ok: false }));

  useEffect(() => {
    void loadInside();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [premise.slug]);

  const digits = code.replace(/\D/g, '');

  const check = async (e: React.FormEvent) => {
    e.preventDefault();
    if (digits.length !== 6) {
      setNotice({ text: 'Enter the 6-digit key.', ok: false });
      return;
    }
    setBusy(true);
    setNotice(null);
    setResult(null);
    try {
      setResult({ code: digits, data: await api.gateCheck(premise.slug, digits) });
      setIdNumber('');
    } catch (err: any) {
      setNotice({ text: err.message, ok: false });
    } finally {
      setBusy(false);
    }
  };

  const admit = async () => {
    if (!result) return;
    setBusy(true);
    setNotice(null);
    try {
      const done = await api.gateAdmit(premise.slug, result.code, idNumber.trim());
      if (done.admitted) {
        setNotice({ text: `${done.visitor.name} admitted.`, ok: true });
        setResult(null);
        setCode('');
        setIdNumber('');
        await loadInside();
      } else {
        setResult({ code: result.code, data: { state: done.state, can_admit: false, visitor: done.visitor } });
        setNotice({ text: 'Not admitted.', ok: false });
      }
    } catch (err: any) {
      // A mistyped ID stops the admit and leaves the pass valid, so the gateman can correct it.
      setNotice({ text: err.message, ok: false });
    } finally {
      setBusy(false);
    }
  };

  const checkOut = async (visitor: api.InsideVisitor) => {
    setBusy(true);
    setNotice(null);
    try {
      await api.gateCheckout(premise.slug, visitor.id);
      setNotice({ text: `${visitor.visitor_name} checked out.`, ok: true });
      await loadInside();
    } catch (err: any) {
      setNotice({ text: err.message, ok: false });
      await loadInside();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {notice && (
        <p data-testid="gate-notice" className={`text-sm rounded-lg p-3 text-center ${notice.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'}`}>
          {notice.text}
        </p>
      )}

      <form onSubmit={check} className="bg-white rounded-xl shadow p-5 space-y-3">
        <label htmlFor="gateCode" className="block text-sm font-medium text-gray-700">Visitor’s key</label>
        <input
          id="gateCode"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^\d ]/g, '').slice(0, 7))}
          inputMode="numeric"
          autoComplete="off"
          placeholder="000 000"
          className={`${fieldClass} text-center text-2xl tracking-widest`}
        />
        <button type="submit" disabled={busy} className={primaryButton}>Check</button>
      </form>

      {result && (
        <div data-testid="gate-result" className="bg-white rounded-xl shadow p-5 space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-xl font-bold tracking-widest">{result.code.slice(0, 3)} {result.code.slice(3)}</p>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATE_STYLE[result.data.state]}`}>{STATE_TEXT[result.data.state]}</span>
          </div>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>Visitor: <strong>{result.data.visitor.name}</strong></li>
            {result.data.visitor.host_label && <li>Visiting: {result.data.visitor.host_label}</li>}
            {result.data.visitor.purpose && <li>Purpose: {result.data.visitor.purpose}</li>}
          </ul>
          {result.data.can_admit ? (
            <>
              <div>
                <label htmlFor="gateId" className="block text-sm font-medium text-gray-700">
                  Visitor’s ID number <span className="text-gray-400">(from their ID)</span>
                </label>
                <input id="gateId" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} autoComplete="off" maxLength={24} className={fieldClass} />
                <p className="text-xs text-gray-500 mt-1">Ask for their ID and type the number. It is kept in the premise’s log only.</p>
              </div>
              <button onClick={admit} disabled={busy} className={primaryButton}>Admit visitor</button>
            </>
          ) : (
            <p className="text-sm text-red-700">
              {result.data.state === 'used' && 'This key has already been used.'}
              {result.data.state === 'expired' && 'This key has expired.'}
              {result.data.state === 'unavailable' && 'This key is no longer valid.'}
            </p>
          )}
        </div>
      )}

      {inside !== null && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Inside now ({inside.length})</h2>
          {inside.length === 0 && <p className="text-sm text-gray-500">Nobody is checked in.</p>}
          {inside.map((v) => (
            <div key={v.id} data-testid="inside-row" className="bg-white rounded-xl shadow p-4 flex justify-between items-center gap-3">
              <div>
                <p className="font-semibold text-gray-900">{v.visitor_name}</p>
                <p className="text-xs text-gray-500">{[v.host_label, v.purpose].filter(Boolean).join(' · ')}</p>
                <p className="text-xs text-gray-500">In at {clock(v.arrived_at)}</p>
              </div>
              <button onClick={() => checkOut(v)} disabled={busy} className="shrink-0 border border-gray-300 text-gray-700 font-semibold text-sm py-2 px-3 rounded-lg">
                Check out
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GateTab;
