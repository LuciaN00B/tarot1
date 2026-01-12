import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Calendar, Eye } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import type { Reading } from '../../types/database';

export function AdminReadings() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const pageSize = 10;

  useEffect(() => {
    fetchReadings();
  }, [page]);

  const fetchReadings = async () => {
    setLoading(true);

    const { data, count } = await supabase
      .from('readings')
      .select('*', { count: 'exact' })
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order('created_at', { ascending: false });

    if (data) {
      setReadings(data);
      setTotalCount(count || 0);
    }

    setLoading(false);
  };

  const filteredReadings = readings.filter((reading) =>
    reading.question.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSpreadLabel = (type: string) => {
    const labels: Record<string, string> = {
      single: 'Single Card',
      three_card: 'Three Card',
      celtic_cross: 'Celtic Cross',
    };
    return labels[type] || type;
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">Readings</h1>
        <p className="text-stone-600 mt-1">View all tarot readings</p>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input
              type="text"
              placeholder="Search by question..."
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
                  Question
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Spread
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Mood
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Date
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
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-stone-200 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filteredReadings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                    No readings found
                  </td>
                </tr>
              ) : (
                filteredReadings.map((reading) => (
                  <tr key={reading.id} className="hover:bg-stone-50">
                    <td className="px-6 py-4">
                      <p className="text-sm text-stone-700 max-w-xs truncate">{reading.question}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                        {getSpreadLabel(reading.spread_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-stone-500">
                        {reading.user_id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {reading.mood ? (
                        <span className="text-sm text-stone-600">{reading.mood}/5</span>
                      ) : (
                        <span className="text-sm text-stone-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-stone-500">
                        <Calendar size={14} />
                        <span className="text-sm">{formatDate(reading.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedReading(reading)}
                        className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium"
                      >
                        <Eye size={16} />
                        View
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

      {selectedReading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-stone-200">
              <h2 className="text-xl font-semibold text-stone-800">Reading Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-stone-500">Question</label>
                <p className="text-stone-700 mt-1">{selectedReading.question}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-stone-500">Spread Type</label>
                  <p className="text-stone-700 mt-1">{getSpreadLabel(selectedReading.spread_type)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-500">Mood</label>
                  <p className="text-stone-700 mt-1">{selectedReading.mood || 'Not recorded'}</p>
                </div>
              </div>
              {selectedReading.notes && (
                <div>
                  <label className="text-sm font-medium text-stone-500">Notes</label>
                  <p className="text-stone-700 mt-1 whitespace-pre-wrap">{selectedReading.notes}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-stone-500">Interpretation</label>
                <pre className="mt-1 p-3 bg-stone-50 rounded-lg text-sm text-stone-600 overflow-auto max-h-48">
                  {JSON.stringify(selectedReading.interpretation, null, 2)}
                </pre>
              </div>
            </div>
            <div className="p-6 border-t border-stone-200">
              <button
                onClick={() => setSelectedReading(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
