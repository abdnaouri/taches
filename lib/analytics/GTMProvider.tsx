'use client';

/**
 * ============================================================
 * tâches.ma — GTM Provider + Consent Banner
 * Server-side safe GTM script injection with Consent Mode v2
 * ============================================================
 *
 * Features:
 *  - Injects GTM snippet into <head> and <body>
 *  - Initializes Consent Mode v2 BEFORE GTM loads
 *  - Renders cookie consent banner on first visit
 *  - Stores user consent choice in localStorage
 *  - Supports GA4 Measurement ID for direct gtag fallback
 *  - Fully GDPR / Morocco Law 09-08 compliant
 */

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import {
  initDataLayer,
  setConsent,
  getDefaultConsentState,
  updateConsentChoice,
  hasConsentChoice,
  hasAnalyticsConsent,
} from './dataLayer';

// ─── Environment Variables ────────────────────────────────────────────────

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || '';
const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '';

// ─── GTM Provider ─────────────────────────────────────────────────────────

interface GTMProviderProps {
  children: React.ReactNode;
}

export function GTMProvider({ children }: GTMProviderProps): JSX.Element {
  const [consentReady, setConsentReady] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Initialize dataLayer array BEFORE GTM script loads
    initDataLayer();

    // 2. Set default consent state (all denied until user accepts)
    const defaultConsent = getDefaultConsentState();
    setConsent('default', defaultConsent);

    // 3. Signal consent is initialized — GTM can now load
    setConsentReady(true);

    // 4. Show banner only if user hasn't made a choice yet
    if (!hasConsentChoice()) {
      // Small delay to not block LCP
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {/* ── GTM Head Script (loads after consent initialized) ── */}
      {GTM_ID && consentReady && (
        <Script
          id="gtm-head"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function(w,d,s,l,i){
  w[l]=w[l]||[];
  w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
  var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),
      dl=l!='dataLayer'?'&l='+l:'';
  j.async=true;
  j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
  f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');
            `.trim(),
          }}
        />
      )}

      {/* ── GA4 Direct (fallback if no GTM) ── */}
      {GA4_ID && !GTM_ID && consentReady && (
        <>
          <Script
            id="ga4-script"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
          />
          <Script
            id="ga4-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA4_ID}', {
  send_page_view: false,
  cookie_flags: 'SameSite=None;Secure',
});
              `.trim(),
            }}
          />
        </>
      )}

      {children}

      {/* ── GTM Body NoScript Fallback ── */}
      {GTM_ID && (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="Google Tag Manager"
          />
        </noscript>
      )}

      {/* ── Consent Banner ── */}
      {showBanner && (
        <ConsentBanner onClose={() => setShowBanner(false)} />
      )}
    </>
  );
}

// ─── Consent Banner Component ─────────────────────────────────────────────

interface ConsentBannerProps {
  onClose: () => void;
}

function ConsentBanner({ onClose }: ConsentBannerProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const dismiss = (granted: boolean) => {
    updateConsentChoice(granted);
    setIsFading(true);
    setTimeout(onClose, 400);
  };

  return (
    <div
      aria-label="Bandeau de consentement aux cookies"
      role="dialog"
      aria-modal="false"
      className={`
        fixed bottom-0 left-0 right-0 z-[9999]
        transition-all duration-400 ease-out
        ${isFading ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
        sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm
      `}
    >
      <div className="bg-white border border-slate-200 shadow-2xl rounded-t-2xl sm:rounded-2xl p-5 text-sm">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-xl leading-none mt-0.5">🍪</span>
          <div className="flex-1">
            <p className="font-bold text-slate-900 text-sm">
              tâches.ma utilise des cookies
            </p>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Nous utilisons des cookies analytiques pour améliorer votre expérience sur notre marketplace.{' '}
              {!isExpanded && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-brand-600 hover:underline font-medium"
                >
                  En savoir plus
                </button>
              )}
            </p>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="bg-slate-50 rounded-xl p-3 mb-3 text-xs text-slate-600 space-y-2 border border-slate-200">
            <div className="flex justify-between">
              <span className="font-semibold">Cookies essentiels</span>
              <span className="text-emerald-600 font-bold">Toujours actifs</span>
            </div>
            <p className="text-slate-500">
              Authentification, sécurité de session, préférences de langue.
            </p>
            <div className="flex justify-between pt-1">
              <span className="font-semibold">Cookies analytiques</span>
              <span className="text-slate-500">Optionnels</span>
            </div>
            <p className="text-slate-500">
              Google Analytics 4 — Mesure d'audience anonyme pour améliorer la plateforme.
              Aucune donnée personnelle n'est partagée avec des tiers.
            </p>
            <p className="text-xs text-slate-400 pt-1 border-t border-slate-200">
              Conformément à la Loi 09-08 (Maroc) et au RGPD européen.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => dismiss(true)}
            className="flex-1 bg-brand-700 hover:bg-brand-800 text-white text-xs font-extrabold py-2.5 px-3 rounded-xl transition-colors"
          >
            Accepter tout
          </button>
          <button
            onClick={() => dismiss(false)}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl transition-colors"
          >
            Refuser
          </button>
        </div>

        <p className="text-center text-slate-400 text-[10px] mt-2">
          Vous pouvez modifier votre choix à tout moment dans vos paramètres.
        </p>
      </div>
    </div>
  );
}

// ─── GTM NoScript (for app/layout.tsx body) ────────────────────────────────

/**
 * Returns raw HTML string for the GTM noscript fallback.
 * Use this in the <body> if you can't use React components.
 */
export function getGTMNoScriptHTML(): string {
  if (!GTM_ID) return '';
  return `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;
}

export { GTM_ID, GA4_ID };
