import { useLanguage } from '../../contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-950/50 border-t border-indigo-500/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-indigo-300 max-w-2xl mx-auto">
            {t('disclaimer.main')}
          </p>
          <p className="text-xs text-indigo-400/60 mt-4">
            &copy; {new Date().getFullYear()} {t('app.name')}
          </p>
        </div>
      </div>
    </footer>
  );
}
