import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser, storeTokens } from './utils/auth';
import AudioPlayer from './components/AudioPlayer';
import QuizModal from './components/QuizModal';
import Dashboard from './components/Dashboard';
import { ROUTES } from './config/constants';

/**
 * App Component
 * 
 * Main application router and authentication flow
 * - Protected routes (requires login)
 * - Public routes
 * - Layout wrapper
 */

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setIsAuth(!!user);
    setIsLoading(false);
  }, []);

  // Mock quiz data for development
  const mockQuiz = {
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 'C',
    explanation: 'Paris is the capital and largest city of France, known for its culture, art, and iconic landmarks like the Eiffel Tower.',
  };

  const handleQuizSubmit = (result) => {
    console.log('Quiz submitted:', result);
    // In production, this would send to API
  };

  const handleSkipQuiz = () => {
    setShowQuiz(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  // Learn Page Component
  const LearnPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Learn with Audio</h1>
          <p className="text-gray-600">Upload text or paste content to get started with audio playback and interactive quizzes</p>
        </div>

        {/* Text Upload Section */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upload or Paste Text</h2>
          <textarea
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Paste your text here or upload a file..."
            defaultValue="The solar system consists of the Sun and all the objects that orbit it. The eight planets are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Each planet has unique characteristics and distances from the Sun."
          />
          <div className="mt-4 flex gap-4">
            <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors">
              Start Learning
            </button>
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Upload File
            </button>
          </div>
        </div>

        {/* Audio Player Section */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🎵 Audio Player</h2>
          <AudioPlayer
            text="The solar system consists of the Sun and all the objects that orbit it. The eight planets are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Each planet has unique characteristics and distances from the Sun."
            onQuizTrigger={() => {
              setCurrentQuiz(mockQuiz);
              setShowQuiz(true);
            }}
          />
        </div>
      </div>

      {/* Quiz Modal */}
      <QuizModal
        quiz={currentQuiz}
        isOpen={showQuiz}
        onSubmit={handleQuizSubmit}
        onSkip={handleSkipQuiz}
      />
    </div>
  );

  // Dashboard Page Component
  const DashboardPage = () => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Dashboard
          userId={currentUser?.id}
          isLoading={false}
          stats={{
            totalQuizzes: 24,
            averageScore: 87.5,
            dailyStreak: 12,
            subscriptionTier: 'Premium',
            trendData: [
              { session: '1', accuracy: 72 },
              { session: '2', accuracy: 75 },
              { session: '3', accuracy: 78 },
              { session: '4', accuracy: 85 },
              { session: '5', accuracy: 88 },
              { session: '6', accuracy: 86 },
              { session: '7', accuracy: 92 },
            ],
            insights: [
              {
                title: '🎯 Focus on Definitions',
                description: 'You\'re stronger with comprehension questions. Try definition-based quizzes.',
              },
              {
                title: '⏱️ Slow Down',
                description: 'Consider using slower speech speed for complex topics.',
              },
              {
                title: '📈 Keep the Streak',
                description: 'You\'re on day 12! Complete 3 more sessions to unlock achievement.',
              },
            ],
          }}
        />
      </div>
    </div>
  );

  // Login Page Component with navigation
  const LoginPageWrapper = () => {
    const navigate = useNavigate();
    
    const handleDemoLogin = () => {
      // Store demo token
      const demoToken = 'demo-token-' + Date.now();
      storeTokens(demoToken, 'demo-refresh-token');
      
      // Update auth state
      setIsAuth(true);
      setCurrentUser({
        id: 'demo-user',
        email: 'demo@example.com',
        name: 'Demo User',
        tier: 'free',
      });
      
      // Navigate to learn page
      navigate(ROUTES.LEARN);
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Login to Speechify</h1>
          <p className="text-gray-600 mb-6">Demo mode: Click below to continue</p>
          <button
            onClick={handleDemoLogin}
            className="w-full px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Continue as Demo User
          </button>
        </div>
      </div>
    );
  };

  // Navigation Header Component
  const Header = () => (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-blue-600">🎓 Speechify</div>
        <div className="flex items-center gap-6">
          <a href={ROUTES.LEARN} className="text-gray-700 hover:text-blue-600">Learn</a>
          <a href={ROUTES.DASHBOARD} className="text-gray-700 hover:text-blue-600">Dashboard</a>
          <button
            onClick={() => {
              // Mock logout
              window.location.href = '/';
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAuth && <Header />}
        
        <Routes>
          <Route path={ROUTES.HOME} element={<Navigate to={isAuth ? ROUTES.LEARN : ROUTES.LOGIN} />} />
          <Route path={ROUTES.LOGIN} element={isAuth ? <Navigate to={ROUTES.LEARN} /> : <LoginPageWrapper />} />
          <Route path={ROUTES.LEARN} element={isAuth ? <LearnPage /> : <Navigate to={ROUTES.LOGIN} />} />
          <Route path={ROUTES.DASHBOARD} element={isAuth ? <DashboardPage /> : <Navigate to={ROUTES.LOGIN} />} />
          <Route path="*" element={<Navigate to={ROUTES.HOME} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
