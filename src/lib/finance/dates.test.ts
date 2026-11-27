import { describe, expect, it } from 'vitest';
import { advanceRecurrenceDate, dateOnlyString, parseDateOnly } from './dates';

describe('date-only helpers', () => {
  it('parses valid calendar dates without a timezone shift', () => {
    expect(dateOnlyString(parseDateOnly('2026-03-08')!)).toBe('2026-03-08');
  });

  it('rejects invalid and non-date-only values', () => {
    expect(parseDateOnly('2026-02-29')).toBeNull();
    expect(parseDateOnly('2026-03-08T00:00:00Z')).toBeNull();
  });
});

describe('advanceRecurrenceDate', () => {
  it('advances weekly intervals across a year boundary', () => {
    const date = parseDateOnly('2026-12-28')!;
    expect(dateOnlyString(advanceRecurrenceDate(date, date, 1, 'WEEK'))).toBe(
      '2027-01-04',
    );
  });

  it('clamps short months and preserves the original monthly anchor', () => {
    const anchor = parseDateOnly('2026-01-31')!;
    const february = advanceRecurrenceDate(anchor, anchor, 1, 'MONTH');
    const march = advanceRecurrenceDate(february, anchor, 1, 'MONTH');

    expect(dateOnlyString(february)).toBe('2026-02-28');
    expect(dateOnlyString(march)).toBe('2026-03-31');
  });

  it('handles leap-day yearly schedules', () => {
    const anchor = parseDateOnly('2024-02-29')!;
    const next = advanceRecurrenceDate(anchor, anchor, 1, 'YEAR');
    const following = advanceRecurrenceDate(next, anchor, 1, 'YEAR');

    expect(dateOnlyString(next)).toBe('2025-02-28');
    expect(dateOnlyString(following)).toBe('2026-02-28');
  });

  it('rejects an invalid interval', () => {
    const date = parseDateOnly('2026-01-01')!;
    expect(() => advanceRecurrenceDate(date, date, 0, 'DAY')).toThrow(
      RangeError,
    );
  });
});
