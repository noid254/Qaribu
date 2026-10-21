import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';

const STATUS_TEXT: Record<api.ClaimStatus, string> = {
  claimable: 'Not registered yet. Claim it to make it yours.',
  yours: 'You own this.',
  from_seller: 'The seller has it registered. Claiming passes it to you.',
  registered: 'Registered to someone else. They, or the seller, must confirm the sale first.',
};

const KINDS: { key: api.AssetKind; label: string }[] = [
  { key: 'other', label: 'Other' },
  { key: 'tool', label: 'Tool' },
  { key: 'electronics', label: 'Electronics' },
  { key: 'vehicle', label: 'Vehicle' },
];

// The serial-numbered items on a receipt issued to me, and a Claim button for each. The seller confirmed the sale by
// issuing the receipt, so a claimed item is verified at once. It shows only when the receipt has such items.
const ClaimPanel: React.FC<{ receiptId: string; onOpenAssets?: () => void }> = ({ receiptId, onOpenAssets }) => {
  const [claims, setClaims] = useState<api.ReceiptClaims | null>(null);
  const [kinds, setKinds] = useState<Record<string, api.AssetKind>>({});
  const [busy, setBusy] = useState('');
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = () =>
    api
      .getReceiptClaims(receiptId)
      .then(setClaims)
      .catch(() => setClaims(null));

  useEffect(() => {
    void load();
  }, [receiptId]);

  if (!claims || claims.items.length === 0) return null;

  const claim = async (serial: string) => {
    setBusy(serial);
    setError('');
    setMessage('');
    try {
      const done = await api.claimAsset({ receipt_id: receiptId, serial, kind: kinds[serial] ?? 'other', consent_show_name: consent });
      setMessage(done.outcome === 'transferred' ? `${done.asset.name} has passed to you.` : `${done.asset.name} is now yours, and verified.`);
      await load();
    } catch (err: any) {
      setError(err.message || 'Could not claim that item.');
    } finally {
      setBusy('');
    }
  };

  return (
    <div data-testid="claim-panel" className="bg-white border-t p-3 max-w-md w-full mx-auto space-y-2 max-h-56 overflow-y-auto">
      <p className="text-sm font-semibold text-gray-900">Claim what you bought</p>
      {message && (
        <p data-testid="claim-done" className="bg-green-50 text-green-800 text-xs rounded-lg p-2">
          {message}{' '}
          {onOpenAssets && <button onClick={onOpenAssets} className="underline font-semibold">See my assets</button>}
        </p>
      )}
      {error && <p data-testid="claim-error" className="text-red-500 text-xs">{error}</p>}
      <label className="flex items-start gap-2 text-xs text-gray-700">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} data-testid="claim-consent" className="h-4 w-4 mt-0.5" />
        <span>I agree that the name on my account (a nickname is fine) is shown to people who check these items.</span>
      </label>
      {claims.items.map((it) => (
        <div key={it.serial} data-testid="claim-item" className="border border-gray-200 rounded-lg p-2 space-y-1">
          <p className="text-sm text-gray-900">{it.description}</p>
          <p className="text-xs font-mono text-gray-500">{it.serial}</p>
          <p className="text-xs text-gray-600">{STATUS_TEXT[it.status]}</p>
          {(it.status === 'claimable' || it.status === 'from_seller') && (
            <div className="flex gap-2 items-center">
              {it.status === 'claimable' && (
                <select
                  aria-label={`What kind of item is ${it.serial}`}
                  value={kinds[it.serial] ?? 'other'}
                  onChange={(e) => setKinds({ ...kinds, [it.serial]: e.target.value as api.AssetKind })}
                  className="text-sm bg-gray-100 rounded-lg px-2 py-2"
                >
                  {KINDS.map((k) => (
                    <option key={k.key} value={k.key}>{k.label}</option>
                  ))}
                </select>
              )}
              <button
                onClick={() => claim(it.serial)}
                disabled={busy === it.serial || !consent}
                className="flex-1 bg-brand-gold text-brand-navy font-bold text-sm py-2 rounded-lg disabled:bg-gray-300"
                aria-label={`Claim ${it.serial}`}
              >
                {busy === it.serial ? 'Claiming…' : 'Claim'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ClaimPanel;