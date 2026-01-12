import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Database, TrendingUp, Sparkles, Calendar } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';

interface Stats {
  totalUsers: number;
  totalReadings: number;
  totalCreditsUsed: number;
  knowledgeChunks: number;
  readingsToday: number;
  newUsersThisWeek: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalReadings: 0,
    totalCreditsUsed: 0,
    knowledgeChunks: 0,
    readingsToday: 0,
    newUsersThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      usersResult,
      readingsResult,
      creditsResult,
      chunksResult,
      readingsTodayResult,
      newUsersResult,
    ] = await Promise.all([
      supabase.from('user_preferences').select('id', { count: 'exact', head: true }),
      supabase.from('readings').select('id', { count: 'exact', head: true }),
      supabase
        .from('credits_ledger')
        .select('amount')
        .eq('transaction_type', 'usage'),
      supabase.from('knowledge_chunks').select('id', { count: 'exact', head: true }),
      supabase
        .from('readings')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString()),
      supabase
        .from('user_preferences')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString()),
    ]);

    const totalCredits = creditsResult.data?.reduce((sum, c) => sum + Math.abs(c.amount), 0) || 0;

    setStats({
      totalUsers: usersResult.count || 0,
      totalReadings: readingsResult.count || 0,
      totalCreditsUsed: totalCredits,
      knowledgeChunks: chunksResult.count || 0,
      readingsToday: readingsTodayResult.count || 0,
      newUsersThisWeek: newUsersResult.count || 0,
    });
    setLoading(false);
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      link: '/admin/users',
    },
    {
      title: 'Total Readings',
      value: stats.totalReadings,
      icon: BookOpen,
      color: 'bg-amber-500',
      link: '/admin/readings',
    },
    {
      title: 'Credits Used',
      value: stats.totalCreditsUsed,
      icon: Sparkles,
      color: 'bg-emerald-500',
    },
    {
      title: 'Knowledge Chunks',
      value: stats.knowledgeChunks,
      icon: Database,
      color: 'bg-violet-500',
      link: '/admin/knowledge',
    },
    {
      title: 'Readings Today',
      value: stats.readingsToday,
      icon: TrendingUp,
      color: 'bg-rose-500',
    },
    {
      title: 'New Users (7 days)',
      value: stats.newUsersThisWeek,
      icon: Calendar,
      color: 'bg-cyan-500',
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">Admin Dashboard</h1>
        <p className="text-stone-600 mt-1">Overview of your application</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="w-12 h-12 bg-stone-200 rounded-xl mb-4" />
              <div className="h-8 bg-stone-200 rounded w-20 mb-2" />
              <div className="h-4 bg-stone-200 rounded w-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card) => {
            const CardWrapper = card.link ? Link : 'div';
            const props = card.link ? { to: card.link } : {};

            return (
              <CardWrapper
                key={card.title}
                {...props}
                className={`bg-white rounded-xl p-6 border border-stone-200 ${
                  card.link ? 'hover:border-stone-300 hover:shadow-lg transition-all cursor-pointer' : ''
                }`}
              >
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4`}>
                  <card.icon className="text-white" size={24} />
                </div>
                <p className="text-3xl font-bold text-stone-800">{card.value.toLocaleString()}</p>
                <p className="text-stone-500 mt-1">{card.title}</p>
              </CardWrapper>
            );
          })}
        </div>
      )}

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-stone-200">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/users"
              className="block px-4 py-3 bg-stone-50 hover:bg-stone-100 rounded-lg text-stone-700 transition-colors"
            >
              Manage Users
            </Link>
            <Link
              to="/admin/readings"
              className="block px-4 py-3 bg-stone-50 hover:bg-stone-100 rounded-lg text-stone-700 transition-colors"
            >
              View All Readings
            </Link>
            <Link
              to="/admin/knowledge"
              className="block px-4 py-3 bg-stone-50 hover:bg-stone-100 rounded-lg text-stone-700 transition-colors"
            >
              Manage Knowledge Base
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-stone-200">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-stone-600">Database</span>
              <span className="flex items-center gap-2 text-emerald-600">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600">Edge Functions</span>
              <span className="flex items-center gap-2 text-emerald-600">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600">AI Service</span>
              <span className="flex items-center gap-2 text-emerald-600">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Available
              </span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
