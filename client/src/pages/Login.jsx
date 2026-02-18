import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      let msg = err.response?.data?.error || 'Login failed';
      if (!err.response && err.message?.includes('Network')) {
        msg = 'Cannot reach server. Make sure the backend is running (e.g. npm run dev in server folder).';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="text-2xl font-bold text-white">Speechify</span>
          <span className="text-xs text-blue-400 font-medium px-2 py-0.5 rounded bg-blue-500/20">Learning</span>
        </Link>
        <h1 className="text-2xl font-semibold text-white mb-2 text-center">Sign in</h1>
        <p className="text-slate-500 text-sm mb-6 text-center">Continue to your library</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
              {error === 'Invalid email or password' && (
                <p className="mt-2 text-slate-400">If you just created an account, use the exact same email and password. No account yet? <Link to="/register" className="text-blue-400 hover:underline">Create one</Link>.</p>
              )}
            </div>
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-slate-500 text-sm text-center">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300">Create one</Link>
        </p>
      </div>
    </div>
  );
}
