import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';
import BrandKitForm from './BrandKitForm';
import IssueReceipt from './IssueReceipt';
import ReceiptList from './ReceiptList';

interface DocumentsHubProps {
  isAuthenticated: boolean;
  onSignIn: () => void;
  onBack: () => void;
  // Which tab to open first: issuing a receipt, or the brand kit itself.
  start: 'receipts' | 'brandKit';
}

type TabKey = 'received' | 'issue' | 'issued' | 'brandKit';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'received', label: 'Received' },
  { key: 'issue', label: 'Issue' },
  { key: 'issued', label: 'Issued' },
  { key: 'brandKit', label: 'Brand kit' },
];

// Business documents. Anyone signed in can look at the receipts issued to their number. To make a document a person
// first sets up their brand kit (the owner's rule, architecture section 23); until they have, Issue and Issued show
// the set-up and nothing else. The server refuses to issue without one as well.
const DocumentsHub: React.FC<DocumentsHubProps> = ({ isAuthenticated, onSignIn, onBack, start }) => {
  const [kit, setKit] = useState<api.BrandKit | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState<TabKey>(start === 'brandKit' ? 'brandKit' : 'issue');
  const [listKey, setListKey] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    setLoadError('');
    api
      .getBrandKit()
      .then(setKit)
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const saved = (next: api.BrandKit) => {
    setKit(next);
    setTab('issue');
  };

  const needsKit = kit !== null && !kit.complete && (tab === 'issue' || tab === 'issued');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white px-4 py-4 flex items-center">
        <button onClick={onBack} className="mr-3 text-xl" aria-label="Back">&larr;</button>
        <h1 className="text-lg font-bold">Receipts</h1>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {!isAuthenticated && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-700 mb-4">Sign in to see your receipts, issue receipts and set up your brand kit.</p>
            <button onClick={onSignIn} className="w-full bg-brand-gold text-brand-navy font-bold py-2 px-4 rounded-lg active-scale">Sign in</button>
          </div>
        )}

        {isAuthenticated && loading && <p className="text-center text-gray-500">Loading…</p>}
        {isAuthenticated && loadError && <p className="text-red-500 text-center text-sm">{loadError}</p>}

        {isAuthenticated && kit && (
          <>
            <div className="flex gap-1 bg-gray-200 rounded-lg p-1" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 text-sm font-semibold py-2 rounded-md ${tab === t.key ? 'bg-white text-brand-navy shadow' : 'text-gray-600'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'received' && (
              <>
                <p className="text-xs text-gray-500">Receipts issued to your phone number. Every receipt has its own ID, and none can be edited or deleted.</p>
                <ReceiptList mode="received" refreshKey={listKey} />
              </>
            )}

            {needsKit && (
              <>
                <div data-testid="brand-kit-gate" className="bg-amber-50 rounded-xl p-4 text-sm text-amber-900">
                  <p className="font-semibold">Set up your brand kit to make receipts.</p>
                  <p className="mt-1">
                    It is your business name, address and phone, which go on everything you issue. It takes a minute. Without it
                    you can still look at the receipts that other people issue to you: see Received.
                  </p>
                </div>
                <BrandKitForm initial={kit} onSaved={saved} />
              </>
            )}

            {!needsKit && tab === 'issue' && <IssueReceipt onIssued={() => setListKey((k) => k + 1)} />}
            {!needsKit && tab === 'issued' && <ReceiptList mode="issued" refreshKey={listKey} />}
            {tab === 'brandKit' && <BrandKitForm initial={kit} onSaved={saved} onCancel={kit.complete ? () => setTab('issue') : undefined} />}
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentsHub;
