/**
 * Payout and Escrow Economics Service for Tâches.ma
 * Moroccan Banking, Cash Plus, Wafacash, Remitly & Binance Pay
 */

export type PayoutMethod =
  | 'RIB'
  | 'CIH'
  | 'AWB'
  | 'BMCE'
  | 'CASHP'
  | 'WAFACASH'
  | 'REMITLY'
  | 'BINANCE_PAY'
  | 'CARD';

export type PayoutSpeed = 'STANDARD' | 'EXPRESS';

export interface PayoutFeeCalculation {
  requestedAmountDH: number;
  feeDH: number;
  netAmountDH: number;
  requestedAmountEur: number;
  feeEur: number;
  netAmountEur: number;
  estimatedHours: number;
  minimumThresholdDH: number;
  isValid: boolean;
  errorMessage?: string;
}

export const MIN_WITHDRAWAL_DH = 50; // Minimum withdrawal threshold set to 50 DH
export const MAD_TO_EUR_RATE = 0.1; // 10 MAD = 1 EUR standard platform accounting

export const PLATFORM_PERFORMER_COMMISSION_RATE = 0.15; // 15% platform commission on task completion
export const PLATFORM_CUSTOMER_ESCROW_FEE_RATE = 0.10; // 10% escrow fee charged to customer

export const MOROCCAN_BANKS_REGISTRY = [
  { code: '007', name: 'Attijariwafa bank', short: 'AWB' },
  { code: '230', name: 'CIH Bank', short: 'CIH' },
  { code: '011', name: 'Bank of Africa (BMCE)', short: 'BMCE' },
  { code: '190', name: 'Banque Populaire (BCP)', short: 'BCP' },
  { code: '022', name: 'Société Générale Maroc', short: 'SGMB' },
  { code: '013', name: 'BMCI (BNP Paribas)', short: 'BMCI' },
  { code: '021', name: 'Crédit du Maroc', short: 'CDM' },
  { code: '225', name: 'Crédit Agricole du Maroc', short: 'CAM' },
  { code: '350', name: 'Al Barid Bank', short: 'ABB' },
];

/**
 * Detects Moroccan bank from RIB (first 3 digits) or name string
 */
export function detectMoroccanBank(ribOrName: string): { code: string; name: string; short: string } {
  if (!ribOrName) return { code: '230', name: 'CIH Bank', short: 'CIH' };
  const clean = ribOrName.trim().replace(/\s+/g, '');
  const prefix = clean.slice(0, 3);
  const foundByCode = MOROCCAN_BANKS_REGISTRY.find((b) => b.code === prefix);
  if (foundByCode) return foundByCode;

  const lower = ribOrName.toLowerCase();
  const foundByName = MOROCCAN_BANKS_REGISTRY.find(
    (b) => lower.includes(b.name.toLowerCase()) || lower.includes(b.short.toLowerCase())
  );
  if (foundByName) return foundByName;

  return { code: '230', name: 'CIH Bank', short: 'CIH' };
}

/**
 * Validates 24-digit Moroccan RIB using Bank Al-Maghrib modulus 97 algorithm
 */
export function validateMoroccanRIB(rawRib: string): { isValid: boolean; bankName?: string; error?: string } {
  if (!rawRib) {
    return { isValid: false, error: 'RIB bancaire requis.' };
  }
  const clean = rawRib.replace(/\s+/g, '');
  if (!/^\d{24}$/.test(clean)) {
    return {
      isValid: false,
      error: 'Le RIB bancaire marocain doit comporter exactement 24 chiffres.',
    };
  }

  const bank = detectMoroccanBank(clean);
  const accountBase = clean.slice(0, 22);
  const key = parseInt(clean.slice(22, 24), 10);

  try {
    const computedKey = 97 - Number(BigInt(accountBase + '00') % BigInt(97));
    const valid = computedKey === key;
    return {
      isValid: valid,
      bankName: bank.name,
      error: valid ? undefined : 'Clé de contrôle du RIB incorrecte. Vérifiez votre relevé bancaire.',
    };
  } catch {
    return { isValid: true, bankName: bank.name };
  }
}

/**
 * Calculates net withdrawal payout and processing fee
 */
export function calculatePayoutFees(
  amountDH: number,
  method: PayoutMethod | string = 'RIB',
  speedTierOrAvailableBalance: PayoutSpeed | string | number = 'STANDARD',
  availableBalanceDHParam?: number
): PayoutFeeCalculation {
  let speedTier: PayoutSpeed = 'STANDARD';
  let availableBalanceDH = 999999;

  if (typeof speedTierOrAvailableBalance === 'number') {
    availableBalanceDH = speedTierOrAvailableBalance;
  } else if (typeof speedTierOrAvailableBalance === 'string') {
    if (speedTierOrAvailableBalance === 'EXPRESS' || speedTierOrAvailableBalance === 'STANDARD') {
      speedTier = speedTierOrAvailableBalance as PayoutSpeed;
    }
    if (typeof availableBalanceDHParam === 'number') {
      availableBalanceDH = availableBalanceDHParam;
    }
  }

  let feeDH = 0;
  let estimatedHours = 24;

  const m = method.toUpperCase();

  if (m === 'BINANCE_PAY' || m === 'BINANCE' || m === 'USDT') {
    feeDH = 0;
    estimatedHours = 0.25;
  } else if (m === 'REMITLY') {
    feeDH = 0;
    estimatedHours = 12;
  } else if (m === 'CASHP' || m === 'WAFACASH') {
    feeDH = speedTier === 'EXPRESS' ? 20 : 15;
    estimatedHours = speedTier === 'EXPRESS' ? 1 : 4;
  } else {
    // Bank RIB / CIH / Attijari / BMCE
    feeDH = speedTier === 'EXPRESS' ? 25 : 15;
    estimatedHours = speedTier === 'EXPRESS' ? 2 : 24;
  }

  const netAmountDH = Math.max(0, amountDH - feeDH);
  const isValid = amountDH >= MIN_WITHDRAWAL_DH && amountDH <= availableBalanceDH && netAmountDH > 0;

  let errorMessage: string | undefined;
  if (amountDH < MIN_WITHDRAWAL_DH) {
    errorMessage = `Le montant minimum de retrait est de ${MIN_WITHDRAWAL_DH} DH.`;
  } else if (amountDH > availableBalanceDH) {
    errorMessage = `Le montant demandé (${amountDH} DH) dépasse votre solde disponible (${availableBalanceDH} DH).`;
  }

  return {
    requestedAmountDH: amountDH,
    feeDH,
    netAmountDH,
    requestedAmountEur: Number((amountDH * MAD_TO_EUR_RATE).toFixed(2)),
    feeEur: Number((feeDH * MAD_TO_EUR_RATE).toFixed(2)),
    netAmountEur: Number((netAmountDH * MAD_TO_EUR_RATE).toFixed(2)),
    estimatedHours,
    minimumThresholdDH: MIN_WITHDRAWAL_DH,
    isValid,
    errorMessage,
  };
}
