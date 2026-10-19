import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';
import BrandKitForm from './BrandKitForm';
import IssueReceipt from './IssueReceipt';
import MyReceipts from './MyReceipts';

interface DocumentsHubProps {
  isAuthenticated: boolean;
  onSignIn: () => void;
  onBack: () => void;
  // Which tab to open first: the receipts, or the brand kit itself.
  start: 'receipts' | 'brandKit';
}

type TabKey = 'issue' | 'mine' | 'brandKit';

// Business documents. To make one a person first sets up their brand kit (the owner's rule, architecture section
// 23); until they have, this shows the set-up and nothing else. The server refuses to issue without one as well.
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

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'issue', label: 'Issue receipt' },
    { key: 'mine', label: 'My receipts' },
    { key: 'brandKit', label: 'Brand kit' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-navy text-white px-4 py-4 flex items-center">
        <button onClick={onBack} className="mr-3 text-xl" aria-label="Back">&larr;</button>
        <h1 className="text-lg font-bold">Receipts</h1>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {!isAuthenticated && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-700 mb-4">Sign in to issue receipts and set up your brand kit.</p>
            <button onClick={onSignIn} className="w-full bg-brand-gold text-brand-navy font-bold py-2 px-4 rounded-lg active-scale">Sign in</button>
          </div>
        )}

        {isAuthenticated && loading && <p className="text-center text-gray-500">Loading…</p>}
        {isAuthenticated && loadError && <p className="text-red-500 text-center text-sm">{loadError}</p>}

        {isAuthenticated && kit && !kit.complete && (
          <>
            <div data-testid="brand-kit-gate" className="bg-amber-50 rounded-xl p-4 text-sm text-amber-900">
              <p className="font-semibold">Set up your brand kit to make receipts.</p>
              <p className="mt-1">
                It is your business name, address and phone, which go on everything you issue. It takes a minute. Without it
                you can still open receipts that other people send you.
              </p>
            </div>
            <BrandKitForm initial={kit} onSaved={saved} />
          </>
        )}

        {isAuthenticated && kit?.complete && (
          <>
            <div className="flex gap-1 bg-gray-200 rounded-lg p-1" role="tablist">
              {tabs.map((t) => (
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

            {tab === 'issue' && <IssueReceipt onIssued={() => setListKey((k) => k + 1)} />}
            {tab === 'mine' && <MyReceipts refreshKey={listKey} />}
            {tab === 'brandKit' && <BrandKitForm initial={kit} onSaved={saved} onCancel={() => setTab('issue')} />}
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentsHub;
