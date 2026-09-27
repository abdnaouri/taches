import { Task, UserProfile, WalletTransaction } from '@/types/database';
import { Locale } from './i18n/types';

export const initialUser: UserProfile = {
  id: 'usr_me_1',
  email: 'aero@example.com',
  fullName: 'Aero Mehdi',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  activeRole: 'PERFORMER',
  balanceAvailable: 285.50,
  balanceEscrow: 75.00,
  createdAt: '2024-01-15T10:00:00Z',

  // Performer stats (UNU-style Level 3 Pro)
  performerTier: 'level_3',
  performerXp: 780, // out of 1000 for level 4
  performerRating: 4.96,
  performerReviewsCount: 48,
  performerCompletedTasks: 52,
  passedQualification: true,

  // Customer stats (Work-zilla style)
  customerRating: 5.0,
  customerTotalSpent: 640.00,
  customerTasksPosted: 11,
};

export interface LocalizedTaskContent {
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  requiredProofs: Record<Locale, string[]>;
}

export const taskTranslations: Record<string, LocalizedTaskContent> = {
  tsk_101: {
    title: {
      fr: "Correction responsive Tailwind CSS & formulaire de contact Next.js",
      ar: "إصلاح تجاوب Tailwind CSS ونموذج الاتصال في Next.js",
      en: "Tailwind CSS responsive fix & Next.js contact form",
      es: "Corrección responsive Tailwind CSS y formulario de contacto Next.js"
    },
    description: {
      fr: "Nous avons une landing page Next.js dont le menu mobile se chevauche sur iPhone 13/14 et le formulaire de contact nécessite une validation Zod avec envoi d'email via Resend. Code propre et testé requis.",
      ar: "لدينا صفحة هبوط في Next.js تتداخل قائمتها في الهواتف الذكية ونموذج الاتصال بحاجة إلى تحقق بواسطة Zod وإرسال البريد عبر Resend. يشترط كود نظيف ومختبر.",
      en: "We have a Next.js landing page where the mobile menu overlaps on iPhone 13/14, and the contact form needs Zod validation with email sending via Resend. Clean and tested code required.",
      es: "Tenemos una landing page en Next.js cuyo menú móvil se superpone en iPhone 13/14 y el formulario de contacto necesita validación Zod con envío por Resend. Se requiere código limpio y probado."
    },
    requiredProofs: {
      fr: [
        "Lien vers la Pull Request GitHub ou commit vérifiable",
        "Vidéo de 30s ou capture d'écran du menu sur viewport mobile (390px)"
      ],
      ar: [
        "رابط إلى طلب السحب (Pull Request) في GitHub أو الالتزام المحقق",
        "فيديو مدته 30 ثانية أو لقطة شاشة للقائمة على شاشات الجوال (390px)"
      ],
      en: [
        "Link to GitHub Pull Request or verifiable commit",
        "30s video or screenshot of the menu on mobile viewport (390px)"
      ],
      es: [
        "Enlace al Pull Request de GitHub o commit verificable",
        "Vídeo de 30s o captura de pantalla del menú en móvil (390px)"
      ]
    }
  },
  tsk_102: {
    title: {
      fr: "Création d'un logo vectoriel minimaliste + favicon SVG pour startup IA",
      ar: "تصميم شعار متجهي بسيط + أيقونة مفضلة SVG لشركة ناشئة للذكاء الاصطناعي",
      en: "Minimalist vector logo + SVG favicon for AI startup",
      es: "Creación de logo vectorial minimalista + favicon SVG para startup de IA"
    },
    description: {
      fr: "Recherche d'un graphiste pour concevoir un logo moderne et épuré pour 'SynapseAI'. Palette sobre (noir/blanc + touche néon vert/lime). Livrables en SVG, PNG transparent haute résolution et favicon.ico.",
      ar: "مطلوب مصمم جرافيك لابتكار شعار عصري وأنيق لشركة 'SynapseAI'. ألوان بسيطة (أسود/أبيض مع لمسة ليموني نيون). التسليم بصيغ SVG وPNG شفاف عالي الدقة وfavicon.ico.",
      en: "Looking for a graphic designer to craft a modern, sleek logo for 'SynapseAI'. Minimal palette (black/white + neon lime touch). Deliverables in SVG, high-res transparent PNG, and favicon.ico.",
      es: "Buscamos diseñador gráfico para crear un logo moderno y depurado para 'SynapseAI'. Paleta sobria (negro/blanco + toque verde lima). Entregables en SVG, PNG transparente alta resolución y favicon.ico."
    },
    requiredProofs: {
      fr: [
        "Fichiers sources vectoriels .SVG et .AI",
        "Fichier favicon.ico et déclinaisons PNG transparentes (512x512)"
      ],
      ar: [
        "ملفات المصدر المتجهية .SVG و .AI",
        "ملف favicon.ico ونسخ PNG شفافة (512x512)"
      ],
      en: [
        "Vector source files in .SVG and .AI",
        "Favicon.ico file and transparent PNG versions (512x512)"
      ],
      es: [
        "Archivos fuente vectoriales .SVG y .AI",
        "Archivo favicon.ico y versiones PNG transparentes (512x512)"
      ]
    }
  },
  tsk_103: {
    title: {
      fr: "Recherche et qualification de 50 prospects B2B SaaS (LinkedIn + Emails)",
      ar: "بحث وتأهيل 50 عميلاً محتملاً B2B SaaS (لينكد إن + بريد إلكتروني)",
      en: "Sourcing and qualification of 50 B2B SaaS leads (LinkedIn + Emails)",
      es: "Búsqueda y cualificación de 50 leads B2B SaaS (LinkedIn + Emails)"
    },
    description: {
      fr: "Collecter 50 contacts ciblés : Directeurs Marketing ou Growth de scale-ups e-commerce en France (> 20 salariés). Colonnes requises : Prénom, Nom, Poste exact, Entreprise, Profil LinkedIn, Email professionnel vérifié.",
      ar: "جمع 50 جهة اتصال مستهدفة: مدراء تسويق أو نمو لشركات تجارة إلكترونية ناشئة في فرنسا (> 20 موظفاً). الأعمدة المطلوبة: الاسم، اللقب، المنصب، الشركة، رابط لينكد إن، بريد مهني مفعل.",
      en: "Collect 50 targeted leads: Marketing or Growth Directors at e-commerce scale-ups in France (> 20 employees). Required columns: First Name, Last Name, Exact Title, Company, LinkedIn Profile, Verified Work Email.",
      es: "Recopilar 50 contactos específicos: Directores de Marketing o Growth de scale-ups de e-commerce en Francia (> 20 empleados). Columnas: Nombre, Apellidos, Cargo exacto, Empresa, Perfil LinkedIn, Email verificado."
    },
    requiredProofs: {
      fr: [
        "Fichier Google Sheets ou CSV partagé avec 50 lignes complètes",
        "Rapport de bounce rate vérifié (NeverBounce ou Dropcontact)"
      ],
      ar: [
        "ملف Google Sheets أو CSV مشترك يحتوي على 50 صفاً مكتملاً",
        "تقرير تحقق من ارتداد البريد (NeverBounce أو Dropcontact)"
      ],
      en: [
        "Shared Google Sheets or CSV with 50 completed rows",
        "Verified bounce rate report (NeverBounce or Dropcontact)"
      ],
      es: [
        "Archivo Google Sheets o CSV compartido con 50 filas completas",
        "Informe de rebote verificado (NeverBounce o Dropcontact)"
      ]
    }
  },
  tsk_104: {
    title: {
      fr: "Traduction & adaptation SEO Anglais -> Français pour 4 fiches produits",
      ar: "ترجمة ومواءمة تحسين محركات البحث (SEO) لـ 4 بطاقات منتجات",
      en: "SEO translation & localization English -> French for 4 product pages",
      es: "Traducción y adaptación SEO Inglés -> Francés para 4 fichas de producto"
    },
    description: {
      fr: "Traduction humaine de 4 pages de descriptions d'accessoires high-tech (environ 1 200 mots au total). Respect du ton de marque premium et intégration naturelle des mots-clés fournis.",
      ar: "ترجمة بشرية احترافية لأربع صفحات وصف ملحقات تكنولوجية متطورة (حوالي 1200 كلمة). الحفاظ على النبرة الفاخرة للعلامة التجارية وإدراج الكلمات المفتاحية بسلاسة.",
      en: "Human translation of 4 high-tech accessory product descriptions (approx. 1,200 words total). Consistent premium brand voice and natural integration of target keywords.",
      es: "Traducción humana de 4 páginas de descripciones de accesorios high-tech (aprox. 1.200 palabras). Mantener el tono premium de la marca e integrar de forma natural las palabras clave provistas."
    },
    requiredProofs: {
      fr: [
        "Document Google Docs avec mode suggestion et texte final relu",
        "Tableau récapitulatif des métadescriptions optimisées"
      ],
      ar: [
        "مستند Google Docs مع وضع الاقتراحات والنص النهائي المراجع",
        "جدول يلخص الأوصاف الوصفية (Meta descriptions) المحسنة"
      ],
      en: [
        "Google Docs document with suggestion mode and final reviewed text",
        "Summary table of optimized meta descriptions"
      ],
      es: [
        "Documento Google Docs en modo sugerencias y texto final revisado",
        "Tabla resumen de metadescripciones optimizadas"
      ]
    }
  },
  tsk_105: {
    title: {
      fr: "Test utilisateur UX (Application mobile iOS) + Rapport d'évaluation",
      ar: "اختبار تجربة المستخدم UX (تطبيق iOS) + تقرير تقييمي",
      en: "UX User Testing (iOS mobile app) + Evaluation Report",
      es: "Prueba de usuario UX (App móvil iOS) + Informe de evaluación"
    },
    description: {
      fr: "Télécharger notre application TestFlight, effectuer un parcours d'inscription complet et d'achat simulé, et rédiger un retour clair sur les éventuels points de friction rencontrés.",
      ar: "تحميل تطبيقنا عبر TestFlight، وإجراء رحلة تسجيل كاملة وتجربة شراء وهمية، وكتابة ملاحظات واضحة حول أي صعوبات أو نقاط احتكاك تمت مواجهتها.",
      en: "Download our app via TestFlight, execute a complete sign-up flow and simulated checkout, and write constructive feedback on friction points encountered.",
      es: "Descargar nuestra aplicación TestFlight, realizar un registro completo y compra simulada, y redactar un informe claro sobre cualquier punto de fricción encontrado."
    },
    requiredProofs: {
      fr: [
        "3 captures d'écran des étapes clés",
        "Rapport écrit structuré de 200 mots minimum décrivant l'expérience"
      ],
      ar: [
        "3 لقطات شاشة للخطوات الأساسية",
        "تقرير كتابي منظم لا يقل عن 200 كلمة يصف التجربة بالتفصيل"
      ],
      en: [
        "3 screenshots of key steps",
        "Structured written report of at least 200 words describing the experience"
      ],
      es: [
        "3 capturas de pantalla de los pasos clave",
        "Informe escrito estructurado de mínimo 200 palabras describiendo la experiencia"
      ]
    }
  },
  tsk_106: {
    title: {
      fr: "Détourage propre et ombrage réaliste de 12 photos de mobilier",
      ar: "قص دقيق وعزل مع إضافة ظلال واقعية لـ 12 صورة أثاث",
      en: "Clean cutout and realistic shadow enhancement for 12 furniture photos",
      es: "Recorte limpio y sombreado realista de 12 fotos de mobiliario"
    },
    description: {
      fr: "Photos de chaises et canapés sur fond d'atelier à détourer à la plume (pas de détourage automatique flou) et exporter sur fond blanc pur (RGB 255,255,255) avec ombre portée naturelle.",
      ar: "صور كراسي وأرائك في ورشة عمل تتطلب عزلاً دقيقاً بأداة Pen Tool وتصديرها على خلفية بيضاء نقية (RGB 255,255,255) مع ظلال طبيعية واقعية.",
      en: "Photos of chairs and sofas shot in a workshop needing meticulous Pen Tool clipping (no automated fuzzy cutouts) and exported on pure white (RGB 255,255,255) with soft natural drop shadow.",
      es: "Fotos de sillas y sofás en taller que requieren trazado con pluma (sin recortes automáticos borrosos) y exportación sobre fondo blanco puro con sombra natural."
    },
    requiredProofs: {
      fr: [
        "Archive ZIP contenant les 12 fichiers PNG et PSD avec calques conservés"
      ],
      ar: [
        "ملف مضغوط ZIP يحتوي على 12 ملفاً بصيغتي PNG و PSD مع الحفاظ على الطبقات"
      ],
      en: [
        "ZIP archive containing all 12 PNG and PSD files with preserved layers"
      ],
      es: [
        "Archivo ZIP con los 12 archivos PNG y PSD manteniendo las capas"
      ]
    }
  }
};

export const initialTasks: Task[] = [
  {
    id: 'tsk_101',
    title: taskTranslations.tsk_101.title.fr,
    description: taskTranslations.tsk_101.description.fr,
    category: 'development',
    status: 'OPEN',
    reward: 45.00,
    platformFee: 5.00,
    totalBudget: 50.00,
    timeLimitHours: 4,
    minLevelRequired: 2,
    clientId: 'cli_01',
    clientName: 'Studio Digital Paris',
    clientAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    clientRating: 4.9,
    clientHireRate: 98,
    requiredProofs: taskTranslations.tsk_101.requiredProofs.fr,
    applicantsCount: 3,
    createdAt: 'Il y a 25 min',
  },
  {
    id: 'tsk_102',
    title: taskTranslations.tsk_102.title.fr,
    description: taskTranslations.tsk_102.description.fr,
    category: 'design',
    status: 'OPEN',
    reward: 70.00,
    platformFee: 7.00,
    totalBudget: 77.00,
    timeLimitHours: 24,
    minLevelRequired: 1,
    clientId: 'cli_02',
    clientName: 'Karim B. (Founder)',
    clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    clientRating: 5.0,
    clientHireRate: 100,
    requiredProofs: taskTranslations.tsk_102.requiredProofs.fr,
    applicantsCount: 7,
    createdAt: 'Il y a 1h',
  },
  {
    id: 'tsk_103',
    title: taskTranslations.tsk_103.title.fr,
    description: taskTranslations.tsk_103.description.fr,
    category: 'assistance',
    status: 'OPEN',
    reward: 32.00,
    platformFee: 3.50,
    totalBudget: 35.50,
    timeLimitHours: 12,
    minLevelRequired: 1,
    clientId: 'cli_03',
    clientName: 'GrowthLab Agency',
    clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    clientRating: 4.8,
    clientHireRate: 92,
    requiredProofs: taskTranslations.tsk_103.requiredProofs.fr,
    applicantsCount: 5,
    createdAt: 'Il y a 2h',
  },
  {
    id: 'tsk_104',
    title: taskTranslations.tsk_104.title.fr,
    description: taskTranslations.tsk_104.description.fr,
    category: 'copywriting',
    status: 'IN_PROGRESS',
    reward: 28.00,
    platformFee: 3.00,
    totalBudget: 31.00,
    timeLimitHours: 6,
    minLevelRequired: 1,
    clientId: 'cli_04',
    clientName: 'ÉlectroShop Direct',
    clientAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    clientRating: 4.7,
    clientHireRate: 89,
    requiredProofs: taskTranslations.tsk_104.requiredProofs.fr,
    applicantsCount: 4,
    assignedToId: 'usr_me_1',
    assignedToName: 'Aero Mehdi',
    assignedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    createdAt: 'Il y a 3h',
  },
  {
    id: 'tsk_105',
    title: taskTranslations.tsk_105.title.fr,
    description: taskTranslations.tsk_105.description.fr,
    category: 'micro',
    status: 'OPEN',
    reward: 18.00,
    platformFee: 2.00,
    totalBudget: 20.00,
    timeLimitHours: 2,
    minLevelRequired: 1,
    clientId: 'cli_05',
    clientName: 'Nox Fintech',
    clientAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    clientRating: 4.9,
    clientHireRate: 95,
    requiredProofs: taskTranslations.tsk_105.requiredProofs.fr,
    applicantsCount: 12,
    createdAt: 'Il y a 10 min',
  },
  {
    id: 'tsk_106',
    title: taskTranslations.tsk_106.title.fr,
    description: taskTranslations.tsk_106.description.fr,
    category: 'design',
    status: 'OPEN',
    reward: 35.00,
    platformFee: 3.50,
    totalBudget: 38.50,
    timeLimitHours: 8,
    minLevelRequired: 1,
    clientId: 'cli_06',
    clientName: 'Mobilier & Co',
    clientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    clientRating: 4.85,
    clientHireRate: 94,
    requiredProofs: taskTranslations.tsk_106.requiredProofs.fr,
    applicantsCount: 6,
    createdAt: 'Il y a 4h',
  }
];

export const transactionTranslations: Record<string, Record<Locale, string>> = {
  tx_901: {
    fr: 'Paiement reçu pour tâche #tsk_089 "Intégration Stripe Checkout"',
    ar: 'دفعة مستلمة للمهمة #tsk_089 "تكامل بوابة دفع Stripe Checkout"',
    en: 'Payment received for task #tsk_089 "Stripe Checkout Integration"',
    es: 'Pago recibido por tarea #tsk_089 "Integración Stripe Checkout"',
  },
  tx_902: {
    fr: 'Approvisionnement sécurisé par Carte Bancaire',
    ar: 'شحن رصيد آمن عبر البطاقة البنكية',
    en: 'Secure top-up via Credit Card',
    es: 'Recarga segura mediante Tarjeta Bancaria',
  },
  tx_903: {
    fr: 'Séquestre bloqué pour publication tâche #tsk_101',
    ar: 'حجز رصيد الضمان لنشر المهمة #tsk_101',
    en: 'Escrow funds locked for task publication #tsk_101',
    es: 'Custodia bloqueada para publicación de tarea #tsk_101',
  },
  tx_904: {
    fr: 'Commission de service plateforme Tâches (Niveau 3 - 15%)',
    ar: 'عمولة خدمة منصة Tâches (المستوى 3 - 15%)',
    en: 'Platform service commission (Level 3 - 15%)',
    es: 'Comisión de servicio plataforma Tâches (Nivel 3 - 15%)',
  }
};

export const initialTransactions: WalletTransaction[] = [
  {
    id: 'tx_901',
    userId: 'usr_me_1',
    type: 'ESCROW_RELEASE',
    amount: 55.00,
    currency: 'EUR',
    description: transactionTranslations.tx_901.fr,
    createdAt: 'Hier à 18:20',
    status: 'COMPLETED',
  },
  {
    id: 'tx_902',
    userId: 'usr_me_1',
    type: 'DEPOSIT',
    amount: 100.00,
    currency: 'EUR',
    description: transactionTranslations.tx_902.fr,
    createdAt: '25 Sep 2024',
    status: 'COMPLETED',
  },
  {
    id: 'tx_903',
    userId: 'usr_me_1',
    type: 'ESCROW_LOCK',
    amount: -50.00,
    currency: 'EUR',
    description: transactionTranslations.tx_903.fr,
    createdAt: '24 Sep 2024',
    status: 'COMPLETED',
  },
  {
    id: 'tx_904',
    userId: 'usr_me_1',
    type: 'COMMISSION',
    amount: -8.25,
    currency: 'EUR',
    description: transactionTranslations.tx_904.fr,
    createdAt: 'Hier à 18:20',
    status: 'COMPLETED',
  }
];

export function getLocalizedTask(task: Task, locale: Locale): Task {
  const trans = taskTranslations[task.id];
  if (!trans) return task;
  return {
    ...task,
    title: trans.title[locale] || task.title,
    description: trans.description[locale] || task.description,
    requiredProofs: trans.requiredProofs[locale] || task.requiredProofs,
  };
}

export function getLocalizedTransaction(tx: WalletTransaction, locale: Locale): WalletTransaction {
  const trans = transactionTranslations[tx.id];
  if (!trans) return tx;
  return {
    ...tx,
    description: trans[locale] || tx.description,
  };
}
