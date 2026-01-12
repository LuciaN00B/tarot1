import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/layout/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { StepCentering } from '../../components/reading/StepCentering';
import { StepQuestion } from '../../components/reading/StepQuestion';
import { StepSpread } from '../../components/reading/StepSpread';
import { StepCards } from '../../components/reading/StepCards';
import { StepInterpretation } from '../../components/reading/StepInterpretation';
import { StepJournal } from '../../components/reading/StepJournal';
import { supabase } from '../../lib/supabase';
import type { SpreadType, TarotCard } from '../../types/database';

interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  position: number;
  positionName: string;
}

export function NewReading() {
  const { user, credits, refreshCredits } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState('');
  const [spreadType, setSpreadType] = useState<SpreadType>('three_card');
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [interpretation, setInterpretation] = useState<Record<string, unknown>>({});
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const totalSteps = 6;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSaveReading = async () => {
    if (!user) return;

    setSaving(true);

    const { data: reading, error: readingError } = await supabase
      .from('readings')
      .insert({
        user_id: user.id,
        question,
        spread_type: spreadType,
        interpretation,
        notes,
        mood,
      })
      .select()
      .single();

    if (readingError || !reading) {
      setSaving(false);
      return;
    }

    const cardInserts = drawnCards.map((dc) => ({
      reading_id: reading.id,
      card_id: dc.card.id,
      position: dc.position,
      position_name: dc.positionName,
      is_reversed: dc.isReversed,
    }));

    await supabase.from('reading_cards').insert(cardInserts);

    const { data: lastCredit } = await supabase
      .from('credits_ledger')
      .select('balance_after')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const currentBalance = lastCredit?.balance_after ?? 0;

    await supabase.from('credits_ledger').insert({
      user_id: user.id,
      amount: -1,
      transaction_type: 'usage',
      description: language === 'IT' ? 'Lettura dei tarocchi' : 'Tarot reading',
      reference_id: reading.id,
      balance_after: currentBalance - 1,
    });

    await refreshCredits();
    setSaving(false);
    navigate(`/reading/${reading.id}`);
  };

  const canProceed = () => {
    switch (step) {
      case 2:
        return question.trim().length > 0;
      case 4:
        const requiredCards =
          spreadType === 'single' ? 1 : spreadType === 'three_card' ? 3 : 10;
        return drawnCards.length === requiredCards;
      default:
        return true;
    }
  };

  if (credits < 1) {
    return (
      <Layout showFooter={false}>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-stone-800 mb-4">
            {language === 'IT' ? 'Crediti Esauriti' : 'No Credits Remaining'}
          </h1>
          <p className="text-stone-600 mb-8">
            {language === 'IT'
              ? 'Hai bisogno di crediti per effettuare una lettura.'
              : 'You need credits to perform a reading.'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors"
          >
            {language === 'IT' ? 'Torna alla Dashboard' : 'Back to Dashboard'}
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-stone-500">
              {language === 'IT' ? 'Passo' : 'Step'} {step} / {totalSteps}
            </span>
            <span className="text-sm text-stone-500">
              {credits} {language === 'IT' ? 'crediti' : 'credits'}
            </span>
          </div>
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && <StepCentering onNext={handleNext} />}
        {step === 2 && (
          <StepQuestion
            question={question}
            setQuestion={setQuestion}
            onNext={handleNext}
            onBack={handleBack}
            canProceed={canProceed()}
          />
        )}
        {step === 3 && (
          <StepSpread
            spreadType={spreadType}
            setSpreadType={setSpreadType}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {step === 4 && (
          <StepCards
            spreadType={spreadType}
            drawnCards={drawnCards}
            setDrawnCards={setDrawnCards}
            onNext={handleNext}
            onBack={handleBack}
            canProceed={canProceed()}
          />
        )}
        {step === 5 && (
          <StepInterpretation
            question={question}
            spreadType={spreadType}
            drawnCards={drawnCards}
            interpretation={interpretation}
            setInterpretation={setInterpretation}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {step === 6 && (
          <StepJournal
            notes={notes}
            setNotes={setNotes}
            mood={mood}
            setMood={setMood}
            onSave={handleSaveReading}
            onBack={handleBack}
            saving={saving}
          />
        )}
      </div>
    </Layout>
  );
}
