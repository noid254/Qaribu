import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';
import { primaryButton } from '../visitors/shared';
import KycCapture from './KycCapture';
import KycReview from './KycReview';

interface IdentityViewProps {
  isAuthenticated: boolean;
  userName: string;
  onSignIn: () => void;
  onBack: () => void;
}

const LEVEL_TEXT: Record<api.IdentityLevel, { title: string; body: string }> = {
  nickname: { title: 'Nickname', body: 'You can search and browse. To be listed as a professional and sell a skill, make a Skill ID.' },
  skill_id: { title: 'Skill ID, not verified', body: 'You can be listed and sell a skill, shown as not verified. Verify with your ID and your face to invite visitors with a gate pass and to own assets.' },
  verified: { title: 'Verified Skill ID', body: 'Your Skill ID is verified by Qaribu review.' },
};

// "My ID": where you are (nickname, Skill ID, verified), the next step, and, for a reviewer, the queue. The server decides
// what each level may do; this page only shows the way.
const IdentityView: React.FC<IdentityViewProps> = ({ isAuthenticated, userName, onSignIn, onBack }) => {
  const [identity, setIdentity] = useState<api.Identity | null>(null);
  const [mode, setMode] = useState<'home' | 'kyc' | 'review'>('home');
  const [reviewer, setReviewer] = useState(false);
  const [waiting, setWaiting] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = () =>
    api
      .getIdentity()
      .then(setIdentity)
      .catch((err) => setError(err.message || 'Could not load your ID.'));

  useEffect(() => {
    if (!isAuthenticated) return;
    void load();
    // Only a reviewer's account is answered; anyone else gets a refusal, which just means no review section.
    api
      .kycPending()
      .then((r) => {
        setReviewer(true);
        setWaiting(r.items.length);
      })
      .catch(() => setReviewer(false));
  }, [isAuthenticated]);

  const makeSkillId = async () => {
    setBusy(true);
    setError('');
    try {
      setIdentity(await api.createSkillId());
    } catch (err: any) {
      setError(err.message || 'Could not make your Skill ID.');
    } finally {
      setBusy(false);
    }
  };

  const header = (
    <div className="bg-brand-navy text-white px-4 py-4 flex items-center">
      <button onClick={onBack} className="mr-3 text-xl" aria-label="Back">&larr;</button>
      <h1 className="text-xl font-bold">My ID</h1>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div>
        {header}
        <div className="p-4">
          <button onClick={onSignIn} className={primaryButton}>Sign in</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {header}
      <div className="p-4 space-y-4 max-w-md mx-auto">
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {mode === 'kyc' && identity && (
          <KycCapture
            defaultName={userName}
            onCancel={() => setMode('home')}
            onSubmitted={() => {
              setMode('home');
              void load();
            }}
          />
        )}

        {mode === 'review' && <KycReview reasons={identity?.reject_reasons ?? {}} onBack={() => { setMode('home'); void load(); void api.kycPending().then((r) => setWaiting(r.items.length)).catch(() => undefined); }} />}

        {mode === 'home' && identity && (
          <>
            <div data-testid="identity-level" className="bg-white rounded-xl shadow p-5 space-y-2">
              <p className="text-xs uppercase tracking-wide text-gray-500">You are</p>
              <h2 className="text-lg font-bold text-brand-navy">{identity.level === 'verified' ? '✓ ' : ''}{LEVEL_TEXT[identity.level].title}</h2>
              <p className="text-sm text-gray-600">{LEVEL_TEXT[identity.level].body}</p>
            </div>

            {identity.level === 'nickname' && (
              <button onClick={makeSkillId} disabled={busy} data-testid="make-skill-id" className={primaryButton}>{busy ? 'Making…' : 'Make my Skill ID'}</button>
            )}

            {identity.level === 'skill_id' && identity.kyc.status === 'pending' && (
              <p data-testid="kyc-pending" className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg p-3">Your ID and selfie are with a reviewer. You will see the result here.</p>
            )}

            {identity.level === 'skill_id' && identity.kyc.status === 'rejected' && (
              <p data-testid="kyc-rejected" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">Not verified. {identity.kyc.reason} You can try again.</p>
            )}

            {identity.level === 'skill_id' && identity.kyc.status !== 'pending' && (
              <button onClick={() => setMode('kyc')} data-testid="start-kyc" className={primaryButton}>Verify with my ID</button>
            )}

            {reviewer && (
              <button onClick={() => setMode('review')} data-testid="open-review" className="w-full border border-brand-navy text-brand-navy font-semibold py-3 rounded-lg">
                Review KYC{waiting > 0 ? ` (${waiting} waiting)` : ''}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default IdentityView;
