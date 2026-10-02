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

/**
 * Instant Telegram Bot Alert Dispatcher (Workzilla & UNU parity)
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

