import { prisma } from '@/lib/db';
import { TransactionType } from '@/lib/finance/types';

const DEFAULT_CATEGORIES = [
  { name: 'Housing', type: TransactionType.EXPENSE, color: '#72ddb0' },
  { name: 'Food', type: TransactionType.EXPENSE, color: '#8bdced' },
  { name: 'Transport', type: TransactionType.EXPENSE, color: '#ffd166' },
  { name: 'Utilities', type: TransactionType.EXPENSE, color: '#b7a5f5' },
  { name: 'Health', type: TransactionType.EXPENSE, color: '#ff9386' },
  { name: 'Entertainment', type: TransactionType.EXPENSE, color: '#f0a8cf' },
  { name: 'Salary', type: TransactionType.INCOME, color: '#72ddb0' },
  { name: 'Other income', type: TransactionType.INCOME, color: '#8bdced' },
];

export async function ensureFinanceSetup(userId: string) {
  await Promise.all([
    prisma.accountSettings.upsert({
      where: { userId },
      create: { userId },
      update: {},
    }),
    prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map((category) => ({ ...category, userId })),
      skipDuplicates: true,
    }),
  ]);
}
