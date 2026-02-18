/**
 * Calculate daily streak from sorted date strings (most recent first).
 * Returns consecutive days with activity from today backward.
 * @param {string[]} dateStrings - YYYY-MM-DD strings, sorted desc (most recent first)
 * @param {string} todayStr - Today's date as YYYY-MM-DD
 * @returns {number} - Streak count (0 if no activity today)
 */
function calculateStreakFromDates(dateStrings, todayStr) {
  if (dateStrings.length === 0) return 0;
  if (dateStrings[0] !== todayStr) return 0;

  let streak = 0;
  let expectedDate = new Date(todayStr);

  for (const dateStr of dateStrings) {
    const expectedStr = expectedDate.toISOString().slice(0, 10);
    if (dateStr === expectedStr) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

module.exports = { calculateStreakFromDates };
