import { useEffect, useState, useRef } from 'react';
import { Upload, Trash2, FileText, Loader2, Plus, Database } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';

interface KnowledgeSource {
  id: string;
  name: string;
  source_type: string;
  description: string;
  created_at: string;
  chunk_count?: number;
}

export function AdminKnowledge() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    description: '',
    content: '',
    sourceType: 'manual',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    setLoading(true);

    const { data: sourcesData } = await supabase
      .from('knowledge_sources')
      .select('*')
      .order('created_at', { ascending: false });

    if (sourcesData) {
      const sourcesWithCounts = await Promise.all(
        sourcesData.map(async (source) => {
          const { count } = await supabase
            .from('knowledge_chunks')
            .select('id', { count: 'exact', head: true })
            .eq('source_id', source.id);

          return { ...source, chunk_count: count || 0 };
        })
      );

      setSources(sourcesWithCounts);
    }

    setLoading(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setNewSource((prev) => ({
      ...prev,
      name: file.name.replace(/\.[^/.]+$/, ''),
      content: text,
    }));
  };

  const handleUpload = async () => {
    if (!newSource.name || !newSource.content) return;

    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ingest-knowledge`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            name: newSource.name,
            description: newSource.description,
            content: newSource.content,
            sourceType: newSource.sourceType,
          }),
        }
      );

      if (response.ok) {
        setShowUploadModal(false);
        setNewSource({ name: '', description: '', content: '', sourceType: 'manual' });
        fetchSources();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to upload');
      }
    } catch (err) {
      alert('Failed to upload knowledge');
    }

    setUploading(false);
  };

  const handleDelete = async (sourceId: string) => {
    if (!confirm('Are you sure you want to delete this knowledge source?')) return;

    await supabase.from('knowledge_chunks').delete().eq('source_id', sourceId);
    await supabase.from('knowledge_sources').delete().eq('id', sourceId);

    fetchSources();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Knowledge Base</h1>
          <p className="text-stone-600 mt-1">Manage RAG knowledge sources</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add Source
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-stone-200 animate-pulse">
              <div className="h-5 bg-stone-200 rounded w-48 mb-2" />
              <div className="h-4 bg-stone-200 rounded w-32" />
            </div>
          ))}
        </div>
      ) : sources.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="text-stone-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-stone-800 mb-2">No Knowledge Sources</h3>
          <p className="text-stone-600 mb-6">
            Upload documents to build your knowledge base for AI-powered interpretations.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
          >
            <Upload size={20} />
            Upload First Document
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {sources.map((source) => (
            <div
              key={source.id}
              className="bg-white rounded-xl border border-stone-200 p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <FileText className="text-amber-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800">{source.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-stone-500">
                    <span className="capitalize">{source.source_type}</span>
                    <span>|</span>
                    <span>{source.chunk_count} chunks</span>
                    <span>|</span>
                    <span>{formatDate(source.created_at)}</span>
                  </div>
                  {source.description && (
                    <p className="text-sm text-stone-600 mt-2">{source.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(source.id)}
                className="p-2 text-stone-400 hover:text-rose-600 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-stone-200">
              <h2 className="text-xl font-semibold text-stone-800">Add Knowledge Source</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  placeholder="e.g., Tarot Manual"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Type</label>
                <select
                  value={newSource.sourceType}
                  onChange={(e) => setNewSource({ ...newSource, sourceType: e.target.value })}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                >
                  <option value="manual">Manual</option>
                  <option value="article">Article</option>
                  <option value="guide">Guide</option>
                  <option value="interpretation">Interpretation Guide</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newSource.description}
                  onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  placeholder="Brief description of the content"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Content</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".txt,.md"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-3 border-2 border-dashed border-stone-300 rounded-lg hover:border-amber-400 transition-colors text-stone-600"
                  >
                    <Upload size={20} className="mx-auto mb-1" />
                    Upload .txt or .md file
                  </button>
                  <textarea
                    value={newSource.content}
                    onChange={(e) => setNewSource({ ...newSource, content: e.target.value })}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none h-32 resize-none"
                    placeholder="Or paste content directly..."
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-stone-200 flex justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-stone-600 hover:text-stone-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !newSource.name || !newSource.content}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading && <Loader2 size={20} className="animate-spin" />}
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
