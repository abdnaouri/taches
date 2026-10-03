import { WIKIDATA_ENTITIES } from './seoSchema';

export interface MoroccanCityData {
  slug: string;
  nameFr: string;
  nameAr: string;
  regionFr: string;
  regionAr: string;
  wikidataId: string;
  metaTitleFr: string;
  metaTitleAr: string;
  metaDescriptionFr: string;
  metaDescriptionAr: string;
  heroPitchFr: string;
  heroPitchAr: string;
  economicHighlightsFr: string[];
  economicHighlightsAr: string[];
  averageTjmMad: number;
  activeFreelancersCount: string;
  topSkillsFr: string[];
  topSkillsAr: string[];
  faqs: {
    qFr: string;
    aFr: string;
    qAr: string;
    aAr: string;
  }[];
}

export const MOROCCAN_CITIES: MoroccanCityData[] = [
  {
    slug: 'casablanca',
    nameFr: 'Casablanca',
    nameAr: 'الدار البيضاء',
    regionFr: 'Casablanca-Settat',
    regionAr: 'الدار البيضاء - سطات',
    wikidataId: WIKIDATA_ENTITIES.casablanca,
    metaTitleFr: 'Freelance Casablanca — Développeurs, Graphistes & Experts E-commerce | Tâches.ma',
    metaTitleAr: 'مستقلين الدار البيضاء — أفضل المبرمجين والمصممين في كازا | Tâches.ma',
    metaDescriptionFr: 'Trouvez et recrutez des freelances vérifiés à Casablanca (Sidi Maarouf, Marina, Maarif) ou trouvez des missions rémunérées. Paiement 100% garanti par séquestre Daman.',
    metaDescriptionAr: 'وظف أفضل المستقلين والمهنيين الأحرار بالدار البيضاء في البرمجة، التصميم، التجارة الإلكترونية وإدخال البيانات. دفع مضمون عبر سيكستر Daman.',
    heroPitchFr: 'Capitale économique du Maroc et premier hub de talents indépendants du Royaume. Casablanca regroupe plus de 45% des entreprises et des freelances les plus qualifiés en tech, design et marketing.',
    heroPitchAr: 'العاصمة الاقتصادية للمغرب وأكبر تجمع للمستقلين وأصحاب المشاريع بالمملكة. أكثر من 45% من المهام والصفقات المنجزة تمر عبر كازابلانكا.',
    economicHighlightsFr: [
      'Hub Tech & Casanearshore : Forte concentration de développeurs Full-Stack, React, Next.js et mobile.',
      'Capitale du E-commerce & COD : Experts Shopify, gestionnaires de stock et community managers.',
      'Agences & Studios créatifs à Maarif, Gauthier et Sidi Maarouf.',
      'Possibilité de rencontres en présentiel ou travail 100% à distance sécurisé.',
    ],
    economicHighlightsAr: [
      'قطب التكنولوجيا وكازانيارشور: تركيز كبير لمطوري الويب والتطبيقات الذكية.',
      'عاصمة التجارة الإلكترونية والدفع عند الاستلام (COD): خبراء شوبيفاي ومدراء الحملات الإعلانية.',
      'إمكانية اللقاء المباشر أو العمل عن بعد مع الحماية المالية الكاملة.',
    ],
    averageTjmMad: 500,
    activeFreelancersCount: '42 000+',
    topSkillsFr: [
      'Développement Web (Next.js, WordPress, Laravel)',
      'E-commerce & Shopify COD',
      'Graphisme & Branding de marque',
      'Marketing Digital & TikTok Ads',
      'Saisie comptable & Nettoyage Excel',
    ],
    topSkillsAr: [
      'تطوير المواقع والتطبيقات',
      'التجارة الإلكترونية وشوبيفاي',
      'التصميم الجرافيكي والهويات البصرية',
      'الإعلانات الرقمية تيك توك وفيسبوك',
      'إدخال البيانات والمحاسبة',
    ],
    faqs: [
      {
        qFr: 'Quel est le TJM moyen d’un freelance à Casablanca ?',
        aFr: 'À Casablanca, le Tarif Journalier Moyen (TJM) oscille généralement entre 350 DH et 750 DH pour les profils créatifs et marketing, et entre 600 DH et 1 800 DH pour les développeurs web et experts techniques seniors.',
        qAr: 'ما هو متوسط الأجر اليومي للمستقل في الدار البيضاء؟',
        aAr: 'يتراوح متوسط الأجر اليومي (TJM) في الدار البيضاء بين 350 و 750 درهم لمجالات التصميم والتسويق، وبين 600 و 1800 درهم للمبرمجين وخبراء التكنولوجيا المتقدمة.',
      },
      {
        qFr: 'Peut-on rencontrer les freelances de Casablanca en physique ?',
        aFr: 'Oui, de nombreux freelances casablancais sont disponibles pour des réunions de cadrage (Maarif, Sidi Maarouf, coworking spaces). Cependant, la validation du paiement reste obligatoirement sécurisée via le séquestre Daman sur tâches.ma.',
        qAr: 'هل يمكن الاجتماع بمستقلي كازا حضورياً؟',
        aAr: 'نعم، يمكن عقد اجتماعات عمل حضورية بمساحات العمل المشترك، مع بقاء المعاملة المالية محمية حصرياً عبر نظام الضمان Daman على المنصة.',
      },
      {
        qFr: 'Quels sont les délais habituels pour recruter à Casablanca ?',
        aFr: 'Sur tâches.ma, une mission publiée à Casablanca reçoit ses premières propositions vérifiées en moins de 35 secondes.',
        qAr: 'كم من الوقت يستغرق توظيف مستقل في الدار البيضاء؟',
        aAr: 'تتلقى المهام المنشورة بالدار البيضاء أولى العروض في غضون أقل من دقيقة واحدة بفضل التفاعل الفوري للمستقلين.',
      },
    ],
  },
  {
    slug: 'rabat',
    nameFr: 'Rabat',
    nameAr: 'الرباط',
    regionFr: 'Rabat-Salé-Kénitra',
    regionAr: 'الرباط - سلا - القنيطرة',
    wikidataId: WIKIDATA_ENTITIES.rabat,
    metaTitleFr: 'Freelance Rabat — Consultants, Traducteurs & Développeurs | Tâches.ma',
    metaTitleAr: 'مستقلين الرباط وسلا — استشارات، ترجمة وتطوير برمجيات | Tâches.ma',
    metaDescriptionFr: 'Recrutez les meilleurs freelances à Rabat, Salé et Technopolis : consultants, traducteurs assermentés, rédacteurs web et développeurs IT sous séquestre Daman.',
    metaDescriptionAr: 'ابحث عن مستقلي الرباط، سلا وتكنوبوليس: استشارات استراتيجية، ترجمة، كتابة محتوى وتطوير برمجيات مع حماية الدفع 100%.',
    heroPitchFr: 'Capitale administrative et pôle académique de premier plan avec Rabat Technopolis, l’Université Mohammed V et de nombreuses écoles d’ingénieurs (ENSIAS, INPT). Un vivier exceptionnel de consultants et experts qualifiés.',
    heroPitchAr: 'العاصمة الإدارية والقطب الأكاديمي الرائد بالمملكة (تكنوبوليس، جامعة محمد الخامس، مدارس المهندسين). بيئة مثالية لخبراء الاستشارات، البرمجة والترجمة.',
    economicHighlightsFr: [
      'Pôle Technopolis & Médias : Consultants stratégiques, rédacteurs institutionnels et ingénieurs télécom.',
      'Excellence linguistique : Traducteurs bilingues et trilingues (Français, Arabe, Anglais, Espagnol).',
      'Assistance administrative, mise en conformité et dossiers institutionnels.',
      'Proximité immédiate avec Salé et Kénitra (Atlantic Free Zone).',
    ],
    economicHighlightsAr: [
      'قطب تكنوبوليس والإعلام: استشارات، كتابة رسمية وهندسة معلوماتية.',
      'كفاءات لغوية عالية: ترجمة احترافية بثلاث لغات (فرنسية، عربية، إنجليزية).',
      'خدمات الإسناد الإداري والتنسيق المؤسساتي.',
    ],
    averageTjmMad: 480,
    activeFreelancersCount: '28 000+',
    topSkillsFr: [
      'Traduction & Rédaction Institutionnelle',
      'Consulting IT & Cybersécurité',
      'Développement Full-Stack & Python',
      'Design Graphique & Rapports Annuels',
      'Assistance Juridique & Administrative',
    ],
    topSkillsAr: [
      'الترجمة الاحترافية والكتابة الرسمية',
      'الاستشارات التقنية والأمن السيبراني',
      'البرمجة بلغة بايثون ورياكت',
      'تصميم المطبوعات والتقارير',
      'المساعدة الإدارية',
    ],
    faqs: [
      {
        qFr: 'Quels profils freelances trouve-t-on principalement à Rabat ?',
        aFr: 'Rabat regorge d’ingénieurs issus des grandes écoles d’État, de consultants en stratégie, de traducteurs multilingues chevronnés et de spécialistes des politiques publiques et du web.',
        qAr: 'ما هي التخصصات الأبرز في الرباط؟',
        aAr: 'تتميز الرباط بمهندسي المعلوميات، خبراء الترجمة الأكاديمية والتقنية، ومستشاري الأعمال والإدارة.',
      },
      {
        qFr: 'Comment payer un freelance basé à Rabat en toute sécurité ?',
        aFr: 'Tous les paiements passent par le séquestre bancaire Daman de tâches.ma. Le freelance ne perçoit les fonds qu’après validation formelle de vos livrables.',
        qAr: 'كيف تضمن أموالك عند التعامل مع مستقل في الرباط؟',
        aAr: 'تظل الأموال محجوزة تحت حراسة سيكستر Daman ولا تُصرف إلا بعد فحصك وموافقتك الكاملة على المخرجات.',
      },
    ],
  },
  {
    slug: 'marrakech',
    nameFr: 'Marrakech',
    nameAr: 'مراكش',
    regionFr: 'Marrakech-Safi',
    regionAr: 'مراكش - آسفي',
    wikidataId: WIKIDATA_ENTITIES.marrakech,
    metaTitleFr: 'Freelance Marrakech — Graphistes, Monteurs Vidéo & Créateurs de Contenu | Tâches.ma',
    metaTitleAr: 'مستقلين مراكش — مصممين، مونتاج فيديو وصناع محتوى | Tâches.ma',
    metaDescriptionFr: 'Trouvez un freelance à Marrakech pour vos besoins créatifs, vidéos TikTok/Reels, sites touristiques, hôtellerie et campagnes e-commerce. Séquestre Daman inclus.',
    metaDescriptionAr: 'وظف أفضل المصممين ومحرري الفيديو وصناع المحتوى بمراكش لمشاريع السياحة، المتاجر الإلكترونية والتسويق الرقمي.',
    heroPitchFr: 'Cœur créatif, touristique et événementiel du Maroc. Marrakech attire les meilleurs designers, directeurs artistiques, photographes, monteurs vidéo et experts en marketing d’influence.',
    heroPitchAr: 'عاصمة الإبداع والسياحة بالمغرب. تستقطب مراكش نخبة المصممين، مدراء الفن، مصوري المنتجات ومحرري الفيديو الإعلاني.',
    economicHighlightsFr: [
      'Hub Créatif & Audiovisuel : Monteurs Reels/TikTok dynamiques, photographes et directeurs artistiques.',
      'Secteur Hospitalité & Tourisme : Gestionnaires de réputation Google Maps, community managers multilingues.',
      'Artisanat & E-commerce haut de gamme : Création de catalogues Shopify pour l’export international.',
    ],
    economicHighlightsAr: [
      'قطب الإبداع وصناعة الفيديو: مونتاج احترافي، تصوير منتجات وإعلانات قصيرة.',
      'قطاع الضيافة والسياحة: إدارة السمعة الرقمية على جوجل وخرائط مابس.',
      'الصناعة التقليدية والتجارة الإلكترونية العالمية.',
    ],
    averageTjmMad: 420,
    activeFreelancersCount: '22 000+',
    topSkillsFr: [
      'Montage Vidéo Vertical (TikTok, Instagram Reels, Shorts)',
      'Identité Visuelle de Marque & Packaging',
      'Gestion Réseaux Sociaux & Influence',
      'Création de Boutiques Shopify & WooCommerce',
      'Shooting Photo & Retouche Haut de Gamme',
    ],
    topSkillsAr: [
      'مونتاج الفيديو القصير تيك توك وريلز',
      'تصميم الشعارات وتغليف المنتجات',
      'إدارة حسابات إنستغرام والتسويق بالمؤثرين',
      'متاجر شوبيفاي وووكومرس',
      'معالجة الصور والريتوش الاحترافي',
    ],
    faqs: [
      {
        qFr: 'Combien coûte un monteur vidéo freelance à Marrakech ?',
        aFr: 'Pour des Reels ou vidéos TikTok percutantes, les tarifs débutent dès 60 DH à 150 DH par vidéo courte, avec sous-titres animés et effets tendances.',
        qAr: 'كم تكلفة مونتاج فيديو ريلز أو تيك توك بمراكش؟',
        aAr: 'تبدأ أسعار الفيديو القصير للمنصات الرقمية من 60 إلى 150 درهم للمقطع الواحد شاملاً الترجمة المتحركة والمؤثرات الصوتية.',
      },
    ],
  },
  {
    slug: 'tanger',
    nameFr: 'Tanger',
    nameAr: 'طنجة',
    regionFr: 'Tanger-Tétouan-Al Hoceïma',
    regionAr: 'طنجة - تطوان - الحسيمة',
    wikidataId: WIKIDATA_ENTITIES.tanger,
    metaTitleFr: 'Freelance Tanger — Développeurs Web, Traducteurs & Logistique | Tâches.ma',
    metaTitleAr: 'مستقلين طنجة وتطوان — برمجة، ترجمة إسبانية وتجارة دولية | Tâches.ma',
    metaDescriptionFr: 'Recrutez des freelances à Tanger et Tétouan. Experts tech, bilingues espagnol/français, gestionnaires supply chain et e-commerce transfrontalier.',
    metaDescriptionAr: 'ابحث عن مستقلي طنجة وتطوان: مبرمجين، مترجمين للإسبانية والفرنسية وخبراء التجارة الإلكترونية العابرة للحدود.',
    heroPitchFr: 'Porte d’entrée vers l’Europe et deuxième pôle économique du Maroc grâce à Tanger Med et Tanger Automotive City. Une communauté dynamique de freelances orientés international et multilingues.',
    heroPitchAr: 'بوابة المغرب نحو أوروبا والقطب الاقتصادي الثاني بالمملكة بفضل ميناء طنجة المتوسط. مجتمع نشط من الكفاءات متعددة اللغات الموجهة للتصدير.',
    economicHighlightsFr: [
      'Bilinguisme Espagnol / Français / Anglais très développé.',
      'Proximité avec l’Europe : Parfait pour le nearshoring et le travail en fuseau horaire européen.',
      'Forte expertise logistique, e-commerce transfrontalier et développement logiciel.',
    ],
    economicHighlightsAr: [
      'إتقان واسع للغات الإسبانية، الفرنسية والإنجليزية.',
      'تزامن تام مع التوقيت الأوروبي للشركات العاملة بالخارج.',
      'خبرة في التجارة والبرمجيات اللوجستية.',
    ],
    averageTjmMad: 460,
    activeFreelancersCount: '19 000+',
    topSkillsFr: [
      'Traduction Espagnol / Français / Arabe',
      'Développement Web & APIs Logistiques',
      'Support Client Multilingue & BPO',
      'E-commerce International & Shopify',
      'Modélisation 3D & Dessin Technique',
    ],
    topSkillsAr: [
      'الترجمة إسباني / فرنسي / عربي',
      'برمجة المنظومات والتطبيقات',
      'خدمة العملاء متعددة اللغات',
      'التجارة الدولية وشوبيفاي',
      'التصميم ثلاثي الأبعاد والرسم التقني',
    ],
    faqs: [
      {
        qFr: 'Pourquoi recruter un freelance à Tanger ?',
        aFr: 'Tanger offre une excellente maîtrise de la langue espagnole et un écosystème habitué à collaborer avec des clients internationaux sous les plus hauts standards de rigueur.',
        qAr: 'لماذا التوظيف من طنجة؟',
        aAr: 'تتميز طنجة بالمهارة العالية في اللغات الأجنبية (خاصة الإسبانية والإنجليزية) والالتزام المهني الصارم المكتسب من الشركات الدولية.',
      },
    ],
  },
  {
    slug: 'agadir',
    nameFr: 'Agadir',
    nameAr: 'أكادير',
    regionFr: 'Souss-Massa',
    regionAr: 'سوس - ماسة',
    wikidataId: WIKIDATA_ENTITIES.agadir,
    metaTitleFr: 'Freelance Agadir — Experts E-commerce, Marketing & Web | Tâches.ma',
    metaTitleAr: 'مستقلين أكادير وسوس — تسويق رقمي، تجارة إلكترونية وبرمجة | Tâches.ma',
    metaDescriptionFr: 'Trouvez un freelance à Agadir et dans le Souss : boutiques en ligne, gestion de campagnes Meta/TikTok, SEO local et assistance e-commerce.',
    metaDescriptionAr: 'وظف مستقلي أكادير وجهة سوس ماسة: إدارة المتاجر الإلكترونية، الحملات الإعلانية والتسويق الرقمي مع ضمان الدفع.',
    heroPitchFr: 'Capitale du Souss et haut lieu prisé par les nomades digitaux. Agadir dispose d’un vivier florissant de spécialistes du marketing digital, de la création de contenu et du commerce en ligne.',
    heroPitchAr: 'عاصمة جهة سوس ومقصد رواد الأعمال الرقميين. تضم أكادير كفاءات واعدة في التجارة الإلكترونية، التسويق الرقمي والمحتوى الإبداعي.',
    economicHighlightsFr: [
      'Plaque tournante du e-commerce local et des produits du terroir.',
      'Communauté de nomades digitaux et de créateurs de contenu indépendants.',
      'Tarifs très compétitifs avec une grande réactivité d’exécution.',
    ],
    economicHighlightsAr: [
      'مركز رائد لتسويق المنتجات المجالية والتجارة الوطنية.',
      'مجتمع متنامٍ من الرحل الرقميين وصناع المحتوى.',
      'أسعار تنافسية وسرعة تنفيذ عالية.',
    ],
    averageTjmMad: 380,
    activeFreelancersCount: '14 000+',
    topSkillsFr: [
      'Gestion de Boutiques YouCan & Shopify',
      'Publicités Facebook & TikTok Ads',
      'Création Visuelle & Bannières Publicitaires',
      'SEO Local & Référencement Google Maps',
      'Assistance Virtuelle & Service Après-Vente',
    ],
    topSkillsAr: [
      'إدارة متاجر يوكان وشوبيفاي',
      'إعلانات فيسبوك وتيك توك',
      'تصميم البانرات الإعلانية',
      'تهيئة محركات البحث وخرائط جوجل',
      'خدمة ما بعد البيع عبر واتساب',
    ],
    faqs: [
      {
        qFr: 'Quels types de missions confier à un freelance à Agadir ?',
        aFr: 'Agadir est particulièrement réputée pour le lancement rapide de boutiques e-commerce, le service client WhatsApp et la gestion de campagnes publicitaires à fort ROI.',
        qAr: 'ما هي أنسب المهام لمستقلي أكادير؟',
        aAr: 'تتفوق أكادير في إطلاق المتاجر الإلكترونية، الرد على طلبات العملاء عبر واتساب وإدارة الحملات الترويجية.',
      },
    ],
  },
  {
    slug: 'fes',
    nameFr: 'Fès',
    nameAr: 'فاس',
    regionFr: 'Fès-Meknès',
    regionAr: 'فاس - مكناس',
    wikidataId: WIKIDATA_ENTITIES.fes,
    metaTitleFr: 'Freelance Fès — Rédacteurs, Traducteurs, Saisie & Artisans Digitaux | Tâches.ma',
    metaTitleAr: 'مستقلين فاس ومكناس — كتابة، ترجمة، إدخال بيانات وتصميم | Tâches.ma',
    metaDescriptionFr: 'Faites appel à des freelances à Fès et Meknès pour la saisie de données, la transcription, la rédaction web et le développement à tarifs très avantageux.',
    metaDescriptionAr: 'تعاقد مع مستقلي فاس ومكناس لإدخال البيانات، التفريغ الصوتي، كتابة المقالات والبرمجة بأسعار تنافسية وجودة مضمونة.',
    heroPitchFr: 'Capitale spirituelle et culturelle abritant l’Université Al Quaraouiyine et l’Euro-Méditerranéenne de Fès (UEMF). Un pôle d’excellence en rédaction de contenu, traduction rigoureuse et traitement de données.',
    heroPitchAr: 'العاصمة الروحية والعلمية (جامعة القرويين والجامعة الأورومتوسطية). مركز متميز في الكتابة التحريرية، الترجمة ومعالجة البيانات المكثفة.',
    economicHighlightsFr: [
      'Excellence en rédaction littéraire, correction de documents et traduction.',
      'Centres de services partagés, saisie rapide Excel et transcription audio.',
      'Tarifs ultra-compétitifs pour externaliser de gros volumes de micro-tâches.',
    ],
    economicHighlightsAr: [
      'تميز في الصياغة اللغوية، تدقيق النصوص والترجمة الدقيقة.',
      'إدخال البيانات السريع، تفريغ التسجيلات الصوتية وجداول إكسيل.',
      'أفضل عائد على الاستثمار لتنفيذ المهام المجمعة والضخمة.',
    ],
    averageTjmMad: 340,
    activeFreelancersCount: '16 000+',
    topSkillsFr: [
      'Saisie de Données & Reconstitution Excel',
      'Rédaction Web & Articles Optimisés SEO',
      'Transcription Audio / Vidéo Arabe & Français',
      'Correction & Relecture Orthographique',
      'Support Client & Téléprospection',
    ],
    topSkillsAr: [
      'إدخال البيانات وتفريغ الفواتير في إكسيل',
      'كتابة المقالات المتوافقة مع السيو (SEO)',
      'التفريغ الصوتي للمؤتمرات والتسجيلات',
      'التدقيق الإملائي واللغوي',
      'الاتصال والمتابعة الهاتفية',
    ],
    faqs: [
      {
        qFr: 'Pourquoi confier ses tâches administratives à des freelances de Fès ?',
        aFr: 'Fès offre l’un des meilleurs rapports qualité/prix du Royaume pour les projets de saisie massive, de nettoyage de données et de rédaction bilingue soignée.',
        qAr: 'ما ميزة الاعتماد على مستقلي فاس للمهام الإدارية؟',
        aAr: 'توفر فاس أفضل معادلة بين السعر الاقتصادي والدقة المتناهية في المهام الكتابية والإدارية وإدخال البيانات.',
      },
    ],
  },
];

export function getCityBySlug(slug: string): MoroccanCityData | undefined {
  return MOROCCAN_CITIES.find((c) => c.slug === slug);
}
