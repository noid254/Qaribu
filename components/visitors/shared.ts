// Small things the visitors screens share.

export const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner',
  manager: 'Manager',
  caretaker: 'Caretaker',
  tenant: 'Tenant',
  gateman: 'Gateman',
  staff: 'Staff',
};

export const roleLabel = (role: string) => ROLE_LABEL[role] ?? role;

// 24-hour clock in Nairobi, as the guard and the host would read it.
export const clock = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' }) : '';

// Contact picking is a browser feature (Chrome on Android, over HTTPS); elsewhere the person types the number.
export const canPickContacts = () =>
  typeof navigator !== 'undefined' && 'contacts' in navigator && typeof window !== 'undefined' && 'ContactsManager' in window;

// The nine digits after +254 must look like a Kenyan mobile number (they start with 7 or 1).
export const isKenyanMobile = (nineDigits: string) => /^[17]\d{8}$/.test(nineDigits);

export const PHONE_HELP = 'Enter a Kenyan mobile number: 9 digits starting with 7 or 1, for example 722123456.';

export const fieldClass =
  'mt-1 block w-full px-3 py-3 bg-gray-100 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-gold sm:text-sm';

export const primaryButton =
  'w-full bg-brand-gold text-brand-navy font-bold py-3 px-4 rounded-lg disabled:bg-gray-400 active-scale';
