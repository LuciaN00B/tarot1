import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Sparkles, Calendar } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';

interface UserData {
  id: string;
  user_id: string;
  language: string;
  reading_tone: string;
  experience_level: string;
  created_at: string;
  email?: string;
  credits?: number;
  readings_count?: number;
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);

    const { data: prefs, count } = await supabase
      .from('user_preferences')
      .select('*', { count: 'exact' })
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order('created_at', { ascending: false });

    if (prefs) {
      const usersWithDetails = await Promise.all(
        prefs.map(async (pref) => {
          const [creditsResult, readingsResult] = await Promise.all([
            supabase
              .from('credits_ledger')
              .select('balance_after')
              .eq('user_id', pref.user_id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle(),
            supabase
              .from('readings')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', pref.user_id),
          ]);

          return {
            ...pref,
            credits: creditsResult.data?.balance_after ?? 0,
            readings_count: readingsResult.count ?? 0,
          };
        })
      );

      setUsers(usersWithDetails);
      setTotalCount(count || 0);
    }

    setLoading(false);
  };

  const filteredUsers = users.filter((user) =>
    user.user_id.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleGrantCredits = async (userId: string, currentCredits: number) => {
    const amount = prompt('Enter number of credits to grant:');
    if (!amount || isNaN(parseInt(amount))) return;

    const creditsToAdd = parseInt(amount);

    await supabase.from('credits_ledger').insert({
      user_id: userId,
      amount: creditsToAdd,
      transaction_type: 'bonus',
      description: 'Admin granted credits',
      balance_after: currentCredits + creditsToAdd,
    });

    fetchUsers();
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">Users</h1>
        <p className="text-stone-600 mt-1">Manage user accounts and credits</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input
              type="text"
              placeholder="Search by user ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Language
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Tone
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Credits
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Readings
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-4 bg-stone-200 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-stone-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-stone-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-stone-600">
                        {user.user_id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-stone-600">{user.language}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-stone-600 capitalize">{user.reading_tone}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={14} className="text-amber-500" />
                        <span className="text-sm font-medium text-stone-700">{user.credits}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-stone-600">{user.readings_count}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-stone-500">
                        <Calendar size={14} />
                        <span className="text-sm">{formatDate(user.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleGrantCredits(user.user_id, user.credits || 0)}
                        className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                      >
                        Grant Credits
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-stone-200 flex items-center justify-between">
            <span className="text-sm text-stone-500">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
