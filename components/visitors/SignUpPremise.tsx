import React, { useState } from 'react';
import * as api from '../../services/api';
import { fieldClass, primaryButton } from './shared';

interface SignUpPremiseProps {
  // Called when the person is done: the screen then opens the premise they registered.
  onDone: (slug: string) => void;
  onCancel: () => void;
}

// Registering a premise brings its page and its sticker with it. One short form, then the result: the link to
// the page, the QR to put on the gate, and the printable sticker. Only the name is required.
const SignUpPremise: React.FC<SignUpPremiseProps> = ({ onDone, onCancel }) => {
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [county, setCounty] = useState('');
  const [tagline, setTagline] = useState('');
  const [about, setAbout] = useState('');
  const [listed, setListed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [made, setMade] = useState<{ slug: string; links: api.PremiseLinks } | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      setMade(await api.registerMyPremise({ name, area, county, tagline, about, listed }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setError('Could not copy. Select the link and copy it by hand.');
    }
  };

  if (made) {
    return (
      <div data-testid="signup-done" className="bg-white rounded-xl shadow p-5 space-y-4 text-center">
        <h2 className="text-lg font-bold text-gray-900">Your premise is ready</h2>
        <p className="text-sm text-gray-600">Its page is live. Put the QR at the gate so visitors can scan it.</p>
        <img src={made.links.qr} alt={`QR code for ${name}`} data-testid="signup-qr" className="mx-auto w-44 h-44" />
        <input readOnly value={made.links.page} aria-label="Premise page link" data-testid="signup-link" className={`${fieldClass} text-xs`} onFocus={(e) => e.currentTarget.select()} />
        <div className="grid grid-cols-2 gap-2">
          <a href={made.links.page} target="_blank" rel="noopener noreferrer" className="block text-center bg-brand-gold text-brand-navy font-bold py-3 px-2 rounded-lg active-scale">
            Open the page
          </a>
          <a href={made.links.sticker} target="_blank" rel="noopener noreferrer" className="block text-center border border-brand-gold text-brand-navy font-bold py-3 px-2 rounded-lg active-scale">
            Sticker to print
          </a>
        </div>
        <button onClick={() => copy(made.links.page)} className="block w-full text-center border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg">
          {copied ? 'Copied' : 'Copy link'}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button onClick={() => onDone(made.slug)} className={primaryButton}>Go to my premise</button>
        <p className="text-xs text-gray-500">Next, add your vacancies, so visitors see them on the page.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl shadow p-5 space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Register a premise</h2>
      <p className="text-sm text-gray-600">You get a page for it and a sticker to put at the gate. Only the name is needed now.</p>
      {error && <p data-testid="signup-error" className="bg-red-50 text-red-700 text-sm rounded-lg p-3 text-center">{error}</p>}

      <div>
        <label htmlFor="premiseName" className="block text-sm font-medium text-gray-700">Name of the premise</label>
        <input id="premiseName" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={80} placeholder="Mwangaza Court" className={fieldClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="premiseArea" className="block text-sm font-medium text-gray-700">Area <span className="text-gray-400">(optional)</span></label>
          <input id="premiseArea" value={area} onChange={(e) => setArea(e.target.value)} maxLength={60} placeholder="Kilimani" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="premiseCounty" className="block text-sm font-medium text-gray-700">County <span className="text-gray-400">(optional)</span></label>
          <input id="premiseCounty" value={county} onChange={(e) => setCounty(e.target.value)} maxLength={40} placeholder="Nairobi" className={fieldClass} />
        </div>
      </div>
      <div>
        <label htmlFor="premiseTagline" className="block text-sm font-medium text-gray-700">One line about it <span className="text-gray-400">(optional)</span></label>
        <input id="premiseTagline" value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={120} placeholder="Safe homes near the park" className={fieldClass} />
      </div>
      <div>
        <label htmlFor="premiseAbout" className="block text-sm font-medium text-gray-700">A few lines for visitors <span className="text-gray-400">(optional)</span></label>
        <textarea id="premiseAbout" value={about} onChange={(e) => setAbout(e.target.value)} maxLength={600} rows={3} className={fieldClass} />
      </div>
      <label className="flex items-start gap-3 text-sm text-gray-700">
        <input type="checkbox" checked={listed} onChange={(e) => setListed(e.target.checked)} className="mt-1" />
        <span>
          List this premise publicly
          <span className="block text-xs text-gray-500">Off by default: only people with your link or sticker can find the page.</span>
        </span>
      </label>
      <button type="submit" disabled={saving} className={primaryButton}>{saving ? 'Registering…' : 'Register premise'}</button>
      <button type="button" onClick={onCancel} className="block w-full text-center text-sm text-blue-600 hover:underline">Cancel</button>
    </form>
  );
};

export default SignUpPremise;
