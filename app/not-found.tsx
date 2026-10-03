'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <h1 className="text-6xl font-black text-slate-800 mb-4">404</h1>
      <h2 className="text-xl font-bold text-slate-700 mb-2">Page introuvable</h2>
      <p className="text-slate-500 mb-6 max-w-md">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        href="/fr/tasks"
        className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-colors"
      >
        Explorer les missions
      </Link>
    </div>
  );
}
