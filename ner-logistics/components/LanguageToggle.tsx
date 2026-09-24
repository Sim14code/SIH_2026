'use client';

import { useLanguage } from '@/context/LanguageContext';
import type { Language } from '@/i18n/translations';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'as', label: 'অসমীয়া', flag: '🟠' },
  { code: 'bn', label: 'বাংলা', flag: '🟡' },
  { code: 'mni', label: 'মৈতৈলোন্', flag: '🟣' },
];

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          title={l.label}
          className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
            lang === l.code
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
              : 'bg-slate-700/60 text-slate-300 hover:bg-slate-600 hover:text-white'
          }`}
        >
          <span className="mr-1">{l.flag}</span>
          <span className="hidden sm:inline">{l.label}</span>
        </button>
      ))}
    </div>
  );
}
