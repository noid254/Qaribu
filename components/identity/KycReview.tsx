import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';

const PART_LABEL: Record<api.KycPart, string> = { front: 'ID front', back: 'ID back', selfie: 'Selfie' };
const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Nairobi' });

// One submission: the typed details beside the pictures, and the decision. Opening it, and each picture, is recorded on
// the server.
const Submission: React.FC<{ id: string; reasons: Record<string, string>; onDone: () => void; onBack: () => void }> = ({ id, reasons, onDone, onBack }) => {
  const [detail, setDetail] = useState<api.KycDetail | null>(null);
  const [pictures, setPictures] = useState<Partial<Record<api.KycPart, string>>>({});
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    const urls: string[] = [];
    api
      .kycDetail(id)
      .then(async (d) => {
        if (!live) return;
        setDetail(d);
        for (const part of d.parts) {
          const url = await api.kycPictureUrl(id, part);
          if (!live) return;
          if (url) {
            urls.push(url);
            setPictures((p) => ({ ...p, [part]: url }));
          }
        }
      })
      .catch((err) => live && setError(err.message || 'Could not open it.'));
    return () => {
      live = false;
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [id]);

  const decide = async (decision: 'approve' | 'reject') => {
    setBusy(true);
    setError('');
    try {
      await api.kycDecide(id, decision, decision === 'reject' ? reason : undefined);
      onDone();
    } catch (err: any) {
      setError(err.message || 'Could not save the decision.');
      setBusy(false);
    }
  };

  if (!detail) return <p className="text-sm text-gray-500">{error || 'Opening…'}</p>;
  return (
    <div data-testid="kyc-review-item" className="space-y-4">
      <button onClick={onBack} className="text-sm text-gray-600">&larr; Back to the list</button>
      <div className="bg-white rounded-xl shadow p-4 space-y-1 text-sm">
        <p><span className="text-gray-500">Name typed:</span> <span className="font-semibold">{detail.name}</span></p>
        <p><span className="text-gray-500">ID kind:</span> {detail.id_type.replace('_', ' ')}</p>
        <p><span className="text-gray-500">ID number typed:</span> <span className="font-mono font-semibold">{detail.id_number}</span></p>
        <p><span className="text-gray-500">Phone:</span> {detail.phone}</p>
        <p className="text-xs text-gray-400">Sent {when(detail.submitted_at)}</p>
      </div>
      {detail.parts.map((p) => (
        <div key={p} className="bg-white rounded-xl shadow p-3">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">{PART_LABEL[p]}</p>
          {pictures[p] ? <img src={pictures[p]} alt={PART_LABEL[p]} className="w-full rounded-lg" /> : <p className="text-sm text-gray-400">Loading…</p>}
        </div>
      ))}
      <p className="text-xs text-gray-500">Check that the ID looks real and not a picture of a screen, that the name and number match what was typed, and that the face on the ID is the face in the selfie.</p>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {detail.decision ? (
        <p className="text-sm font-semibold">Already {detail.decision}.</p>
      ) : (
        <div className="space-y-3">
          <button onClick={() => decide('approve')} disabled={busy} data-testid="kyc-approve" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg disabled:opacity-50">Approve</button>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 bg-white text-sm" aria-label="Reason for rejecting">
            <option value="">Reason, if rejecting…</option>
            {Object.entries(reasons).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button onClick={() => decide('reject')} disabled={busy || !reason} data-testid="kyc-reject" className="w-full border border-red-500 text-red-600 font-bold py-3 rounded-lg disabled:opacity-40">Reject</button>
        </div>
      )}
    </div>
  );
};

const KycReview: React.FC<{ reasons: Record<string, string>; onBack: () => void }> = ({ reasons, onBack }) => {
  const [items, setItems] = useState<api.KycPending[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = () =>
    api
      .kycPending()
      .then((r) => setItems(r.items))
      .catch((err) => setError(err.message || 'Could not load the list.'));

  useEffect(() => {
    void load();
  }, []);

  if (openId) {
    return (
      <Submission
        id={openId}
        reasons={reasons}
        onBack={() => setOpenId(null)}
        onDone={() => {
          setOpenId(null);
          void load();
        }}
      />
    );
  }

  return (
    <div data-testid="kyc-review" className="space-y-3">
      <button onClick={onBack} className="text-sm text-gray-600">&larr; Back</button>
      <h2 className="text-lg font-bold text-brand-navy">Waiting for review</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {items && items.length === 0 && <p className="text-sm text-gray-500">Nothing is waiting.</p>}
      {items?.map((i) => (
        <button key={i.id} onClick={() => setOpenId(i.id)} className="w-full text-left bg-white rounded-xl shadow p-4">
          <p className="font-semibold">{i.name}</p>
          <p className="text-xs text-gray-500">{i.id_type.replace('_', ' ')} · sent {when(i.submitted_at)}</p>
        </button>
      ))}
    </div>
  );
};

export default KycReview;
