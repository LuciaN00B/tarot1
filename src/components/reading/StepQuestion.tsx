import { ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface StepQuestionProps {
  question: string;
  setQuestion: (q: string) => void;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
}

export function StepQuestion({ question, setQuestion, onNext, onBack, canProceed }: StepQuestionProps) {
  const { t, language } = useLanguage();

  const exampleQuestions = language === 'IT'
    ? [
        'Cosa dovrei considerare riguardo alla mia situazione attuale?',
        'Quali aspetti di me stesso dovrei esplorare in questo momento?',
        'Come posso affrontare al meglio questa sfida?',
      ]
    : [
        'What should I consider about my current situation?',
        'What aspects of myself should I explore right now?',
        'How can I best approach this challenge?',
      ];

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-stone-800 mb-4 text-center">{t('question.title')}</h2>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Lightbulb className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-amber-800 text-sm">{t('question.tip')}</p>
        </div>
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder={t('question.placeholder')}
        className="w-full h-32 px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none resize-none text-stone-800"
      />

      <div className="mt-6">
        <p className="text-sm text-stone-500 mb-3">
          {language === 'IT' ? 'Esempi di domande:' : 'Example questions:'}
        </p>
        <div className="space-y-2">
          {exampleQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => setQuestion(q)}
              className="block w-full text-left px-4 py-3 bg-stone-50 hover:bg-stone-100 rounded-lg text-stone-600 text-sm transition-colors"
            >
              "{q}"
            </button>
          ))}
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
          onClick={onNext}
          disabled={!canProceed}
          className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('common.next')}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
