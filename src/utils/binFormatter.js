/**
 * Utility functions for parsing, formatting, and validating
 * Warehouse TOAT Bin Codes & Location Codes.
 *
 * Supported Warehouse Formats:
 * 1. 4-Segment TOAT: [PREFIX]-[AISLE]-[BAY]-[SHELF]-[SLOT]
 *    e.g. A1B15  -> CPLM-A-1-B-15
 *    e.g. a2c20  -> CPLM-A-2-C-20
 * 2. 2-Segment Location: [PREFIX]-[ZONE/AISLE]-[BAY/BIN]
 *    e.g. A18    -> CPLM-A-18
 *    e.g. a18    -> CPLM-A-18
 *    e.g. B05    -> CPLM-B-05
 *
 * Rules:
 * - Fixed prefix: CPLM-
 * - Auto-uppercase
 * - Exact QR payload matches formatted code
 */

export const FIXED_PREFIX = 'CPLM-';

/**
 * Sanitizes input by stripping existing 'CPLM-' prefix, extra spaces,
 * and converts to uppercase alphanumeric.
 * @param {string} input - raw text from user or paste
 * @returns {string} cleaned suffix
 */
export function sanitizeInput(input) {
  if (!input) return '';

  let cleaned = input.trim().toUpperCase();

  // Strip leading CPLM- or CPLM if present
  if (cleaned.startsWith('CPLM-')) {
    cleaned = cleaned.slice(5);
  } else if (cleaned.startsWith('CPLM')) {
    cleaned = cleaned.slice(4);
  }

  // Remove leading/trailing spaces and internal spaces
  cleaned = cleaned.replace(/\s+/g, '');

  // Strip any characters other than A-Z, 0-9, and hyphen
  return cleaned.replace(/[^A-Z0-9-]/g, '');
}

/**
 * Normalizes spoken speech input into a clean alphanumeric bin suffix.
 * Handles spoken words like "A one B fifteen" -> "A1B15" or "A eighteen" -> "A18".
 * @param {string} text - speech recognition transcript
 * @returns {string} normalized suffix
 */
export function normalizeSpokenBin(text) {
  if (!text) return '';

  let str = text.toLowerCase().trim();

  // Strip leading CPLM if spoken
  str = str.replace(/\bcplm\b/gi, '').replace(/\bc\s*p\s*l\s*m\b/gi, '');

  // Replace compound tens (21 to 29)
  const compounds = {
    'twenty one': '21', 'twenty-one': '21',
    'twenty two': '22', 'twenty-two': '22',
    'twenty three': '23', 'twenty-three': '23',
    'twenty four': '24', 'twenty-four': '24',
    'twenty five': '25', 'twenty-five': '25',
    'twenty six': '26', 'twenty-six': '26',
    'twenty seven': '27', 'twenty-seven': '27',
    'twenty eight': '28', 'twenty-eight': '28',
    'twenty nine': '29', 'twenty-nine': '29'
  };
  for (const [k, v] of Object.entries(compounds)) {
    str = str.replaceAll(k, v);
  }

  // Replace single number words
  const singles = {
    zero: '0', one: '1', won: '1', two: '2', to: '2', too: '2',
    three: '3', four: '4', for: '4', fore: '4', five: '5',
    six: '6', seven: '7', eight: '8', ate: '8', nine: '9',
    ten: '10', eleven: '11', twelve: '12', thirteen: '13',
    fourteen: '14', fifteen: '15', sixteen: '16', seventeen: '17',
    eighteen: '18', nineteen: '19', twenty: '20', thirty: '30'
  };
  for (const [k, v] of Object.entries(singles)) {
    str = str.replace(new RegExp(`\\b${k}\\b`, 'gi'), v);
  }

  // Strip all non-alphanumerics except hyphen
  let cleaned = str.toUpperCase().replace(/[^A-Z0-9-]/g, '');

  // Strip CPLM if still remaining
  if (cleaned.startsWith('CPLM-')) {
    cleaned = cleaned.slice(5);
  } else if (cleaned.startsWith('CPLM')) {
    cleaned = cleaned.slice(4);
  }

  return cleaned.replace(/-/g, '');
}

/**
 * Parses and formats bin code according to warehouse TOAT standards.
 *
 * @param {string} rawInput
 * @returns {{
 *   rawSuffix: string,
 *   displayInput: string,
 *   formattedCode: string,
 *   isValid: boolean,
 *   statusMessage: string
 * }}
 */
export function parseBinCode(rawInput) {
  const sanitized = sanitizeInput(rawInput);

  if (!sanitized) {
    return {
      rawSuffix: '',
      displayInput: '',
      formattedCode: '',
      isValid: false,
      statusMessage: 'Awaiting bin code',
    };
  }

  // Strip hyphens to analyze structure
  const cleanChars = sanitized.replace(/-/g, '');

  // Format 1: 4-Segment TOAT [Letter(s)][Digit(s)][Letter(s)][Digit(s)]
  // e.g. A1B15 -> CPLM-A-1-B-15
  const toatPattern4 = /^([A-Z]+)(\d+)([A-Z]+)(\d+)$/;
  const match4 = cleanChars.match(toatPattern4);

  if (match4) {
    const [, aisle, bay, shelf, slot] = match4;
    const formattedCode = `${FIXED_PREFIX}${aisle}-${bay}-${shelf}-${slot}`;
    return {
      rawSuffix: cleanChars,
      displayInput: cleanChars,
      formattedCode,
      isValid: true,
      statusMessage: 'Ready to Scan',
    };
  }

  // Format 2: 2-Segment Location [Letter(s)][Digit(s)]
  // e.g. A18 -> CPLM-A-18, B2 -> CPLM-B-2
  const toatPattern2 = /^([A-Z]+)(\d+)$/;
  const match2 = cleanChars.match(toatPattern2);

  if (match2) {
    const [, aisle, num] = match2;
    const formattedCode = `${FIXED_PREFIX}${aisle}-${num}`;
    return {
      rawSuffix: cleanChars,
      displayInput: cleanChars,
      formattedCode,
      isValid: true,
      statusMessage: 'Ready to Scan',
    };
  }

  // Handle case where user explicitly types custom hyphens e.g. A-1-B-15
  const manualHyphen4 = /^([A-Z]+)-(\d+)-([A-Z]+)-(\d+)$/;
  const matchManual4 = sanitized.match(manualHyphen4);
  if (matchManual4) {
    const [, aisle, bay, shelf, slot] = matchManual4;
    const formattedCode = `${FIXED_PREFIX}${aisle}-${bay}-${shelf}-${slot}`;
    return {
      rawSuffix: cleanChars,
      displayInput: cleanChars,
      formattedCode,
      isValid: true,
      statusMessage: 'Ready to Scan',
    };
  }

  // Handle case where user explicitly types custom hyphens e.g. A-18
  const manualHyphen2 = /^([A-Z]+)-(\d+)$/;
  const matchManual2 = sanitized.match(manualHyphen2);
  if (matchManual2) {
    const [, aisle, num] = matchManual2;
    const formattedCode = `${FIXED_PREFIX}${aisle}-${num}`;
    return {
      rawSuffix: cleanChars,
      displayInput: cleanChars,
      formattedCode,
      isValid: true,
      statusMessage: 'Ready to Scan',
    };
  }

  // Partial match detection for real-time guidance
  const partialLettersOnly = /^([A-Z]+)$/;
  const partialIncomplete4 = /^([A-Z]+)(\d+)([A-Z]+)$/;

  let hint = 'Incomplete bin code (e.g. A18 or A1B15)';
  if (partialLettersOnly.test(cleanChars)) {
    hint = 'Enter number (e.g. 18 or 1B15)';
  } else if (partialIncomplete4.test(cleanChars)) {
    hint = 'Enter bin slot (e.g. 15)';
  }

  return {
    rawSuffix: cleanChars,
    displayInput: cleanChars,
    formattedCode: cleanChars.length > 0 ? `${FIXED_PREFIX}${cleanChars}` : '',
    isValid: false,
    statusMessage: hint,
  };
}

/**
 * Calculates the next (+1) or previous (-1) sequential bin code.
 * Supports:
 * - 4-Segment TOAT (e.g. A1B15 -> A1B16 / A1B14)
 * - 2-Segment Location (e.g. A18 -> A19 / A17)
 *
 * @param {string} rawInput - current bin code string
 * @param {number} direction - +1 for next, -1 for previous
 * @returns {string|null} new bin suffix or null if cannot step
 */
export function stepBinCode(rawInput, direction) {
  const sanitized = sanitizeInput(rawInput);
  if (!sanitized) return null;

  const cleanChars = sanitized.replace(/-/g, '');

  // 4-Segment TOAT: [Aisle][Bay][Shelf][Slot] e.g. A1B15
  const match4 = cleanChars.match(/^([A-Z]+)(\d+)([A-Z]+)(\d+)$/);
  if (match4) {
    const [, aisle, bay, shelf, slotStr] = match4;
    const slot = parseInt(slotStr, 10);
    const newSlot = Math.max(1, slot + direction);
    return `${aisle}${bay}${shelf}${newSlot}`;
  }

  // 2-Segment Location: [Aisle/Zone][Slot/Bin] e.g. A18
  const match2 = cleanChars.match(/^([A-Z]+)(\d+)$/);
  if (match2) {
    const [, aisle, numStr] = match2;
    const num = parseInt(numStr, 10);
    const newNum = Math.max(1, num + direction);
    return `${aisle}${newNum}`;
  }

  return null;
}

