'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { TASK_EXAMPLES, POPULAR_SEARCH_INTENTS, TaskExample } from '@/lib/taskExamplesData';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import {
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiCopy,
  FiStar,
  FiCheckCircle,
  FiShield,
  FiUsers,
  FiTrendingUp,
  FiLayers,
  FiPlus,
  FiArrowRight,
  FiArrowLeft,
  FiClock,
  FiCheck,
  FiMapPin,
  FiPackage,
  FiTag
} from 'react-icons/fi';

interface TaskExamplesPageProps {
  onCopyTask: (task: TaskExample) => void;
  onPostNewTask: () => void;
}

export const TaskExamplesPage: React.FC<TaskExamplesPageProps> = ({
  onCopyTask,
  onPostNewTask,
}) => {
  const { locale, isRTL } = useLanguage();
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuth();

  // Accordion open states (keyed by task ID, default opening first 2)
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<number, boolean>>({
    1001: true,
    1002: true,
  });

  const toggleTaskExpand = (id: number) => {
    setExpandedTaskIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Search & Category Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [budgetFilter, setBudgetFilter] = useState<'all' | 'under100' | '100to300' | '300to1000' | 'above1000'>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(10);

  const categories = [
    { id: 'all', label: { fr: 'Toutes les catégories', ar: 'جميع الفئات', en: 'All Categories', ru: 'Все категории', es: 'Todas las categorías' }, icon: '⚡' },
    { id: 'development', label: { fr: 'Web & E-commerce', ar: 'برمجة ومتاجر', en: 'Web & E-commerce', ru: 'Разработка и IT', es: 'Web y E-commerce' }, icon: '💻' },
    { id: 'design', label: { fr: 'Graphisme & Design', ar: 'تصميم وجرافيك', en: 'Design & Graphics', ru: 'Дизайн', es: 'Diseño' }, icon: '🎨' },
    { id: 'marketing', label: { fr: 'Marketing & Vidéo', ar: 'تسويق وفيديو', en: 'Marketing & Video', ru: 'Маркетинг и видео', es: 'Marketing y vídeo' }, icon: '📱' },
    { id: 'copywriting', label: { fr: 'Traduction & Rédaction', ar: 'ترجمة وكتابة', en: 'Writing & Translation', ru: 'Тексты и переводы', es: 'Traducción' }, icon: '✍️' },
    { id: 'assistance', label: { fr: 'Saisie & Administratif', ar: 'إدخال بيانات', en: 'Data Entry & Admin', ru: 'Ввод данных', es: 'Asistencia' }, icon: '📊' },
    { id: 'micro', label: { fr: 'Micro-tâches & Terrain', ar: 'مهام ميدانية', en: 'Errands & Tasks', ru: 'Микро-задачи', es: 'Microtareas' }, icon: '📍' },
  ];

  const citiesList = [
    { id: 'all', label: { fr: 'Tout le Maroc / En ligne', ar: 'كل المغرب / عن بعد', en: 'All Morocco / Remote', ru: 'Все города / Онлайн', es: 'Todo Marruecos / Remoto' } },
    { id: 'Casablanca', label: { fr: 'Casablanca', ar: 'الدار البيضاء', en: 'Casablanca', ru: 'Касабланка', es: 'Casablanca' } },
    { id: 'Rabat', label: { fr: 'Rabat', ar: 'الرباط', en: 'Rabat', ru: 'Рабат', es: 'Rabat' } },
    { id: 'Marrakech', label: { fr: 'Marrakech', ar: 'مراكش', en: 'Marrakech', ru: 'Марракеш', es: 'Marrakech' } },
    { id: 'Tanger', label: { fr: 'Tanger', ar: 'طنجة', en: 'Tangier', ru: 'Танжер', es: 'Tánger' } },
    { id: 'Fès', label: { fr: 'Fès', ar: 'فاس', en: 'Fez', ru: 'Фес', es: 'Fez' } },
    { id: 'Agadir', label: { fr: 'Agadir', ar: 'أكادير', en: 'Agadir', ru: 'Агадир', es: 'Agadir' } },
  ];

  // Natural search query matching algorithm
  const filteredTasks = useMemo(() => {
    return TASK_EXAMPLES.filter((task) => {
      // Category filter
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }

      // City filter
      if (selectedCity !== 'all' && task.city && !task.city.toLowerCase().includes(selectedCity.toLowerCase())) {
        return false;
      }

      // Budget filter
      if (budgetFilter === 'under100' && task.priceDH >= 100) return false;
      if (budgetFilter === '100to300' && (task.priceDH < 100 || task.priceDH > 300)) return false;
      if (budgetFilter === '300to1000' && (task.priceDH < 300 || task.priceDH > 1000)) return false;
      if (budgetFilter === 'above1000' && task.priceDH <= 1000) return false;

      // Natural intent search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleFr = (task.title.fr || '').toLowerCase();
        const titleAr = (task.title.ar || '').toLowerCase();
        const titleEn = (task.title.en || '').toLowerCase();
        const descFr = (task.description.fr || '').toLowerCase();
        const descAr = (task.description.ar || '').toLowerCase();
        
        const tagsMatch = task.tags.some((t) => t.toLowerCase().includes(q));
        const keywordsMatch = task.searchIntentKeywords.some((k) => k.toLowerCase().includes(q) || q.includes(k.toLowerCase()));
        const deliverablesMatch = task.deliverables.some((d) => d.toLowerCase().includes(q));

        if (
          !titleFr.includes(q) &&
          !titleAr.includes(q) &&
          !titleEn.includes(q) &&
          !descFr.includes(q) &&
          !descAr.includes(q) &&
          !tagsMatch &&
          !keywordsMatch &&
          !deliverablesMatch
        ) {
          return false;
        }
      }

      return true;
    });
  }, [selectedCategory, selectedCity, budgetFilter, searchQuery, locale]);

  const displayedTasks = filteredTasks.slice(0, visibleCount);

  // Generate JSON-LD schema for SEO
  const jsonLdData = useMemo(() => {
    return {
      '@context': 'https://schema.org/',
      '@type': 'ItemList',
      name: 'Exemples de missions et micro-tâches réalisées au Maroc sur tâches.ma',
      itemListElement: TASK_EXAMPLES.slice(0, 20).map((task, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Service',
          name: task.title[locale] || task.title.fr,
          description: task.description[locale] || task.description.fr,
          provider: {
            '@type': 'Person',
            name: task.executor.name,
          },
          offers: {
            '@type': 'Offer',
            price: task.priceDH,
            priceCurrency: 'MAD',
          },
        },
      })),
    };
  }, [locale]);

  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 pb-20">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      {/* TOP HEADER HERO BANNER */}
      <section className="bg-white border-b border-slate-200/80 pt-8 pb-10 shadow-2xs">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <button
              onClick={() => router.push(`/${locale}`)}
              className="hover:text-brand-700 transition-colors font-semibold cursor-pointer"
            >
              {locale === 'ar' ? 'الرئيسية' : locale === 'ru' ? 'Главная' : locale === 'en' ? 'Home' : 'Accueil'}
            </button>
            <span>/</span>
            <span className="font-bold text-slate-900">
              {locale === 'ar'
                ? 'أمثلة المهام المنجزة'
                : locale === 'ru'
                ? 'Примеры заданий'
                : locale === 'en'
                ? 'Completed Task Examples'
                : 'Exemples de missions réalisées'}
            </span>
          </nav>

          {/* Heading */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200/80 px-4 py-1 text-xs font-bold text-brand-700 mb-3 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {locale === 'ar'
                  ? '⚡ نماذج ومهام منجزة بالمغرب مع ضمان Séquestre'
                  : locale === 'ru'
                  ? '⚡ Реальные примеры заданий в Марокко с гарантией'
                  : locale === 'en'
                  ? '⚡ Real Moroccan Task Templates & Escrow Guarantee'
                  : '⚡ Modèles & Exemples concrets au Maroc avec garantie Séquestre'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {locale === 'ar'
                ? 'أمثلة حقيقية لمهام منجزة على tâches.ma'
                : locale === 'ru'
                ? 'Примеры выполненных заданий на tâches.ma'
                : locale === 'en'
                ? 'Real Completed Task Examples on tâches.ma'
                : 'Exemples réels de missions réalisées sur tâches.ma'}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              {locale === 'ar'
                ? 'ابحث بالنية الطبيعية (شوبيفاي، تصميم لوجو، ترجمة عقود، إكسيل، مونتاج ريلز) واستلهم من مهام حقيقية مع أسعار بالدرهم وأنشيء مهمة مطابقة بنقرة واحدة.'
                : locale === 'ru'
                ? 'Посмотрите примеры реальных задач, реальные цены в MAD и отзывы клиентов. Создайте аналогичное задание в 1 клик.'
                : locale === 'en'
                ? 'Search natural tasks (Shopify COD, Logo, Arabic translation, Excel data, Reels editing) and copy templates in 1 click.'
                : 'Trouvez l’inspiration parmi des centaines de besoins concrets (Boutique Shopify COD, Création Logo, Traduction juridique, Saisie Excel, Montage Reels) et dupliquez une mission identique en 1 clic.'}
            </p>
          </div>

          {/* 3 Authentic Metric Stat Banners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-4">
            
            {/* Metric 1: Rapidité */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/40 border border-blue-100 p-5 sm:p-6 flex items-center gap-4 transition hover:shadow-md">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white text-2xl shadow-sm">
                <FiClock />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  &lt; 10 min
                </div>
                <div className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5 leading-snug">
                  {locale === 'ar'
                    ? 'متوسط الوقت لاستقبال أول العروض من المنفذين'
                    : locale === 'ru'
                    ? 'среднее время получения первых откликов'
                    : locale === 'en'
                    ? 'average time to get first qualified proposals'
                    : 'délai moyen pour recevoir vos premières propositions'}
                </div>
              </div>
            </div>

            {/* Metric 2: Sécurité Daman */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-100 p-5 sm:p-6 flex items-center gap-4 transition hover:shadow-md">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white text-2xl shadow-sm">
                <FiShield />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  100% Sécurisé
                </div>
                <div className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5 leading-snug">
                  {locale === 'ar'
                    ? 'ضمان مالي : الدفع محمي ولا يُصرف إلا بعد رضاكم'
                    : locale === 'ru'
                    ? 'безопасная сделка: оплата только после подтверждения'
                    : locale === 'en'
                    ? 'Daman escrow: funds released only upon your approval'
                    : 'fonds sous séquestre Daman débloqués après validation'}
                </div>
              </div>
            </div>

            {/* Metric 3: Tarifs Dirhams CMI */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-100 p-5 sm:p-6 flex items-center gap-4 transition hover:shadow-md">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white text-2xl shadow-sm">
                <FiTrendingUp />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Dès 50 DH
                </div>
                <div className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5 leading-snug">
                  {locale === 'ar'
                    ? 'الدفع بالدرهم المغربي عبر CMI والبطاقات البنكية'
                    : locale === 'ru'
                    ? 'оплата в MAD местными картами CMI и переводами'
                    : locale === 'en'
                    ? 'all budgets in MAD via Moroccan cards & CMI'
                    : 'tarifs transparents en MAD par CB marocaine & CMI'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER CONTROLS & NATURAL SEARCH INTENT BAR */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
          
          {/* Main Search Input & Dropdowns */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            
            {/* Instant Search Bar */}
            <div className="relative flex-1">
              <FiSearch className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-3.5 text-slate-400 text-base`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  locale === 'ar'
                    ? 'اكتب ما تبحث عنه (مثال: متجر شوبيفاي، تصميم شعار، ترجمة عقود، إكسيل، مونتاج ريلز، صوت بالدارجة)...'
                    : locale === 'ru'
                    ? 'Поиск по естественным запросам (Shopify, логотип, перевод, Excel, Reels, WhatsApp)...'
                    : locale === 'en'
                    ? 'Search natural intent (Shopify store, logo design, contract translation, Excel data, reels editing)...'
                    : 'Recherchez par besoin (ex: Shopify COD, Créer un logo, Traduction contrat, Saisie Excel, Montage Reels, Voix off)...'
                }
                className={`w-full rounded-xl border border-slate-300 bg-slate-50/60 py-3 ${
                  isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'
                } text-xs sm:text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:bg-white focus:ring-1 focus:ring-brand-700`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute ${isRTL ? 'left-3.5' : 'right-3.5'} top-3 text-xs text-slate-400 hover:text-slate-800 font-bold bg-slate-200/80 rounded-full h-5 w-5 flex items-center justify-center cursor-pointer`}
                >
                  ✕
                </button>
              )}
            </div>

            {/* City selector dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="rounded-xl border border-slate-300 bg-slate-50/60 py-3 px-3 text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-brand-700 focus:bg-white transition cursor-pointer"
              >
                {citiesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    📍 {c.label[locale as keyof typeof c.label] || c.label.fr}
                  </option>
                ))}
              </select>

              {/* Budget filter dropdown */}
              <select
                value={budgetFilter}
                onChange={(e) => setBudgetFilter(e.target.value as any)}
                className="rounded-xl border border-slate-300 bg-slate-50/60 py-3 px-3.5 text-xs sm:text-sm font-semibold text-slate-700 outline-none focus:border-brand-700 focus:bg-white transition cursor-pointer"
              >
                <option value="all">
                  {locale === 'ar' ? 'كل الميزانيات' : locale === 'ru' ? 'Любой бюджет' : locale === 'en' ? 'All Budgets' : 'Tous les budgets'}
                </option>
                <option value="under100">&lt; 100 DH</option>
                <option value="100to300">100 - 300 DH</option>
                <option value="300to1000">300 - 1000 DH</option>
                <option value="above1000">&gt; 1000 DH</option>
              </select>

              {(searchQuery || selectedCategory !== 'all' || selectedCity !== 'all' || budgetFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedCity('all');
                    setBudgetFilter('all');
                  }}
                  className="rounded-xl bg-slate-100 hover:bg-slate-200 px-3.5 py-3 text-xs font-bold text-slate-600 transition cursor-pointer"
                >
                  {locale === 'ar' ? 'إعادة ضبط' : locale === 'ru' ? 'Сброс' : locale === 'en' ? 'Reset' : 'Réinitialiser'}
                </button>
              )}
            </div>

          </div>

          {/* POPULAR NATURAL SEARCH INTENT CHIPS (Instant Tag Filtering) */}
          <div className="mt-3.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 shrink-0">
              <FiTag className="text-brand-600" />
              <span>{locale === 'ar' ? 'عمليات بحث شائعة :' : 'Recherches fréquentes :'}</span>
            </span>
            {POPULAR_SEARCH_INTENTS.map((intent) => {
              const isActive = searchQuery.toLowerCase().includes(intent.query.toLowerCase());
              return (
                <button
                  key={intent.id}
                  onClick={() => setSearchQuery(isActive ? '' : intent.query)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-brand-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700 border border-slate-200/80'
                  }`}
                >
                  {intent.label}
                </button>
              );
            })}
          </div>

          {/* Category Tabs */}
          <div className="mt-5 pt-5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const catLabel = cat.label[locale] || cat.label.fr;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-brand-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{catLabel}</span>
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* TASKS LIST SECTION (Tâches.ma Accordion Sliding Cards) */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Results Count Banner */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="text-xs sm:text-sm font-semibold text-slate-600 flex items-center gap-2">
            <span>
              {locale === 'ar'
                ? `عرض ${displayedTasks.length} من أصل ${filteredTasks.length} مهمة مطابقة للبحث`
                : locale === 'ru'
                ? `Показано ${displayedTasks.length} из ${filteredTasks.length} примеров`
                : locale === 'en'
                ? `Showing ${displayedTasks.length} of ${filteredTasks.length} matching tasks`
                : `Affichage de ${displayedTasks.length} sur ${filteredTasks.length} missions correspondantes`}
            </span>
            {searchQuery && (
              <span className="text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md font-bold text-xs border border-brand-200">
                « {searchQuery} »
              </span>
            )}
          </div>
          <button
            onClick={onPostNewTask}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800 cursor-pointer"
          >
            <FiPlus className="text-sm" />
            <span>
              {locale === 'ar' ? 'نشر مهمة جديدة' : locale === 'ru' ? 'Разместить свое задание' : locale === 'en' ? 'Post a task' : 'Publier une tâche'}
            </span>
          </button>
        </div>

        {/* Task Cards Accordion Feed */}
        <div className="space-y-4">
          {displayedTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
              <FiShield className="mx-auto text-3xl text-slate-400 mb-2" />
              <h3 className="text-base font-bold text-slate-900">
                {locale === 'ar' ? 'لم يتم العثور على أي مهمة مطابقة' : locale === 'ru' ? 'Задания не найдены' : locale === 'en' ? 'No matching tasks found' : 'Aucune mission correspondante'}
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                {locale === 'ar'
                  ? 'جرب البحث بكلمات أخرى أو انقر على أحد وسوم البحث الشائعة أعلاه.'
                  : 'Essayez une autre recherche ou sélectionnez l’un des tags populaires ci-dessus.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedCity('all');
                  setBudgetFilter('all');
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 text-xs shadow-xs transition cursor-pointer"
              >
                <span>{locale === 'ar' ? 'عرض جميع المهام' : 'Afficher tous les exemples'}</span>
              </button>
            </div>
          ) : (
            displayedTasks.map((task, index) => {
              const isExpanded = !!expandedTaskIds[task.id];
              const taskTitle = task.title[locale] || task.title.fr;
              const taskDesc = task.description[locale] || task.description.fr;
              const executorRole = task.executor.role[locale] || task.executor.role.fr;
              const executorBadge = task.executor.badge[locale] || task.executor.badge.fr;
              const reviewComment = task.clientReview ? (task.clientReview.comment[locale] || task.clientReview.comment.fr) : null;

              return (
                <React.Fragment key={task.id}>
                  {/* TACHES.MA ACCORDION TASK ITEM */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-all hover:border-slate-300 hover:shadow-sm">
                    
                    {/* ACCORDION HEADER (Clickable to Toggle) */}
                    <div
                      onClick={() => toggleTaskExpand(task.id)}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none bg-white hover:bg-slate-50/70 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 text-base font-bold">
                          {task.category === 'development' ? '💻' : task.category === 'design' ? '🎨' : task.category === 'marketing' ? '📱' : task.category === 'copywriting' ? '✍️' : task.category === 'assistance' ? '📊' : '📍'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                            {taskTitle}
                          </h3>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                            <span className="font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                              {task.categoryLabel[locale] || task.categoryLabel.fr}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                              <FiClock className="text-[10px]" />
                              {task.turnaroundTime}
                            </span>
                            {task.city && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-0.5 text-slate-600">
                                  <FiMapPin className="text-[10px]" />
                                  {task.city}
                                </span>
                              </>
                            )}
                            <span>•</span>
                            <span>#{task.orderNumber}</span>
                          </div>
                        </div>
                      </div>

                      {/* Price Badge + Expand Icon */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-base sm:text-lg font-extrabold text-brand-700">
                            {task.priceDH} DH
                          </span>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition">
                          {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED CONTENT PANEL (Tâches.ma Slide-Down Panel) */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/50 p-5 sm:p-6 animate-in slide-in-from-top-2 duration-200">
                        
                        {/* Task Description */}
                        <div className="mb-5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            {locale === 'ar' ? 'تفاصيل المهمة والمطلوب' : locale === 'ru' ? 'Описание задания' : locale === 'en' ? 'Task Description & Brief' : 'Description du besoin'}
                          </h4>
                          <div className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs whitespace-pre-line">
                            {taskDesc}
                          </div>
                        </div>

                        {/* Deliverables List (Search Intent Proof) */}
                        {task.deliverables && task.deliverables.length > 0 && (
                          <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                              <FiPackage className="text-brand-600" />
                              <span>{locale === 'ar' ? 'ما تم تسليمه للعميل بنجاح :' : 'Livrables remis au client :'}</span>
                            </h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                              {task.deliverables.map((item, dIdx) => (
                                <li key={dIdx} className="flex items-start gap-2">
                                  <FiCheck className="text-emerald-600 shrink-0 mt-0.5 font-bold" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Two columns: Executor Box & Client Review Box */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                          
                          {/* Executor Box */}
                          <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-3.5 shadow-2xs">
                            <img
                              src={task.executor.avatar}
                              alt={task.executor.name}
                              className="h-12 w-12 rounded-full object-cover border-2 border-brand-500/30"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs sm:text-sm text-slate-900">
                                  {task.executor.name}
                                </span>
                                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  {executorBadge}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                {executorRole}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-1 font-semibold">
                                <span className="flex items-center text-amber-500">
                                  <FiStar className="fill-amber-400 mr-0.5 text-xs" />
                                  {task.executor.rating}
                                </span>
                                <span>•</span>
                                <span>{task.executor.completedCount} {locale === 'ar' ? 'مهمة منجزة' : 'missions'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Client Review Box */}
                          {task.clientReview ? (
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-2xs">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-bold text-slate-900">
                                  {locale === 'ar' ? 'تقييم صاحب العمل' : locale === 'ru' ? 'Отзыв заказчика' : locale === 'en' ? 'Client Review' : 'Avis du donneur d’ordre'} ({task.clientReview.author})
                                </span>
                                <div className="flex text-amber-400 text-xs">
                                  {'★'.repeat(task.clientReview.rating)}
                                </div>
                              </div>
                              <p className="text-xs text-slate-700 italic leading-snug">
                                « {reviewComment} »
                              </p>
                            </div>
                          ) : (
                            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-center text-xs text-slate-500">
                              {locale === 'ar' ? 'تم استلام العمل وتأكيد الدفع بنجاح' : 'Mission validée et rémunération versée avec succès.'}
                            </div>
                          )}

                        </div>

                        {/* CTA ACTION BUTTON: "Créer une mission pareille" */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
                          <div className="flex flex-wrap gap-1.5">
                            {task.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] font-medium text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-md"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <button
                            onClick={() => onCopyTask(task)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold px-5 py-2.5 text-xs sm:text-sm shadow-sm hover:shadow transition-all active:scale-98 cursor-pointer"
                          >
                            <FiCopy className="text-sm" />
                            <span>
                              {locale === 'ar'
                                ? 'إنشاء مهمة مماثلة بنقرة واحدة'
                                : locale === 'ru'
                                ? 'Создать такое же задание'
                                : locale === 'en'
                                ? 'Create an identical task'
                                : 'Créer une mission identique'}
                            </span>
                          </button>
                        </div>

                      </div>
                    )}

                  </div>

                  {/* IN-FEED CTA BANNER (Tâches.ma Style After 4th item) */}
                  {index === 3 && (
                    <div className="my-6 rounded-2xl bg-gradient-to-r from-brand-700 via-blue-700 to-indigo-800 p-6 sm:p-8 text-white shadow-md text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-5">
                      <div>
                        <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                          {locale === 'ar'
                            ? 'هل تحتاج لمساعدة مستقل محترف في مهمتك؟'
                            : locale === 'ru'
                            ? 'Требуется помощь фрилансера?'
                            : locale === 'en'
                            ? 'Need help from a skilled freelancer?'
                            : 'Besoin de l’aide d’un freelance qualifié ?'}
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-blue-100 max-w-xl">
                          {locale === 'ar'
                            ? 'انشر مهمتك في دقيقتين واستقبل عروض الأسعار الأولى من أفضل الخبراء بالمغرب في غضون 10 دقائق.'
                            : locale === 'ru'
                            ? 'Разместите свое задание прямо сейчас и получите первые отклики уже через несколько минут.'
                            : locale === 'en'
                            ? 'Post your task in 2 minutes and receive your first competitive proposals in under 10 minutes.'
                            : 'Publiez votre besoin en 2 minutes et recevez vos premières propositions en moins de 10 minutes avec garantie séquestre.'}
                        </p>
                      </div>
                      <button
                        onClick={onPostNewTask}
                        className="rounded-xl bg-white text-brand-800 font-extrabold px-6 py-3 text-xs sm:text-sm shadow-md hover:bg-blue-50 transition-all shrink-0 cursor-pointer"
                      >
                        {locale === 'ar' ? 'نشر مهمة الآن' : locale === 'ru' ? 'Создать задание' : locale === 'en' ? 'Post your task' : 'Créer une tâche'}
                      </button>
                    </div>
                  )}
                </React.Fragment>
              );
            })
          )}
        </div>

        {/* LOAD MORE BUTTON */}
        {visibleCount < filteredTasks.length && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 10)}
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-300 px-6 py-3 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 transition shadow-2xs hover:shadow cursor-pointer"
            >
              <span>
                {locale === 'ar'
                  ? 'عرض المزيد من المهام المنجزة'
                  : locale === 'ru'
                  ? 'Показать ещё задания'
                  : locale === 'en'
                  ? 'Load more task examples'
                  : 'Afficher plus d’exemples de missions'}
              </span>
              <FiChevronDown />
            </button>
          </div>
        )}

        {/* BOTTOM BIG CTA BANNER (Tâches.ma Style) */}
        <div className="mt-12 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-8 sm:p-10 text-white shadow-xl text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-brand-600 text-white text-xl mb-4 shadow-sm">
              <FiPlus />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {locale === 'ar'
                ? 'هل لديك مشروع أو مهمة ترغب في تفويضها؟'
                : locale === 'ru'
                ? 'Хотите разместить свое задание?'
                : locale === 'en'
                ? 'Ready to delegate your tasks to top pros?'
                : 'Vous avez une tâche ou un projet à déléguer ?'}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {locale === 'ar'
                ? 'انضم إلى آلاف المغاربة الذين ينجزون أعمالهم اليومية والمشاريع الرقمية بسرعة وبأمان تام تحت نظام الضمان المالي.'
                : locale === 'ru'
                ? 'Присоединяйтесь к тысячам заказчиков. Быстрое выполнение любых задач с гарантией возврата средств.'
                : locale === 'en'
                ? 'Join thousands of satisfied clients in Morocco. Fast delivery with 100% escrow protection.'
                : 'Rejoignez des milliers d’entreprises et particuliers au Maroc. Dépôt gratuit en 2 minutes, fonds garantis sous séquestre Daman.'}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onPostNewTask}
                className="w-full sm:w-auto rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold px-8 py-3.5 text-xs sm:text-sm shadow-lg shadow-brand-600/30 transition-all cursor-pointer"
              >
                {locale === 'ar' ? 'نشر مهمة جديدة الآن' : locale === 'ru' ? 'Разместить свое задание' : locale === 'en' ? 'Post a task now' : 'Publier ma tâche maintenant'}
              </button>
            </div>
          </div>
        </div>

        {/* COMPREHENSIVE SEO DIRECTORY & ADVANTAGES BLOCK (Tâches.ma Style) */}
        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          
          <div className="mb-6">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-2">
              {locale === 'ar'
                ? 'هل تبحث عن مهام جديدة أو مستقلين موثوقين لمشروعك في المغرب؟'
                : locale === 'ru'
                ? 'В поиске новых задач или надежных фрилансеров для вашего проекта?'
                : locale === 'en'
                ? 'Looking for new tasks or trusted freelancers in Morocco?'
                : 'En recherche de nouvelles opportunités ou de freelances qualifiés au Maroc ?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              {locale === 'ar'
                ? 'على منصة tâches.ma، ستجد آلاف المتخصصين المغاربة المعتمدين في شتى المجالات والمهن الرقمية والميدانية:'
                : locale === 'ru'
                ? 'На платформе tâches.ma вы найдете тысячи проверенных исполнителей в различных областях:'
                : locale === 'en'
                ? 'On the tâches.ma marketplace, discover thousands of vetted professionals across all major digital & local fields:'
                : 'Sur la plateforme tâches.ma, découvrez des milliers de spécialistes vérifiés dans tous les domaines d’activité :'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-bold text-brand-700">⬩ Web & E-commerce :</span> configuration Shopify, WooCommerce, landing pages e-commerce, intégration passerelles/Stripe, correction de bugs.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-bold text-brand-700">⬩ Graphisme & Design :</span> création de logo vectoriel, bannières réseaux sociaux, menus de restaurant, flyers A5, détourage photos e-commerce.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-bold text-brand-700">⬩ Marketing Digital & Vidéo :</span> montage vidéo TikTok/Reels avec sous-titres, campagnes TikTok & Meta Ads, voix-off en Darija marocaine.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-bold text-brand-700">⬩ Traduction & Rédaction :</span> traduction juridique Arabe ⇄ Français, relecture de mémoires PFE, fiches produits e-commerce vendeuses.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-bold text-brand-700">⬩ Saisie & Administratif :</span> traitement de factures sous Excel, collecte de leads B2B, service client WhatsApp Business.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-bold text-brand-700">⬩ Services terrain & Démarches :</span> dépôts officiels de plis à Rabat & Casablanca, visites de locaux, tests d’applications mobiles.
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h4 className="text-sm font-extrabold text-slate-900 mb-3">
              {locale === 'ar' ? 'مميزات منصة tâches.ma بالمغرب :' : locale === 'ru' ? 'Преимущества платформы tâches.ma:' : locale === 'en' ? 'Why choose tâches.ma in Morocco:' : 'Les garanties et avantages de tâches.ma :'}
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <FiCheck className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Paiement 100% sécurisé sous séquestre (Daman) :</strong> les fonds sont bloqués et débloqués uniquement après votre entière validation.</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheck className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Prestataires certifiés et évalués :</strong> profil vérifié, notation transparente sur 5 étoiles et avis authentiques.</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheck className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Rapidité d’exécution :</strong> recevez les premières propositions de freelances en moins de 10 minutes.</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheck className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Tous les budgets en Dirhams (MAD) :</strong> des micro-tâches dès 50 DH jusqu’aux projets web et digitaux avancés.</span>
              </li>
            </ul>
          </div>

        </div>

      </section>
    </div>
  );
};
