import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { escapeCsv } from '../utils/csv';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/analytics/dashboard`),
      axios.get(`${API_URL}/api/analytics/score-trends`),
    ])
      .then(([dashRes, trendsRes]) => {
        setData(dashRes.data);
        setTrends((trendsRes.data.score_trends || []).reverse());
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const res = await axios.get(`${API_URL}/api/analytics/quiz-history`);
      const attempts = res.data?.attempts || [];
      const headers = ['Date', 'Session', 'Question', 'Your Answer', 'Correct Answer', 'Result'];
      const rows = attempts.map((a) => [
        new Date(a.created_at).toLocaleString(),
        a.content_title || '-',
        a.question,
        a.user_answer,
        a.correct_answer,
        a.is_correct ? 'Correct' : 'Incorrect',
      ]);
      const csv = [headers.map(escapeCsv).join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quiz-history-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast(err.response?.data?.error || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="p-8 flex items-center justify-center text-slate-400">Loading...</div>;
  if (error) return <div className="p-8 flex items-center justify-center text-red-400">{error}</div>;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-white">Retention Stats</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExportCsv}
              disabled={exporting}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-sm disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </button>
            <Link to="/listen" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium">
              Start Listening
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Quizzes</p>
            <p className="text-3xl font-bold text-white mt-1">{data?.total_quizzes_completed ?? 0}</p>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Avg Score</p>
            <p className="text-3xl font-bold text-white mt-1">{data?.average_comprehension_score ?? 0}%</p>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Daily Streak</p>
            <p className="text-3xl font-bold text-white mt-1">{data?.daily_streak ?? 0} days</p>
          </div>
        </div>
        {trends.length > 0 && (
          <div className="mt-8 p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-sm font-medium text-slate-400 mb-4">Score Trends (Last 7 Sessions)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }} labelStyle={{ color: '#94a3b8' }} />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        <p className="mt-6 text-slate-500 text-sm">
          Complete listening sessions with quizzes to see your retention trends.
        </p>
      </div>
    </div>
  );
}
