import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FaTrophy, FaFire, FaBookmark, FaCrown, FaArrowUp, FaArrowDown } from 'react-icons/fa';

/**
 * Dashboard Component
 * 
 * User learning analytics dashboard with:
 * - 4 stats cards (total quizzes, avg score %, daily streak, tier)
 * - 7-session accuracy trend chart
 * - Performance insights panel
 * - Premium upgrade prompts
 * 
 * @param {string} userId - Current user ID
 * @param {boolean} isLoading - Loading state
 * @param {object} stats - User statistics object
 */
export default function Dashboard({ userId = '', isLoading = false, stats = null }) {
  const [mockStats] = useState({
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
  });

  const currentStats = stats || mockStats;

  // Format percentage with decimal
  const formatPercentage = (value) => {
    return typeof value === 'number' ? value.toFixed(1) : '0.0';
  };

  // Determine tier color
  const getTierColor = (tier) => {
    const tierColors = {
      'Free': 'bg-gray-100 text-gray-700 border-gray-300',
      'Pro': 'bg-blue-100 text-blue-700 border-blue-300',
      'Premium': 'bg-purple-100 text-purple-700 border-purple-300',
    };
    return tierColors[tier] || tierColors['Free'];
  };

  // Calculate score trend
  const scoreChange = currentStats.trendData.length >= 2
    ? currentStats.trendData[currentStats.trendData.length - 1].accuracy - currentStats.trendData[0].accuracy
    : 0;
  const isImproving = scoreChange >= 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Dashboard</h1>
        <p className="text-gray-600">Track your progress and stay motivated</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Quizzes Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-medium">Total Quizzes</h3>
            <FaBookmark className="text-blue-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{currentStats.totalQuizzes}</p>
          <p className="text-xs text-gray-500 mt-2">Keep practicing</p>
        </div>

        {/* Average Score Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-medium">Average Score</h3>
            <FaTrophy className="text-green-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatPercentage(currentStats.averageScore)}%</p>
          <p className="text-xs text-gray-500 mt-2">Excellent work!</p>
        </div>

        {/* Daily Streak Card */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-medium">Daily Streak</h3>
            <FaFire className="text-orange-500" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{currentStats.dailyStreak}</p>
          <p className="text-xs text-gray-500 mt-2">days in a row</p>
        </div>

        {/* Subscription Tier Card */}
        <div className={`bg-white rounded-lg shadow p-6 border-l-4 border-purple-500 ${getTierColor(currentStats.subscriptionTier)}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Subscription</h3>
            <FaCrown className="text-purple-500" size={20} />
          </div>
          <p className="text-3xl font-bold">{currentStats.subscriptionTier}</p>
          <p className="text-xs text-gray-500 mt-2">Active plan</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">7-Session Accuracy Trend</h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {currentStats.trendData[currentStats.trendData.length - 1]?.accuracy || 0}%
              </span>
              {isImproving ? (
                <div className="flex items-center gap-1 text-green-600">
                  <FaArrowUp size={16} />
                  <span className="text-sm font-medium">+{scoreChange.toFixed(0)}%</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <FaArrowDown size={16} />
                  <span className="text-sm font-medium">{scoreChange.toFixed(0)}%</span>
                </div>
              )}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentStats.trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="session"
                label={{ value: 'Session', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis
                domain={[0, 100]}
                label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={(value) => `${value}%`}
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Accuracy"
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600">
              📊 Your accuracy has improved <span className="font-bold text-green-600">+{scoreChange.toFixed(0)}%</span> over the past 7 sessions. Keep up the excellent work!
            </p>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Performance Insights</h2>

          {/* Insight Cards */}
          {currentStats.insights.map((insight, index) => (
            <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-bold text-gray-900 mb-2">{insight.title}</h3>
              <p className="text-sm text-gray-700">{insight.description}</p>
            </div>
          ))}

          {/* Upgrade Prompt */}
          {currentStats.subscriptionTier === 'Free' && (
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-4 border border-purple-300 mt-6">
              <h3 className="font-bold text-gray-900 mb-2">🚀 Upgrade to Premium</h3>
              <p className="text-sm text-gray-700 mb-3">
                Unlock unlimited quizzes, advanced analytics, and priority support.
              </p>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2 font-medium transition-colors">
                Upgrade Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      {currentStats.subscriptionTier !== 'Premium' && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">Premium features await</h3>
            <p className="text-blue-100">Get detailed insights, custom learning paths, and unlimited content.</p>
          </div>
          <button className="bg-white hover:bg-blue-50 text-blue-600 font-bold px-6 py-2 rounded-lg transition-colors flex-shrink-0">
            Explore Plans
          </button>
        </div>
      )}
    </div>
  );
}
