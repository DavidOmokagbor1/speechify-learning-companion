import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import AppShell from './components/AppShell';
import Home from './pages/Home';
import Imported from './pages/Imported';
import Login from './pages/Login';
import Register from './pages/Register';
import Listen from './pages/Listen';
import Dashboard from './pages/Dashboard';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<AppShell><Home /></AppShell>} />
      <Route path="/imported" element={<AppShell><ProtectedRoute><Imported /></ProtectedRoute></AppShell>} />
      <Route path="/listen" element={<AppShell><ProtectedRoute><Listen /></ProtectedRoute></AppShell>} />
      <Route path="/dashboard" element={<AppShell><ProtectedRoute><Dashboard /></ProtectedRoute></AppShell>} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
