export interface SeoLandingService {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  badge: string;
  categoryKey: string;
  icon: string;
  averagePriceMAD: number;
  deliveryTimeHours: number;
  heroPitch: string;
  whyChooseUs: string[];
  sampleDeliverables: string[];
  faqs: { q: string; a: string }[];
  relatedSlugs: string[];
  tags: string[];
}

export const SEO_SERVICES: SeoLandingService[] = [
  {
    slug: 'graphiste-freelance-maroc',
    title: 'Graphiste Freelance au Maroc',
    metaTitle: 'Graphiste Freelance Maroc — Création Logo & Visuels | Tâches.ma',
    metaDescription: 'Trouvez un graphiste freelance au Maroc en quelques minutes. Création de logo, identité visuelle, bannières e-commerce et retouche photo. Paiement sous séquestre garanti.',
    h1: 'Trouvez le meilleur Graphiste Freelance au Maroc en 1 minute',
    badge: '🎨 Design & Identité Visuelle',
    categoryKey: 'design',
    icon: '🎨',
    averagePriceMAD: 150,
    deliveryTimeHours: 24,
    heroPitch: 'Besoin d’un logo percutant, d’affiches publicitaires, de visuels Instagram ou d’une identité de marque complète ? Déléguez votre projet graphique à des designers marocains vérifiés.',
    whyChooseUs: [
      'Plus de 3 200 graphistes et directeurs artistiques basés au Maroc',
      'Fichiers sources fournis (AI, PSD, SVG, PNG transparent haute résolution)',
      'Révisions incluses et paiement bloqué sous séquestre Daman jusqu’à validation',
      'Livraison express en 24h à 48h selon vos impératifs',
    ],
    sampleDeliverables: [
      '3 pistes de logos vectoriels originaux et charte graphique',
      'Pack de 5 visuels percutants pour Instagram & Facebook Ads',
      'Détourage et retouche fond blanc pour catalogue e-commerce',
      'Bannières promotionnelles et affiches prêtes pour impression',
    ],
    faqs: [
      {
        q: 'Combien coûte un graphiste freelance au Maroc ?',
        a: 'Sur tâches.ma, un logo démarre à partir de 150 DH à 350 DH, un visuel pour réseaux sociaux à partir de 40 DH, et un pack de branding complet autour de 500 DH. Les fonds restent sécurisés jusqu’à votre approbation.',
      },
      {
        q: 'Quels types de fichiers vais-je recevoir ?',
        a: 'Le graphiste vous remet l’ensemble des fichiers sources vectoriels (.AI, .EPS, .SVG) ainsi que les formats web haute définition (.PNG transparent, .JPG 300 DPI, .PDF haute définition).',
      },
      {
        q: 'Comment être certain de la qualité du travail ?',
        a: 'Vous pouvez consulter les avis clients vérifiés et le portfolio du freelance avant de valider votre choix. De plus, vous bénéficiez de demandes de retouches gratuites.',
      },
    ],
    relatedSlugs: [
      'creation-logo-maroc',
      'montage-video-freelance-maroc',
      'gestion-boutique-youcan-maroc',
      'developpeur-freelance-maroc',
    ],
    tags: ['graphiste maroc', 'freelance logo casablanca', 'design marrakech', 'retouche photo rabat', 'designer freelance'],
  },
  {
    slug: 'developpeur-freelance-maroc',
    title: 'Développeur Freelance Maroc',
    metaTitle: 'Développeur Web & Mobile Freelance Maroc | Tâches.ma',
    metaDescription: 'Recrutez un développeur freelance au Maroc : WordPress, Next.js, Laravel, Shopify, React et Flutter. Développeurs expérimentés à Casablanca, Rabat, Tanger.',
    h1: 'Développeur Web & Mobile Freelance au Maroc',
    badge: '💻 Tech & Développement',
    categoryKey: 'development',
    icon: '💻',
    averagePriceMAD: 400,
    deliveryTimeHours: 48,
    heroPitch: 'Création de sites vitrines, boutiques e-commerce, intégration d’API de paiement marocaines (CMI, Viva Wallet), applications mobiles et dépannage de bugs en urgence.',
    whyChooseUs: [
      'Experts WordPress, Next.js, React, Laravel, PHP, Python et Flutter',
      'Intégration fluide des passerelles de paiement marocaines (CMI, Payzone, Stripe)',
      'Paiement échelonné et garanti sous séquestre Daman à chaque jalon technique',
      'Code propre, documenté, responsive mobile et optimisé pour le référencement SEO',
    ],
    sampleDeliverables: [
      'Site vitrine moderne ultra-rapide optimisé pour Google',
      'Boutique en ligne avec paiement CMI et gestion du Cash on Delivery (COD)',
      'Correction de bugs CSS, JavaScript, base de données ou hébergement',
      'Application mobile Android / iOS prête pour le Play Store et App Store',
    ],
    faqs: [
      {
        q: 'Quel est le tarif moyen d’un développeur web freelance au Maroc ?',
        a: 'Une correction de bug ou modification ponctuelle débute à 150 DH. La configuration d’un site ou boutique en ligne se situe généralement entre 400 DH et 2 500 DH selon la complexité.',
      },
      {
        q: 'Comment s’effectue le suivi et le test du code ?',
        a: 'Le prestataire effectue les développements sur un environnement de test ou branche dédiée. Vous validez le bon fonctionnement avant que le paiement ne lui soit débloqué.',
      },
    ],
    relatedSlugs: [
      'gestion-boutique-youcan-maroc',
      'expert-seo-maroc',
      'graphiste-freelance-maroc',
    ],
    tags: ['developpeur web maroc', 'freelance wordpress casablanca', 'programmeur react maroc', 'developpeur mobile tanger'],
  },
  {
    slug: 'gestion-boutique-youcan-maroc',
    title: 'Gestionnaire Boutique YouCan Maroc',
    metaTitle: 'Expert YouCan & Shopify Maroc — Freelance E-commerce | Tâches.ma',
    metaDescription: 'Déléguez la configuration de votre boutique YouCan ou Shopify au Maroc : ajout de produits, fiches produits percutantes en Darija, formulaire Cash on Delivery express.',
    h1: 'Experts E-commerce YouCan & Shopify au Maroc',
    badge: '🛍️ E-commerce & COD',
    categoryKey: 'development',
    icon: '🛍️',
    averagePriceMAD: 250,
    deliveryTimeHours: 24,
    heroPitch: 'Boostez vos ventes en Cash on Delivery au Maroc. Faites configurer et optimiser votre boutique YouCan ou Shopify par des spécialistes rompus aux attentes des acheteurs marocains.',
    whyChooseUs: [
      'Formulaire de commande simplifié 1-Click adapté au marché marocain (ville, quartier, téléphone)',
      'Rédaction de pages produits vendeuses en Darija, Français et Arabe',
      'Intégration des pixels publicitaires Meta Ads, TikTok Pixel et Google Analytics',
      'Optimisation de la vitesse de chargement sur réseau 4G / mobile',
    ],
    sampleDeliverables: [
      'Boutique YouCan ou Shopify clé en main prête à recevoir des commandes',
      '10 fiches produits rédigées avec visuels haute conversion',
      'Intégration de l’export des commandes pour société de livraison (Ozbex, Cathedis, etc.)',
      'Mise en place de compteurs d’urgence et d’avis clients crédibles',
    ],
    faqs: [
      {
        q: 'Pourquoi passer par un freelance pour ma boutique YouCan ?',
        a: 'Un expert configure un thème optimisé pour le COD au Maroc avec un taux de conversion maximal, vous faisant gagner un temps précieux pour vos publicités et votre stock.',
      },
      {
        q: 'Les fiches produits sont-elles rédigées en Darija marocaine ?',
        a: 'Oui, nos prestataires maîtrisent les tournures commerciales locales (Darija marocaine, arabe standard ou français) adaptées à votre cible.',
      },
    ],
    relatedSlugs: [
      'graphiste-freelance-maroc',
      'community-manager-maroc',
      'developpeur-freelance-maroc',
    ],
    tags: ['youcan maroc', 'shopify maroc freelance', 'cod maroc e-commerce', 'dropshipping maroc expert'],
  },
  {
    slug: 'saisie-donnees-maroc',
    title: 'Saisie de Données & Excel Freelance Maroc',
    metaTitle: 'Saisie de Données & Nettoyage Excel Maroc | Tâches.ma',
    metaDescription: 'Externalisez la saisie de factures, numérisation de documents, nettoyage de bases de contacts marocains (+212) et transcription Word au Maroc.',
    h1: 'Saisie de Données, Excel & Traitement de Documents au Maroc',
    badge: '📊 Administratif & Excel',
    categoryKey: 'assistance',
    icon: '📊',
    averagePriceMAD: 90,
    deliveryTimeHours: 12,
    heroPitch: 'Libérez-vous des tâches chronophages : saisie de tickets de caisse, conversion de PDF scannés en Excel, dédoublonnage de listings téléphoniques et retranscription audio.',
    whyChooseUs: [
      'Opérateurs de saisie rigoureux, rapides et respectueux de la confidentialité',
      'Standardisation des numéros de téléphone marocains (+212 6... / +212 7...)',
      'Tableaux Excel vérifiés avec formules et totaux de contrôle à 100%',
      'Tarifs ultra-compétitifs à partir de 50 DH',
    ],
    sampleDeliverables: [
      'Fichier Excel (.xlsx) propre avec formatage conditionnel et zéro doublon',
      'Reconstitution de relevés bancaires ou factures depuis des scans PDF',
      'Retranscription fidèle de notes de réunion ou de mémos vocaux',
      'Base de données prospects qualifiée avec noms, villes et coordonnées',
    ],
    faqs: [
      {
        q: 'Comment est garantie la confidentialité de mes données ?',
        a: 'Tous les prestataires acceptent notre charte de stricte confidentialité. Vos fichiers ne sont accessibles que par le freelance sélectionné pour la durée de la mission.',
      },
      {
        q: 'Quel est le délai pour traiter 1 000 lignes Excel ?',
        a: 'La majorité des missions de saisie et de nettoyage sont livrées en moins de 12 à 24 heures.',
      },
    ],
    relatedSlugs: [
      'traduction-darija-maroc',
      'developpeur-freelance-maroc',
      'gestion-boutique-youcan-maroc',
    ],
    tags: ['saisie de donnees maroc', 'excel freelance casablanca', 'assistant virtuel maroc', 'transcription audio maroc'],
  },
  {
    slug: 'traduction-darija-maroc',
    title: 'Traduction Darija, Arabe & Français au Maroc',
    metaTitle: 'Traduction Darija, Arabe, Français & Anglais Maroc | Tâches.ma',
    metaDescription: 'Service de traduction professionnelle en Darija marocaine, arabe littéraire, français et anglais. Sous-titres vidéo, contrats et contenus publicitaires.',
    h1: 'Traduction Professionnelle Darija, Arabe & Français au Maroc',
    badge: '✍️ Traduction & Rédaction',
    categoryKey: 'copywriting',
    icon: '✍️',
    averagePriceMAD: 100,
    deliveryTimeHours: 24,
    heroPitch: 'Adaptez vos messages au public marocain : traduction de scripts publicitaires en Darija authentique, sous-titres Arabizi / alphabet arabe, relecture juridique et administrative.',
    whyChooseUs: [
      'Traducteurs bilingues natifs maîtrisant les subtilités régionales (Casablanca, Fès, Tanger, Marrakech)',
      'Sous-titrage vidéo synchronisé (.SRT) pour TikTok, Instagram Reels et YouTube',
      'Respect strict du ton de voix et des expressions idiomatiques marocaines',
      'Livraison soignée en format Word et PDF',
    ],
    sampleDeliverables: [
      'Traduction fidèle de documents commerciaux ou administratifs',
      'Scripts publicitaires rédigés en Darija avec accroches vendeuses',
      'Fichiers de sous-titres synchronisés pour campagnes vidéo',
      'Relecture et correction de textes pour éliminer toute faute',
    ],
    faqs: [
      {
        q: 'Pouvez-vous traduire vers la Darija en alphabet arabe et en caractères latins (Arabizi/3aransi) ?',
        a: 'Absolument, nos traducteurs fournissent les deux versions selon vos besoins de publication.',
      },
      {
        q: 'Quel est le tarif au mot ou par document ?',
        a: 'Un document standard de 2 à 3 pages coûte généralement entre 80 et 150 DH, avec garantie de relecture illimitée.',
      },
    ],
    relatedSlugs: [
      'community-manager-maroc',
      'saisie-donnees-maroc',
      'montage-video-freelance-maroc',
    ],
    tags: ['traduction darija francais', 'traducteur arabe maroc', 'sous titrage darija', 'redaction web maroc'],
  },
  {
    slug: 'community-manager-maroc',
    title: 'Community Manager Freelance Maroc',
    metaTitle: 'Community Manager Freelance Maroc — Instagram & TikTok | Tâches.ma',
    metaDescription: 'Engagez un community manager freelance au Maroc pour animer vos pages Instagram, TikTok et Facebook, répondre aux messages clients et créer du contenu viral.',
    h1: 'Community Management & Réseaux Sociaux au Maroc',
    badge: '📱 Social Media & Modération',
    categoryKey: 'marketing',
    icon: '📱',
    averagePriceMAD: 350,
    deliveryTimeHours: 48,
    heroPitch: 'Développez votre communauté et répondez à vos prospects en temps réel : animation de comptes Instagram, modération des commentaires WhatsApp/DM et calendriers éditoriaux.',
    whyChooseUs: [
      'Gestionnaire de communauté maîtrisant les tendances virales au Maroc',
      'Réponses rapides aux messages privés (DM) en Darija et Français pour convertir vos prospects',
      'Planification de posts, stories et Reels avec visuels engageants',
      'Rapports d’engagement mensuels et suivi de la croissance d’abonnés',
    ],
    sampleDeliverables: [
      'Planning éditorial mensuel (12 à 20 publications + stories)',
      'Modération quotidienne des commentaires et redirection vers WhatsApp',
      'Mise en place de réponses automatiques personnalisées',
      'Veille concurrentielle et identification des sons tendances',
    ],
    faqs: [
      {
        q: 'Le community manager répond-il en Darija marocaine ?',
        a: 'Oui, la communication se fait en Darija fluide, polie et commerciale pour maximiser la confiance et les ventes directes.',
      },
      {
        q: 'Puis-je commander une formule d’essai sur 1 semaine ?',
        a: 'Tout à fait, vous pouvez poster une mission test de 7 jours avant d’engager une collaboration plus longue.',
      },
    ],
    relatedSlugs: [
      'graphiste-freelance-maroc',
      'montage-video-freelance-maroc',
      'expert-seo-maroc',
    ],
    tags: ['community manager maroc', 'gestion instagram maroc', 'moderation facebook casablanca', 'marketing digital maroc'],
  },
  {
    slug: 'montage-video-freelance-maroc',
    title: 'Monteur Vidéo Freelance Maroc (Reels & TikTok)',
    metaTitle: 'Monteur Vidéo Freelance Maroc — Reels, TikTok & Shorts | Tâches.ma',
    metaDescription: 'Monteurs vidéo freelances au Maroc pour vos vidéos TikTok, Instagram Reels, YouTube et publicités e-commerce. Sous-titres animés et rythme dynamique.',
    h1: 'Monteur Vidéo Freelance au Maroc pour TikTok, Reels & Ads',
    badge: '🎬 Vidéo & Montage',
    categoryKey: 'marketing',
    icon: '🎬',
    averagePriceMAD: 180,
    deliveryTimeHours: 24,
    heroPitch: 'Transformez vos rushs bruts en vidéos verticales captivantes avec sous-titres dynamiques, effets sonores, zooms percutants et musiques tendance.',
    whyChooseUs: [
      'Experts Premiere Pro, Final Cut, CapCut Pro et After Effects',
      'Sous-titres animés mot à mot (style Alex Hormozi / TikTok)',
      'Format optimisé 9:16 vertical 1080x1920 haute qualité',
      'Livraison express pour alimenter votre calendrier de publication',
    ],
    sampleDeliverables: [
      'Pack de 3 vidéos verticales rythmées prêtes à poster',
      'Vidéos publicitaires Meta / TikTok Ads avec accroche (Hook) forte',
      'Incrustation de logos, animations et effets sonores percutants',
      'Exports en MP4 1080p ou 4K sans perte de netteté',
    ],
    faqs: [
      {
        q: 'Quel est le coût d’un montage vidéo pour Instagram ou TikTok ?',
        a: 'Une vidéo courte (30 à 60 secondes) coûte entre 50 et 100 DH. Un pack de 3 vidéos est généralement proposé autour de 180 DH.',
      },
      {
        q: 'Comment envoyer mes rushs volumineux ?',
        a: 'Vous pouvez partager vos vidéos via un simple lien Google Drive, WeTransfer ou Mega directement dans la messagerie du projet.',
      },
    ],
    relatedSlugs: [
      'graphiste-freelance-maroc',
      'community-manager-maroc',
      'gestion-boutique-youcan-maroc',
    ],
    tags: ['monteur video maroc', 'montage reels casablanca', 'tiktok video maroc', 'creation video publicitaire maroc'],
  },
  {
    slug: 'expert-seo-maroc',
    title: 'Consultant & Expert SEO au Maroc',
    metaTitle: 'Expert SEO Maroc — Référencement Naturel Google | Tâches.ma',
    metaDescription: 'Améliorez votre positionnement sur Google au Maroc. Audit SEO, optimisation on-page, recherche de mots-clés marocains et netlinking.',
    h1: 'Consultant SEO & Référencement Naturel au Maroc',
    badge: '🚀 SEO & Visibilité Google',
    categoryKey: 'marketing',
    icon: '🚀',
    averagePriceMAD: 350,
    deliveryTimeHours: 48,
    heroPitch: 'Positionnez votre site en tête de Google Maroc. Attirez des clients qualifiés grâce à une stratégie de référencement naturel adaptée au marché local.',
    whyChooseUs: [
      'Audits techniques complets et identification des erreurs bloquantes',
      'Recherche approfondie de mots-clés à fort volume et haute intention d’achat au Maroc',
      'Optimisation des balises, de la vitesse de chargement et des données structurées Schema.org',
      'Référencement local Google Maps pour attirer des clients dans votre ville',
    ],
    sampleDeliverables: [
      'Rapport d’audit SEO détaillé avec plan d’actions priorisé',
      'Liste de 50 mots-clés stratégiques avec volumes de recherche au Maroc',
      'Optimisation des balises Title, Meta et structure Hn de vos pages',
      'Fiche Google My Business optimisée pour le classement local',
    ],
    faqs: [
      {
        q: 'Combien de temps faut-il pour voir les résultats d’un travail SEO ?',
        a: 'Les premières améliorations techniques et de positionnement apparaissent généralement entre 3 et 6 semaines après les corrections.',
      },
      {
        q: 'Le SEO fonctionne-t-il pour les sites e-commerce au Maroc ?',
        a: 'Oui, positionner vos catégories de produits sur Google génère un trafic récurrent et gratuit sans dépendre uniquement des publicités payantes.',
      },
    ],
    relatedSlugs: [
      'developpeur-freelance-maroc',
      'gestion-boutique-youcan-maroc',
      'traduction-darija-maroc',
    ],
    tags: ['expert seo maroc', 'referencement google casablanca', 'agence seo rabat', 'consultant seo maroc freelance'],
  },
  {
    slug: 'creation-logo-maroc',
    title: 'Création de Logo Professionnel au Maroc',
    metaTitle: 'Création Logo Maroc — Logo Pro & Charte Graphique | Tâches.ma',
    metaDescription: 'Commandez un logo unique pour votre entreprise marocaine. 3 propositions originales, fichiers vectoriels éditables et cession des droits.',
    h1: 'Création de Logo Professionnel au Maroc en 24h',
    badge: '💎 Branding & Logo',
    categoryKey: 'design',
    icon: '💎',
    averagePriceMAD: 250,
    deliveryTimeHours: 48,
    heroPitch: 'Donnez une identité mémorable et professionnelle à votre marque ou projet. Recevez des propositions de logos modernes conçues par des créatifs marocains.',
    whyChooseUs: [
      '3 concepts originaux différents créés sur-mesure (pas de modèles préfabriqués)',
      'Déclinaisons complètes (version couleur, fond noir, fond blanc, monochrome)',
      'Fichiers vectoriels haute définition prêts pour l’impression et le digital (AI, EPS, SVG, PNG)',
      'Retouches illimitées jusqu’à totale satisfaction',
    ],
    sampleDeliverables: [
      'Logo principal vectoriel haute définition',
      'Favicon et avatar pour réseaux sociaux (Instagram, WhatsApp Business, Facebook)',
      'Mini-guide d’utilisation avec codes couleurs (HEX/RGB) et polices typographiques',
      'Fichiers PNG avec fond transparent pour intégration sur tout support',
    ],
    faqs: [
      {
        q: 'Combien de propositions de logo vais-je recevoir ?',
        a: 'Le graphiste vous présente 3 concepts distincts. Vous choisissez votre préféré et pouvez demander tous les ajustements nécessaires.',
      },
      {
        q: 'Le logo m’appartient-il à 100% ?',
        a: 'Oui, dès la libération du paiement, vous disposez de la pleine propriété intellectuelle et des droits d’exploitation commerciale.',
      },
    ],
    relatedSlugs: [
      'graphiste-freelance-maroc',
      'gestion-boutique-youcan-maroc',
      'montage-video-freelance-maroc',
    ],
    tags: ['creation logo maroc', 'logo entreprise casablanca', 'design logo rabat', 'creation charte graphique maroc'],
  },
];

export function getSeoServiceBySlug(slug: string): SeoLandingService | undefined {
  return SEO_SERVICES.find((s) => s.slug === slug);
}
