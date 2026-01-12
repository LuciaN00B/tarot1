import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Shuffle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import type { SpreadType, TarotCard } from '../../types/database';
import { SPREAD_POSITIONS } from '../../types/database';

interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  position: number;
  positionName: string;
}

interface StepCardsProps {
  spreadType: SpreadType;
  drawnCards: DrawnCard[];
  setDrawnCards: (cards: DrawnCard[]) => void;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
}

export function StepCards({
  spreadType,
  drawnCards,
  setDrawnCards,
  onNext,
  onBack,
  canProceed,
}: StepCardsProps) {
  const { t, language } = useLanguage();
  const [allCards, setAllCards] = useState<TarotCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [shuffling, setShuffling] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [revealedPositions, setRevealedPositions] = useState<number[]>([]);

  const positions = SPREAD_POSITIONS[spreadType];
  const requiredCards = positions.length;

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    const { data } = await supabase.from('tarot_cards').select('*').order('id');
    if (data) {
      setAllCards(data);
    }
    setLoading(false);
  };

  const shuffle = () => {
    setShuffling(true);
    setDrawnCards([]);
    setRevealedPositions([]);

    setTimeout(() => {
      const shuffledDeck = [...allCards].sort(() => Math.random() - 0.5);
      const drawn: DrawnCard[] = positions.map((pos, index) => ({
        card: shuffledDeck[index],
        isReversed: Math.random() < 0.3,
        position: pos.index,
        positionName: language === 'IT' ? pos.name_it : pos.name_en,
      }));

      setDrawnCards(drawn);
      setShuffling(false);
      setShuffled(true);
    }, 1500);
  };

  const revealCard = (index: number) => {
    if (!revealedPositions.includes(index)) {
      setRevealedPositions([...revealedPositions, index]);
    }
  };

  const revealAll = () => {
    setRevealedPositions(positions.map((_, i) => i));
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Loader2 size={32} className="animate-spin text-amber-600 mx-auto" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-stone-800 mb-2 text-center">
        {language === 'IT' ? 'Estrai le Carte' : 'Draw Your Cards'}
      </h2>
      <p className="text-stone-600 text-center mb-8">
        {!shuffled
          ? language === 'IT'
            ? 'Concentrati sulla tua domanda e mescola il mazzo'
            : 'Focus on your question and shuffle the deck'
          : language === 'IT'
          ? 'Clicca sulle carte per rivelarle'
          : 'Click on cards to reveal them'}
      </p>

      {!shuffled ? (
        <div className="text-center">
          <button
            onClick={shuffle}
            disabled={shuffling}
            className="inline-flex items-center gap-3 px-8 py-4 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-medium transition-all disabled:opacity-50"
          >
            <Shuffle size={20} className={shuffling ? 'animate-spin' : ''} />
            {shuffling
              ? language === 'IT'
                ? 'Mescolando...'
                : 'Shuffling...'
              : t('cards.shuffle')}
          </button>
        </div>
      ) : (
        <>
          <div
            className={`grid gap-4 mb-6 ${
              spreadType === 'single'
                ? 'grid-cols-1 max-w-[200px] mx-auto'
                : spreadType === 'three_card'
                ? 'grid-cols-3 max-w-2xl mx-auto'
                : 'grid-cols-4 max-w-3xl mx-auto'
            }`}
          >
            {drawnCards.map((dc, index) => {
              const isRevealed = revealedPositions.includes(index);
              const cardName = language === 'IT' ? dc.card.name_it : dc.card.name_en;

              return (
                <button
                  key={index}
                  onClick={() => revealCard(index)}
                  disabled={isRevealed}
                  className={`aspect-[2/3] rounded-xl transition-all transform ${
                    isRevealed
                      ? 'bg-gradient-to-b from-amber-50 to-amber-100 border-2 border-amber-300'
                      : 'bg-gradient-to-b from-stone-700 to-stone-900 hover:scale-105 cursor-pointer'
                  }`}
                >
                  {isRevealed ? (
                    <div className="h-full flex flex-col items-center justify-center p-3">
                      <p className="text-xs text-amber-600 font-medium mb-1">
                        {dc.positionName}
                      </p>
                      <p className="text-sm font-semibold text-stone-800 text-center leading-tight">
                        {cardName}
                      </p>
                      {dc.isReversed && (
                        <span className="mt-1 text-xs px-2 py-0.5 bg-stone-200 rounded text-stone-600">
                          {t('card.reversed')}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <span className="text-amber-300 text-xl font-serif">?</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {revealedPositions.length < requiredCards && (
            <div className="text-center mb-6">
              <button
                onClick={revealAll}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                {language === 'IT' ? 'Rivela tutte le carte' : 'Reveal all cards'}
              </button>
            </div>
          )}

          <button
            onClick={shuffle}
            className="flex items-center gap-2 mx-auto text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
          >
            <Shuffle size={16} />
            {language === 'IT' ? 'Mescola di nuovo' : 'Shuffle again'}
          </button>
        </>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 text-indigo-300 hover:text-indigo-100 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          {t('common.back')}
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed || revealedPositions.length < requiredCards}
          className="mystical-button inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('common.next')}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
