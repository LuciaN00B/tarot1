import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, History, Compass, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout/Layout';

export function Landing() {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <Layout>
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-stone-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-8">
              <Sparkles size={16} />
              {t('app.name')}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-stone-900 leading-tight mb-6">
              {t('landing.hero')}
            </h1>
            <p className="text-lg md:text-xl text-stone-600 mb-10 leading-relaxed">
              {t('landing.heroSub')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={user ? '/reading/new' : '/signup'}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300 text-lg"
              >
                {t('landing.getStarted')}
                <ArrowRight size={20} />
              </Link>
              {!user && (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-stone-50 text-stone-700 rounded-xl font-medium transition-all border border-stone-200 text-lg"
                >
                  {t('nav.signIn')}
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-b from-stone-50 to-white p-8 rounded-2xl border border-stone-100">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <Compass className="text-amber-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-3">
                {t('landing.feature1Title')}
              </h3>
              <p className="text-stone-600 leading-relaxed">
                {t('landing.feature1Desc')}
              </p>
            </div>

            <div className="bg-gradient-to-b from-stone-50 to-white p-8 rounded-2xl border border-stone-100">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="text-amber-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-3">
                {t('landing.feature2Title')}
              </h3>
              <p className="text-stone-600 leading-relaxed">
                {t('landing.feature2Desc')}
              </p>
            </div>

            <div className="bg-gradient-to-b from-stone-50 to-white p-8 rounded-2xl border border-stone-100">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <History className="text-amber-600" size={28} />
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-3">
                {t('landing.feature3Title')}
              </h3>
              <p className="text-stone-600 leading-relaxed">
                {t('landing.feature3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/80 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-6 drop-shadow-lg">
              {t('app.tagline')}
            </h2>
            <p className="text-stone-100 mb-8 max-w-2xl mx-auto">
              {t('disclaimer.main')}
            </p>
            <Link
              to={user ? '/reading/new' : '/signup'}
              className="mystical-button inline-flex items-center justify-center gap-2"
            >
              {t('landing.getStarted')}
              <Sparkles size={20} className="animate-shimmer" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
