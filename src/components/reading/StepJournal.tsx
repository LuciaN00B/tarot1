import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface StepJournalProps {
  notes: string;
  setNotes: (notes: string) => void;
  mood: number | null;
  setMood: (mood: number | null) => void;
  onSave: () => void;
  onBack: () => void;
  saving: boolean;
}

export function StepJournal({
  notes,
  setNotes,
  mood,
  setMood,
  onSave,
  onBack,
  saving,
}: StepJournalProps) {
  const { t, language } = useLanguage();

  const moodLabels = language === 'IT'
    ? ['Molto Basso', 'Basso', 'Neutro', 'Buono', 'Ottimo']
    : ['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'];

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-stone-800 mb-2 text-center">{t('journal.title')}</h2>
      <p className="text-stone-600 text-center mb-8">{t('journal.prompt')}</p>

      <div className="space-y-6">
        <div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              language === 'IT'
                ? 'Scrivi le tue riflessioni, intuizioni, o qualsiasi pensiero emerso da questa lettura...'
                : 'Write your reflections, insights, or any thoughts that emerged from this reading...'
            }
            className="w-full h-40 px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none resize-none text-stone-800"
          />
        </div>

        <div>
          <label className="block text-stone-700 font-medium mb-3">{t('journal.mood')}</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setMood(mood === value ? null : value)}
                className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                  mood === value
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="text-center">
                  <span className="text-2xl">{value}</span>
                  <p className="text-xs text-stone-500 mt-1">{moodLabels[value - 1]}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
          <p className="text-sm text-stone-500 text-center">{t('disclaimer.main')}</p>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 text-stone-600 hover:text-stone-800 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          {t('common.back')}
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Save size={20} />
          )}
          {t('journal.save')}
        </button>
      </div>
    </div>
  );
}
