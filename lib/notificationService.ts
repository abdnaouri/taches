/**
 * Notification Service for Tâches.ma
 * Dispatches business-grade transactional HTML emails, SMS, and instant alerts.
 * Parity with Workzilla, UNU, and Upwork workflows.
 */

import { dispatchEmail } from './email/dispatcher';
import {
  buildTaskConfirmedClientEmail,
  buildTaskCompletedPerformerEmail,
  buildSubmissionReceivedClientEmail,
  buildNewBidClientEmail,
  buildPayoutStatusEmail,
} from './email/templates';

export interface PayoutNotificationParams {
  recipientEmail: string;
  recipientName: string;
  recipientUserId?: string;
  amountDH: number;
  netAmountDH: number;
  feeDH: number;
  payoutMethod: 'REMITLY' | 'BINANCE_PAY' | string;
  bankName?: string;
  maskedDestination: string;
  trackingReference: string;
  status: 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  rejectionReason?: string;
}

export interface EscrowReleaseNotificationParams {
  recipientEmail: string;
  recipientName: string;
  recipientUserId?: string;
  clientName?: string;
  taskTitle: string;
  taskId: string;
  grossRewardDH: number;
  platformFeeDH: number;
  netGainDH: number;
}

export interface TaskConfirmedClientParams {
  clientEmail: string;
  clientName: string;
  clientUserId?: string;
  contractorName: string;
  taskTitle: string;
  taskId: string;
  amountDH: number;
}

export interface SubmissionReceivedParams {
  clientEmail: string;
  clientName: string;
  clientUserId?: string;
  performerName: string;
  taskTitle: string;
  taskId: string;
  reportPreview?: string;
  proofsCount?: number;
}

export interface NewBidNotificationParams {
  clientEmail: string;
  clientName: string;
  clientUserId?: string;
  performerName: string;
  performerTier?: string;
  performerRating?: number;
  taskTitle: string;
  taskId: string;
  proposedHours?: number;
  pitchPreview?: string;
}

/**
 * 1. Dispatches Client Task Confirmation & Escrow Transfer Email (Workzilla Parity)
 */
export async function sendTaskConfirmationClientNotification(
  params: TaskConfirmedClientParams
): Promise<boolean> {
  try {
    const email = buildTaskConfirmedClientEmail({
      clientName: params.clientName,
      contractorName: params.contractorName,
      taskTitle: params.taskTitle,
      taskId: params.taskId,
      amountDH: params.amountDH,
    });

    const res = await dispatchEmail({
      to: params.clientEmail,
      recipientName: params.clientName,
      recipientUserId: params.clientUserId,
      subject: email.subject,
      html: email.html,
      text: email.text,
      templateName: 'task_confirmed_client',
      data: params,
    });

    return res.success;
  } catch (err: any) {
    console.error('Failed to send task confirmation email to client:', err);
    return false;
  }
}

/**
 * 2. Dispatches Performer Escrow Release & Earnings Email
 */
export async function sendEscrowReleaseNotification(
  params: EscrowReleaseNotificationParams
): Promise<boolean> {
  try {
    const email = buildTaskCompletedPerformerEmail({
      performerName: params.recipientName,
      clientName: params.clientName || 'Donneur d\'ordre',
      taskTitle: params.taskTitle,
      taskId: params.taskId,
      grossRewardDH: params.grossRewardDH,
      platformFeeDH: params.platformFeeDH,
      netGainDH: params.netGainDH,
    });

    const res = await dispatchEmail({
      to: params.recipientEmail,
      recipientName: params.recipientName,
      recipientUserId: params.recipientUserId,
      subject: email.subject,
      html: email.html,
      text: email.text,
      templateName: 'task_escrow_released',
      data: params,
    });

    return res.success;
  } catch (err: any) {
    console.error('Failed to dispatch escrow release notification to performer:', err);
    return false;
  }
}

/**
 * 3. Dispatches Deliverable Submitted Notification to Client
 */
export async function sendSubmissionReceivedNotification(
  params: SubmissionReceivedParams
): Promise<boolean> {
  try {
    const email = buildSubmissionReceivedClientEmail({
      clientName: params.clientName,
      performerName: params.performerName,
      taskTitle: params.taskTitle,
      taskId: params.taskId,
      reportPreview: params.reportPreview,
      proofsCount: params.proofsCount,
    });

    const res = await dispatchEmail({
      to: params.clientEmail,
      recipientName: params.clientName,
      recipientUserId: params.clientUserId,
      subject: email.subject,
      html: email.html,
      text: email.text,
      templateName: 'submission_received_client',
      data: params,
    });

    return res.success;
  } catch (err: any) {
    console.error('Failed to dispatch submission notification to client:', err);
    return false;
  }
}

/**
 * 4. Dispatches New Application / Bid Notification to Client
 */
export async function sendNewBidNotification(
  params: NewBidNotificationParams
): Promise<boolean> {
  try {
    const email = buildNewBidClientEmail({
      clientName: params.clientName,
      performerName: params.performerName,
      performerTier: params.performerTier,
      performerRating: params.performerRating,
      taskTitle: params.taskTitle,
      taskId: params.taskId,
      proposedHours: params.proposedHours,
      pitchPreview: params.pitchPreview,
    });

    const res = await dispatchEmail({
      to: params.clientEmail,
      recipientName: params.clientName,
      recipientUserId: params.clientUserId,
      subject: email.subject,
      html: email.html,
      text: email.text,
      templateName: 'new_bid_client',
      data: params,
    });

    return res.success;
  } catch (err: any) {
    console.error('Failed to dispatch new bid notification to client:', err);
    return false;
  }
}

/**
 * 5. Dispatches Payout Status Update Notification to Performer
 */
export async function sendPayoutNotification(
  params: PayoutNotificationParams
): Promise<boolean> {
  try {
    const email = buildPayoutStatusEmail({
      recipientName: params.recipientName,
      amountDH: params.amountDH,
      netAmountDH: params.netAmountDH,
      feeDH: params.feeDH,
      payoutMethod: params.payoutMethod,
      trackingReference: params.trackingReference,
      status: params.status,
      rejectionReason: params.rejectionReason,
    });

    const res = await dispatchEmail({
      to: params.recipientEmail,
      recipientName: params.recipientName,
      recipientUserId: params.recipientUserId,
      subject: email.subject,
      html: email.html,
      text: email.text,
      templateName: 'payout_status_update',
      data: params,
    });

    return res.success;
  } catch (err: any) {
    console.error('Failed to dispatch payout notification:', err);
    return false;
  }
}

/**
 * 6. Instant Telegram Bot Alert Dispatcher (Workzilla & UNU parity)
 * Broadcasts newly published tasks to Telegram channels/subscribers in real-time.
 */
export async function sendTelegramTaskAlert(params: {
  taskId: string;
  title: string;
  rewardDH: number;
  category: string;
  city?: string;
  taskMode?: string;
  timeLimitHours: number;
}): Promise<boolean> {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHANNEL_ID || process.env.TELEGRAM_CHAT_ID;

    const message = [
      `🚀 *NOUVELLE MISSION SUR TÂCHES.MA*`,
      ``,
      `📌 *${params.title.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&')}*`,
      `💰 *Rémunération :* ${params.rewardDH} DH _(Garantie sous séquestre Daman)_`,
      `⏱️ *Délai :* ${params.timeLimitHours}h | 📍 *Lieu :* ${params.city || 'En ligne'}`,
      `🏷️ *Catégorie :* #${params.category}`,
      ``,
      `👉 [Postuler immédiatement sur Tâches\\.ma](https://taches.ma/fr/task/${params.taskId})`,
    ].join('\n');

    if (botToken && chatId) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'MarkdownV2',
          disable_web_page_preview: false,
        }),
      }).catch((err) => console.warn('Telegram broadcast failed (non-blocking):', err.message));
    }

    console.log(`[Telegram Alert Engine] Broadcasted task #${params.taskId} (${params.rewardDH} DH)`);
    return true;
  } catch (err: any) {
    console.warn('Failed to send Telegram alert:', err.message);
    return false;
  }
}
