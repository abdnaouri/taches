/**
 * Google Rich Snippets, Structured Data & Wikidata Knowledge Graph (Schema.org JSON-LD)
 * Fully compliant with Google Search Best Practices, Wikidata Knowledge Graph & GEO Standards.
 */

export const BASE_URL = 'https://taches.ma';

/**
 * Authoritative Wikidata Entity Identifiers for High-Precision Entity Grounding
 */
export const WIKIDATA_ENTITIES = {
  // Platform Entity
  taches: 'https://www.wikidata.org/wiki/Q141629849',

  // Geographic Entities (Morocco & Major Cities)
  morocco: 'https://www.wikidata.org/wiki/Q1028',
  casablanca: 'https://www.wikidata.org/wiki/Q34647',
  rabat: 'https://www.wikidata.org/wiki/Q3551',
  marrakech: 'https://www.wikidata.org/wiki/Q34167',
  tanger: 'https://www.wikidata.org/wiki/Q126148',
  fes: 'https://www.wikidata.org/wiki/Q80985',
  agadir: 'https://www.wikidata.org/wiki/Q170560',

  // Concept & Industry Entities
  freelancing: 'https://www.wikidata.org/wiki/Q562771',
  microwork: 'https://www.wikidata.org/wiki/Q6840428',
  crowdsourcing: 'https://www.wikidata.org/wiki/Q275969',
  escrow: 'https://www.wikidata.org/wiki/Q678648',
  darija: 'https://www.wikidata.org/wiki/Q56428',
  ecommerce: 'https://www.wikidata.org/wiki/Q484876',
  webDevelopment: 'https://www.wikidata.org/wiki/Q386275',
  graphicDesign: 'https://www.wikidata.org/wiki/Q185925',

  // Negative Disambiguation Target (Dermatological hyperpigmentation)
  hyperpigmentation: 'https://www.wikidata.org/wiki/Q3144865',
} as const;

/**
 * Root Organization Schema with Full Wikidata Grounding & Disambiguation
 */
export function getOrganizationSchema() {
  return {
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'tâches.ma',
    alternateName: [
      'taches.ma',
      'Tâches Maroc',
      'Taches Maroc',
      'Taches.ma',
      'Freelance Maroc Tâches',
      'منصة المهام المصغرة المغرب',
      'مهام.ما',
      'تاش.ما',
    ],
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      '@id': `${BASE_URL}/#logo`,
      url: `${BASE_URL}/icon.svg`,
      caption: 'tâches.ma — 1ère Bourse de micro-tâches & Plateforme Freelance au Maroc',
      width: 512,
      height: 512,
    },
    image: `${BASE_URL}/og-image.png`,
    description:
      '1ère bourse marocaine de micro-tâches, missions locales et services freelance avec paiement garanti sous séquestre Daman.',
    disambiguatingDescription:
      'Plateforme marocaine de travail freelance, services numériques et micro-tâches rémunérées sous séquestre Daman (Wikidata: Q141629849, Q562771, Q6840428, Q678648). Ne concerne aucun produit cosmétique anti-taches, dermatologique ou traitement d’hyperpigmentation (Wikidata: Q3144865).',
    sameAs: [
      WIKIDATA_ENTITIES.taches,
      'https://twitter.com/tachesma',
      'https://www.linkedin.com/company/tachesma',
      'https://www.facebook.com/tachesma',
      'https://www.instagram.com/taches.ma',
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'MA',
      addressLocality: 'Casablanca',
      addressRegion: 'Casablanca-Settat',
    },
    areaServed: [
      { '@type': 'Country', name: 'Morocco', sameAs: WIKIDATA_ENTITIES.morocco },
      { '@type': 'City', name: 'Casablanca', sameAs: WIKIDATA_ENTITIES.casablanca },
      { '@type': 'City', name: 'Rabat', sameAs: WIKIDATA_ENTITIES.rabat },
      { '@type': 'City', name: 'Marrakech', sameAs: WIKIDATA_ENTITIES.marrakech },
      { '@type': 'City', name: 'Tanger', sameAs: WIKIDATA_ENTITIES.tanger },
      { '@type': 'City', name: 'Fès', sameAs: WIKIDATA_ENTITIES.fes },
      { '@type': 'City', name: 'Agadir', sameAs: WIKIDATA_ENTITIES.agadir },
    ],
    knowsAbout: [
      { '@type': 'DefinedTerm', name: 'Freelance Maroc', sameAs: WIKIDATA_ENTITIES.freelancing },
      { '@type': 'DefinedTerm', name: 'Micro-tâches au Maroc', sameAs: WIKIDATA_ENTITIES.microwork },
      { '@type': 'DefinedTerm', name: 'Crowdsourcing & Travail collaboratif', sameAs: WIKIDATA_ENTITIES.crowdsourcing },
      { '@type': 'DefinedTerm', name: 'Paiement sous séquestre Daman', sameAs: WIKIDATA_ENTITIES.escrow },
      { '@type': 'DefinedTerm', name: 'Traduction Darija Marocaine', sameAs: WIKIDATA_ENTITIES.darija },
      { '@type': 'DefinedTerm', name: 'E-commerce & Shopify Maroc', sameAs: WIKIDATA_ENTITIES.ecommerce },
      { '@type': 'DefinedTerm', name: 'Développement Web & Mobile Maroc', sameAs: WIKIDATA_ENTITIES.webDevelopment },
      { '@type': 'DefinedTerm', name: 'Graphisme & Design de Logo', sameAs: WIKIDATA_ENTITIES.graphicDesign },
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+212-600-000000',
        contactType: 'customer service',
        areaServed: 'MA',
        availableLanguage: ['French', 'Arabic', 'English'],
      },
    ],
  };
}

/**
 * Root WebSite Schema
 */
export function getWebSiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'tâches.ma',
    alternateName: ['taches.ma', 'Tâches Maroc', 'Taches Maroc', 'مهام.ما', 'تاش.ما'],
    description: 'Bourse de micro-tâches & services freelance au Maroc sous séquestre Daman',
    sameAs: [WIKIDATA_ENTITIES.taches],
    inLanguage: ['fr-MA', 'ar-MA', 'en-US'],
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/fr/tasks?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Primary Site Navigation Schema
 */
export function getSiteNavigationSchema() {
  return {
    '@type': 'ItemList',
    '@id': `${BASE_URL}/#navigation`,
    name: 'Catégories de Services Freelance & Micro-Tâches au Maroc',
    description: 'Explorez nos catégories phares de missions et prestations au Maroc',
    itemListElement: [
      {
        '@type': 'SiteNavigationElement',
        position: 1,
        name: 'Micro-tâches, Terrain & Mystère',
        description: 'Clients mystères, relevés de prix supermarché, files d’attente et tests sur téléphones au Maroc.',
        url: `${BASE_URL}/fr/tasks?category=micro`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 2,
        name: 'Saisie de Données, Excel & Appels',
        description: 'Nettoyage Excel, saisie de reçus froissés, appels mystères et prospection B2B au Maroc.',
        url: `${BASE_URL}/fr/tasks?category=assistance`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 3,
        name: 'Web, E-commerce & Développement',
        description: 'Paramétrage boutique Shopify/WooCommerce, intégration passerelles de paiement et corrections bugs.',
        url: `${BASE_URL}/fr/tasks?category=development`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 4,
        name: 'Marketing, Réputation & Veille Ads',
        description: 'Signalement de faux profils, veille pubs concurrents, voix off en Darija et montage TikTok/Reels.',
        url: `${BASE_URL}/fr/tasks?category=marketing`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 5,
        name: 'Traduction, Démarches & Écritures',
        description: 'Aide portails publics CNSS/Massar, lettres de réclamation formelles et traduction Arabe/Français.',
        url: `${BASE_URL}/fr/tasks?category=copywriting`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 6,
        name: 'Graphisme, Retouches Photo & Logos',
        description: 'Création de logos modernes, détourage photos e-commerce et visuels réseaux sociaux.',
        url: `${BASE_URL}/fr/tasks?category=design`,
      },
    ],
  };
}

/**
 * Employment Agency Schema
 */
export function getEmploymentAgencySchema() {
  return {
    '@type': 'EmploymentAgency',
    '@id': `${BASE_URL}/#employment-agency`,
    name: 'tâches.ma — Plateforme Freelance & Travail Indépendant Maroc',
    url: `${BASE_URL}/fr/freelance-maroc`,
    description:
      'Mise en relation directe entre donneurs d’ordre, entreprises marocaines et prestataires freelances indépendants sous paiement garanti.',
    disambiguatingDescription:
      'Bourse d’emploi freelance et de micro-travail au Maroc, sans rapport avec la dermocosmétique.',
    sameAs: [WIKIDATA_ENTITIES.taches],
    parentOrganization: {
      '@id': `${BASE_URL}/#organization`,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Morocco',
      sameAs: WIKIDATA_ENTITIES.morocco,
    },
  };
}

/**
 * Online Marketplace Schema
 */
export function getOnlineMarketplaceSchema() {
  return {
    '@type': 'OnlineMarketplace',
    '@id': `${BASE_URL}/#marketplace`,
    name: 'tâches.ma Marketplace Freelance Maroc',
    url: BASE_URL,
    description:
      'Marketplace marocaine de services numériques, graphisme, développement, e-commerce et micro-tâches sous séquestre Daman.',
    sameAs: [WIKIDATA_ENTITIES.taches],
    parentOrganization: {
      '@id': `${BASE_URL}/#organization`,
    },
  };
}

/**
 * Consolidated Root Knowledge Graph Schema
 */
export function getRootGraphSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      getWebSiteSchema(),
      getOrganizationSchema(),
      getSiteNavigationSchema(),
      getEmploymentAgencySchema(),
      getOnlineMarketplaceSchema(),
    ],
  };
}

/**
 * Daman Escrow & HowTo Schema for the Escrow Protection Page
 */
export function getDamanEscrowSchema(locale: string = 'fr') {
  const isAr = locale === 'ar';
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FinancialService',
        '@id': `${BASE_URL}/#daman-escrow`,
        name: isAr ? 'ضمان Séquestre Daman — tâches.ma' : 'Séquestre Daman — tâches.ma',
        serviceType: 'Escrow Service',
        description: isAr
          ? 'نظام الضمان المالي وسيكستر Daman لحماية صفقات العمل الحر والمصغر في المغرب.'
          : 'Service marocain de consignation financière et séquestre sous garantie pour prestations freelance et micro-tâches.',
        provider: {
          '@id': `${BASE_URL}/#organization`,
        },
        areaServed: {
          '@type': 'Country',
          name: 'Morocco',
          sameAs: WIKIDATA_ENTITIES.morocco,
        },
        sameAs: [WIKIDATA_ENTITIES.escrow],
        feesAndCommissionsSpecification: 'Commission de 15% couvrant la protection sous séquestre Daman, l’arbitrage et le support 7j/7.',
      },
      {
        '@type': 'HowTo',
        '@id': `${BASE_URL}/${locale}/daman#howto`,
        name: isAr
          ? 'كيف يعمل الضمان المالي Séquestre Daman في 3 خطوات'
          : 'Comment fonctionne la garantie sous séquestre Daman en 3 étapes',
        description: isAr
          ? 'دليل تفصيلي خطوة بخطوة حول كيفية حماية المعاملات والمدفوعات على منصة tâches.ma بالمغرب.'
          : 'Guide étape par étape du fonctionnement de la protection des paiements par séquestre sur tâches.ma au Maroc.',
        totalTime: 'PT5M',
        step: [
          {
            '@type': 'HowToStep',
            position: 1,
            name: isAr ? '1. إيداع المبلغ المالي' : '1. Dépôt Garanti',
            text: isAr
              ? 'يقوم صاحب العمل بإيداع الميزانية المتفق عليها بالدرهم المغربي (MAD). تبقى الأموال محفوظة بأمان تحت الضمان المحايد ولا تُحول للمنفذ.'
              : 'Le donneur d’ordre dépose le budget en Dirhams (MAD). Les fonds sont conservés sous séquestre neutre et ne sont pas débités vers le prestataire.',
            url: `${BASE_URL}/${locale}/daman#step-1`,
          },
          {
            '@type': 'HowToStep',
            position: 2,
            name: isAr ? '2. تنفيذ العمل بثقة' : '2. Exécution Sereine',
            text: isAr
              ? 'يبدأ المستقل في إنجاز المهمة وهو مطمئن بأن مستحقاته المالية محجوزة وجاهزة للصرف.'
              : 'Le freelance commence le travail avec la certitude que la rémunération est réservée et disponible.',
            url: `${BASE_URL}/${locale}/daman#step-2`,
          },
          {
            '@type': 'HowToStep',
            position: 3,
            name: isAr ? '3. التحقق وتحرير الدفع' : '3. Validation & Déblocage',
            text: isAr
              ? 'بعد فحص الملفات والنتائج المسلمة، يضغط العميل على "تأكيد واستلام" ليتم تحويل الأرباح فوراً لمحفظة المنفذ.'
              : 'Après examen des preuves et fichiers livrés, le client clique sur "Valider" et les fonds sont débloqués immédiatement.',
            url: `${BASE_URL}/${locale}/daman#step-3`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: isAr
              ? 'ماذا يحدث إذا لم يتم تسليم العمل في الوقت المحدد؟'
              : 'Que se passe-t-il si le travail n’est pas livré dans les temps ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: isAr
                ? 'يمكن لصاحب العمل إلغاء الطلب واستعادة 100% من المبلغ المودع مباشرة إلى رصيده المتاح بدون أي اقتطاعات.'
                : 'Le client peut annuler la commande et récupérer 100% de son dépôt directement sur son solde disponible sans frais.',
            },
          },
          {
            '@type': 'Question',
            name: isAr
              ? 'ماذا يحدث إذا كان العمل غير مطابق للشروط المتفق عليها؟'
              : 'Que se passe-t-il si le travail est non conforme au brief ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: isAr
                ? 'يمكن للعميل طلب تعديل مجاني، أو فتح نزاع للتحكيم. يقوم وسطاؤنا بفحص الأدلة والبت في النزاع خلال 24 ساعة.'
                : 'Le client peut d’abord demander une retouche gratuite, ou ouvrir un arbitrage. Nos médiateurs examinent les preuves et tranchent sous 24h.',
            },
          },
        ],
      },
    ],
  };
}
