import type { LanguageCode } from '../types/soundbox';

export interface SpokenPhraseResult {
  sentence: string;
  tokens: string[];
}

// --- FRENCH NUMBER TO WORDS ---
const FR_UNITS = [
  '',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
  'dix-sept',
  'dix-huit',
  'dix-neuf',
];

const FR_TENS = [
  '',
  'dix',
  'vingt',
  'trente',
  'quarante',
  'cinquante',
  'soixante',
  'soixante-dix',
  'quatre-vingts',
  'quatre-vingt-dix',
];

function frenchUnder1000(num: number): string {
  if (num === 0) return '';
  if (num < 20) return FR_UNITS[num];

  if (num < 70) {
    const tens = Math.floor(num / 10);
    const remainder = num % 10;
    if (remainder === 1 && tens < 7) {
      return `${FR_TENS[tens]} et un`;
    }
    return remainder ? `${FR_TENS[tens]}-${FR_UNITS[remainder]}` : FR_TENS[tens];
  }

  if (num < 80) {
    const remainder = num - 60;
    if (remainder === 11) return 'soixante et onze';
    return `soixante-${FR_UNITS[remainder]}`;
  }

  if (num < 100) {
    const remainder = num - 80;
    if (remainder === 0) return 'quatre-vingts';
    return `quatre-vingt-${FR_UNITS[remainder]}`;
  }

  // 100 - 999
  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;
  let hundredStr = hundreds === 1 ? 'cent' : `${FR_UNITS[hundreds]} cents`;
  if (remainder) {
    if (hundreds > 1) hundredStr = `${FR_UNITS[hundreds]} cent`;
    return `${hundredStr} ${frenchUnder1000(remainder)}`;
  }
  return hundredStr;
}

export function frenchNumberToWords(num: number): string {
  if (num === 0) return 'zéro';
  if (num > 10_000_000) return num.toLocaleString('fr-FR');

  const millions = Math.floor(num / 1_000_000);
  const remainderAfterMillions = num % 1_000_000;
  const thousands = Math.floor(remainderAfterMillions / 1000);
  const remainder = remainderAfterMillions % 1000;

  const parts: string[] = [];

  if (millions > 0) {
    parts.push(millions === 1 ? 'un million' : `${frenchUnder1000(millions)} millions`);
  }

  if (thousands > 0) {
    parts.push(thousands === 1 ? 'mille' : `${frenchUnder1000(thousands)} mille`);
  }

  if (remainder > 0) {
    parts.push(frenchUnder1000(remainder));
  }

  return parts.join(' ').trim();
}

// --- WOLOF NUMBER TO WORDS ---
// Senegalese Wolof cardinal structure:
// 1 = benn, 2 = ñaar, 3 = ñett, 4 = ñent, 5 = juróom
// 6 = juróom-benn, 7 = juróom-ñaar, 8 = juróom-ñett, 9 = juróom-ñent
// 10 = fukk
// 20 = ñaar fukk, 30 = fanweer, 40 = ñent fukk, 50 = juróom fukk
// 100 = téeméer, 500 = juróomi téeméer
// 1,000 = junni, 2,000 = ñaari junni, 5,000 = juróomi junni
// 10,000 = fukki junni, 1,000,000 = milyoŋ

const WO_UNITS: Record<number, string> = {
  1: 'benn',
  2: 'ñaar',
  3: 'ñett',
  4: 'ñent',
  5: 'juróom',
  6: 'juróom-benn',
  7: 'juróom-ñaar',
  8: 'juróom-ñett',
  9: 'juróom-ñent',
};

const WO_TENS: Record<number, string> = {
  10: 'fukk',
  20: 'ñaar-fukk',
  30: 'fanweer',
  40: 'ñent-fukk',
  50: 'juróom-fukk',
  60: 'juróom-benn-fukk',
  70: 'juróom-ñaar-fukk',
  80: 'juróom-ñett-fukk',
  90: 'juróom-ñent-fukk',
};

function wolofUnder100(num: number): string {
  if (num <= 0) return '';
  if (num < 10) return WO_UNITS[num] || '';
  if (WO_TENS[num]) return WO_TENS[num];

  const tens = Math.floor(num / 10) * 10;
  const unit = num % 10;
  const tensStr = WO_TENS[tens] || '';
  const unitStr = WO_UNITS[unit] || '';

  return `${tensStr} ak ${unitStr}`;
}

function wolofUnder1000(num: number): string {
  if (num < 100) return wolofUnder100(num);

  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;

  let hundredStr = '';
  if (hundreds === 1) {
    hundredStr = 'téeméer';
  } else if (hundreds === 5) {
    hundredStr = 'juróomi téeméer';
  } else {
    const hPrefix = WO_UNITS[hundreds] || '';
    hundredStr = `${hPrefix}i téeméer`;
  }

  if (remainder > 0) {
    return `${hundredStr} ak ${wolofUnder100(remainder)}`;
  }
  return hundredStr;
}

export function wolofNumberToWords(num: number): string {
  if (num <= 0) return 'tus';
  if (num > 10_000_000) return `${num.toLocaleString('fr-SN')} CFA`;

  const millions = Math.floor(num / 1_000_000);
  const remainderAfterMillions = num % 1_000_000;
  const thousands = Math.floor(remainderAfterMillions / 1000);
  const remainder = remainderAfterMillions % 1000;

  const parts: string[] = [];

  if (millions > 0) {
    if (millions === 1) {
      parts.push('benn milyoŋ');
    } else {
      parts.push(`${wolofUnder1000(millions)} milyoŋ`);
    }
  }

  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('junni');
    } else if (thousands === 5) {
      parts.push('juróomi junni');
    } else if (thousands === 2) {
      parts.push('ñaari junni');
    } else if (thousands === 10) {
      parts.push('fukki junni');
    } else {
      parts.push(`${wolofUnder1000(thousands)}i junni`);
    }
  }

  if (remainder > 0) {
    if (parts.length > 0) {
      parts.push(`ak ${wolofUnder1000(remainder)}`);
    } else {
      parts.push(wolofUnder1000(remainder));
    }
  }

  return parts.join(' ').trim();
}

// --- ENGLISH NUMBER TO WORDS ---
const EN_UNITS = [
  '',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
];

const EN_TENS = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
];

function englishUnder1000(num: number): string {
  if (num === 0) return '';
  if (num < 20) return EN_UNITS[num];
  if (num < 100) {
    const tens = Math.floor(num / 10);
    const rem = num % 10;
    return rem ? `${EN_TENS[tens]}-${EN_UNITS[rem]}` : EN_TENS[tens];
  }

  const hundreds = Math.floor(num / 100);
  const rem = num % 100;
  if (rem) {
    return `${EN_UNITS[hundreds]} hundred ${englishUnder1000(rem)}`;
  }
  return `${EN_UNITS[hundreds]} hundred`;
}

export function englishNumberToWords(num: number): string {
  if (num === 0) return 'zero';
  if (num > 10_000_000) return num.toLocaleString('en-US');

  const millions = Math.floor(num / 1_000_000);
  const remAfterMil = num % 1_000_000;
  const thousands = Math.floor(remAfterMil / 1000);
  const rem = remAfterMil % 1000;

  const parts: string[] = [];
  if (millions > 0) parts.push(`${englishUnder1000(millions)} million`);
  if (thousands > 0) parts.push(`${englishUnder1000(thousands)} thousand`);
  if (rem > 0) parts.push(englishUnder1000(rem));

  return parts.join(' ').trim();
}

/**
 * Main export: formats an XOF amount into natural phrasing and tokens.
 */
export function formatSpokenXofAmount(
  amountXof: number,
  language: LanguageCode
): SpokenPhraseResult {
  const safeAmount = Math.max(0, Math.round(amountXof));

  if (language === 'wo') {
    const words = wolofNumberToWords(safeAmount);
    return {
      sentence: `${words} Franc CFA jot na ci Lightning.`,
      tokens: [
        'jot_naa',
        ...words
          .toLowerCase()
          .replace(/[-]/g, ' ')
          .split(/\s+/)
          .filter(Boolean),
        'franc_cfa',
      ],
    };
  }

  if (language === 'en') {
    const words = englishNumberToWords(safeAmount);
    return {
      sentence: `Payment of ${words} CFA Francs received on Lightning.`,
      tokens: [
        'payment_received',
        ...words
          .toLowerCase()
          .replace(/[-]/g, ' ')
          .split(/\s+/)
          .filter(Boolean),
        'cfa_francs',
      ],
    };
  }

  // Default: French
  const words = frenchNumberToWords(safeAmount);
  return {
    sentence: `Paiement de ${words} Francs CFA reçu sur Lightning.`,
    tokens: [
      'paiement_recu',
      ...words
        .toLowerCase()
        .replace(/[-]/g, ' ')
        .split(/\s+/)
        .filter(Boolean),
      'francs_cfa',
    ],
  };
}
