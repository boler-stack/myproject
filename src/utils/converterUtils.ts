export const BaseFormats = {
  DECIMAL: 10,
  HEXADECIMAL: 16,
  BINARY: 2,
  OCTAL: 8,
} as const;

export type BaseType = keyof typeof BaseFormats;

export const convertValue = (value: string, fromBase: number): Record<BaseType, string> => {
  if (!value) {
    return {
      DECIMAL: '',
      HEXADECIMAL: '',
      BINARY: '',
      OCTAL: '',
    };
  }

  try {
    const num = parseInt(value, fromBase);
    if (isNaN(num)) throw new Error('Invalid number');

    return {
      DECIMAL: num.toString(10),
      HEXADECIMAL: num.toString(16).toUpperCase(),
      BINARY: num.toString(2),
      OCTAL: num.toString(8),
    };
  } catch {
    return {
      DECIMAL: 'Error',
      HEXADECIMAL: 'Error',
      BINARY: 'Error',
      OCTAL: 'Error',
    };
  }
};

export const isValidForBase = (value: string, base: number): boolean => {
  if (!value) return true;
  const regexes: Record<number, RegExp> = {
    10: /^[0-9]*$/,
    16: /^[0-9A-Fa-f]*$/,
    2: /^[0-1]*$/,
    8: /^[0-7]*$/,
  };
  return regexes[base]?.test(value) ?? false;
};
