/**
 * Payout and Escrow Economics Service for Tâches.ma
 * Work-zilla Inspired Monetization and Multi-channel Payout Logic
 */

export type PayoutMethod = 'RIB' | 'CASHPLUS' | 'BINANCE_PAY' | 'USDT';
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

export interface MoroccanBankInfo {
  code: string;
  name: string;
  shortName: string;
  color: string;
  bg: string;
  logoText: string;
}

export const MOROCCAN_BANKS: Record<string, MoroccanBankInfo> = {
  '230': { code: '230', name: 'CIH Bank (Crédit Immobilier et Hôtelier)', shortName: 'CIH Bank', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', logoText: 'CIH' },
  '007': { code: '007', name: 'Attijariwafa Bank', shortName: 'Attijariwafa', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200', logoText: 'AWB' },
  '181': { code: '181', name: 'Banque Populaire (BCP)', shortName: 'Banque Populaire', color: 'text-yellow-800', bg: 'bg-yellow-50 border-yellow-200', logoText: 'BCP' },
  '190': { code: '190', name: 'Banque Populaire (BCP)', shortName: 'Banque Populaire', color: 'text-yellow-800', bg: 'bg-yellow-50 border-yellow-200', logoText: 'BCP' },
  '145': { code: '145', name: 'Banque Populaire (BCP)', shortName: 'Banque Populaire', color: 'text-yellow-800', bg: 'bg-yellow-50 border-yellow-200', logoText: 'BCP' },
  '101': { code: '101', name: 'Banque Populaire (BCP)', shortName: 'Banque Populaire', color: 'text-yellow-800', bg: 'bg-yellow-50 border-yellow-200', logoText: 'BCP' },
  '011': { code: '011', name: 'Bank of Africa (BMCE Group)', shortName: 'Bank of Africa', color: 'text-blue-800', bg: 'bg-blue-50 border-blue-200', logoText: 'BOA' },
  '013': { code: '013', name: 'BMCI (BNP Paribas)', shortName: 'BMCI', color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200', logoText: 'BMCI' },
  '022': { code: '022', name: 'Société Générale Maroc (SGMB)', shortName: 'Société Générale', color: 'text-rose-800', bg: 'bg-rose-50 border-rose-200', logoText: 'SG' },
  '050': { code: '050', name: 'Crédit Agricole du Maroc (CAM)', shortName: 'Crédit Agricole', color: 'text-green-800', bg: 'bg-green-50 border-green-200', logoText: 'CAM' },
  '021': { code: '021', name: 'Crédit du Maroc (CDM)', shortName: 'Crédit du Maroc', color: 'text-cyan-800', bg: 'bg-cyan-50 border-cyan-200', logoText: 'CDM' },
  '350': { code: '350', name: 'Al Barid Bank (Poste Maroc)', shortName: 'Al Barid Bank', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200', logoText: 'ABB' },
  '019': { code: '019', name: 'CFG Bank', shortName: 'CFG Bank', color: 'text-indigo-800', bg: 'bg-indigo-50 border-indigo-200', logoText: 'CFG' },
  '310': { code: '310', name: 'Umnia Bank', shortName: 'Umnia Bank', color: 'text-teal-800', bg: 'bg-teal-50 border-teal-200', logoText: 'UMN' },
  '320': { code: '320', name: 'Bank Assafa', shortName: 'Bank Assafa', color: 'text-purple-800', bg: 'bg-purple-50 border-purple-200', logoText: 'ASF' },
};

export const MIN_WITHDRAWAL_DH = 1000; // Minimum withdrawal threshold set to 1000 DH
export const MAD_TO_EUR_RATE = 0.1; // 10 MAD = 1 EUR standard platform accounting

export const PLATFORM_PERFORMER_COMMISSION_RATE = 0.15; // 15% platform commission on task completion
export const PLATFORM_CUSTOMER_ESCROW_FEE_RATE = 0.10; // 10% escrow fee charged to customer

/**
 * Calculates net withdrawal payout and processing fee based on method and speed tier
 */
export function calculatePayoutFees(
  amountDH: number,
  method: PayoutMethod,
  speed: PayoutSpeed = 'STANDARD',
  availableBalanceDH: number = 0
): PayoutFeeCalculation {
  let feeDH = 0;
  let estimatedHours = 24;

  if (method === 'RIB') {
    if (speed === 'EXPRESS') {
      feeDH = Math.max(35, Math.round(amountDH * 0.04));
      estimatedHours = 2;
    } else {
      feeDH = 15;
      estimatedHours = 24;
    }
  } else if (method === 'CASHPLUS') {
    feeDH = Math.max(20, Math.round(amountDH * 0.035));
    estimatedHours = speed === 'EXPRESS' ? 1 : 12;
  } else if (method === 'BINANCE_PAY') {
    feeDH = 10; // ~1 USDT flat fee
    estimatedHours = 0.25; // 15 mins
  } else if (method === 'USDT') {
    feeDH = 15; // ~1.5 USDT network gas fee
    estimatedHours = 0.5; // 30 mins
  }

  const netAmountDH = Math.max(0, amountDH - feeDH);
  const isValid = amountDH >= MIN_WITHDRAWAL_DH && amountDH <= availableBalanceDH && netAmountDH > 0;

  let errorMessage: string | undefined;
  if (amountDH < MIN_WITHDRAWAL_DH) {
    errorMessage = `Le montant minimum de retrait est de ${MIN_WITHDRAWAL_DH} DH.`;
  } else if (amountDH > availableBalanceDH) {
    errorMessage = `Le montant demandé dépasse votre solde disponible (${availableBalanceDH} DH).`;
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

/**
 * Validates a 24-digit Moroccan RIB (Relevé d'Identité Bancaire)
 */
export function validateMoroccanRIB(rib: string): { isValid: boolean; bank: MoroccanBankInfo | null; cleanRib: string } {
  const cleanRib = rib.replace(/[^0-9]/g, '');
  if (cleanRib.length !== 24) {
    return { isValid: false, bank: null, cleanRib };
  }

  const bankCode = cleanRib.substring(0, 3);
  const bank = MOROCCAN_BANKS[bankCode] || null;

  return {
    isValid: true,
    bank,
    cleanRib,
  };
}

/**
 * Detects Moroccan bank from partial or complete RIB
 */
export function detectMoroccanBank(rib: string): MoroccanBankInfo | null {
  const clean = rib.replace(/[^0-9]/g, '');
  if (clean.length >= 3) {
    const code = clean.substring(0, 3);
    return MOROCCAN_BANKS[code] || null;
  }
  return null;
}
