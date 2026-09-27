'use client';

import { useState } from 'react';
import { FiArrowUpRight, FiCheck, FiChevronDown, FiMenu, FiSearch, FiX } from 'react-icons/fi';

type Lang = 'FR' | 'EN' | 'AR' | 'ES';
const copy = {
  FR: { nav: ['Trouver une tâche', 'Trouver un talent', 'Comment ça marche'], title: <>Les bonnes personnes.<br /><em>Les vrais projets.</em></>, sub: 'La plateforme simple et humaine pour faire avancer vos idées, ensemble.', start: 'Commencer maintenant', explore: 'Explorer les talents', search: 'De quoi avez-vous besoin ?', trusted: 'Ils construisent déjà mieux avec tâches', stats: [['12k+', 'talents vérifiés'], ['48k+', 'projets réalisés'], ['4.9/5', 'satisfaction']], badge: 'Nouveau : tâches pour les équipes', categories: ['Design & création', 'Marketing', 'Développement', 'Maison & quotidien'] },
  EN: { nav: ['Find a task', 'Find talent', 'How it works'], title: <>The right people.<br /><em>Real projects.</em></>, sub: 'The simple, human platform to move your ideas forward, together.', start: 'Get started', explore: 'Explore talent', search: 'What do you need help with?', trusted: 'Already building better with tâches', stats: [['12k+', 'verified talents'], ['48k+', 'projects done'], ['4.9/5', 'satisfaction']], badge: 'New: tâches for teams', categories: ['Design & creative', 'Marketing', 'Development', 'Home & everyday'] },
  AR: { nav: ['ابحث عن مهمة', 'ابحث عن موهبة', 'كيف تعمل'], title: <>الأشخاص المناسبون.<br /><em>المشاريع الحقيقية.</em></>, sub: 'منصة بسيطة وإنسانية لتحويل أفكارك إلى واقع، معًا.', start: 'ابدأ الآن', explore: 'اكتشف المواهب', search: 'ما الذي تحتاجه؟', trusted: 'يبنون بشكل أفضل مع tâches', stats: [['12k+', 'موهبة موثوقة'], ['48k+', 'مشروع منجز'], ['4.9/5', 'رضا العملاء']], badge: 'جديد: tâches للفرق', categories: ['التصميم والإبداع', 'التسويق', 'التطوير', 'المنزل والحياة'] },
  ES: { nav: ['Encontrar tarea', 'Encontrar talento', 'Cómo funciona'], title: <>Las personas correctas.<br /><em>Proyectos reales.</em></>, sub: 'La plataforma sencilla y humana para hacer avanzar tus ideas, juntos.', start: 'Empezar ahora', explore: 'Explorar talento', search: '¿Qué necesitas?', trusted: 'Ya construyen mejor con tâches', stats: [['12k+', 'talentos verificados'], ['48k+', 'proyectos realizados'], ['4.9/5', 'satisfacción']], badge: 'Nuevo: tâches para equipos', categories: ['Diseño y creatividad', 'Marketing', 'Desarrollo', 'Hogar y día a día'] },
};

export default function Home() {
  const [lang, setLang] = useState<Lang>('FR');
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const t = copy[lang];
  return <main dir={lang === 'AR' ? 'rtl' : 'ltr'}>
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
      <a href="#" className="font-display text-2xl font-bold tracking-tight">tâches<span className="text-lime-500">.</span></a>
      <div className={`${menu ? 'flex' : 'hidden'} absolute left-5 right-5 top-20 z-20 flex-col gap-6 rounded-2xl bg-ink p-6 text-white md:static md:flex md:flex-row md:items-center md:bg-transparent md:p-0 md:text-ink`}>
        {t.nav.map((item) => <a key={item} href="#explore" className="text-sm font-medium transition hover:opacity-60">{item}</a>)}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block"><button onClick={() => setOpen(!open)} className="flex items-center gap-1 text-sm font-semibold">{lang}<FiChevronDown /></button>{open && <div className="absolute right-0 top-8 z-30 min-w-20 rounded-xl border border-ink/10 bg-white p-1 shadow-xl">{(['FR','EN','AR','ES'] as Lang[]).map(l => <button key={l} onClick={() => { setLang(l); setOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-lime">{l}</button>)}</div>}</div>
        <button className="hidden rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold transition hover:bg-ink hover:text-white md:block">Se connecter</button>
        <button onClick={() => setMenu(!menu)} className="rounded-full bg-ink p-2 text-white md:hidden">{menu ? <FiX /> : <FiMenu />}</button>
      </div>
    </nav>

    <section className="grid-bg relative mx-3 overflow-hidden rounded-[2rem] bg-lime px-6 pb-12 pt-16 sm:px-12 lg:mx-5 lg:px-20 lg:pb-20 lg:pt-24">
      <div className="relative z-10 max-w-3xl"><div className="mb-8 inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white/25 px-3 py-1.5 text-xs font-semibold"><span className="h-2 w-2 rounded-full bg-ink" />{t.badge}</div><h1 className="font-display text-5xl font-bold leading-[.95] tracking-[-.06em] sm:text-7xl lg:text-[7.6rem]">{t.title}</h1><p className="mt-8 max-w-md text-base leading-relaxed text-ink/70 sm:text-lg">{t.sub}</p><div className="mt-8 flex flex-wrap gap-3"><button className="group flex items-center gap-3 rounded-full bg-ink px-5 py-3.5 text-sm font-semibold text-white transition hover:translate-y-[-2px]">{t.start}<span className="rounded-full bg-lime p-1 text-ink"><FiArrowUpRight /></span></button><button className="rounded-full border border-ink/30 px-5 py-3.5 text-sm font-semibold transition hover:bg-white/30">{t.explore}</button></div></div>
      <div className="mt-14 grid max-w-xl grid-cols-3 gap-4 border-t border-ink/20 pt-5 lg:absolute lg:bottom-12 lg:right-20 lg:mt-0 lg:w-[420px]">{t.stats.map(([num, label]) => <div key={label}><div className="font-display text-2xl font-bold">{num}</div><div className="mt-1 text-[11px] leading-tight text-ink/60">{label}</div></div>)}</div>
      <div className="pointer-events-none absolute -bottom-20 -right-12 hidden h-72 w-72 rounded-full border-[40px] border-ink/10 lg:block" />
    </section>

    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="flex flex-col justify-between gap-7 md:flex-row md:items-end"><div><p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-ink/45">01 — Le point de départ</p><h2 className="font-display max-w-xl text-4xl font-bold leading-tight tracking-[-.04em] sm:text-5xl">Tout ce qu'il faut.<br /><span className="text-ink/35">Rien de superflu.</span></h2></div><div className="relative w-full max-w-sm"><FiSearch className="absolute left-4 top-4 text-ink/40" /><input placeholder={t.search} className="w-full rounded-full border border-ink/15 bg-white py-3.5 pl-11 pr-5 text-sm outline-none transition focus:border-ink" /></div></div>
      <div id="explore" className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{t.categories.map((cat, i) => <a href="#" key={cat} className="group rounded-2xl border border-ink/10 bg-white p-5 transition hover:-translate-y-1 hover:border-ink/30"><div className="mb-12 flex items-start justify-between"><span className="text-3xl">{['✦', '◒', '⌘', '⌂'][i]}</span><span className="rounded-full border border-ink/10 p-2 opacity-40 transition group-hover:bg-lime group-hover:opacity-100"><FiArrowUpRight /></span></div><h3 className="font-display text-lg font-bold">{cat}</h3><div className="mt-2 flex items-center gap-1 text-xs text-ink/45"><FiCheck /> Des profils sélectionnés</div></a>)}</div></section>

    <section className="overflow-hidden bg-ink py-6 text-lime"><div className="marquee flex w-max items-center gap-10 whitespace-nowrap font-display text-2xl font-bold"><span>{t.trusted}</span><span>✳</span><span>{t.trusted}</span><span>✳</span><span>{t.trusted}</span><span>✳</span><span>{t.trusted}</span></div></section>
    <footer className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-sm text-ink/50 sm:flex-row sm:items-center sm:justify-between lg:px-8"><span className="font-display font-bold text-ink">tâches<span className="text-lime-500">.</span></span><span>© 2024 tâches. Faire mieux, ensemble.</span><div className="flex gap-5"><a href="#" className="hover:text-ink">Instagram</a><a href="#" className="hover:text-ink">LinkedIn</a><a href="#" className="hover:text-ink">Contact</a></div></footer>
  </main>;
}
