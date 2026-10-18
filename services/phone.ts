// Kenyan mobile numbers as the invite form takes them: the nine digits after +254.

// "0722 123 456", "+254722123456" and "254722123456" all give "722123456". Anything else gives null.
export const nineDigitPhone = (raw: string): string | null => {
    const digits = raw.replace(/\D/g, '');
    const local = digits.startsWith('254') ? digits.slice(3) : digits.startsWith('0') ? digits.slice(1) : digits;
    return /^[17]\d{8}$/.test(local) ? local : null;
};
