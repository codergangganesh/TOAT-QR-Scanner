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
