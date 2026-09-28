/**
 * Notification Service for Tâches.ma
 * Manages email, SMS, and in-app status alerts for payments, payouts, and task escrow events.
 */

export interface PayoutNotificationParams {
  recipientEmail: string;
  recipientName: string;
  amountDH: number;
  netAmountDH: number;
  feeDH: number;
  payoutMethod: 'RIB' | 'CASHPLUS' | 'BINANCE_PAY' | 'USDT';
  bankName?: string;
  maskedDestination: string;
  trackingReference: string;
  status: 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  rejectionReason?: string;
}

export interface EscrowReleaseNotificationParams {
  recipientEmail: string;
  recipientName: string;
  taskTitle: string;
  taskId: string;
  grossRewardDH: number;
  platformFeeDH: number;
  netGainDH: number;
}

/**
 * Sends a payout status update notification
 */
export async function sendPayoutNotification(params: PayoutNotificationParams): Promise<boolean> {
  try {
    const isCompleted = params.status === 'COMPLETED';
    const isCancelled = params.status === 'CANCELLED';

    let subject = `[Tâches.ma] Virement de ${params.netAmountDH} DH en cours d'exécution`;
    if (isCompleted) {
      subject = `[Tâches.ma] Virement de ${params.netAmountDH} DH envoyé avec succès !`;
    } else if (isCancelled) {
      subject = `[Tâches.ma] Information concernant votre demande de retrait de ${params.amountDH} DH`;
    }

    console.log(`[Notification Engine] Dispatching payout email to ${params.recipientEmail}: "${subject}"`);
    console.log(`[Notification Engine] Details: ${params.payoutMethod} -> ${params.maskedDestination}, Ref: ${params.trackingReference}`);

    // If Cloudflare Email Worker or Resend is configured, trigger HTTP call
    const emailWorkerUrl = process.env.EMAIL_WORKER_URL;
    if (emailWorkerUrl) {
      await fetch(emailWorkerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: params.recipientEmail,
          subject,
          template: 'payout_status_update',
          data: params,
        }),
      }).catch((e) => console.warn('Email worker dispatch failed (non-blocking):', e.message));
    }

    return true;
  } catch (err: any) {
    console.error('Failed to dispatch payout notification:', err);
    return false;
  }
}

/**
 * Sends an escrow release and earnings notification to performer
 */
export async function sendEscrowReleaseNotification(
  params: EscrowReleaseNotificationParams
): Promise<boolean> {
  try {
    const subject = `[Tâches.ma] Félicitations ! Vos gains de ${params.netGainDH} DH sont débloqués`;
    console.log(`[Notification Engine] Dispatching escrow release to ${params.recipientEmail}: "${subject}"`);

    const emailWorkerUrl = process.env.EMAIL_WORKER_URL;
    if (emailWorkerUrl) {
      await fetch(emailWorkerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: params.recipientEmail,
          subject,
          template: 'task_escrow_released',
          data: params,
        }),
      }).catch((e) => console.warn('Email worker dispatch failed (non-blocking):', e.message));
    }

    return true;
  } catch (err: any) {
    console.error('Failed to dispatch escrow notification:', err);
    return false;
  }
}
