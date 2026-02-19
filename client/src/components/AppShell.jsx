import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Library', icon: '📚' },
    { to: '/imported', label: 'Imported', icon: '☁️' },
    { to: '/listen', label: 'Listen', icon: '🎧' },
    { to: '/dashboard', label: 'Stats', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex">
      {/* Sidebar - Speechify style */}
      <aside className="w-64 border-r border-white/10 flex flex-col bg-[#141414]">
        <div className="p-4 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">Speechify</span>
            <span className="text-xs text-blue-400 font-medium px-2 py-0.5 rounded bg-blue-500/20">Learning</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <Link
            to="/listen"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full ${
              location.pathname === '/listen'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            <span>+</span>
            New
          </Link>
          {navItems.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === to
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white text-sm"
          >
            {theme === 'dark' ? '☀️' : '🌙'} {theme === 'dark' ? 'Light' : 'Dark'} mode
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#0f0f0f]">
          <div className="text-slate-400 text-sm">Learning Companion — AI quizzes during playback</div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-sm">{user.email}</span>
              <Link
                to="/listen"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
              >
                + New
              </Link>
              <button
                onClick={logout}
                className="text-slate-400 hover:text-white text-sm"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-sm">
                Sign in
              </Link>
              <Link to="/register" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium">
                Get started
              </Link>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
