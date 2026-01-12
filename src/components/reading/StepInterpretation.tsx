import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Sparkles, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { SpreadType, TarotCard } from '../../types/database';

interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  position: number;
  positionName: string;
}

interface StepInterpretationProps {
  question: string;
  spreadType: SpreadType;
  drawnCards: DrawnCard[];
  interpretation: Record<string, unknown>;
  setInterpretation: (interp: Record<string, unknown>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepInterpretation({
  question,
  spreadType,
  drawnCards,
  interpretation,
  setInterpretation,
  onNext,
  onBack,
}: StepInterpretationProps) {
  const { t, language } = useLanguage();
  const { preferences, session } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(Object.keys(interpretation).length > 0);

  useEffect(() => {
    if (!generated && drawnCards.length > 0) {
      generateInterpretation();
    }
  }, []);

  const generateInterpretation = async () => {
    setGenerating(true);

    const tone = preferences?.reading_tone || 'soft';
    const focusAreas = preferences?.focus_areas || [];

    const cardsPayload = drawnCards.map((dc) => ({
      cardName: language === 'IT' ? dc.card.name_it : dc.card.name_en,
      positionName: dc.positionName,
      isReversed: dc.isReversed,
      meaning: dc.isReversed
        ? (language === 'IT' ? dc.card.reversed_meaning_it : dc.card.reversed_meaning_en)
        : (language === 'IT' ? dc.card.upright_meaning_it : dc.card.upright_meaning_en),
      keywords: language === 'IT' ? dc.card.keywords_it : dc.card.keywords_en,
    }));

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-interpretation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentSession?.access_token || session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            question,
            spreadType,
            drawnCards: cardsPayload,
            tone,
            language,
            focusAreas,
          }),
        }
      );

      if (response.ok) {
        const aiInterpretation = await response.json();
        setInterpretation({
          ...aiInterpretation,
          tone,
          generatedAt: new Date().toISOString(),
        });
      } else {
        setInterpretation(generateFallbackInterpretation(cardsPayload, tone));
      }
    } catch {
      setInterpretation(generateFallbackInterpretation(cardsPayload, tone));
    }

    setGenerating(false);
    setGenerated(true);
  };

  const generateFallbackInterpretation = (
    cards: { cardName: string; positionName: string; isReversed: boolean; meaning: string; keywords: string[] }[],
    tone: string
  ) => {
    const isItalian = language === 'IT';

    const toneIntros: Record<string, { en: string; it: string }> = {
      soft: {
        en: 'This reading gently invites you to explore',
        it: 'Questa lettura ti invita dolcemente a esplorare',
      },
      pragmatic: {
        en: 'Looking at this practically, the cards suggest',
        it: 'Guardando praticamente, le carte suggeriscono',
      },
      spiritual: {
        en: 'On a deeper spiritual level, this reading reveals',
        it: 'A un livello spirituale piu profondo, questa lettura rivela',
      },
      direct: {
        en: 'The cards clearly point to',
        it: 'Le carte indicano chiaramente',
      },
    };

    const intro = toneIntros[tone] || toneIntros.soft;
    const overallMsg = isItalian
      ? `${intro.it} i temi legati alla tua domanda: "${question}". Le carte che hai estratto offrono simboli potenti per la riflessione personale.`
      : `${intro.en} themes related to your question: "${question}". The cards you've drawn offer powerful symbols for personal reflection.`;

    const cardInterps: Record<string, string> = {};
    cards.forEach((card) => {
      const reversedNote = card.isReversed
        ? (isItalian ? ' In posizione rovesciata, questo potrebbe indicare blocchi o sfide in quest\'area.' : ' In the reversed position, this may indicate blocks or challenges in this area.')
        : '';

      cardInterps[card.positionName] = isItalian
        ? `${card.cardName} nella posizione "${card.positionName}" porta energie di ${card.keywords.slice(0, 3).join(', ')}. ${card.meaning}${reversedNote} Rifletti su come questi temi si manifestano nella tua vita.`
        : `${card.cardName} in the "${card.positionName}" position brings energies of ${card.keywords.slice(0, 3).join(', ')}. ${card.meaning}${reversedNote} Reflect on how these themes manifest in your life.`;
    });

    const allKeywords = cards.flatMap(c => c.keywords.slice(0, 2));
    const uniqueThemes = [...new Set(allKeywords)].slice(0, 4);
    const themesStr = uniqueThemes.join(', ');

    const synthesis = isItalian
      ? `Visione d'Insieme: Guardando questa lettura nel suo complesso, emergono temi interconnessi di ${themesStr}. Le carte, considerate insieme, suggeriscono un momento in cui questi aspetti della tua vita si intrecciano. Questa non e una previsione, ma un invito a riflettere su come questi simboli risuonano con la tua esperienza attuale. Considera: quali connessioni vedi tra queste energie? Come potrebbero guidare le tue riflessioni nei prossimi giorni?`
      : `Overall Vision: Looking at this reading as a whole, interconnected themes of ${themesStr} emerge. The cards, considered together, suggest a moment where these aspects of your life interweave. This is not a prediction, but an invitation to reflect on how these symbols resonate with your current experience. Consider: what connections do you see between these energies? How might they guide your reflections in the coming days?`;

    return {
      overall: overallMsg,
      cards: cardInterps,
      synthesis,
    };
  };

  const cardInterps = (interpretation.cards as Record<string, string>) || {};

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-stone-800 mb-2 text-center">
        {language === 'IT' ? 'La Tua Interpretazione' : 'Your Interpretation'}
      </h2>

      {generating ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="text-amber-600" size={32} />
          </div>
          <p className="text-stone-600">{t('interpretation.generating')}</p>
        </div>
      ) : (
        <>
          <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl border border-amber-200 p-6 mb-6">
            <p className="text-stone-700 leading-relaxed italic">
              "{interpretation.overall as string}"
            </p>
          </div>

          <div className="space-y-4">
            {drawnCards.map((dc, index) => {
              const cardName = language === 'IT' ? dc.card.name_it : dc.card.name_en;
              const interp = cardInterps[dc.positionName] || '';

              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-stone-200 p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <span className="text-amber-700 font-semibold">{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-800">{cardName}</h3>
                      <p className="text-sm text-stone-500">
                        {dc.positionName}
                        {dc.isReversed && (
                          <span className="ml-2 text-amber-600">({t('card.reversed')})</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <p className="text-stone-600 leading-relaxed">{interp}</p>
                </div>
              );
            })}
          </div>

          {interpretation.synthesis && (
            <div className="bg-gradient-to-b from-stone-800 to-stone-900 rounded-2xl p-6 mt-8">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-amber-400" size={20} />
                <h3 className="text-lg font-semibold text-white">
                  {language === 'IT' ? 'Visione d\'Insieme' : 'Overall Vision'}
                </h3>
              </div>
              <p className="text-stone-300 leading-relaxed">
                {interpretation.synthesis as string}
              </p>
            </div>
          )}

          <button
            onClick={generateInterpretation}
            className="flex items-center gap-2 mx-auto mt-6 text-stone-500 hover:text-stone-700 text-sm font-medium transition-colors"
          >
            <RotateCcw size={16} />
            {language === 'IT' ? 'Rigenera interpretazione' : 'Regenerate interpretation'}
          </button>
        </>
      )}

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
          disabled={generating}
          className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('common.next')}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
