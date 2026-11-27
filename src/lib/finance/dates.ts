export type RecurrenceUnit = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

export function toDateOnly(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return date;
}

export function dateOnlyString(date: Date): string {
  return toDateOnly(date).toISOString().slice(0, 10);
}

export function advanceRecurrenceDate(
  date: Date,
  anchorDate: Date,
  intervalCount: number,
  intervalUnit: RecurrenceUnit,
): Date {
  if (!Number.isInteger(intervalCount) || intervalCount < 1) {
    throw new RangeError('The recurrence interval must be a positive integer.');
  }

  const current = toDateOnly(date);
  const anchor = toDateOnly(anchorDate);

  if (intervalUnit === 'DAY' || intervalUnit === 'WEEK') {
    const days = intervalCount * (intervalUnit === 'WEEK' ? 7 : 1);
    current.setUTCDate(current.getUTCDate() + days);
    return current;
  }

  if (intervalUnit === 'MONTH') {
    const targetMonth = current.getUTCMonth() + intervalCount;
    const targetYear = current.getUTCFullYear() + Math.floor(targetMonth / 12);
    const normalizedMonth = targetMonth % 12;
    const day = Math.min(
      anchor.getUTCDate(),
      new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate(),
    );
    return new Date(Date.UTC(targetYear, normalizedMonth, day));
  }

  const targetYear = current.getUTCFullYear() + intervalCount;
  const day = Math.min(
    anchor.getUTCDate(),
    new Date(Date.UTC(targetYear, anchor.getUTCMonth() + 1, 0)).getUTCDate(),
  );
  return new Date(Date.UTC(targetYear, anchor.getUTCMonth(), day));
}
