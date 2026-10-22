import React, { useState } from 'react';
import * as api from '../../services/api';
import { primaryButton } from '../visitors/shared';

interface QuoteAnswerPanelProps {
  id: string;
  // Called after the answer is saved, so the page and the lists show it.
  onAnswered: () => void;
}

// The customer answers a quote they were sent: accept or decline. It is answered once and that is final; the quote
// is not changed, an answer is added to its record and the shop sees it.
const QuoteAnswerPanel: React.FC<QuoteAnswerPanelProps> = ({ id, onAnswered }) => {
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState<'' | 'accept' | 'decline'>('');
  const [error, setError] = useState('');

  const send = async (decision: 'accept' | 'decline') => {
    setSaving(true);
    setError('');
    try {
      await api.respondToQuote(id, decision);
      setConfirming('');
      onAnswered();
    } catch (err: any) {
      setError(err.message || 'Could not save your answer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="quote-answer" className="bg-white border-t p-3 max-w-md w-full mx-auto space-y-2">
      <p className="text-sm font-semibold text-gray-900">Your answer</p>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      {confirming === '' ? (
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setConfirming('accept')} data-testid="accept-quote" className={primaryButton}>Accept</button>
          <button onClick={() => setConfirming('decline')} data-testid="decline-quote" className="border border-red-300 text-red-700 font-semibold py-3 rounded-lg">Decline</button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">{confirming === 'accept' ? 'Accept this quote?' : 'Decline this quote?'} You answer once, and the shop is told. It cannot be undone.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirming('')} className="shrink-0 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg">Back</button>
            <button type="button" disabled={saving} onClick={() => send(confirming)} data-testid="answer-confirm" className={primaryButton}>
              {saving ? 'Saving…' : confirming === 'accept' ? 'Yes, accept' : 'Yes, decline'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteAnswerPanel;
