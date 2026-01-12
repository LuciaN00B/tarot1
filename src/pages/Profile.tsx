import { useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/layout/Layout';

const FOCUS_AREAS = [
  'relationships',
  'career',
  'personal',
  'health',
  'creativity',
  'spirituality',
] as const;

export function Profile() {
  const { user, preferences, updatePreferences } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLanguageChange = async (lang: 'EN' | 'IT') => {
    setSaving(true);
    setLanguage(lang);
    await updatePreferences({ language: lang });
    setSaving(false);
    showSavedFeedback();
  };

  const handleToneChange = async (tone: 'soft' | 'pragmatic' | 'spiritual' | 'direct') => {
    setSaving(true);
    await updatePreferences({ reading_tone: tone });
    setSaving(false);
    showSavedFeedback();
  };

  const handleExperienceChange = async (level: 'beginner' | 'intermediate') => {
    setSaving(true);
    await updatePreferences({ experience_level: level });
    setSaving(false);
    showSavedFeedback();
  };

  const handleFocusToggle = async (area: string) => {
    const currentAreas = preferences?.focus_areas || [];
    const newAreas = currentAreas.includes(area)
      ? currentAreas.filter((a) => a !== area)
      : [...currentAreas, area];

    setSaving(true);
    await updatePreferences({ focus_areas: newAreas });
    setSaving(false);
    showSavedFeedback();
  };

  const showSavedFeedback = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-stone-800">{t('nav.profile')}</h1>
          <div className="flex items-center gap-2 text-sm">
            {saving && <Loader2 size={16} className="animate-spin text-amber-600" />}
            {saved && (
              <span className="flex items-center gap-1 text-emerald-600">
                <Check size={16} />
                {language === 'IT' ? 'Salvato' : 'Saved'}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-stone-200">
            <h2 className="text-lg font-semibold text-stone-800 mb-1">
              {language === 'IT' ? 'Account' : 'Account'}
            </h2>
            <p className="text-stone-500 text-sm mb-4">{user?.email}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">{t('profile.language')}</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleLanguageChange('EN')}
                className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                  language === 'EN'
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                English
              </button>
              <button
                onClick={() => handleLanguageChange('IT')}
                className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                  language === 'IT'
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                Italiano
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">{t('profile.tone')}</h2>
            <div className="grid grid-cols-2 gap-3">
              {(['soft', 'pragmatic', 'spiritual', 'direct'] as const).map((tone) => (
                <button
                  key={tone}
                  onClick={() => handleToneChange(tone)}
                  className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                    preferences?.reading_tone === tone
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {t(`tone.${tone}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">{t('profile.experience')}</h2>
            <div className="grid grid-cols-2 gap-3">
              {(['beginner', 'intermediate'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => handleExperienceChange(level)}
                  className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                    preferences?.experience_level === level
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {t(`experience.${level}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">{t('profile.focusAreas')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FOCUS_AREAS.map((area) => (
                <button
                  key={area}
                  onClick={() => handleFocusToggle(area)}
                  className={`py-3 px-4 rounded-xl border-2 font-medium transition-all text-sm ${
                    preferences?.focus_areas?.includes(area)
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {t(`focus.${area}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
