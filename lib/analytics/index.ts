/**
 * ============================================================
 * tâches.ma — Analytics Module Barrel Export
 * ============================================================
 *
 * Single import point for the entire analytics suite:
 *
 *   import { useAnalytics, GTMProvider, AnalyticsPageTracker } from '@/lib/analytics';
 *
 * Or import specific utilities:
 *
 *   import { trackCTAClick, pushEvent } from '@/lib/analytics/dataLayer';
 *   import type { GA4Item, DataLayerEvent } from '@/lib/analytics/events';
 */

// Provider (Client Component — inject in root layout)
export { GTMProvider } from './GTMProvider';

// Page tracker (Client Component — inject in layout inside Suspense)
export { AnalyticsPageTracker } from './AnalyticsPageTracker';

// Hook (Client Components)
export { useAnalytics, hasAnalyticsConsent, updateConsentChoice, hasConsentChoice } from './useAnalytics';

// Low-level service functions (use in server actions, API routes, etc.)
export {
  initDataLayer,
  setConsent,
  getDefaultConsentState,
  updateConsentChoice as setConsentChoice,
  pushEvent,
  setUserProperties,
  clearUserProperties,
  buildTaskItem,
  trackPageView,
  trackLogin,
  trackSignUp,
  trackSearch,
  trackViewItemList,
  trackViewItem,
  trackBidSubmitted,
  trackTaskPosted,
  trackTaskApproved,
  trackTaskCancelled,
  trackWalletDepositInitiated,
  trackWalletDepositCompleted,
  trackCTAClick,
  trackRoleSwitch,
  trackLanguageChange,
  trackCategorySelected,
  trackChatOpened,
  trackError,
  MAD_TO_EUR,
} from './dataLayer';

// Type exports
export type {
  GA4Item,
  DataLayerEvent,
  ConsentState,
  ConsentStatus,
  ConsentUpdateType,
  Currency,
  UserRole,
  TaskStatus,
  TaskCategory,
  PageViewEvent,
  PurchaseEvent,
  TaskPostedEvent,
  TaskApprovedEvent,
  WalletDepositCompletedEvent,
} from './events';
