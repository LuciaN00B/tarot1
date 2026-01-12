import { Link } from 'react-router-dom';
import { Plus, History, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Layout } from '../components/layout/Layout';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Reading } from '../types/database';

export function Dashboard() {
  const { user, credits } = useAuth();
  const { t, language } = useLanguage();
  const [recentReadings, setRecentReadings] = useState<Reading[]>([]);
  const [totalReadings, setTotalReadings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    const [readingsResult, countResult] = await Promise.all([
      supabase
        .from('readings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('readings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
    ]);

    setRecentReadings(readingsResult.data || []);
    setTotalReadings(countResult.count || 0);
    setLoading(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'IT' ? 'it-IT' : 'en-US', {
      month: 'short',
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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-800">
            {language === 'IT' ? 'Benvenuto' : 'Welcome'}
          </h1>
          <p className="text-stone-600 mt-1">{t('app.tagline')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-4">
              <Sparkles size={24} />
              <span className="text-3xl font-bold">{credits}</span>
            </div>
            <p className="text-amber-100">{t('credits.remaining')}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp size={24} className="text-stone-400" />
              <span className="text-3xl font-bold text-stone-800">{totalReadings}</span>
            </div>
            <p className="text-stone-500">
              {language === 'IT' ? 'Letture Totali' : 'Total Readings'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <Calendar size={24} className="text-stone-400" />
              <span className="text-3xl font-bold text-stone-800">
                {recentReadings[0] ? formatDate(recentReadings[0].created_at).split(',')[0] : '-'}
              </span>
            </div>
            <p className="text-stone-500">
              {language === 'IT' ? 'Ultima Lettura' : 'Last Reading'}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/reading/new"
            className="bg-white p-8 rounded-2xl border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all group"
          >
            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
              <Plus className="text-amber-600" size={28} />
            </div>
            <h2 className="text-xl font-semibold text-stone-800 mb-2">{t('nav.newReading')}</h2>
            <p className="text-stone-600">
              {language === 'IT'
                ? 'Inizia una nuova sessione di riflessione guidata'
                : 'Start a new guided reflection session'}
            </p>
          </Link>

          <Link
            to="/history"
            className="bg-white p-8 rounded-2xl border border-stone-200 hover:border-amber-300 hover:shadow-lg transition-all group"
          >
            <div className="w-14 h-14 bg-stone-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-stone-200 transition-colors">
              <History className="text-stone-600" size={28} />
            </div>
            <h2 className="text-xl font-semibold text-stone-800 mb-2">{t('nav.history')}</h2>
            <p className="text-stone-600">
              {language === 'IT'
                ? 'Rivedi le tue letture passate e riflessioni'
                : 'Review your past readings and reflections'}
            </p>
          </Link>
        </div>

        {!loading && recentReadings.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-stone-800 mb-4">
              {language === 'IT' ? 'Letture Recenti' : 'Recent Readings'}
            </h2>
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              {recentReadings.map((reading, index) => (
                <Link
                  key={reading.id}
                  to={`/reading/${reading.id}`}
                  className={`flex items-center justify-between p-4 hover:bg-stone-50 transition-colors ${
                    index !== recentReadings.length - 1 ? 'border-b border-stone-100' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-stone-800 font-medium truncate">{reading.question}</p>
                    <p className="text-sm text-stone-500 mt-1">
                      {getSpreadLabel(reading.spread_type)} &bull; {formatDate(reading.created_at)}
                    </p>
                  </div>
                  <span className="ml-4 text-stone-400">&rarr;</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
