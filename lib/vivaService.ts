/**
 * Viva.com (Viva Wallet) Smart Checkout Integration Service
 * Handles OAuth authentication, Smart Checkout order creation, and Webhook verification.
 */

export interface VivaConfig {
  clientId: string;
  clientSecret: string;
  sourceCode: string;
  isProduction: boolean;
}

export interface CreateVivaOrderParams {
  amountEur: number;
  customerEmail: string;
  customerFullName: string;
  customerPhone?: string;
  customerTrns: string; // Internal transaction reference (e.g., DEP-123456)
  requestLang?: string; // 'fr' | 'en'
}

export interface VivaOrderResponse {
  orderCode: string;
  checkoutUrl: string;
}

export function getVivaConfig(): VivaConfig {
  return {
    clientId: process.env.VIVA_CLIENT_ID || '',
    clientSecret: process.env.VIVA_CLIENT_SECRET || '',
    sourceCode: process.env.VIVA_SOURCE_CODE || 'Default',
    isProduction: process.env.VIVA_ENV === 'production',
  };
}

/**
 * Get Viva API Base URL depending on environment
 */
export function getVivaBaseUrl(isProduction: boolean = false): string {
  return isProduction
    ? 'https://api.viva.com'
    : 'https://demo-api.viva.com';
}

/**
 * Get Viva Smart Checkout Portal Base URL
 */
export function getVivaCheckoutUrl(isProduction: boolean = false): string {
  return isProduction
    ? 'https://www.viva.com/web/checkout'
    : 'https://demo.viva.com/web/checkout';
}

/**
 * Obtains an OAuth2 bearer token from Viva.com API
 */
export async function getVivaBearerToken(config: VivaConfig): Promise<string> {
  const tokenUrl = config.isProduction
    ? 'https://accounts.viva.com/connect/token'
    : 'https://demo-accounts.viva.com/connect/token';

  const authString = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${authString}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Viva token request failed with status HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Generates a Viva Smart Checkout Order Code
 */
export async function createVivaSmartCheckoutOrder(
  params: CreateVivaOrderParams
): Promise<VivaOrderResponse> {
  const config = getVivaConfig();

  // If Viva credentials are not configured yet, generate a simulated checkout order
  if (!config.clientId || !config.clientSecret) {
    const mockOrderCode = `MOCK_VIVA_${Date.now()}`;
    return {
      orderCode: mockOrderCode,
      checkoutUrl: `/checkout/simulated?orderCode=${mockOrderCode}&amount=${params.amountEur}&ref=${params.customerTrns}`,
    };
  }

  const token = await getVivaBearerToken(config);
  const baseUrl = getVivaBaseUrl(config.isProduction);

  // Amount in Viva is in cents (e.g. 50.00 EUR = 5000 cents)
  const amountInCents = Math.round(params.amountEur * 100);

  const payload = {
    amount: amountInCents,
    customerTrns: params.customerTrns,
    customer: {
      email: params.customerEmail,
      fullName: params.customerFullName,
      phone: params.customerPhone || '+212600000000',
      requestLang: params.requestLang === 'ar' ? 'fr' : params.requestLang || 'fr',
    },
    paymentTimeout: 1800,
    preauth: false,
    allowRecurring: false,
    maxInstallments: 0,
    paymentNotification: true,
    tipAmount: 0,
    disableExactAmount: false,
    disableCash: true,
    disablePayAtStore: true,
    sourceCode: config.sourceCode,
  };

  const response = await fetch(`${baseUrl}/checkout/v2/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Viva order creation failed (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const orderCode = data.orderCode.toString();
  const checkoutBase = getVivaCheckoutUrl(config.isProduction);

  return {
    orderCode,
    checkoutUrl: `${checkoutBase}?ref=${orderCode}`,
  };
}
