'use client';

/**
 * ============================================================
 * tâches.ma — useAnalytics React Hook
 * ============================================================
 *
 * Centralizes all analytics tracking calls in a single hook.
 * Reads user context from AuthContext and LanguageContext
 * automatically, enriching every event with user_id, user_role,
 * and page_locale without any boilerplate at call sites.
 *
 * Usage:
 *   const { track } = useAnalytics();
 *   track.taskPosted(task);
 *   track.pageView('tasks', '/fr/tasks');
 *
 * The hook is safe to call in any Client Component.
 * All methods are no-ops if called during SSR.
 */

import { useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
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
  setUserProperties,
  clearUserProperties,
  pushEvent,
  hasAnalyticsConsent,
  updateConsentChoice,
  hasConsentChoice,
} from './dataLayer';
import type { TaskCategory } from './events';

// Re-export for convenience
export { hasAnalyticsConsent, updateConsentChoice, hasConsentChoice } from './dataLayer';

// ─── Stable user ID hash (client-side, privacy-safe) ─────────────────────

/** Returns a short stable hash of the user ID for GA4 user_id (not PII). */
function hashUserId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit int
  }
  return Math.abs(hash).toString(36);
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useAnalytics() {
  const { profile, isAuthenticated } = useAuth();
  const { locale } = useLanguage();

  // Stable user context refs (no re-renders on change)
  const userId = profile?.id ? hashUserId(profile.id) : undefined;
  const userRole = profile?.activeRole;

  // ── Page View ──────────────────────────────────────────────────────────

  const page = useCallback(
    (title: string, path: string, contentGroup?: string) => {
      trackPageView({
        title,
        path,
        locale,
        contentGroup,
        userId,
        userRole,
      });
    },
    [locale, userId, userRole]
  );

  // ── Auth Events ────────────────────────────────────────────────────────

  const login = useCallback(
    (method: 'email' | 'demo' | 'google' | 'phone') => {
      trackLogin(method, userId, userRole);
      if (profile) {
        setUserProperties({
          user_id: userId,
          user_role: profile.activeRole,
          performer_tier: profile.performerTier,
          kyc_status: profile.kycStatus,
          locale,
          city: profile.city,
        });
      }
    },
    [profile, userId, userRole, locale]
  );

  const signUp = useCallback(
    (method: 'email' | 'google', role?: string) => {
      trackSignUp(method, role);
    },
    []
  );

  const logout = useCallback(() => {
    clearUserProperties();
  }, []);

  // ── Search ─────────────────────────────────────────────────────────────

  const search = useCallback(
    (query: string, category?: string, resultsCount?: number) => {
      trackSearch(query, category, resultsCount);
    },
    []
  );

  // ── Task List View ─────────────────────────────────────────────────────

  const viewTaskList = useCallback(
    (
      tasks: Array<{
        id: string;
        title: string;
        category?: string;
        city?: string;
        status?: string;
        totalBudget?: number;
        reward?: number;
        isUrgent?: boolean;
      }>,
      listId: string,
      listName: string
    ) => {
      if (!tasks.length) return;
      trackViewItemList(tasks, listId, listName);
    },
    []
  );

  // ── Task Detail View ───────────────────────────────────────────────────

  const viewTask = useCallback(
    (task: {
      id: string;
      title: string;
      category?: string;
      city?: string;
      status?: string;
      totalBudget?: number;
      reward?: number;
      isUrgent?: boolean;
    }) => {
      trackViewItem(task);
    },
    []
  );

  // ── Task Bid ───────────────────────────────────────────────────────────

  const bidSubmitted = useCallback(
    (
      task: {
        id: string;
        title: string;
        category?: string;
        reward?: number;
        totalBudget?: number;
      },
      pitch: string
    ) => {
      trackBidSubmitted(task, pitch, profile?.performerTier);
    },
    [profile?.performerTier]
  );

  // ── Task Posted ────────────────────────────────────────────────────────

  const taskPosted = useCallback(
    (task: {
      id: string;
      title: string;
      category?: string;
      totalBudget: number;
      reward?: number;
      isUrgent?: boolean;
      city?: string;
      attachments?: string[];
    }) => {
      trackTaskPosted(task);
    },
    []
  );

  // ── Task Approved ──────────────────────────────────────────────────────

  const taskApproved = useCallback(
    (
      task: { id: string; category?: string; reward: number },
      rating?: number
    ) => {
      const commission = task.reward * 0.15; // 15% commission
      trackTaskApproved(task, commission, rating);
    },
    []
  );

  // ── Task Cancelled ─────────────────────────────────────────────────────

  const taskCancelled = useCallback(
    (taskId: string, refundEur: number, stage: string, category?: string) => {
      trackTaskCancelled(taskId, refundEur, stage, category);
    },
    []
  );

  // ── Task Proof Submitted ───────────────────────────────────────────────

  const proofSubmitted = useCallback(
    (taskId: string, category: string, attachmentsCount: number, reportLength: number) => {
      pushEvent({
        event: 'task_proof_submitted',
        task_id: taskId,
        task_category: category as TaskCategory,
        proof_attachments_count: attachmentsCount,
        report_length: reportLength,
        user_id: userId,
        user_role: userRole as any,
        page_locale: locale,
      });
    },
    [userId, userRole, locale]
  );

  // ── Task Arbitration ───────────────────────────────────────────────────

  const arbitrationRequested = useCallback(
    (taskId: string, reason: string, category?: string) => {
      pushEvent({
        event: 'task_arbitration_requested',
        task_id: taskId,
        task_category: category as TaskCategory,
        reason_length: reason.length,
        user_id: userId,
        user_role: userRole as any,
        page_locale: locale,
      });
    },
    [userId, userRole, locale]
  );

  // ── Revision Requested ─────────────────────────────────────────────────

  const revisionRequested = useCallback(
    (taskId: string, feedback: string) => {
      pushEvent({
        event: 'task_revision_requested',
        task_id: taskId,
        feedback_length: feedback.length,
        user_id: userId,
        user_role: userRole as any,
        page_locale: locale,
      });
    },
    [userId, userRole, locale]
  );

  // ── Settlement ─────────────────────────────────────────────────────────

  const settlementProposed = useCallback(
    (taskId: string, percentage: number, amountMAD: number) => {
      pushEvent({
        event: 'settlement_proposed',
        task_id: taskId,
        settlement_percentage: percentage,
        settlement_amount_mad: amountMAD,
        user_id: userId,
        user_role: userRole as any,
        page_locale: locale,
      });
    },
    [userId, userRole, locale]
  );

  const settlementAccepted = useCallback(
    (taskId: string, percentage: number, performerNetMAD: number, clientRefundMAD: number) => {
      pushEvent({
        event: 'settlement_accepted',
        task_id: taskId,
        settlement_percentage: percentage,
        performer_net_mad: performerNetMAD,
        client_refund_mad: clientRefundMAD,
        user_id: userId,
        user_role: userRole as any,
        page_locale: locale,
      });
    },
    [userId, userRole, locale]
  );

  // ── Wallet ─────────────────────────────────────────────────────────────

  const walletDepositInitiated = useCallback(
    (amountMAD: number, amountEur: number, method: string) => {
      trackWalletDepositInitiated(amountMAD, amountEur, method);
    },
    []
  );

  const walletDepositCompleted = useCallback(
    (transactionId: string, amountMAD: number, amountEur: number, method: string) => {
      trackWalletDepositCompleted(transactionId, amountMAD, amountEur, method);
    },
    []
  );

  const walletWithdrawalRequested = useCallback(
    (amountMAD: number, bankName?: string) => {
      pushEvent({
        event: 'wallet_withdrawal_requested',
        amount_mad: amountMAD,
        bank_name: bankName,
        user_id: userId,
        user_role: userRole as any,
        page_locale: locale,
      });
    },
    [userId, userRole, locale]
  );

  // ── Qualification / KYC ────────────────────────────────────────────────

  const qualificationStarted = useCallback(() => {
    pushEvent({
      event: 'qualification_test_started',
      user_id: userId,
      user_role: userRole as any,
      page_locale: locale,
    });
  }, [userId, userRole, locale]);

  const qualificationPassed = useCallback((score?: number) => {
    pushEvent({
      event: 'qualification_test_passed',
      score,
      user_id: userId,
      user_role: userRole as any,
      page_locale: locale,
    });
  }, [userId, userRole, locale]);

  const kycSubmitted = useCallback(() => {
    pushEvent({
      event: 'kyc_submitted',
      user_id: userId,
      user_role: userRole as any,
      page_locale: locale,
    });
  }, [userId, userRole, locale]);

  // ── UI Interactions ────────────────────────────────────────────────────

  const ctaClick = useCallback(
    (id: string, label: string, location: string, type?: 'button' | 'link' | 'card' | 'tab') => {
      trackCTAClick(id, label, location, type);
    },
    []
  );

  const roleSwitch = useCallback((newRole: 'CUSTOMER' | 'PERFORMER' | 'ADMIN' | 'GUEST') => {
    trackRoleSwitch(newRole);
  }, []);

  const languageChange = useCallback((from: string, to: string) => {
    trackLanguageChange(from, to);
  }, []);

  const categorySelected = useCallback(
    (category: string, source: 'grid' | 'filter_bar' | 'search') => {
      trackCategorySelected(category, source);
    },
    []
  );

  const chatOpened = useCallback(
    (source: 'task_detail' | 'floating_widget' | 'profile', taskId?: string) => {
      trackChatOpened(source, taskId);
    },
    []
  );

  const error = useCallback((type: string, message: string, source: string) => {
    trackError(type, message, source);
  }, []);

  // ── Return all trackers ────────────────────────────────────────────────

  return {
    track: {
      page,
      login,
      signUp,
      logout,
      search,
      viewTaskList,
      viewTask,
      bidSubmitted,
      taskPosted,
      taskApproved,
      taskCancelled,
      proofSubmitted,
      arbitrationRequested,
      revisionRequested,
      settlementProposed,
      settlementAccepted,
      walletDepositInitiated,
      walletDepositCompleted,
      walletWithdrawalRequested,
      qualificationStarted,
      qualificationPassed,
      kycSubmitted,
      ctaClick,
      roleSwitch,
      languageChange,
      categorySelected,
      chatOpened,
      error,
    },
    /** Push any raw DataLayerEvent directly */
    pushRaw: pushEvent,
    /** Whether current user has granted analytics consent */
    hasConsent: hasAnalyticsConsent,
  };
}

// Dummy import guard (avoids unused import lint error)
const PLATFORM_PERFORMER_COMMISSION_RATE = 0.15;
