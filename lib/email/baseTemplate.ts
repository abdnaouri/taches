/**
 * Tâches.ma Bulletproof HTML Email Framework
 * Compatible with Gmail, Apple Mail, Outlook (2016-365 + Web), Yahoo, iOS & Android.
 * Features:
 * - Fluid 600px table-based layout with MSO conditional tags
 * - Inline CSS for high deliverability & zero stripping
 * - Dark-mode resilient color tokens
 * - Moroccan trust & Daman Escrow guarantee branding
 */

export interface EmailAction {
  label: string;
  url: string;
  variant?: 'primary' | 'success' | 'outline';
}

export interface EmailDataRow {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface BaseEmailOptions {
  preheader: string;
  badge?: {
    text: string;
    variant: 'success' | 'brand' | 'warning' | 'info';
  };
  headline: string;
  subtitle?: string;
  greetingName: string;
  paragraphs: string[];
  dataRows?: EmailDataRow[];
  calloutBox?: {
    title: string;
    text: string;
    icon?: 'shield' | 'clock' | 'info' | 'star';
  };
  primaryAction?: EmailAction;
  secondaryAction?: EmailAction;
  footerNote?: string;
}

const BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  success: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
  brand: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
  warning: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  info: { bg: '#f8fafc', text: '#334155', border: '#e2e8f0' },
};

const BUTTON_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  primary: { bg: '#2563eb', text: '#ffffff', border: '#1d4ed8' },
  success: { bg: '#059669', text: '#ffffff', border: '#047857' },
  outline: { bg: '#ffffff', text: '#0f172a', border: '#cbd5e1' },
};

/**
 * Escapes HTML entities to prevent injection
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generates an all-client compatible HTML email string
 */
export function renderEmailHtml(options: BaseEmailOptions): string {
  const {
    preheader,
    badge,
    headline,
    subtitle,
    greetingName,
    paragraphs,
    dataRows,
    calloutBox,
    primaryAction,
    secondaryAction,
    footerNote,
  } = options;

  const badgeStyle = badge ? BADGE_COLORS[badge.variant] || BADGE_COLORS.brand : null;
  const primaryBtn = primaryAction
    ? BUTTON_COLORS[primaryAction.variant || 'primary']
    : BUTTON_COLORS.primary;

  // Build Data Rows Table
  const dataRowsHtml =
    dataRows && dataRows.length > 0
      ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      ${dataRows
        .map(
          (row, i) => `
        <tr style="border-bottom: ${i === dataRows.length - 1 ? 'none' : '1px solid #e2e8f0'};">
          <td style="padding: 12px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; color: #64748b; width: 40%; font-weight: 500;">
            ${escapeHtml(row.label)}
          </td>
          <td style="padding: 12px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; color: ${
            row.highlight ? '#059669' : '#0f172a'
          }; font-weight: ${row.highlight ? '700' : '600'}; text-align: right;">
            ${escapeHtml(row.value)}
          </td>
        </tr>
      `
        )
        .join('')}
    </table>
  `
      : '';

  // Build Callout Box
  const calloutHtml = calloutBox
    ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px;">
      <tr>
        <td style="padding: 14px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #065f46;">
            🛡️ ${escapeHtml(calloutBox.title)}
          </p>
          <p style="margin: 0; font-size: 13px; line-height: 20px; color: #047857;">
            ${escapeHtml(calloutBox.text)}
          </p>
        </td>
      </tr>
    </table>
  `
    : '';

  // Build CTA buttons
  const ctaHtml = primaryAction
    ? `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0 16px 0;">
      <tr>
        <td align="center" style="border-radius: 8px; background-color: ${primaryBtn.bg};">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${escapeHtml(
            primaryAction.url
          )}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="16%" stroke="f" fillcolor="${primaryBtn.bg}">
          <w:anchorlock/>
          <center style="color:${primaryBtn.text};font-family:sans-serif;font-size:15px;font-weight:bold;">${escapeHtml(
              primaryAction.label
            )}</center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-->
          <a href="${escapeHtml(primaryAction.url)}" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 700; color: ${primaryBtn.text}; text-decoration: none; border-radius: 8px; background-color: ${primaryBtn.bg}; border: 1px solid ${primaryBtn.border}; text-align: center; mso-padding-alt: 0;">
            ${escapeHtml(primaryAction.label)} &rarr;
          </a>
          <!--<![endif]-->
        </td>
        ${
          secondaryAction
            ? `
        <td style="padding-left: 14px;">
          <a href="${escapeHtml(
            secondaryAction.url
          )}" target="_blank" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #475569; text-decoration: underline;">
            ${escapeHtml(secondaryAction.label)}
          </a>
        </td>
        `
            : ''
        }
      </tr>
    </table>
  `
    : '';

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="fr">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(headline)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      background-color: #f1f5f9;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    table {
      border-collapse: collapse !important;
    }
    a {
      color: #2563eb;
      text-decoration: none;
    }
    @media only screen and (max-width: 620px) {
      .container {
        width: 100% !important;
        border-radius: 0 !important;
      }
      .mobile-padding {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
      .cta-button {
        width: 100% !important;
        text-align: center !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9;">
  <!-- Hidden Preheader Preview Text -->
  <div style="display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${escapeHtml(preheader)} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container (600px Max) -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="container" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 24px 32px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9;" class="mobile-padding">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" style="vertical-align: middle;">
                    <a href="https://taches.ma" target="_blank" style="text-decoration: none; display: inline-block;">
                      <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">
                        Tâches<span style="color: #2563eb;">.ma</span>
                      </span>
                    </a>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; padding: 4px 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; color: #047857; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px;">
                      🔒 Séquestre Daman
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;" class="mobile-padding">
              
              <!-- Badge (Optional) -->
              ${
                badge && badgeStyle
                  ? `
              <div style="margin-bottom: 16px;">
                <span style="display: inline-block; padding: 4px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 700; color: ${badgeStyle.text}; background-color: ${badgeStyle.bg}; border: 1px solid ${badgeStyle.border}; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${escapeHtml(badge.text)}
                </span>
              </div>
              `
                  : ''
              }

              <!-- Headline -->
              <h1 style="margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 22px; line-height: 28px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">
                ${escapeHtml(headline)}
              </h1>

              ${
                subtitle
                  ? `
              <p style="margin: 0 0 20px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 22px; color: #64748b;">
                ${escapeHtml(subtitle)}
              </p>
              `
                  : '<div style="margin-bottom: 20px;"></div>'
              }

              <!-- Greeting -->
              <p style="margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 24px; color: #1e293b; font-weight: 600;">
                Bonjour ${escapeHtml(greetingName)},
              </p>

              <!-- Paragraphs -->
              ${paragraphs
                .map(
                  (p) => `
                <p style="margin: 0 0 14px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 22px; color: #334155;">
                  ${p}
                </p>
              `
                )
                .join('')}

              <!-- Data Rows -->
              ${dataRowsHtml}

              <!-- Callout Box -->
              ${calloutHtml}

              <!-- CTA Button -->
              ${ctaHtml}

              <!-- Footer Note -->
              ${
                footerNote
                  ? `
              <p style="margin: 20px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; line-height: 18px; color: #94a3b8;">
                ${escapeHtml(footerNote)}
              </p>
              `
                  : ''
              }

            </td>
          </tr>

          <!-- Workzilla-Grade Retention & Mobile App Footer Card -->
          <tr>
            <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;" class="mobile-padding">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 20px; color: #475569;">
                    <strong style="color: #0f172a;">Programme Parrainage Tâches.ma :</strong> Gagnez jusqu'à <strong>15% de bonus</strong> sur les commissions en invitant vos collaborateurs et amis.
                    <br />
                    <a href="https://taches.ma/fr/partners" target="_blank" style="color: #2563eb; font-weight: 600; text-decoration: underline;">
                      En savoir plus sur le parrainage &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Legal & Support Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0f172a; text-align: center;" class="mobile-padding">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; line-height: 18px; color: #94a3b8;">
                    <p style="margin: 0 0 8px 0; color: #cbd5e1; font-weight: 600;">
                      Tâches.ma &bull; La plateforme marocaine de micro-missions & freelancing sécurisé
                    </p>
                    <p style="margin: 0 0 12px 0;">
                      Paiements garantis par séquestre Daman &bull; Assistance 7j/7 &bull; Conforme CNDP Maroc
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #64748b;">
                      Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.<br />
                      Une question ? Visitez notre <a href="https://taches.ma/fr/support" target="_blank" style="color: #60a5fa; text-decoration: underline;">Centre d'aide</a> ou écrivez à <a href="mailto:support@taches.ma" style="color: #60a5fa; text-decoration: underline;">support@taches.ma</a>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Unsubscribe / Preferences Info -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin-top: 16px;">
          <tr>
            <td align="center" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #94a3b8; line-height: 16px;">
              Vous recevez cet email opérationnel car vous êtes inscrit sur Tâches.ma.<br />
              Gérez vos préférences de notifications dans votre <a href="https://taches.ma/fr/profile" target="_blank" style="color: #64748b; text-decoration: underline;">Profil utilisateur</a>.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generates Plain Text alternative for email clients that do not support HTML
 */
export function renderEmailPlainText(options: BaseEmailOptions): string {
  const {
    preheader,
    headline,
    greetingName,
    paragraphs,
    dataRows,
    calloutBox,
    primaryAction,
  } = options;

  const lines: string[] = [];

  lines.push(`TÂCHES.MA | ${preheader.toUpperCase()}`);
  lines.push('----------------------------------------------------');
  lines.push('');
  lines.push(headline);
  lines.push('');
  lines.push(`Bonjour ${greetingName},`);
  lines.push('');

  paragraphs.forEach((p) => {
    // Strip simple HTML tags like <strong>
    const clean = p.replace(/<[^>]*>/g, '');
    lines.push(clean);
    lines.push('');
  });

  if (dataRows && dataRows.length > 0) {
    lines.push('DÉTAILS DE LA MISSION :');
    dataRows.forEach((r) => {
      lines.push(`- ${r.label} : ${r.value}`);
    });
    lines.push('');
  }

  if (calloutBox) {
    lines.push(`[NOTE SÉCURITÉ] ${calloutBox.title} : ${calloutBox.text}`);
    lines.push('');
  }

  if (primaryAction) {
    lines.push(`👉 ${primaryAction.label} :`);
    lines.push(primaryAction.url);
    lines.push('');
  }

  lines.push('----------------------------------------------------');
  lines.push('Tâches.ma - Micro-missions et freelancing sécurisé au Maroc');
  lines.push('Besoin d\'aide ? Contactez notre support : support@taches.ma');
  lines.push('Gérer vos notifications : https://taches.ma/fr/profile');

  return lines.join('\n');
}
