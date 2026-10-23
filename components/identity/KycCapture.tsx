import React, { useEffect, useRef, useState } from 'react';
import * as api from '../../services/api';
import { fieldClass, primaryButton } from '../visitors/shared';

interface KycCaptureProps {
  defaultName: string;
  onSubmitted: () => void;
  onCancel: () => void;
}

const ID_TYPES: { key: api.KycIdType; label: string }[] = [
  { key: 'national_id', label: 'Kenyan national ID' },
  { key: 'alien_id', label: 'Alien ID' },
  { key: 'passport', label: 'Passport' },
];

const PART_LABEL: Record<api.KycPart, string> = { front: 'ID front', back: 'ID back', selfie: 'Selfie' };
const PART_HINT: Record<api.KycPart, string> = {
  front: 'The side with your photo and name. Fill the frame, no glare, every word readable.',
  back: 'The back of the ID. Fill the frame, no glare.',
  selfie: 'Your face, in good light, looking at the camera. No hat or glasses.',
};

const partsFor = (type: api.KycIdType): api.KycPart[] => (type === 'passport' ? ['front', 'selfie'] : ['front', 'back', 'selfie']);

const MAX_SIDE = 1400;

function cameraMessage(err: unknown): string {
  const name = (err as { name?: string })?.name ?? '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'The camera is blocked. Allow the camera for this site in your browser settings, then try again.';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'No camera was found on this device.';
  return 'The camera could not be opened. Close other apps that use it and try again.';
}

// The live camera for one picture. No gallery: the ID and the face must be taken now. The picture is shrunk, sent, and
// the page gets the name the server gave it.
const CameraStep: React.FC<{ part: api.KycPart; onTaken: (ref: string) => void; onClose: () => void }> = ({ part, onTaken, onClose }) => {
  const video = useRef<HTMLVideoElement>(null);
  const [live, setLive] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    let stream: MediaStream | null = null;
    setLive(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser cannot open the camera here. Use Chrome or Safari on your phone, on the Qaribu address.');
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: part === 'selfie' ? 'user' : 'environment' } }, audio: false })
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
  }, [part]);

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
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
      if (!blob) throw new Error('Could not take the picture. Try again.');
      onTaken(await api.uploadKycPicture(blob));
    } catch (err: any) {
      setError(err.message || 'Could not save the picture.');
      setBusy(false);
    }
  };

  return (
    <div data-testid="kyc-camera" className="fixed inset-0 z-50 bg-black flex flex-col" role="dialog" aria-label={`Take the ${PART_LABEL[part].toLowerCase()} picture`}>
      <div className="bg-brand-navy text-white px-4 py-3 flex items-center">
        <button onClick={onClose} className="mr-3 text-xl" aria-label="Close camera">&larr;</button>
        <h2 className="text-lg font-bold">{PART_LABEL[part]}</h2>
      </div>
      <div className="flex-1 relative overflow-hidden">
        <video ref={video} playsInline muted onLoadedData={() => setLive(true)} className={`absolute inset-0 w-full h-full object-cover ${part === 'selfie' ? 'scale-x-[-1]' : ''}`} />
        {!live && !error && <p className="absolute inset-0 flex items-center justify-center text-white text-sm">Opening the camera…</p>}
        {error && <p className="absolute inset-x-4 top-4 bg-white text-red-600 text-sm rounded-lg p-3">{error}</p>}
      </div>
      <div className="bg-white p-4 space-y-3 max-w-md w-full mx-auto">
        <p className="text-sm text-gray-700">{PART_HINT[part]}</p>
        <button onClick={take} disabled={!live || busy} data-testid="kyc-take" className="w-full bg-brand-gold text-brand-navy font-bold py-3 rounded-lg active-scale disabled:opacity-50">
          {busy ? 'Sending…' : 'Take picture'}
        </button>
      </div>
    </div>
  );
};

// Three steps: the details as they are on the ID, the pictures from the camera, and the consent. Then it goes to a
// reviewer. The server checks everything again.
const KycCapture: React.FC<KycCaptureProps> = ({ defaultName, onSubmitted, onCancel }) => {
  const [step, setStep] = useState<'details' | 'pictures' | 'consent'>('details');
  const [name, setName] = useState(defaultName);
  const [idType, setIdType] = useState<api.KycIdType>('national_id');
  const [idNumber, setIdNumber] = useState('');
  const [files, setFiles] = useState<Partial<Record<api.KycPart, string>>>({});
  const [taking, setTaking] = useState<api.KycPart | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const parts = partsFor(idType);
  const allTaken = parts.every((p) => files[p]);

  const toPictures = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStep('pictures');
  };

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      await api.submitKyc({ name, id_type: idType, id_number: idNumber, consent: agreed, files });
      onSubmitted();
    } catch (err: any) {
      setError(err.message || 'Could not send your details.');
      setSaving(false);
    }
  };

  return (
    <div data-testid="kyc-capture" className="bg-white rounded-xl shadow p-5 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-brand-navy">Verify your Skill ID</h2>
        <p className="text-xs text-gray-500">Your ID and your face, checked by a Qaribu reviewer. It takes about three minutes.</p>
      </div>
      {error && <p data-testid="kyc-error" className="text-red-500 text-sm">{error}</p>}

      {step === 'details' && (
        <form onSubmit={toPictures} className="space-y-4">
          <div>
            <label htmlFor="kycName" className="block text-sm font-medium text-gray-700">Full name, as on your ID</label>
            <input id="kycName" value={name} onChange={(e) => setName(e.target.value)} required minLength={5} maxLength={80} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="kycType" className="block text-sm font-medium text-gray-700">Kind of ID</label>
            <select id="kycType" value={idType} onChange={(e) => { setIdType(e.target.value as api.KycIdType); setFiles({}); }} className={fieldClass}>
              {ID_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="kycNumber" className="block text-sm font-medium text-gray-700">ID number</label>
            <input id="kycNumber" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} required inputMode={idType === 'passport' ? 'text' : 'numeric'} maxLength={20} className={fieldClass} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="shrink-0 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg">Cancel</button>
            <button type="submit" className={primaryButton}>Next: take pictures</button>
          </div>
        </form>
      )}

      {step === 'pictures' && (
        <div className="space-y-3">
          {parts.map((p) => (
            <div key={p} className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-semibold">{PART_LABEL[p]}</p>
                <p className="text-xs text-gray-500">{files[p] ? 'Taken' : 'Not taken yet'}</p>
              </div>
              <button type="button" onClick={() => setTaking(p)} data-testid={`kyc-open-${p}`} className="text-sm font-semibold border border-gray-300 rounded-lg px-3 py-2">
                {files[p] ? 'Retake' : 'Take'}
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep('details')} className="shrink-0 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg">Back</button>
            <button type="button" onClick={() => setStep('consent')} disabled={!allTaken} className={primaryButton}>Next</button>
          </div>
        </div>
      )}

      {step === 'consent' && (
        <div className="space-y-4">
          <div className="text-xs p-3 border rounded-lg bg-gray-50 text-gray-600 space-y-2">
            <p>Qaribu collects your name, ID number, a picture of your ID and a picture of your face to check that you are who you say you are, so that your Skill ID can be verified.</p>
            <p>The pictures are stored securely. Only a Qaribu reviewer can open them, and every time one is opened it is recorded. They are used to verify you and to answer a dispute or a lawful request, and for nothing else. They are never shown to other people.</p>
            <p>You can ask for your data to be removed. That ends your verified Skill ID.</p>
          </div>
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="h-5 w-5" data-testid="kyc-consent" />
            <span className="font-semibold text-sm">I agree, and these details are mine</span>
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep('pictures')} className="shrink-0 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg">Back</button>
            <button type="button" onClick={submit} disabled={!agreed || saving} className={primaryButton} data-testid="kyc-submit">{saving ? 'Sending…' : 'Send for review'}</button>
          </div>
        </div>
      )}

      {taking && (
        <CameraStep
          part={taking}
          onTaken={(ref) => {
            setFiles((f) => ({ ...f, [taking]: ref }));
            setTaking(null);
          }}
          onClose={() => setTaking(null)}
        />
      )}
    </div>
  );
};

export default KycCapture;
