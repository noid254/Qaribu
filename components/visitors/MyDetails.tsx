import React, { useState } from 'react';
import * as api from '../../services/api';
import { fieldClass, primaryButton } from './shared';

interface MyDetailsProps {
  account: { phone: string; name: string };
  onSaved: (account: { phone: string; name: string }) => void;
}

// Your own details. There is one account for Qaribu and Nikosoko, and a profile needs nothing more than a phone
// number and, if you like, a name. So this asks for one thing, once, and never blocks anything else.
const MyDetails: React.FC<MyDetailsProps> = ({ account, onSaved }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(account.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const done = await api.setMyName(name);
      onSaved(done.account);
      setEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const prompt = !account.name;

  if (!prompt && !editing) {
    return (
      <p data-testid="my-details" className="text-xs text-gray-500">
        Signed in as <span className="font-semibold text-gray-700">{account.name}</span> · +{account.phone.replace('+', '')}{' '}
        <button onClick={() => setEditing(true)} className="text-blue-600 hover:underline">Edit</button>
      </p>
    );
  }

  return (
    <form onSubmit={save} data-testid="my-details" className={`rounded-xl p-4 space-y-3 ${prompt ? 'bg-amber-50' : 'bg-white shadow'}`}>
      <label htmlFor="myName" className="block text-sm font-medium text-gray-800">
        {prompt ? 'What should we call you?' : 'Your name'}
      </label>
      <input id="myName" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" className={fieldClass} />
      {prompt && (
        <p className="text-xs text-gray-600">
          That is all we need. One account for your phone number works on Qaribu and on Nikosoko. You can add more later, only if you want to.
        </p>
      )}
      {error && <p data-testid="my-details-error" className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving || !name.trim()} className={primaryButton}>{saving ? 'Saving…' : 'Save'}</button>
        {!prompt && (
          <button type="button" onClick={() => { setEditing(false); setName(account.name); setError(''); }} className="shrink-0 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default MyDetails;
