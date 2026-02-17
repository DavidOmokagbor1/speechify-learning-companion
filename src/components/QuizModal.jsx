import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

/**
 * QuizModal Component
 * 
 * Displays comprehension quiz with:
 * - Question and 4 multiple-choice options
 * - Option selection UI
 * - Immediate feedback (correct/incorrect)
 * - Explanation display
 * - Auto-dismiss after 10 seconds or manual continue
 * 
 * @param {object} quiz - Quiz data { question, options, correctAnswer, explanation }
 * @param {function} onSubmit - Callback when user selects answer
 * @param {function} onSkip - Callback when user skips quiz
 * @param {boolean} isOpen - Whether modal is visible
 */
export default function QuizModal({ quiz = null, onSubmit = () => {}, onSkip = () => {}, isOpen = false }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10);

  // Reset state when quiz changes
  useEffect(() => {
    if (quiz) {
      setSelectedAnswer(null);
      setShowFeedback(false);
      setTimeRemaining(10);
    }
  }, [quiz]);

  // Auto-dismiss after showing feedback
  useEffect(() => {
    if (!showFeedback || !isOpen) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleContinue();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showFeedback, isOpen]);

  const handleSelectAnswer = (option) => {
    if (showFeedback) return; // Prevent changing answer after selection

    setSelectedAnswer(option);
    const correct = option === quiz.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Submit to API
    onSubmit({
      question: quiz.question,
      options: quiz.options,
      userAnswer: option,
      correctAnswer: quiz.correctAnswer,
      isCorrect: correct,
    });
  };

  const handleContinue = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeRemaining(10);
  };

  if (!isOpen || !quiz) return null;

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">📚 Quick Check</h2>
            <p className="text-sm text-gray-600">Let's make sure you understood what you just heard</p>
          </div>

          {/* Question */}
          <div className="mb-8">
            <p className="text-lg font-medium text-gray-900">{quiz.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {quiz.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(optionLetters[index])}
                disabled={showFeedback}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === optionLetters[index]
                    ? showFeedback
                      ? isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : 'border-blue-500 bg-blue-50'
                    : quiz.correctAnswer === optionLetters[index] && showFeedback
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                } disabled:cursor-not-allowed`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-gray-700">
                    {optionLetters[index]}.
                  </span>
                  <span className="text-gray-800 flex-1">{option}</span>
                  {showFeedback && selectedAnswer === optionLetters[index] && (
                    isCorrect ? (
                      <FaCheckCircle className="text-green-500" size={20} />
                    ) : (
                      <FaTimesCircle className="text-red-500" size={20} />
                    )
                  )}
                  {showFeedback && quiz.correctAnswer === optionLetters[index] && selectedAnswer !== optionLetters[index] && (
                    <FaCheckCircle className="text-green-500" size={20} />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Feedback Section */}
          {showFeedback && (
            <div className={`mb-8 p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start gap-3 mb-3">
                {isCorrect ? (
                  <FaCheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                ) : (
                  <FaTimesCircle className="text-red-500 flex-shrink-0 mt-1" size={20} />
                )}
                <div>
                  <p className={`font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {isCorrect ? '✓ Correct!' : '✗ Not quite right'}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">{quiz.explanation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            {!showFeedback && (
              <button
                onClick={onSkip}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Skip Question
              </button>
            )}

            {showFeedback && (
              <>
                <div className="text-sm text-gray-600">
                  Continuing in <span className="font-bold text-blue-600">{timeRemaining}s</span>
                </div>
                <button
                  onClick={handleContinue}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                >
                  Continue Listening
                </button>
              </>
            )}

            {!showFeedback && (
              <div className="text-sm text-gray-500">
                Select an answer above
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
