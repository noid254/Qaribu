import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';
import { fieldClass, primaryButton } from '../visitors/shared';

interface SkillIdEditorProps {
  state: api.SkillIdState;
  onChange: (state: api.SkillIdState) => void;
}

const MAX_PHOTO_BYTES = 150 * 1024;

// Any picture from the phone, made small enough: about 480 pixels on the long side, as a JPEG under 150 KB.
async function shrink(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('That file is not a picture.'));
      i.src = url;
    });
    const scale = Math.min(1, 480 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.85, 0.7, 0.55, 0.4]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (blob && blob.size <= MAX_PHOTO_BYTES) return blob;
    }
    throw new Error('That picture is too detailed. Choose a simpler one.');
  } finally {
    URL.revokeObjectURL(url);
  }
}

// The Skill ID's profile: what a person shows as a professional. Everything is kept on the server; this only fills it in.
const SkillIdEditor: React.FC<SkillIdEditorProps> = ({ state, onChange }) => {
  const profile = state.skill_id!;
  const [name, setName] = useState(profile.name);
  const [tagline, setTagline] = useState(profile.tagline);
  const [about, setAbout] = useState(profile.about);
  const [area, setArea] = useState(profile.area);
  const [county, setCounty] = useState(profile.county);
  const [skill, setSkill] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  // A new photo keeps has_photo true, so the picture is fetched again whenever this counter moves.
  const [photoVersion, setPhotoVersion] = useState(0);

  useEffect(() => {
    let live = true;
    let url: string | null = null;
    if (profile.has_photo) {
      api.fetchSkillIdPhotoUrl().then((u) => {
        url = u;
        if (live) setPhotoUrl(u);
      });
    } else {
      setPhotoUrl(null);
    }
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [profile.has_photo, photoVersion]);

  const run = async (job: () => Promise<api.SkillIdState>, saved = '') => {
    setBusy(true);
    setError('');
    setNote('');
    try {
      onChange(await job());
      if (saved) setNote(saved);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const saveAll = () =>
    run(async () => {
      if (name.trim() !== profile.name) await api.setMyName(name);
      return api.saveSkillId({ tagline, about, area, county });
    }, 'Saved.');

  const pickPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await run(async () => api.uploadSkillIdPhoto(await shrink(file)));
    setPhotoVersion((v) => v + 1);
  };

  const addSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill.trim()) return;
    void run(() => api.addMySkill(skill)).then(() => setSkill(''));
  };

  const missing = profile.checklist.filter((c) => !c.done);

  return (
    <div data-testid="skill-id-editor" className="space-y-4">
      <div className="bg-white rounded-xl shadow p-5 space-y-4">
        <div className="flex items-center gap-4">
          {photoUrl ? <img src={photoUrl} alt="Your photo" className="h-20 w-20 rounded-full object-cover border" /> : <div className="h-20 w-20 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">No photo</div>}
          <div className="space-y-1">
            <label className={`inline-block text-sm font-semibold border border-gray-300 rounded-lg px-3 py-2 cursor-pointer ${busy ? 'opacity-50' : ''}`}>
              {profile.has_photo ? 'Change photo' : 'Add a photo'}
              <input type="file" accept="image/*" onChange={pickPhoto} disabled={busy} className="hidden" data-testid="skill-id-photo" />
            </label>
            {profile.has_photo && <button type="button" onClick={() => run(api.removeSkillIdPhoto)} disabled={busy} className="block text-xs text-red-600 font-semibold">Remove photo</button>}
          </div>
        </div>

        {missing.length > 0 ? (
          <div data-testid="skill-id-missing" className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-900">
            <p className="font-semibold">Complete your Skill ID</p>
            <ul className="list-disc ml-5 mt-1">{missing.map((m) => <li key={m.key}>{m.label}</li>)}</ul>
          </div>
        ) : (
          <p className="text-sm text-green-700 font-semibold">✓ Your Skill ID is complete.</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-5 space-y-4">
        <div>
          <label htmlFor="sidName" className="block text-sm font-medium text-gray-700">Name or nickname</label>
          <input id="sidName" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="sidTag" className="block text-sm font-medium text-gray-700">What you do, in a line</label>
          <input id="sidTag" value={tagline} onChange={(e) => setTagline(e.target.value)} maxLength={80} placeholder="Plumber and pipe fitter" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="sidAbout" className="block text-sm font-medium text-gray-700">About you</label>
          <textarea id="sidAbout" value={about} onChange={(e) => setAbout(e.target.value)} maxLength={500} rows={4} className={fieldClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="sidArea" className="block text-sm font-medium text-gray-700">Where you work</label>
            <input id="sidArea" value={area} onChange={(e) => setArea(e.target.value)} maxLength={60} placeholder="Kileleshwa" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="sidCounty" className="block text-sm font-medium text-gray-700">County</label>
            <input id="sidCounty" value={county} onChange={(e) => setCounty(e.target.value)} maxLength={40} placeholder="Nairobi" className={fieldClass} />
          </div>
        </div>
        <button type="button" onClick={saveAll} disabled={busy} data-testid="skill-id-save" className={primaryButton}>{busy ? 'Saving…' : 'Save'}</button>
        {note && <p className="text-sm text-green-700">{note}</p>}
      </div>

      <div className="bg-white rounded-xl shadow p-5 space-y-3">
        <h3 className="text-sm font-bold text-brand-navy">Your skills</h3>
        {profile.skills.length === 0 && <p className="text-sm text-gray-500">None yet. Add what you can do.</p>}
        <ul className="space-y-2">
          {profile.skills.map((s) => (
            <li key={s.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
              <span>{s.title}{s.category ? <span className="text-gray-400"> · {s.category}</span> : null}</span>
              <button type="button" onClick={() => run(() => api.removeMySkill(s.id))} disabled={busy} className="text-xs text-red-600 font-semibold" aria-label={`Remove ${s.title}`}>Remove</button>
            </li>
          ))}
        </ul>
        <form onSubmit={addSkill} className="flex gap-2">
          <input value={skill} onChange={(e) => setSkill(e.target.value)} maxLength={60} placeholder="For example Plumbing" aria-label="Add a skill" data-testid="skill-id-new-skill" className="flex-1 px-3 py-3 bg-gray-100 rounded-lg shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
          <button type="submit" disabled={busy || !skill.trim()} className="shrink-0 bg-brand-navy text-white font-semibold px-4 rounded-lg disabled:opacity-40">Add</button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-5 space-y-2">
        <h3 className="text-sm font-bold text-brand-navy">Be found as a professional</h3>
        <p className="text-xs text-gray-500">When you are listed, people searching for your skills can find your name, photo, what you do, where you work and your skills. Your phone number is never shown. You can stop at any time.</p>
        <button
          type="button"
          onClick={() => run(() => api.saveSkillId({ listed: !profile.listed }), profile.listed ? 'You are no longer listed.' : 'You are listed.')}
          disabled={busy || (!profile.listed && !profile.complete)}
          data-testid="skill-id-list"
          className={profile.listed ? 'w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg' : primaryButton}
        >
          {profile.listed ? 'Stop being listed' : 'List me'}
        </button>
        {!profile.listed && !profile.complete && <p className="text-xs text-gray-500">Complete the list above first.</p>}
        {state.level !== 'verified' && <p className="text-xs text-gray-500">You can be listed before you are verified. A verified Skill ID shows a tick.</p>}
      </div>

      {error && <p data-testid="skill-id-error" className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default SkillIdEditor;
