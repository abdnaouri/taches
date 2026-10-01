/**
 * ============================================================
 * tâches.ma — Enterprise DataLayer Service
 * Core GTM DataLayer push engine with full type safety
 * ============================================================
 *
 * Features:
 *  - Type-safe dataLayer.push() wrapper
 *  - Automatic metadata enrichment (timestamp, locale, env)
 *  - Consent Mode v2 support
 *  - GA4 e-commerce item builder for tâches.ma tasks
 *  - Debug mode with structured console output
 *  - Queue management for pre-GTM pushes
 *  - No-op safely if window.dataLayer not available (SSR)
 */

import type {
  DataLayerEvent,
  ConsentState,
  ConsentUpdateType,
  GA4Item,
  Currency,
  TaskCategory,
} from './events';

// ─── Global window augmentation ──────────────────────────────────────────

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag: (...args: unknown[]) => void;
  }
}

// ─── Configuration ────────────────────────────────────────────────────────

const IS_PRODUCTION =
  typeof process !== 'undefined' &&
  process.env.NODE_ENV === 'production';

const IS_DEBUG =
  typeof window !== 'undefined' &&
  (window.location?.search?.includes('debug_analytics=1') ||
    !IS_PRODUCTION);

const PLATFORM = 'taches.ma';
const MAD_TO_EUR = 0.092; // 1 MAD ≈ 0.092 EUR (2026 rate, ~10.87 MAD/EUR)

// ─── DataLayer Initializer ────────────────────────────────────────────────

/**
 * Ensures window.dataLayer array exists.
 * Must be called before any push — GTMProvider calls this on mount.
 */
export function initDataLayer(): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
}

// ─── Consent Mode v2 ──────────────────────────────────────────────────────

/**
 * Sets or updates Consent Mode v2 signals.
 * Call 'default' before GTM loads, 'update' after user grants/denies consent.
 *
 * @param type    'default' or 'update'
 * @param consent ConsentState signals
 */
export function setConsent(type: ConsentUpdateType, consent: Partial<ConsentState>): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];

  // Using gtag() format for Consent Mode v2 (required by Google)
  // This uses the dataLayer directly to avoid a dependency on gtag
  window.dataLayer.push({
    event: 'consent',
    '0': type,
    '1': consent,
  });

  // Also push via gtag if available
  if (typeof window.gtag === 'function') {
    window.gtag('consent', type, consent);
  }

  _debug('🔐 Consent Mode v2', { type, consent });
}

/**
 * Returns the default consent state (denied until user accepts).
 * Override with user preferences from localStorage.
 */
export function getDefaultConsentState(): ConsentState {
  const saved = _getSavedConsent();
  if (saved) return saved;

  return {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500,
  };
}

/**
 * Saves user's consent choice to localStorage and fires consent update.
 */
export function updateConsentChoice(granted: boolean): void {
  const state: ConsentState = {
    analytics_storage: granted ? 'granted' : 'denied',
    ad_storage: granted ? 'granted' : 'denied',
    ad_user_data: granted ? 'granted' : 'denied',
    ad_personalization: granted ? 'granted' : 'denied',
    functionality_storage: 'granted',
    personalization_storage: granted ? 'granted' : 'denied',
    security_storage: 'granted',
  };

  try {
    localStorage.setItem('taches_consent', JSON.stringify({ state, updatedAt: Date.now() }));
  } catch {}

  setConsent('update', state);
}

/** Checks if user has previously granted analytics consent. */
export function hasAnalyticsConsent(): boolean {
  const saved = _getSavedConsent();
  return saved?.analytics_storage === 'granted';
}

/** Checks if user has made a consent choice (either granted or denied). */
export function hasConsentChoice(): boolean {
  try {
    return !!localStorage.getItem('taches_consent');
  } catch {
    return false;
  }
}

function _getSavedConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem('taches_consent');
    if (!raw) return null;
    const { state } = JSON.parse(raw);
    return state as ConsentState;
  } catch {
    return null;
  }
}

// ─── Core DataLayer Push ──────────────────────────────────────────────────

/**
 * Type-safe wrapper around window.dataLayer.push().
 *
 * Automatically enriches every event with:
 *  - event_timestamp (Unix ms)
 *  - platform ('taches.ma')
 *  - environment ('production' | 'development')
 *
 * Safe to call during SSR — no-ops if window is undefined.
 */
export function pushEvent(event: DataLayerEvent): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];

  const enriched: Record<string, unknown> = {
    ...event,
    event_timestamp: Date.now(),
    platform: PLATFORM,
    environment: IS_PRODUCTION ? 'production' : 'development',
  };

  // Clear ecommerce before pushing new e-commerce events (GA4 requirement)
  if (_isEcommerceEvent(event.event)) {
    window.dataLayer.push({ ecommerce: null });
  }

  window.dataLayer.push(enriched);
  _debug(`📊 DataLayer: ${event.event}`, enriched);
}

/**
 * Sets GA4 user properties (persistent across events in session).
 * Call after successful login or profile load.
 */
export function setUserProperties(properties: {
  user_id?: string;
  user_role?: string;
  performer_tier?: string;
  kyc_status?: string;
  locale?: string;
  city?: string;
}): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];

  window.dataLayer.push({
    event: 'user_properties_set',
    ...properties,
    platform: PLATFORM,
  });

  // Also set via gtag if available (for GA4 direct)
  if (typeof window.gtag === 'function') {
    window.gtag('set', 'user_properties', properties);
    if (properties.user_id) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '', {
        user_id: properties.user_id,
      });
    }
  }

  _debug('👤 User Properties Set', properties);
}

/**
 * Resets user properties on logout.
 */
export function clearUserProperties(): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'user_logged_out',
    user_id: undefined,
    user_role: undefined,
    platform: PLATFORM,
  });

  _debug('🚪 User Logged Out – Properties Cleared');
}

// ─── GA4 Item Builder ─────────────────────────────────────────────────────

/**
 * Builds a GA4 item object from a tâches.ma task.
 * Used in all e-commerce events (view_item, add_to_cart, purchase, etc.)
 */
export function buildTaskItem(task: {
  id: string;
  title: string;
  category?: string;
  city?: string;
  status?: string;
  totalBudget?: number;
  reward?: number;
  isUrgent?: boolean;
}, options?: {
  currency?: Currency;
  index?: number;
  listId?: string;
  listName?: string;
}): GA4Item {
  const budgetMAD = Math.round((task.totalBudget || task.reward || 0) * 10.87);

  return {
    item_id: task.id,
    item_name: task.title,
    item_category: task.category || 'micro',
    item_category2: task.city || 'Maroc',
    item_category3: task.status || 'OPEN',
    item_brand: PLATFORM,
    item_variant: task.isUrgent ? 'urgent' : 'standard',
    price: budgetMAD,
    currency: options?.currency || 'MAD',
    quantity: 1,
    affiliation: 'taches_marketplace',
    index: options?.index,
    item_list_id: options?.listId,
    item_list_name: options?.listName,
  };
}

// ─── Predefined Event Helpers ─────────────────────────────────────────────

/**
 * Fire page_view on every route change.
 * Pass the locale, path, and content group for proper segmentation.
 */
export function trackPageView(params: {
  title: string;
  path: string;
  locale: string;
  contentGroup?: string;
  userId?: string;
  userRole?: string;
}): void {
  pushEvent({
    event: 'page_view',
    page_title: params.title,
    page_location: typeof window !== 'undefined' ? window.location.href : `https://taches.ma${params.path}`,
    page_path: params.path,
    page_referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    content_group: params.contentGroup,
    locale: params.locale,
    page_locale: params.locale,
    user_id: params.userId,
    user_role: params.userRole as any,
  });
}

/**
 * Track login event.
 */
export function trackLogin(method: 'email' | 'demo' | 'google' | 'phone', userId?: string, role?: string): void {
  pushEvent({
    event: 'login',
    method,
    user_id: userId,
    user_role: role as any,
  });
}

/**
 * Track sign_up event.
 */
export function trackSignUp(method: 'email' | 'google', role?: string): void {
  pushEvent({
    event: 'sign_up',
    method,
    user_role: role as any,
  });
}

/**
 * Track site search.
 */
export function trackSearch(query: string, category?: string, resultsCount?: number): void {
  if (!query.trim()) return;
  pushEvent({
    event: 'search',
    search_term: query.trim(),
    search_category: category,
    results_count: resultsCount,
  });
}

/**
 * Track task list view (GA4 view_item_list).
 */
export function trackViewItemList(tasks: Array<{
  id: string;
  title: string;
  category?: string;
  city?: string;
  status?: string;
  totalBudget?: number;
  reward?: number;
  isUrgent?: boolean;
}>, listId: string, listName: string): void {
  const items = tasks.slice(0, 20).map((t, i) =>
    buildTaskItem(t, { index: i, listId, listName })
  );

  pushEvent({
    event: 'view_item_list',
    item_list_id: listId,
    item_list_name: listName,
    items,
  });
}

/**
 * Track task detail view (GA4 view_item).
 */
export function trackViewItem(task: {
  id: string;
  title: string;
  category?: string;
  city?: string;
  status?: string;
  totalBudget?: number;
  reward?: number;
  isUrgent?: boolean;
}): void {
  const item = buildTaskItem(task);

  pushEvent({
    event: 'view_item',
    currency: 'MAD',
    value: item.price,
    items: [item],
  });
}

/**
 * Track bid submission (add_to_cart equivalent).
 */
export function trackBidSubmitted(task: {
  id: string;
  title: string;
  category?: string;
  reward?: number;
  totalBudget?: number;
}, pitch: string, performerTier?: string): void {
  const item = buildTaskItem(task);

  // GA4 e-commerce
  pushEvent({
    event: 'add_to_cart',
    currency: 'MAD',
    value: item.price,
    items: [item],
  });

  // Custom marketplace event
  pushEvent({
    event: 'task_bid_submitted',
    task_id: task.id,
    task_category: (task.category as TaskCategory) || 'micro',
    task_reward_mad: item.price,
    performer_tier: performerTier,
    pitch_length: pitch.length,
  });
}

/**
 * Track task posting by customer (purchase equivalent).
 */
export function trackTaskPosted(task: {
  id: string;
  title: string;
  category?: string;
  totalBudget: number;
  reward?: number;
  isUrgent?: boolean;
  city?: string;
  attachments?: string[];
}): void {
  const budgetMAD = Math.round(task.totalBudget * 10.87);
  const item = buildTaskItem(task);

  // GA4 purchase (escrow lock = purchase)
  pushEvent({
    event: 'purchase',
    transaction_id: task.id,
    value: budgetMAD,
    currency: 'MAD',
    affiliation: 'taches_marketplace',
    items: [item],
  });

  // Custom event
  pushEvent({
    event: 'task_posted',
    task_id: task.id,
    task_category: (task.category as TaskCategory) || 'micro',
    task_budget_mad: budgetMAD,
    task_budget_eur: task.totalBudget,
    task_urgent: Boolean(task.isUrgent),
    task_city: task.city,
    task_has_attachment: Boolean(task.attachments?.length),
  });
}

/**
 * Track task approval by customer.
 */
export function trackTaskApproved(task: {
  id: string;
  category?: string;
  reward: number;
}, commission: number, rating?: number): void {
  const netEur = task.reward - commission;
  const netMAD = Math.round(netEur * 10.87);
  const commissionMAD = Math.round(commission * 10.87);

  pushEvent({
    event: 'task_approved',
    task_id: task.id,
    task_category: (task.category as TaskCategory) || 'micro',
    net_reward_mad: netMAD,
    net_reward_eur: netEur,
    commission_mad: commissionMAD,
    review_rating: rating,
  });
}

/**
 * Track task cancellation.
 */
export function trackTaskCancelled(taskId: string, refundEur: number, stage: string, category?: string): void {
  const refundMAD = Math.round(refundEur * 10.87);

  pushEvent({
    event: 'refund',
    transaction_id: taskId,
    value: refundMAD,
    currency: 'MAD',
  });

  pushEvent({
    event: 'task_cancelled',
    task_id: taskId,
    task_category: category as TaskCategory,
    refund_mad: refundMAD,
    cancellation_stage: stage as any,
  });
}

/**
 * Track wallet deposit initiated.
 */
export function trackWalletDepositInitiated(amountMAD: number, amountEur: number, method: string): void {
  // GA4 begin_checkout
  pushEvent({
    event: 'begin_checkout',
    currency: 'MAD',
    value: amountMAD,
    items: [{
      item_id: 'wallet_topup',
      item_name: 'Recharge Portefeuille',
      item_category: 'wallet',
      item_brand: PLATFORM,
      price: amountMAD,
      currency: 'MAD',
      quantity: 1,
    }],
  });

  pushEvent({
    event: 'wallet_deposit_initiated',
    amount_mad: amountMAD,
    amount_eur: amountEur,
    payment_method: method,
  });
}

/**
 * Track wallet deposit completed.
 */
export function trackWalletDepositCompleted(
  transactionId: string,
  amountMAD: number,
  amountEur: number,
  method: string
): void {
  // GA4 purchase
  pushEvent({
    event: 'purchase',
    transaction_id: transactionId,
    value: amountMAD,
    currency: 'MAD',
    affiliation: 'taches_wallet',
    items: [{
      item_id: 'wallet_topup',
      item_name: 'Recharge Portefeuille',
      item_category: 'wallet',
      item_brand: PLATFORM,
      price: amountMAD,
      currency: 'MAD',
      quantity: 1,
    }],
  });

  // Custom event
  pushEvent({
    event: 'wallet_deposit_completed',
    transaction_id: transactionId,
    amount_mad: amountMAD,
    amount_eur: amountEur,
    payment_method: method,
  });
}

/**
 * Track CTA click.
 */
export function trackCTAClick(
  id: string,
  label: string,
  location: string,
  type: 'button' | 'link' | 'card' | 'tab' = 'button'
): void {
  pushEvent({
    event: 'cta_clicked',
    cta_id: id,
    cta_label: label,
    cta_location: location,
    cta_type: type,
  });
}

/**
 * Track role switch.
 */
export function trackRoleSwitch(newRole: 'CUSTOMER' | 'PERFORMER' | 'ADMIN' | 'GUEST'): void {
  pushEvent({
    event: 'role_switched',
    new_role: newRole,
  });
}

/**
 * Track locale change.
 */
export function trackLanguageChange(from: string, to: string): void {
  pushEvent({
    event: 'language_changed',
    from_locale: from,
    to_locale: to,
  });
}

/**
 * Track category filter selection.
 */
export function trackCategorySelected(category: string, source: 'grid' | 'filter_bar' | 'search'): void {
  pushEvent({
    event: 'category_selected',
    category,
    source,
  });
}

/**
 * Track chat widget open.
 */
export function trackChatOpened(source: 'task_detail' | 'floating_widget' | 'profile', taskId?: string): void {
  pushEvent({
    event: 'chat_opened',
    source,
    task_id: taskId,
  });
}

/**
 * Track client-side error.
 */
export function trackError(type: string, message: string, source: string): void {
  pushEvent({
    event: 'error_occurred',
    error_type: type,
    error_message: message.slice(0, 200),
    error_source: source,
  });
}

// ─── Internal Helpers ─────────────────────────────────────────────────────

const ECOMMERCE_EVENTS = new Set([
  'view_item_list',
  'view_item',
  'add_to_cart',
  'remove_from_cart',
  'begin_checkout',
  'add_payment_info',
  'add_shipping_info',
  'purchase',
  'refund',
]);

function _isEcommerceEvent(eventName: string): boolean {
  return ECOMMERCE_EVENTS.has(eventName);
}

function _debug(label: string, data?: unknown): void {
  if (!IS_DEBUG) return;
  const style = 'color: #6366f1; font-weight: bold;';
  if (data) {
    console.groupCollapsed(`%c[taches.ma analytics] ${label}`, style);
    console.log(data);
    console.groupEnd();
  } else {
    console.log(`%c[taches.ma analytics] ${label}`, style);
  }
}

export { MAD_TO_EUR };
