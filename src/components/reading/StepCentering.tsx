import { useState, useEffect } from 'react';
import { Wind, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface StepCenteringProps {
  onNext: () => void;
}

export function StepCentering({ onNext }: StepCenteringProps) {
  const { t, language } = useLanguage();
  const [breathCount, setBreathCount] = useState(0);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [isBreathing, setIsBreathing] = useState(false);

  useEffect(() => {
    if (!isBreathing) return;

    const phases = ['inhale', 'hold', 'exhale'] as const;
    const durations = { inhale: 4000, hold: 2000, exhale: 4000 };
    let phaseIndex = 0;
    let totalBreaths = 0;

    const runPhase = () => {
      if (totalBreaths >= 3) {
        setIsBreathing(false);
        return;
      }

      setPhase(phases[phaseIndex]);

      setTimeout(() => {
        phaseIndex++;
        if (phaseIndex >= phases.length) {
          phaseIndex = 0;
          totalBreaths++;
          setBreathCount(totalBreaths);
        }
        runPhase();
      }, durations[phases[phaseIndex]]);
    };

    runPhase();
  }, [isBreathing]);

  const getPhaseText = () => {
    if (!isBreathing) return '';
    if (language === 'IT') {
      return phase === 'inhale' ? 'Inspira...' : phase === 'hold' ? 'Trattieni...' : 'Espira...';
    }
    return phase === 'inhale' ? 'Breathe in...' : phase === 'hold' ? 'Hold...' : 'Breathe out...';
  };

  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-8">
        <Wind className="text-amber-600" size={36} />
      </div>

      <h2 className="text-2xl font-bold text-stone-800 mb-4">{t('centering.title')}</h2>
      <p className="text-stone-600 mb-8 max-w-md mx-auto leading-relaxed">
        {t('centering.instruction')}
      </p>

      {!isBreathing && breathCount === 0 && (
        <button
          onClick={() => setIsBreathing(true)}
          className="px-8 py-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium transition-all mb-8"
        >
          {language === 'IT' ? 'Inizia Esercizio di Respirazione' : 'Start Breathing Exercise'}
        </button>
      )}

      {isBreathing && (
        <div className="mb-8">
          <div
            className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-1000 ${
              phase === 'inhale'
                ? 'scale-125 bg-amber-100'
                : phase === 'hold'
                ? 'scale-125 bg-amber-200'
                : 'scale-100 bg-amber-50'
            }`}
          >
            <span className="text-amber-700 font-medium">{getPhaseText()}</span>
          </div>
          <p className="mt-4 text-stone-500">
            {language === 'IT' ? 'Respiro' : 'Breath'} {breathCount + 1} / 3
          </p>
        </div>
      )}

      {(breathCount >= 3 || !isBreathing) && (
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors"
        >
          {breathCount >= 3
            ? language === 'IT'
              ? 'Sono Pronto'
              : "I'm Ready"
            : language === 'IT'
            ? 'Salta e Continua'
            : 'Skip & Continue'}
          <ArrowRight size={20} />
        </button>
      )}
    </div>
  );
}
