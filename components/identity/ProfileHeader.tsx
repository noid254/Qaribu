import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';

// A picture from the phone, cropped from the centre to the shape the profile shows and made small enough to send.
async function prepare(file: File, width: number, height: number, maxBytes: number): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('That file is not a picture.'));
      i.src = url;
    });
    const want = width / height;
    const have = img.naturalWidth / img.naturalHeight;
    const sw = have > want ? img.naturalHeight * want : img.naturalWidth;
    const sh = have > want ? img.naturalHeight : img.naturalWidth / want;
    const sx = (img.naturalWidth - sw) / 2;
    const sy = (img.naturalHeight - sh) / 2;
    const out = Math.min(1, width / sw);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(sw * out);
    canvas.height = Math.round(sh * out);
    canvas.getContext('2d')!.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.85, 0.7, 0.55, 0.4]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (blob && blob.size <= maxBytes) return blob;
    }
    throw new Error('That picture is too detailed. Choose a simpler one.');
  } finally {
    URL.revokeObjectURL(url);
  }
}

const SIZES: Record<api.ProfilePicture, { w: number; h: number; max: number }> = {
  photo: { w: 480, h: 480, max: 150 * 1024 },
  cover: { w: 960, h: 320, max: 250 * 1024 },
};

// Fetches a picture of the signed-in person and keeps showing the old one until the new one has arrived.
function usePicture(which: api.ProfilePicture, has: boolean, version: number): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    let made: string | null = null;
    if (!has) {
      setUrl(null);
      return;
    }
    api.fetchProfilePictureUrl(which).then((u) => {
      made = u;
      if (live) setUrl(u);
    });
    return () => {
      live = false;
    };
  }, [which, has, version]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  return url;
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || '?';

interface ProfileHeaderProps {
  name: string;
  tagline?: string;
  hasPhoto: boolean;
  hasCover: boolean;
  onState: (state: api.SkillIdState) => void;
}

// The top of a profile as a business page shows it: a wide banner, the person's photo over its edge, the name and line beside it.
const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, tagline, hasPhoto, hasCover, onState }) => {
  const [version, setVersion] = useState({ photo: 0, cover: 0 });
  const [busy, setBusy] = useState<api.ProfilePicture | null>(null);
  const [error, setError] = useState('');
  const photo = usePicture('photo', hasPhoto, version.photo);
  const cover = usePicture('cover', hasCover, version.cover);

  const run = async (which: api.ProfilePicture, job: () => Promise<api.SkillIdState>) => {
    setBusy(which);
    setError('');
    try {
      onState(await job());
      setVersion((v) => ({ ...v, [which]: v[which] + 1 }));
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setBusy(null);
    }
  };

  const pick = (which: api.ProfilePicture) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const size = SIZES[which];
    await run(which, async () => api.uploadProfilePicture(which, await prepare(file, size.w, size.h, size.max)));
  };

  return (
    <section data-testid="profile-header" className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="relative aspect-[3/1] bg-gradient-to-br from-brand-navy to-slate-600">
        {cover && <img src={cover} alt="Your banner" className="absolute inset-0 w-full h-full object-cover" />}
        <label className="absolute right-3 top-3 cursor-pointer rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
          {busy === 'cover' ? 'Saving…' : hasCover ? 'Change banner' : 'Add a banner'}
          <input type="file" accept="image/*" className="hidden" onChange={pick('cover')} disabled={busy !== null} data-testid="skill-id-cover" />
        </label>
      </div>
      <div className="px-5 pb-5">
        <div className="-mt-10 flex items-end gap-4">
          <label className="relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-full bg-slate-200 ring-4 ring-white">
            {photo ? <img src={photo} alt="Your photo" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center text-xl font-bold text-slate-500">{initials(name)}</span>}
            <span className="absolute inset-x-0 bottom-0 bg-black/50 py-0.5 text-center text-[10px] font-semibold text-white">{busy === 'photo' ? 'Saving…' : 'Edit'}</span>
            <input type="file" accept="image/*" className="hidden" onChange={pick('photo')} disabled={busy !== null} data-testid="skill-id-photo" />
          </label>
          <div className="min-w-0 pb-1">
            <p className="truncate text-lg font-bold text-brand-navy">{name || 'Your name'}</p>
            <p className="truncate text-sm text-slate-500">{tagline || 'Add a line about what you do'}</p>
          </div>
        </div>
        {(hasPhoto || hasCover) && (
          <div className="mt-3 flex gap-4 text-xs font-semibold text-red-600">
            {hasPhoto && <button type="button" onClick={() => run('photo', () => api.removeProfilePicture('photo'))} disabled={busy !== null}>Remove photo</button>}
            {hasCover && <button type="button" onClick={() => run('cover', () => api.removeProfilePicture('cover'))} disabled={busy !== null}>Remove banner</button>}
          </div>
        )}
        {error && <p data-testid="skill-id-photo-error" className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    </section>
  );
};

export default ProfileHeader;
