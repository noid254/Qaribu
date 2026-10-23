import React from 'react';

interface FormLineProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  max?: number;
  placeholder?: string;
  multiline?: boolean;
  hint?: string;
}

// One field on its own line: a small grey label over a plain input with a rule beneath, as on the earlier Nikosoko form.
export const FormLine: React.FC<FormLineProps> = ({ label, value, onChange, max, placeholder, multiline, hint }) => {
  const id = `fl-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div className="border-b border-gray-200 py-3">
      <label htmlFor={id} className="block text-xs text-gray-400 font-medium mb-1">{label}</label>
      {multiline ? (
        <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} maxLength={max} rows={4} placeholder={placeholder} className="w-full text-base text-gray-800 bg-transparent focus:outline-none resize-none" />
      ) : (
        <input id={id} type="text" value={value} onChange={(e) => onChange(e.target.value)} maxLength={max} placeholder={placeholder} className="w-full text-base text-gray-800 bg-transparent focus:outline-none" />
      )}
      {(hint || max) && (
        <p className="text-xs text-gray-400 mt-1 flex justify-between">
          <span>{hint ?? ''}</span>
          {max ? <span>{value.length}/{max}</span> : null}
        </p>
      )}
    </div>
  );
};
