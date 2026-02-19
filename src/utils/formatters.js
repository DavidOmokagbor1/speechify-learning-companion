/**
 * Data Formatting Utilities
 * 
 * Format data for display:
 * - Time (seconds to mm:ss)
 * - Date (ISO to readable)
 * - Percentage (number to %)
 * - Grades (score to letter grade)
 * - Reading time estimates
 * - File sizes
 * - Text truncation
 * - Accuracy calculation
 */

/**
 * Format seconds to mm:ss or hh:mm:ss
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
  if (!seconds || seconds < 0) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format date to readable format
 * @param {Date|string} date - Date object or ISO string
 * @param {string} format - 'short', 'long', or 'relative'
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (format === 'relative') {
    const now = new Date();
    const diffMs = now - dateObj;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return formatDate(dateObj, 'short');
  }

  return dateObj.toISOString();
};

/**
 * Format number to percentage string
 * @param {number} value - Number (0-100 or 0-1)
 * @param {number} decimals - Decimal places to show
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number') return '0%';

  // If value is between 0-1, convert to 0-100
  const percent = value <= 1 ? value * 100 : value;

  return `${percent.toFixed(decimals)}%`;
};

/**
 * Convert score to letter grade
 * @param {number} score - Score 0-100
 * @returns {string} Letter grade
 */
export const getLetterGrade = (score) => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

/**
 * Estimate reading time based on word count
 * @param {number} wordCount - Number of words
 * @param {number} wordsPerMinute - Reading speed (default 200)
 * @returns {string} Estimated time (e.g., "5 min read")
 */
export const getReadingTime = (wordCount, wordsPerMinute = 200) => {
  if (!wordCount) return '< 1 min read';

  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes === 1 ? '1 min read' : `${minutes} min read`;
};

/**
 * Format bytes to human-readable file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {boolean} breakOnWord - Break on word boundary
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100, breakOnWord = true) => {
  if (!text || text.length <= maxLength) return text;

  let truncated = text.substring(0, maxLength);

  if (breakOnWord) {
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
      truncated = truncated.substring(0, lastSpace);
    }
  }

  return truncated + '...';
};

/**
 * Calculate accuracy from quiz results
 * @param {array} quizzes - Array of quiz objects with { userAnswer, correctAnswer }
 * @returns {number} Accuracy percentage (0-100)
 */
export const calculateAccuracy = (quizzes) => {
  if (!Array.isArray(quizzes) || quizzes.length === 0) return 0;

  const correct = quizzes.filter((q) => q.userAnswer === q.correctAnswer).length;

  return Math.round((correct / quizzes.length) * 100);
};

/**
 * Format score with appropriate styling indicators
 * @param {number} score - Score 0-100
 * @returns {object} { value: string, color: string, feedback: string }
 */
export const formatScoreFeedback = (score) => {
  if (score >= 90) {
    return {
      value: formatPercentage(score),
      color: 'text-green-600',
      feedback: '🌟 Excellent work!',
    };
  }
  if (score >= 75) {
    return {
      value: formatPercentage(score),
      color: 'text-blue-600',
      feedback: '👍 Good job!',
    };
  }
  if (score >= 60) {
    return {
      value: formatPercentage(score),
      color: 'text-yellow-600',
      feedback: '💪 Keep practicing',
    };
  }
  return {
    value: formatPercentage(score),
    color: 'text-red-600',
    feedback: '🎯 Try again',
  };
};

/**
 * Format duration string from start and end times
 * @param {Date|string} startTime - Start time
 * @param {Date|string} endTime - End time
 * @returns {string} Duration string
 */
export const formatDuration = (startTime, endTime) => {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;

  const diffMs = end - start;
  return formatTime(Math.floor(diffMs / 1000));
};

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString('en-US');
};
