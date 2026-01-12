import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Loader2, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Layout } from '../../components/layout/Layout';
import { supabase } from '../../lib/supabase';
import type { Reading, ReadingCard, TarotCard } from '../../types/database';

interface ReadingWithCards extends Reading {
  reading_cards: (ReadingCard & { tarot_cards: TarotCard })[];
}

export function ReadingDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [reading, setReading] = useState<ReadingWithCards | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      fetchReading();
    }
  }, [user, id]);

  const fetchReading = async () => {
    if (!id) return;

    const { data } = await supabase
      .from('readings')
      .select(
        `
        *,
        reading_cards (
          *,
          tarot_cards:card_id (*)
        )
      `
      )
      .eq('id', id)
      .maybeSingle();

    if (data) {
      setReading(data as unknown as ReadingWithCards);
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'IT' ? 'it-IT' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSpreadLabel = (type: string) => {
    const labels: Record<string, string> = {
      single: t('spread.single'),
      three_card: t('spread.threeCard'),
      celtic_cross: t('spread.celticCross'),
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-amber-600" />
        </div>
      </Layout>
    );
  }

  if (!reading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-stone-600 mb-6">
            {language === 'IT' ? 'Lettura non trovata.' : 'Reading not found.'}
          </p>
          <Link
            to="/history"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            {t('nav.history')}
          </Link>
        </div>
      </Layout>
    );
  }

  const interpretation = reading.interpretation as { cards?: Record<string, string>; overall?: string };
  const sortedCards = [...reading.reading_cards].sort((a, b) => a.position - b.position);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/history"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 font-medium mb-6"
        >
          <ArrowLeft size={20} />
          {language === 'IT' ? 'Torna alla cronologia' : 'Back to history'}
        </Link>

        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="p-6 border-b border-stone-100">
            <div className="flex items-center gap-2 text-stone-500 text-sm mb-3">
              <Calendar size={16} />
              {formatDate(reading.created_at)}
            </div>
            <h1 className="text-xl font-bold text-stone-800 mb-2">{reading.question}</h1>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium">
                {getSpreadLabel(reading.spread_type)}
              </span>
              {reading.mood && (
                <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-lg text-sm">
                  {language === 'IT' ? 'Umore' : 'Mood'}: {reading.mood}/5
                </span>
              )}
            </div>
          </div>

          {interpretation.overall && (
            <div className="p-6 bg-gradient-to-b from-amber-50 to-white border-b border-stone-100">
              <p className="text-stone-700 leading-relaxed italic">"{interpretation.overall}"</p>
            </div>
          )}

          <div className="p-6">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">
              {language === 'IT' ? 'Le Tue Carte' : 'Your Cards'}
            </h2>
            <div className="space-y-4">
              {sortedCards.map((rc, index) => {
                const card = rc.tarot_cards;
                if (!card) return null;

                const cardName = language === 'IT' ? card.name_it : card.name_en;
                const cardInterp = interpretation.cards?.[rc.position_name] || '';

                return (
                  <div key={rc.id} className="bg-stone-50 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <span className="text-amber-700 font-semibold">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-800">{cardName}</h3>
                        <p className="text-sm text-stone-500">
                          {rc.position_name}
                          {rc.is_reversed && (
                            <span className="ml-2 text-amber-600">({t('card.reversed')})</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {cardInterp && <p className="text-stone-600 leading-relaxed">{cardInterp}</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {reading.notes && (
            <div className="p-6 border-t border-stone-100">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={18} className="text-stone-500" />
                <h2 className="text-lg font-semibold text-stone-800">{t('journal.title')}</h2>
              </div>
              <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">{reading.notes}</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/reading/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors"
          >
            {t('nav.newReading')}
          </Link>
        </div>
      </div>
    </Layout>
  );
}
