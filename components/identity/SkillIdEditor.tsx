import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';
import { primaryButton } from '../visitors/shared';
import { FormLine } from './FormLine';
import ProfileHeader from './ProfileHeader';

interface SkillIdEditorProps {
  state: api.SkillIdState;
  onChange: (state: api.SkillIdState) => void;
  // 'skills' shows only the skills card (the Skills page in the side menu).
  only?: 'skills';
}

const BUTTONS: { value: string; label: string; hint: string }[] = [
  { value: 'call', label: 'Call', hint: 'People phone you' },
  { value: 'whatsapp', label: 'WhatsApp', hint: 'People message you' },
  { value: 'chat', label: 'Chat', hint: 'Chat inside Qaribu' },
  { value: 'book', label: 'Book', hint: 'People book your time' },
  { value: 'catalogue', label: 'Catalogue', hint: 'Show what you sell' },
];
const MAX_BUTTONS = 4;
const RATE_TYPES = ['per hour', 'per day', 'per task', 'per month', 'per piece work', 'per km', 'per sqm', 'per cbm', 'per appearance'];

const Card: React.FC<{ title: string; hint?: string; children: React.ReactNode }> = ({ title, hint, children }) => (
  <section className="bg-white rounded-2xl shadow-sm p-5">
    <h2 className="text-base font-semibold text-brand-navy">{title}</h2>
    {hint && <p className="text-sm text-slate-500 mt-0.5 mb-2">{hint}</p>}
    <div className={hint ? '' : 'mt-1'}>{children}</div>
  </section>
);

// The Skill ID's profile: what a person shows as a professional, one field to a line. Everything is kept on the server.
const SkillIdEditor: React.FC<SkillIdEditorProps> = ({ state, onChange, only }) => {
  const profile = state.skill_id!;
  const [name, setName] = useState(profile.name);
  const [tagline, setTagline] = useState(profile.tagline);
  const [about, setAbout] = useState(profile.about);
  const [area, setArea] = useState(profile.area);
  const [county, setCounty] = useState(profile.county);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState(profile.category);
  const [amount, setAmount] = useState(profile.rate.amount > 0 ? String(profile.rate.amount) : '');
  const [per, setPer] = useState(profile.rate.per);
  const [buttons, setButtons] = useState<string[]>(profile.buttons);
  const [skill, setSkill] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => undefined);
  }, []);
  // A category the person typed is not in the list: it is shown as 'Other' with its text.
  const listed = categories.includes(category);

  const run = async (job: () => Promise<api.SkillIdState>, saved = '') => {
    setBusy(true);
    setError('');
    setNote('');
    try {
      onChange(await job());
      if (saved) setNote(saved);
      return true;
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const saveAll = () =>
    run(async () => {
      if (name.trim() !== profile.name) await api.setMyName(name);
      return api.saveSkillId({ tagline, about, area, county, buttons, category: category.trim(), rate: { amount: parseInt(amount, 10) || 0, per } });
    }, 'Saved.');

  const toggleButton = (value: string) =>
    setButtons((prev) => (prev.includes(value) ? prev.filter((b) => b !== value) : prev.length < MAX_BUTTONS ? [...prev, value] : prev));

  const addSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill.trim()) return;
    if (await run(() => api.addMySkill(skill))) setSkill('');
  };

  const missing = profile.checklist.filter((c) => !c.done);
  const done = profile.checklist.length - missing.length;
  const skillsCard = (
    <Card title="Your skills" hint="Up to 10. Short names work best, such as Plumbing or Wedding photography.">
      {profile.skills.length === 0 && <p className="text-sm text-gray-500 mb-2">None yet. Add what you can do.</p>}
      <ul className="space-y-2 mb-3">
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
      {error && <p data-testid="skill-id-error" className="text-red-500 text-sm mt-2">{error}</p>}
    </Card>
  );

  if (only === 'skills') return <div data-testid="skill-id-editor" className="space-y-4">{skillsCard}</div>;

  return (
    <div data-testid="skill-id-editor" className="space-y-4">
      <ProfileHeader name={name} tagline={tagline} hasPhoto={profile.has_photo} hasCover={profile.has_cover} onState={onChange} />

      <section data-testid={missing.length > 0 ? 'skill-id-missing' : 'skill-id-complete'} className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-brand-navy">{missing.length > 0 ? 'Complete your Skill ID' : 'Your Skill ID is complete'}</h2>
          <span className="text-sm text-slate-500">{done} of {profile.checklist.length}</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-slate-100" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={profile.checklist.length}>
          <div className="h-1.5 rounded-full bg-brand-gold transition-all" style={{ width: `${(done / profile.checklist.length) * 100}%` }} />
        </div>
        {missing.length > 0 && <p className="mt-3 text-sm text-slate-600">Still to add: {missing.map((m) => m.label.toLowerCase()).join(', ')}.</p>}
      </section>

      <Card title="Your details" hint="This is what people see on your profile.">
        <FormLine label="Your name or nickname" value={name} onChange={setName} max={80} />
        <FormLine label="What you do, in a line" value={tagline} onChange={setTagline} max={80} placeholder="Plumber and pipe fitter" />
        <div className="border-b border-gray-200 py-3">
          <label htmlFor="sid-category" className="block text-xs text-gray-400 font-medium mb-1">Category</label>
          <select id="sid-category" value={listed ? category : category ? 'other' : ''} onChange={(e) => setCategory(e.target.value === 'other' ? ' ' : e.target.value)} className="w-full text-base text-gray-800 bg-transparent focus:outline-none">
            <option value="">Choose a category</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            <option value="other">Other (please specify)</option>
          </select>
        </div>
        {category !== '' && !listed && <FormLine label="Your category" value={category.trim()} onChange={(v) => setCategory(v || ' ')} max={40} />}
        <div className="border-b border-gray-200 py-3">
          <label htmlFor="sid-charge" className="block text-xs text-gray-400 font-medium mb-1">Charge</label>
          <div className="flex items-center gap-2">
            <span className="text-base text-gray-500">Ksh</span>
            <input id="sid-charge" type="number" inputMode="numeric" min={0} placeholder="1000" value={amount} onChange={(e) => setAmount(e.target.value)} className="text-base text-gray-800 bg-transparent focus:outline-none w-28" data-testid="skill-id-charge" />
            <select value={per} onChange={(e) => setPer(e.target.value)} aria-label="What the charge is for" className="text-base text-gray-800 bg-transparent focus:outline-none border-l pl-2">
              {RATE_TYPES.map((t) => <option key={t} value={t}>{t.replace('piece work', 'piece')}</option>)}
            </select>
          </div>
        </div>
        <FormLine label="About me" value={about} onChange={setAbout} max={500} multiline />
        <FormLine label="Where you work (estate or area)" value={area} onChange={setArea} max={60} placeholder="Kileleshwa" />
        <FormLine label="County" value={county} onChange={setCounty} max={40} placeholder="Nairobi" />
      </Card>

      <Card title="Buttons on your profile" hint={`Choose up to ${MAX_BUTTONS}. They show in the order you pick them.`}>
        <div className="grid grid-cols-2 gap-2">
          {BUTTONS.map((b) => {
            const at = buttons.indexOf(b.value);
            const on = at >= 0;
            return (
              <label key={b.value} className={`flex items-start gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${on ? 'border-brand-navy bg-brand-navy/5' : 'border-slate-200'} ${!on && buttons.length >= MAX_BUTTONS ? 'opacity-40' : ''}`}>
                <input type="checkbox" checked={on} onChange={() => toggleButton(b.value)} disabled={!on && buttons.length >= MAX_BUTTONS} className="mt-1 text-brand-navy focus:ring-brand-gold" data-testid={`button-${b.value}`} />
                <span>
                  <span className="block text-sm font-semibold text-gray-800">{b.label}{on ? <span className="ml-1 text-xs text-brand-navy">#{at + 1}</span> : null}</span>
                  <span className="block text-xs text-gray-500">{b.hint}</span>
                </span>
              </label>
            );
          })}
        </div>
      </Card>

      <div className="sticky bottom-0 -mx-4 border-t border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur-sm">
        <button type="button" onClick={saveAll} disabled={busy} data-testid="skill-id-save" className={primaryButton}>{busy ? 'Saving…' : 'Save my details'}</button>
        {note && <p className="text-sm text-green-700 text-center mt-2">{note}</p>}
        {error && <p data-testid="skill-id-error" className="text-red-500 text-sm text-center mt-2">{error}</p>}
      </div>

      {skillsCard}

      <Card title="Be found as a professional" hint="When you are listed, people searching can find your name, photo, what you do, where you work and your skills. Your phone number is not shown. You can stop at any time.">
        <button
          type="button"
          onClick={() => run(() => api.saveSkillId({ listed: !profile.listed }), profile.listed ? 'You are no longer listed.' : 'You are listed.')}
          disabled={busy || (!profile.listed && !profile.complete)}
          data-testid="skill-id-list"
          className={profile.listed ? 'w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-lg' : `${primaryButton} disabled:opacity-40`}
        >
          {profile.listed ? 'Stop being listed' : 'List me'}
        </button>
        {!profile.listed && !profile.complete && <p className="text-xs text-gray-500 mt-2">Complete the list above first.</p>}
        {state.level !== 'verified' && <p className="text-xs text-gray-500 mt-2">You can be listed before you are verified. A verified Skill ID shows a tick.</p>}
      </Card>
    </div>
  );
};

export default SkillIdEditor;
