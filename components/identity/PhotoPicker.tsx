import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';

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

interface PhotoPickerProps {
  hasPhoto: boolean;
  onState: (state: api.SkillIdState) => void;
}

// The profile photo: shown large and round, with one button to add or change it. Anyone signed in can have one.
const PhotoPicker: React.FC<PhotoPickerProps> = ({ hasPhoto, onState }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // A new photo keeps hasPhoto true, so the picture is fetched again whenever the version moves.
  useEffect(() => {
    let live = true;
    let made: string | null = null;
    if (hasPhoto) {
      api.fetchSkillIdPhotoUrl().then((u) => {
        made = u;
        if (live) setUrl(u);
      });
    } else {
      setUrl(null);
    }
    return () => {
      live = false;
      if (made) URL.revokeObjectURL(made);
    };
  }, [hasPhoto, version]);

  const run = async (job: () => Promise<api.SkillIdState>) => {
    setBusy(true);
    setError('');
    try {
      onState(await job());
      setVersion((v) => v + 1);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await run(async () => api.uploadSkillIdPhoto(await shrink(file)));
  };

  return (
    <div className="flex flex-col items-center">
      <label className={`relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 text-gray-500 cursor-pointer shadow-lg flex items-center justify-center ${busy ? 'opacity-60' : ''}`}>
        {url ? (
          <img src={url} alt="Your photo" className="w-full h-full object-cover" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        )}
        <input type="file" accept="image/*" onChange={pick} disabled={busy} className="hidden" data-testid="skill-id-photo" />
      </label>
      <p className="text-sm text-gray-500 mt-2">{busy ? 'Saving…' : hasPhoto ? 'Tap the picture to change it' : 'Tap to add a profile picture'}</p>
      {hasPhoto && (
        <button type="button" onClick={() => run(api.removeSkillIdPhoto)} disabled={busy} className="text-xs text-red-600 font-semibold mt-1">Remove photo</button>
      )}
      {error && <p data-testid="skill-id-photo-error" className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default PhotoPicker;
