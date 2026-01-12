import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/layout/Layout';
import { supabase } from '../lib/supabase';
import type { Reading } from '../types/database';

export function ReadingHistory() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReadings();
    }
  }, [user]);

  const fetchReadings = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('readings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setReadings(data || []);
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'IT' ? 'it-IT' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
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

  const getMoodEmoji = (mood: number | null) => {
    if (!mood) return '';
    const moods = ['', '1', '2', '3', '4', '5'];
    return moods[mood] || '';
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-stone-800 mb-8">{t('history.title')}</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-amber-600" />
          </div>
        ) : readings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-stone-400" size={32} />
            </div>
            <p className="text-stone-600 mb-6">{t('history.noReadings')}</p>
            <Link
              to="/reading/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors"
            >
              {t('nav.newReading')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {readings.map((reading) => (
              <Link
                key={reading.id}
                to={`/reading/${reading.id}`}
                className="block bg-white p-6 rounded-2xl border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-stone-800 font-medium text-lg mb-2 line-clamp-2">
                      {reading.question}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
                      <span className="px-2 py-1 bg-stone-100 rounded-lg">
                        {getSpreadLabel(reading.spread_type)}
                      </span>
                      <span>{formatDate(reading.created_at)}</span>
                      {reading.mood && (
                        <span className="px-2 py-1 bg-amber-50 rounded-lg text-amber-700">
                          {language === 'IT' ? 'Umore' : 'Mood'}: {getMoodEmoji(reading.mood)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    size={24}
                    className="text-stone-300 group-hover:text-amber-500 transition-colors flex-shrink-0 mt-1"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
