import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || '';

function getGroupKey(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sessionDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.floor((today - sessionDate) / 86400000);

  if (diffDays === 0) return { key: 'today', label: 'Today', sort: 0 };
  if (diffDays === 1) return { key: 'yesterday', label: 'Yesterday', sort: 1 };
  if (diffDays < 7) return { key: 'this-week', label: 'This Week', sort: 2 };
  if (diffDays < 30) return { key: 'this-month', label: 'This Month', sort: 3 };
  return { key: d.toISOString().slice(0, 7), label: d.toLocaleDateString([], { month: 'long', year: 'numeric' }), sort: 4 };
}

function formatSessionTime(dateStr, groupKey) {
  const d = new Date(dateStr);
  if (groupKey === 'today') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (groupKey === 'yesterday' || groupKey === 'this-week') return d.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getDisplayTitle(session) {
  const title = session.content_title?.trim();
  if (title && title !== 'Listening Session') return title;
  const preview = session.content_preview?.trim();
  if (preview) return preview.length > 80 ? preview.slice(0, 77) + '...' : preview;
  return 'Listening Session';
}

function groupSessionsByDate(sessions) {
  const groups = {};
  sessions.forEach((s) => {
    const { key, label, sort } = getGroupKey(s.created_at);
    if (!groups[key]) groups[key] = { label, sort, key, sessions: [] };
    groups[key].sessions.push(s);
  });
  return Object.entries(groups)
    .sort((a, b) => {
      const [, gA] = a;
      const [, gB] = b;
      if (gA.sort !== gB.sort) return gA.sort - gB.sort;
      return gB.key.localeCompare(gA.key);
    })
    .map(([key, g]) => ({
      key,
      ...g,
      sessions: g.sessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    }));
}

export default function Imported() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSessionId, setLoadingSessionId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) return;
    axios.get(`${API_URL}/api/sessions?limit=50`)
      .then((res) => setSessions(res.data.sessions || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [user]);

  const filteredSessions = useMemo(() => {
    if (!search.trim()) return sessions;
    const q = search.toLowerCase().trim();
    return sessions.filter((s) => {
      const title = getDisplayTitle(s).toLowerCase();
      return title.includes(q);
    });
  }, [sessions, search]);

  const groupedSessions = useMemo(() => groupSessionsByDate(filteredSessions), [filteredSessions]);

  const handleSessionClick = async (sessionId) => {
    setLoadingSessionId(sessionId);
    try {
      const res = await axios.get(`${API_URL}/api/sessions/${sessionId}`);
      navigate('/listen', { state: { initialText: res.data.content_text || '', initialTitle: res.data.content_title || '', sessionId: sessionId } });
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to load session');
    } finally {
      setLoadingSessionId(null);
    }
  };

  const handleDelete = async (e, sessionId) => {
    e.stopPropagation();
    if (!confirm('Delete this session? This cannot be undone.')) return;
    setDeletingId(sessionId);
    try {
      await axios.delete(`${API_URL}/api/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      showToast('Session deleted');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) return null;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Imported</h2>
          <p className="text-slate-500 text-sm mt-1">Your listening history</p>
        </div>
        <Link
          to="/"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
        >
          + Add New
        </Link>
      </div>

      {sessions.length > 0 && (
        <div className="mb-6">
          <input
            type="search"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {loading ? (
        <div className="text-slate-500 text-sm">Loading...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-16 rounded-xl bg-white/5 border border-white/10">
          <p className="text-slate-400 mb-4">No imported content yet</p>
          <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
            Add your first file or link →
          </Link>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-white/5 border border-white/10">
          <p className="text-slate-400">No sessions match "{search}"</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedSessions.map(({ key, label, sessions: groupSessions }) => (
            <section key={key}>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">{label}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupSessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSessionClick(s.id)}
                    className="relative flex flex-col p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all cursor-pointer group min-h-[100px]"
                  >
                    <div className="flex items-start gap-3 pr-10">
                      <span className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/30 shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </span>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-white font-medium text-sm line-clamp-2" title={getDisplayTitle(s)}>
                          {getDisplayTitle(s)}
                        </p>
                        <p className="text-slate-500 text-xs mt-1.5">{formatSessionTime(s.created_at, key)}</p>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                      {loadingSessionId === s.id ? (
                        <span className="text-slate-500 text-xs">Loading...</span>
                      ) : (
                        <span className="text-blue-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Listen</span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, s.id)}
                        disabled={deletingId === s.id}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                        title="Remove"
                        aria-label="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
