/**
 * Anti-Circumvention & Platform Protection Engine for Tâches.ma
 * Modeled after Workzilla & Upwork contact filtering algorithms.
 * Protects users under Daman Escrow and prevents disintermediation.
 */

// Moroccan phone regexes: 06, 07, 05, +212, 00212 with various separators
const MOROCCAN_PHONE_REGEX = /(?:\+?212|00212|0)[-\s.]*[5-7](?:[-\s.]*\d){8}\b/gi;

// General international phone sequences (7 to 14 consecutive digits with spaces/dots/dashes)
const GENERIC_PHONE_REGEX = /(?:\+\d{1,3}[-.\s]*)?\(?\d{2,4}\)?[-.\s]*\d{2,4}[-.\s]*\d{2,4}[-.\s]*\d{0,4}/g;

// Standard email regex
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;

// External social & messaging keywords and direct bypass channels
const PROHIBITED_KEYWORDS_REGEX = /\b(whatsapp|wtsp|watssap|whtsp|watsap|wa\.me|telegram|t\.me|viber|skype|wechat|snapchat|cashplus\s*direct|wafacash\s*direct|virement\s*direct)\b/gi;

export interface AntiCircumventionResult {
  hasViolation: boolean;
  sanitizedText: string;
  detectedPatterns: string[];
  warningMessage?: string;
}

/**
 * Inspects content for off-platform contact leaks.
 * If detected, replaces the sensitive snippets with a Daman Escrow security placeholder.
 */
export function filterOffPlatformContact(text: string): AntiCircumventionResult {
  if (!text || typeof text !== 'string') {
    return { hasViolation: false, sanitizedText: text || '', detectedPatterns: [] };
  }

  let sanitized = text;
  const detected: string[] = [];

  // 1. Detect and mask Moroccan and general phones
  const phoneMatches = text.match(MOROCCAN_PHONE_REGEX);
  if (phoneMatches && phoneMatches.length > 0) {
    phoneMatches.forEach((match) => {
      // Avoid false positive on simple short numbers
      const digitsOnly = match.replace(/\D/g, '');
      if (digitsOnly.length >= 9) {
        detected.push(`Numéro de téléphone (${match.trim()})`);
        sanitized = sanitized.replace(match, '🛡️ [Numéro masqué par sécurité Daman]');
      }
    });
  }

  // 2. Detect and mask email addresses
  const emailMatches = text.match(EMAIL_REGEX);
  if (emailMatches && emailMatches.length > 0) {
    emailMatches.forEach((match) => {
      detected.push(`Adresse email (${match.trim()})`);
      sanitized = sanitized.replace(match, '🛡️ [Email masqué par sécurité Daman]');
    });
  }

  // 3. Detect bypass direct keywords (e.g. WhatsApp, Telegram, CashPlus direct)
  const keywordMatches = text.match(PROHIBITED_KEYWORDS_REGEX);
  if (keywordMatches && keywordMatches.length > 0) {
    keywordMatches.forEach((match) => {
      detected.push(`Canal externe (${match.trim()})`);
      sanitized = sanitized.replace(match, '🛡️ [Canal externe masqué]');
    });
  }

  const hasViolation = detected.length > 0;
  const warningMessage = hasViolation
    ? "Rappel de sécurité Tâches.ma : Tout échange de coordonnées hors plateforme (WhatsApp, Téléphone, Virement direct) avant attribution sous séquestre Daman est strictement interdit pour votre protection financière."
    : undefined;

  return {
    hasViolation,
    sanitizedText: sanitized,
    detectedPatterns: Array.from(new Set(detected)),
    warningMessage,
  };
}
