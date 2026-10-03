/**
 * Unified Edge-Compatible Transactional Email Dispatcher for Tâches.ma
 * Dispatches via:
 * 1. Resend API (if RESEND_API_KEY is configured)
 * 2. Cloudflare Email Worker (if EMAIL_WORKER_URL is configured)
 * 3. Graceful Dev Fallback (informative structured console output)
 */

import { getAdminClient } from '@/lib/auth/serverAuth';

export interface DispatchEmailParams {
  to: string;
  recipientName?: string;
  subject: string;
  html: string;
  text?: string;
  templateName: string;
  data?: Record<string, any>;
  recipientUserId?: string; // If provided, checks user's notify_email preference
}

export interface DispatchEmailResult {
  success: boolean;
  provider: 'resend' | 'cloudflare_worker' | 'mock_dev' | 'skipped_by_user_pref';
  messageId?: string;
  error?: string;
}

export async function dispatchEmail(
  params: DispatchEmailParams
): Promise<DispatchEmailResult> {
  const { to, recipientName, subject, html, text, templateName, data, recipientUserId } = params;

  // 1. Check user notification preferences if recipientUserId is provided
  if (recipientUserId) {
    try {
      const supabase = getAdminClient();
      const { data: prof } = await supabase
        .from('profiles')
        .select('notify_email')
        .eq('id', recipientUserId)
        .single();

      if (prof && prof.notify_email === false) {
        console.log(`[Email Dispatcher] Skipped email to ${to} (${recipientUserId}) - notify_email is disabled.`);
        return {
          success: true,
          provider: 'skipped_by_user_pref',
        };
      }
    } catch (prefErr: any) {
      console.warn('[Email Dispatcher] Error checking profile preference (proceeding):', prefErr.message);
    }
  }

  // Sender details
  const fromEmail = process.env.EMAIL_FROM || 'Tâches.ma <notifications@taches.ma>';
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailWorkerUrl = process.env.EMAIL_WORKER_URL;

  // 2. Resend API Provider
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          html,
          text: text || '',
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        console.error('[Email Dispatcher] Resend API error response:', json);
        return {
          success: false,
          provider: 'resend',
          error: json.message || 'Resend API returned error',
        };
      }

      console.log(`[Email Dispatcher] Sent via Resend to ${to}: "${subject}" (id: ${json.id})`);
      return {
        success: true,
        provider: 'resend',
        messageId: json.id,
      };
    } catch (err: any) {
      console.error('[Email Dispatcher] Resend call failed:', err);
      // Fall through to next provider if available
    }
  }

  // 3. Cloudflare Email Worker Provider
  if (emailWorkerUrl) {
    try {
      const res = await fetch(emailWorkerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          recipientName: recipientName || '',
          subject,
          html,
          text: text || '',
          template: templateName,
          data,
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.warn('[Email Dispatcher] Worker returned status', res.status, resData);
      } else {
        console.log(`[Email Dispatcher] Dispatched to Cloudflare Worker for ${to}: "${subject}"`);
        return {
          success: true,
          provider: 'cloudflare_worker',
          messageId: resData?.result || 'ok',
        };
      }
    } catch (err: any) {
      console.warn('[Email Dispatcher] Cloudflare Worker dispatch error:', err.message);
    }
  }

  // 4. Dev / Mock Fallback
  console.log(`\n================== [TÂCHES.MA EMAIL DISPATCH (DEV MOCK)] ==================`);
  console.log(`To: ${to} (${recipientName || 'No Name'})`);
  console.log(`Subject: ${subject}`);
  console.log(`Template: ${templateName}`);
  console.log(`HTML Length: ${html.length} chars | Text Preview: ${(text || '').slice(0, 120)}...`);
  console.log(`===========================================================================\n`);

  return {
    success: true,
    provider: 'mock_dev',
    messageId: `mock-${Date.now()}`,
  };
}
