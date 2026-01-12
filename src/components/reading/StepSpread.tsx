import { ArrowRight, ArrowLeft, Square, Columns3, Grid3X3 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { SpreadType } from '../../types/database';

interface StepSpreadProps {
  spreadType: SpreadType;
  setSpreadType: (type: SpreadType) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepSpread({ spreadType, setSpreadType, onNext, onBack }: StepSpreadProps) {
  const { t, language } = useLanguage();

  const spreads: { type: SpreadType; icon: typeof Square; cards: number }[] = [
    { type: 'single', icon: Square, cards: 1 },
    { type: 'three_card', icon: Columns3, cards: 3 },
    { type: 'celtic_cross', icon: Grid3X3, cards: 10 },
  ];

  const getSpreadLabel = (type: SpreadType) => {
    const labels: Record<SpreadType, string> = {
      single: t('spread.single'),
      three_card: t('spread.threeCard'),
      celtic_cross: t('spread.celticCross'),
    };
    return labels[type];
  };

  const getSpreadDesc = (type: SpreadType) => {
    const descs: Record<SpreadType, string> = {
      single: t('spread.singleDesc'),
      three_card: t('spread.threeCardDesc'),
      celtic_cross: t('spread.celticCrossDesc'),
    };
    return descs[type];
  };

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-stone-800 mb-2 text-center">
        {language === 'IT' ? 'Scegli lo Schema' : 'Choose Your Spread'}
      </h2>
      <p className="text-stone-600 text-center mb-8">
        {language === 'IT'
          ? 'Seleziona il tipo di lettura che desideri'
          : 'Select the type of reading you want'}
      </p>

      <div className="space-y-4">
        {spreads.map(({ type, icon: Icon, cards }) => (
          <button
            key={type}
            onClick={() => setSpreadType(type)}
            className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${
              spreadType === type
                ? 'border-amber-500 bg-amber-50'
                : 'border-stone-200 hover:border-stone-300 bg-white'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  spreadType === type ? 'bg-amber-200' : 'bg-stone-100'
                }`}
              >
                <Icon className={spreadType === type ? 'text-amber-700' : 'text-stone-500'} size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-stone-800">{getSpreadLabel(type)}</h3>
                  <span className="text-sm text-stone-500">
                    {cards} {language === 'IT' ? 'carte' : 'cards'}
                  </span>
                </div>
                <p className="text-stone-600 text-sm mt-1">{getSpreadDesc(type)}</p>
              </div>
            </div>
          </button>
        ))}
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
          onClick={onNext}
          className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors"
        >
          {t('common.next')}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
