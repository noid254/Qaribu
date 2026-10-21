import React, { useEffect, useRef, useState } from 'react';
import * as api from '../../services/api';

export const PHOTO_KINDS: { key: api.PhotoKind; label: string; hint: string }[] = [
  { key: 'item', label: 'The item', hint: 'The whole item, clearly in view.' },
  { key: 'serial', label: 'Serial number', hint: 'The label or plate with the serial number or IMEI, close enough to read.' },
  { key: 'receipt', label: 'The receipt', hint: 'If you have one. It is kept as a record; only a Qaribu receipt gives the tick.' },
];

export const photoWhen = (iso: string) => new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Nairobi' });

const MAX_SIDE = 1200;

function cameraMessage(err: unknown): string {
  const name = (err as { name?: string })?.name ?? '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'The camera is blocked. Allow the camera for this site in your browser settings, then try again.';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'No camera was found on this device.';
  return 'The camera could not be opened. Close other apps that use it and try again.';
}

// The live camera, and nothing else: there is no way to choose a file from the gallery, because a photo of an item must be
// taken now. The photo is shrunk to about 1200 pixels (which also drops any hidden location data from the file), sent,
// and dated by the server when it arrives.
const PhotoCapture: React.FC<{ assetId: string; onAdded: () => void; onClose: () => void }> = ({ assetId, onAdded, onClose }) => {
  const video = useRef<HTMLVideoElement>(null);
  const [kind, setKind] = useState<api.PhotoKind>('item');
  const [live, setLive] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<{ kind: api.PhotoKind; at: string }[]>([]);

  useEffect(() => {
    let alive = true;
    let stream: MediaStream | null = null;
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser cannot open the camera here. Use Chrome or Safari on your phone, on the Qaribu address.');
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      .then((s) => {
        if (!alive) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        if (video.current) {
          video.current.srcObject = s;
          void video.current.play().catch(() => undefined);
        }
      })
      .catch((err) => alive && setError(cameraMessage(err)));
    return () => {
      alive = false;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const take = async () => {
    const v = video.current;
    if (!v || busy) return;
    if (!v.videoWidth) {
      setError('The camera is not ready yet. Wait a moment and try again.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const scale = Math.min(1, MAX_SIDE / Math.max(v.videoWidth, v.videoHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(v.videoWidth * scale);
      canvas.height = Math.round(v.videoHeight * scale);
      canvas.getContext('2d')!.drawImage(v, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      if (!blob) throw new Error('Could not take the photo. Try again.');
      const photo = await api.uploadAssetPhoto(assetId, kind, blob);
      setSaved((list) => [...list, { kind: photo.kind, at: photo.taken_at }]);
      onAdded();
    } catch (err: any) {
      setError(err.message || 'Could not save the photo.');
    } finally {
      setBusy(false);
    }
  };

  const current = PHOTO_KINDS.find((k) => k.key === kind)!;
  return (
    <div data-testid="photo-capture" className="fixed inset-0 z-50 bg-black flex flex-col" role="dialog" aria-label="Take photos of the item">
      <div className="bg-brand-navy text-white px-4 py-3 flex items-center">
        <button onClick={onClose} className="mr-3 text-xl" aria-label="Close camera" data-testid="photo-done">&larr;</button>
        <h2 className="text-lg font-bold">Take photos</h2>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {/* The button stays off until the picture is really arriving, so a tap is never lost. */}
        <video ref={video} playsInline muted onLoadedData={() => setLive(true)} className="absolute inset-0 w-full h-full object-cover" />
        {!live && !error && <p className="absolute inset-0 flex items-center justify-center text-white text-sm">Opening the camera…</p>}
        {error && <p data-testid="photo-error" className="absolute inset-x-4 top-4 bg-white text-red-600 text-sm rounded-lg p-3">{error}</p>}
      </div>

      <div className="bg-white p-4 space-y-3 max-w-md w-full mx-auto">
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="What the photo shows">
          {PHOTO_KINDS.map((k) => (
            <button
              key={k.key}
              type="button"
              role="radio"
              aria-checked={kind === k.key}
              data-testid={`photo-kind-${k.key}`}
              onClick={() => setKind(k.key)}
              className={`text-xs font-semibold py-2 rounded-lg border ${kind === k.key ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              {k.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-600">{current.hint}</p>
        <button onClick={take} disabled={!live || busy} data-testid="photo-take" className="w-full bg-brand-gold text-brand-navy font-bold py-3 rounded-lg active-scale disabled:opacity-50">
          {busy ? 'Saving…' : 'Take photo'}
        </button>
        {saved.length > 0 && (
          <p data-testid="photo-saved" className="text-xs text-green-700">
            {saved.length === 1 ? '1 photo saved' : `${saved.length} photos saved`}. Last: {PHOTO_KINDS.find((k) => k.key === saved[saved.length - 1]!.kind)!.label.toLowerCase()}, taken {photoWhen(saved[saved.length - 1]!.at)}.
          </p>
        )}
        <p className="text-xs text-gray-400">Photos come from the camera only, and are dated when they arrive. They stay with the item and cannot be deleted.</p>
      </div>
    </div>
  );
};

export default PhotoCapture;
