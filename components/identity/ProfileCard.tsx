import React, { useState } from 'react';
import * as api from '../../services/api';
import { primaryButton } from '../visitors/shared';
import ProfileHeader from './ProfileHeader';
import { FormLine } from './FormLine';

interface ProfileCardProps {
  state: api.SkillIdState;
  onChange: (state: api.SkillIdState) => void;
}

// What a person with only a nickname can edit: a photo and the nickname.
const ProfileCard: React.FC<ProfileCardProps> = ({ state, onChange }) => {
  const [name, setName] = useState(state.me.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  const save = async () => {
    setBusy(true);
    setError('');
    setNote('');
    try {
      await api.setMyName(name);
      onChange(await api.getSkillIdState());
      setNote('Saved.');
    } catch (err: any) {
      setError(err.message || 'Could not save.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="profile-card" className="space-y-4">
      <ProfileHeader name={state.me.name} hasPhoto={state.me.has_photo} hasCover={state.me.has_cover} onState={onChange} />
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <FormLine label="Name or nickname" value={name} onChange={setName} max={80} />
        <button type="button" onClick={save} disabled={busy || name.trim() === state.me.name} data-testid="profile-save" className={`${primaryButton} mt-4 disabled:opacity-40`}>{busy ? 'Saving…' : 'Save'}</button>
        {note && <p className="text-sm text-green-700 mt-2">{note}</p>}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default ProfileCard;
