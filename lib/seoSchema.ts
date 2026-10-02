/**
 * Google Rich Snippets & Structured Data (Schema.org JSON-LD)
 * Fully compliant with Google Search Best Practices & Authority Signals
 */

export const BASE_URL = 'https://taches.ma';

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'tâches.ma',
    alternateName: ['taches.ma', 'Tâches Maroc', 'Taches Maroc', 'Taches.ma', 'Freelance Maroc Tâches'],
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
    description: '1ère bourse marocaine de micro-tâches, missions locales et services freelance avec paiement garanti sous séquestre Daman.',
    disambiguatingDescription: 'Plateforme marocaine de travail freelance, services numériques et micro-tâches rémunérées sous séquestre. Ne concerne aucun produit cosmétique anti-taches ou parapharmacie.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'MA',
      addressLocality: 'Casablanca',
      addressRegion: 'Casablanca-Settat',
    },
    areaServed: [
      { '@type': 'Country', name: 'Morocco' },
      { '@type': 'City', name: 'Casablanca' },
      { '@type': 'City', name: 'Rabat' },
      { '@type': 'City', name: 'Marrakech' },
      { '@type': 'City', name: 'Tanger' },
      { '@type': 'City', name: 'Fès' },
      { '@type': 'City', name: 'Agadir' },
    ],
    knowsAbout: [
      'Freelance Maroc',
      'Micro-tâches au Maroc',
      'Plateforme freelance Casablanca',
      'E-commerce et Boutiques Shopify',
      'Saisie de données et Excel',
      'Graphiste et Création de Logos',
      'Développeur web et mobile Maroc',
      'Traduction Darija et Arabe',
      'Séquestre Daman Maroc',
      'Enquêtes et Visites Mystères',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+212-600-000000',
        contactType: 'customer service',
        areaServed: 'MA',
        availableLanguage: ['French', 'Arabic'],
      },
    ],
  };
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'tâches.ma',
    alternateName: ['taches.ma', 'Tâches Maroc', 'Taches Maroc'],
    description: 'Bourse de micro-tâches & services freelance au Maroc sous séquestre Daman',
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

export function getSiteNavigationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
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

export function getFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Comment fonctionne le paiement sécurisé sous séquestre Daman sur tâches.ma ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sur tâches.ma, lorsque vous commandez un service ou postez une micro-tâche, le montant convenu est consigné sous séquestre Daman. Le prestataire commence la mission immédiatement, et les fonds ne lui sont reversés qu’après votre vérification et validation complète du travail livré.',
        },
      },
      {
        '@type': 'Question',
        name: 'Quels types de micro-tâches et services peut-on déléguer au Maroc ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Vous pouvez déléguer des tâches digitales : graphisme, création de logo, saisie Excel de factures, configuration de boutique e-commerce Shopify / WooCommerce, traduction en Darija marocaine, marketing digital et développement web.',
        },
      },
      {
        '@type': 'Question',
        name: 'Comment les freelances et prestataires marocains reçoivent-ils leurs gains ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Dès validation de la mission par le client, les fonds sont instantanément crédités sur le solde du prestataire. Le retrait se fait simplement via Remitly ou instantanément en USDT via Binance Pay.',
        },
      },
      {
        '@type': 'Question',
        name: 'En combien de temps une mission est-elle prise en charge ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Grâce à notre communauté de freelances et exécutants qualifiés disponibles à Casablanca, Rabat, Marrakech, Tanger, Fès, Agadir et partout au Royaume, les premières propositions arrivent généralement en moins de 5 minutes.',
        },
      },
    ],
  };
}

export function getServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Bourse de Micro-tâches et Services Freelance au Maroc',
    provider: {
      '@id': `${BASE_URL}/#organization`,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Morocco',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Services Freelance & Micro-Missions Maroc',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Micro-tâches & Saisie de données',
          },
          priceCurrency: 'MAD',
          price: '15.00',
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Création Logo & Identité Visuelle',
          },
          priceCurrency: 'MAD',
          price: '150.00',
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Paramétrage E-commerce Shopify Maroc',
          },
          priceCurrency: 'MAD',
          price: '250.00',
        },
      ],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '1420',
      bestRating: '5',
      worstRating: '1',
    },
  };
}

export function getEmploymentAgencySchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EmploymentAgency',
    '@id': `${BASE_URL}/#employment-agency`,
    name: 'tâches.ma — Plateforme Freelance & Travail Indépendant Maroc',
    url: `${BASE_URL}/fr/freelance-maroc`,
    description: 'Mise en relation directe entre donneurs d’ordre, entreprises marocaines et prestataires freelances indépendants sous paiement garanti.',
    disambiguatingDescription: 'Bourse d’emploi freelance et de micro-travail au Maroc, sans rapport avec la dermocosmétique.',
    areaServed: {
      '@type': 'Country',
      name: 'Morocco',
    },
  };
}

export function getOnlineMarketplaceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'OnlineMarketplace',
    '@id': `${BASE_URL}/#marketplace`,
    name: 'tâches.ma Marketplace Freelance Maroc',
    url: BASE_URL,
    description: 'Marketplace marocaine de services numériques, graphisme, développement, e-commerce et micro-tâches sous séquestre Daman.',
  };
}

