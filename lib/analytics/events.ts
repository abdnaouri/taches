/**
 * ============================================================
 * tâches.ma — Enterprise GA4 & GTM DataLayer Event Schema
 * 2026 Industry Standard | GA4 + GTM Full DataLayer Suite
 * ============================================================
 *
 * Implements Google's recommended GA4 e-commerce event schema
 * plus custom marketplace events for the tâches.ma platform.
 *
 * Reference:
 *  - GA4 recommended events: https://support.google.com/analytics/answer/9267735
 *  - GTM DataLayer: https://developers.google.com/tag-manager/devguide
 *  - GA4 e-commerce: https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
 */

// ─── Core Primitives ─────────────────────────────────────────────────────────

export type Currency = 'MAD' | 'EUR' | 'USD';
export type UserRole = 'CUSTOMER' | 'PERFORMER' | 'ADMIN' | 'GUEST';
export type TaskStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'UNDER_REVIEW'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ARBITRATION'
  | 'REVISION_REQUESTED';

export type TaskCategory =
  | 'development'
  | 'design'
  | 'assistance'
  | 'copywriting'
  | 'marketing'
  | 'micro';

export type ConsentStatus = 'granted' | 'denied' | 'pending';

// ─── GA4 Item (Product) Schema ─────────────────────────────────────────────

/**
 * Standard GA4 item representation for a task/service.
 * Maps tâches.ma tasks to the GA4 e-commerce item schema.
 */
export interface GA4Item {
  item_id: string;          // Task ID
  item_name: string;        // Task title
  item_category: string;    // Primary category
  item_category2?: string;  // Sub-category or city
  item_category3?: string;  // Task status
  item_brand?: string;      // Platform: 'taches.ma'
  item_variant?: string;    // 'task' | 'service' | 'micro'
  price: number;            // Budget in MAD
  currency: Currency;
  quantity: number;         // Always 1 for tasks
  affiliation?: string;     // 'taches_marketplace'
  index?: number;           // Position in list
  item_list_id?: string;    // List identifier
  item_list_name?: string;  // List display name
  discount?: number;        // Discount amount
}

// ─── Consent Mode v2 ──────────────────────────────────────────────────────

export interface ConsentState {
  analytics_storage: ConsentStatus;
  ad_storage: ConsentStatus;
  ad_user_data: ConsentStatus;
  ad_personalization: ConsentStatus;
  functionality_storage: ConsentStatus;
  personalization_storage: ConsentStatus;
  security_storage: ConsentStatus;
  wait_for_update?: number; // ms
}

export type ConsentUpdateType = 'default' | 'update';

// ─── DataLayer Push Types ──────────────────────────────────────────────────

export interface DataLayerBase {
  event: string;
  event_timestamp?: number;     // Unix ms
  page_locale?: string;         // 'fr' | 'ar' | 'en' | 'es' | 'ru'
  platform?: string;            // 'taches.ma'
  environment?: string;         // 'production' | 'development'
  user_id?: string;             // GA4 user_id (hashed)
  user_role?: UserRole;
  session_id?: string;
}

// ─── Standard GA4 Events ──────────────────────────────────────────────────

/** page_view — fired on every route change */
export interface PageViewEvent extends DataLayerBase {
  event: 'page_view';
  page_title: string;
  page_location: string;
  page_path: string;
  page_referrer?: string;
  content_group?: string; // 'homepage' | 'tasks' | 'wallet' | 'profile' | 'admin'
  locale?: string;
}

/** user_engagement — session-level engagement */
export interface UserEngagementEvent extends DataLayerBase {
  event: 'user_engagement';
  engagement_time_msec: number;
}

/** search — site search */
export interface SearchEvent extends DataLayerBase {
  event: 'search';
  search_term: string;
  search_category?: string;
  results_count?: number;
}

/** login — user signs in */
export interface LoginEvent extends DataLayerBase {
  event: 'login';
  method: 'email' | 'demo' | 'google' | 'phone';
}

/** sign_up — user registers */
export interface SignUpEvent extends DataLayerBase {
  event: 'sign_up';
  method: 'email' | 'google';
  user_role?: UserRole;
}

/** select_content — any content interaction */
export interface SelectContentEvent extends DataLayerBase {
  event: 'select_content';
  content_type: string;
  content_id: string;
}

// ─── GA4 E-Commerce Events ────────────────────────────────────────────────

/** view_item_list — task list shown */
export interface ViewItemListEvent extends DataLayerBase {
  event: 'view_item_list';
  item_list_id: string;
  item_list_name: string;
  items: GA4Item[];
}

/** view_item — task detail viewed */
export interface ViewItemEvent extends DataLayerBase {
  event: 'view_item';
  currency: Currency;
  value: number;
  items: GA4Item[];
}

/** add_to_cart — task added to cart / bid initiated */
export interface AddToCartEvent extends DataLayerBase {
  event: 'add_to_cart';
  currency: Currency;
  value: number;
  items: GA4Item[];
}

/** begin_checkout — wallet top-up or task creation initiated */
export interface BeginCheckoutEvent extends DataLayerBase {
  event: 'begin_checkout';
  currency: Currency;
  value: number;
  coupon?: string;
  items: GA4Item[];
}

/** add_payment_info — payment step reached */
export interface AddPaymentInfoEvent extends DataLayerBase {
  event: 'add_payment_info';
  currency: Currency;
  value: number;
  payment_type: 'card' | 'bank_transfer' | 'wallet' | 'viva_wallet';
  items: GA4Item[];
}

/** purchase — task posted (escrow locked) OR wallet deposit completed */
export interface PurchaseEvent extends DataLayerBase {
  event: 'purchase';
  transaction_id: string;
  value: number;
  tax?: number;
  shipping?: number;
  currency: Currency;
  coupon?: string;
  affiliation?: string;
  items: GA4Item[];
}

/** refund — escrow refunded / task cancelled */
export interface RefundEvent extends DataLayerBase {
  event: 'refund';
  transaction_id: string;
  value: number;
  currency: Currency;
  items?: GA4Item[];
}

// ─── Custom tâches.ma Marketplace Events ─────────────────────────────────

/** task_posted — customer posts a new task */
export interface TaskPostedEvent extends DataLayerBase {
  event: 'task_posted';
  task_id: string;
  task_category: TaskCategory;
  task_budget_mad: number;
  task_budget_eur: number;
  task_urgent: boolean;
  task_city?: string;
  task_has_attachment: boolean;
}

/** task_bid_submitted — performer applies to a task */
export interface TaskBidSubmittedEvent extends DataLayerBase {
  event: 'task_bid_submitted';
  task_id: string;
  task_category: TaskCategory;
  task_reward_mad: number;
  performer_tier?: string;
  pitch_length: number;
}

/** task_bid_accepted — customer assigns performer */
export interface TaskBidAcceptedEvent extends DataLayerBase {
  event: 'task_bid_accepted';
  task_id: string;
  task_category: TaskCategory;
  task_budget_mad: number;
  performer_id: string;
}

/** task_proof_submitted — performer submits work */
export interface TaskProofSubmittedEvent extends DataLayerBase {
  event: 'task_proof_submitted';
  task_id: string;
  task_category: TaskCategory;
  proof_attachments_count: number;
  report_length: number;
}

/** task_approved — customer approves work */
export interface TaskApprovedEvent extends DataLayerBase {
  event: 'task_approved';
  task_id: string;
  task_category: TaskCategory;
  net_reward_mad: number;
  net_reward_eur: number;
  commission_mad: number;
  review_rating?: number;
}

/** task_cancelled — task cancelled by customer */
export interface TaskCancelledEvent extends DataLayerBase {
  event: 'task_cancelled';
  task_id: string;
  task_category?: TaskCategory;
  refund_mad: number;
  cancellation_stage: TaskStatus;
}

/** task_arbitration_requested — dispute opened */
export interface TaskArbitrationRequestedEvent extends DataLayerBase {
  event: 'task_arbitration_requested';
  task_id: string;
  task_category?: TaskCategory;
  reason_length: number;
}

/** task_revision_requested — revision asked */
export interface TaskRevisionRequestedEvent extends DataLayerBase {
  event: 'task_revision_requested';
  task_id: string;
  feedback_length: number;
}

/** settlement_proposed — partial settlement proposed */
export interface SettlementProposedEvent extends DataLayerBase {
  event: 'settlement_proposed';
  task_id: string;
  settlement_percentage: number;
  settlement_amount_mad: number;
}

/** settlement_accepted — partial settlement accepted */
export interface SettlementAcceptedEvent extends DataLayerBase {
  event: 'settlement_accepted';
  task_id: string;
  settlement_percentage: number;
  performer_net_mad: number;
  client_refund_mad: number;
}

/** wallet_deposit_initiated — user starts top-up flow */
export interface WalletDepositInitiatedEvent extends DataLayerBase {
  event: 'wallet_deposit_initiated';
  amount_mad: number;
  amount_eur: number;
  payment_method: string;
}

/** wallet_deposit_completed — deposit confirmed */
export interface WalletDepositCompletedEvent extends DataLayerBase {
  event: 'wallet_deposit_completed';
  transaction_id: string;
  amount_mad: number;
  amount_eur: number;
  payment_method: string;
}

/** wallet_withdrawal_requested — payout requested */
export interface WalletWithdrawalRequestedEvent extends DataLayerBase {
  event: 'wallet_withdrawal_requested';
  amount_mad: number;
  bank_name?: string;
}

/** qualification_test_started — KYC test started */
export interface QualificationTestStartedEvent extends DataLayerBase {
  event: 'qualification_test_started';
}

/** qualification_test_passed — KYC test passed */
export interface QualificationTestPassedEvent extends DataLayerBase {
  event: 'qualification_test_passed';
  score?: number;
}

/** kyc_submitted — ID documents uploaded */
export interface KycSubmittedEvent extends DataLayerBase {
  event: 'kyc_submitted';
}

/** role_switched — user switches between CUSTOMER/PERFORMER */
export interface RoleSwitchedEvent extends DataLayerBase {
  event: 'role_switched';
  new_role: UserRole;
}

/** cta_clicked — any call-to-action */
export interface CtaClickedEvent extends DataLayerBase {
  event: 'cta_clicked';
  cta_id: string;
  cta_label: string;
  cta_location: string;
  cta_type?: 'button' | 'link' | 'card' | 'tab';
}

/** category_selected — category filter applied */
export interface CategorySelectedEvent extends DataLayerBase {
  event: 'category_selected';
  category: string;
  source: 'grid' | 'filter_bar' | 'search';
}

/** language_changed — user switches locale */
export interface LanguageChangedEvent extends DataLayerBase {
  event: 'language_changed';
  from_locale: string;
  to_locale: string;
}

/** chat_opened — messenger widget opened */
export interface ChatOpenedEvent extends DataLayerBase {
  event: 'chat_opened';
  task_id?: string;
  source: 'task_detail' | 'floating_widget' | 'profile';
}

/** error_occurred — tracked client-side errors */
export interface ErrorOccurredEvent extends DataLayerBase {
  event: 'error_occurred';
  error_type: string;
  error_message: string;
  error_source: string;
}

// ─── Union of All Events ──────────────────────────────────────────────────

export type DataLayerEvent =
  | PageViewEvent
  | UserEngagementEvent
  | SearchEvent
  | LoginEvent
  | SignUpEvent
  | SelectContentEvent
  | ViewItemListEvent
  | ViewItemEvent
  | AddToCartEvent
  | BeginCheckoutEvent
  | AddPaymentInfoEvent
  | PurchaseEvent
  | RefundEvent
  | TaskPostedEvent
  | TaskBidSubmittedEvent
  | TaskBidAcceptedEvent
  | TaskProofSubmittedEvent
  | TaskApprovedEvent
  | TaskCancelledEvent
  | TaskArbitrationRequestedEvent
  | TaskRevisionRequestedEvent
  | SettlementProposedEvent
  | SettlementAcceptedEvent
  | WalletDepositInitiatedEvent
  | WalletDepositCompletedEvent
  | WalletWithdrawalRequestedEvent
  | QualificationTestStartedEvent
  | QualificationTestPassedEvent
  | KycSubmittedEvent
  | RoleSwitchedEvent
  | CtaClickedEvent
  | CategorySelectedEvent
  | LanguageChangedEvent
  | ChatOpenedEvent
  | ErrorOccurredEvent;
