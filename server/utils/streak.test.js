const { calculateStreakFromDates } = require('./streak');

describe('calculateStreakFromDates', () => {
  const today = '2025-02-17';

  it('returns 0 when no dates', () => {
    expect(calculateStreakFromDates([], today)).toBe(0);
  });

  it('returns 0 when most recent date is not today', () => {
    expect(calculateStreakFromDates(['2025-02-16'], today)).toBe(0);
    expect(calculateStreakFromDates(['2025-02-15', '2025-02-14'], today)).toBe(0);
  });

  it('returns 1 when only today', () => {
    expect(calculateStreakFromDates(['2025-02-17'], today)).toBe(1);
  });

  it('returns streak for consecutive days', () => {
    expect(calculateStreakFromDates(['2025-02-17', '2025-02-16'], today)).toBe(2);
    expect(calculateStreakFromDates(['2025-02-17', '2025-02-16', '2025-02-15'], today)).toBe(3);
  });

  it('stops at gap in dates', () => {
    expect(calculateStreakFromDates(['2025-02-17', '2025-02-15'], today)).toBe(1);
    expect(calculateStreakFromDates(['2025-02-17', '2025-02-16', '2025-02-14'], today)).toBe(2);
  });
});
