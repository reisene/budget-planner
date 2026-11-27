export const TransactionType = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
} as const;

export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

export const RecurrenceUnit = {
  DAY: 'DAY',
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  YEAR: 'YEAR',
} as const;

export type RecurrenceUnit =
  (typeof RecurrenceUnit)[keyof typeof RecurrenceUnit];
