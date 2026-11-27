import 'server-only';

import { prisma } from '@/lib/db';
import { advanceRecurrenceDate, toDateOnly } from '@/lib/finance/dates';
import { logServerError } from '@/lib/serverLogger';

const MAX_CATCH_UP_OCCURRENCES = 500;

export async function processDueRecurringPayments(userId?: string) {
  const today = toDateOnly(new Date());
  const rules = await prisma.recurringPayment.findMany({
    where: {
      isActive: true,
      nextOccurrence: { lte: today },
      ...(userId ? { userId } : {}),
    },
    orderBy: { nextOccurrence: 'asc' },
    take: 1000,
  });

  let createdCount = 0;
  let failedCount = 0;

  for (const rule of rules) {
    const occurrences: Date[] = [];
    let nextOccurrence = toDateOnly(rule.nextOccurrence);
    const endDate = rule.endDate ? toDateOnly(rule.endDate) : null;

    while (
      nextOccurrence <= today &&
      (!endDate || nextOccurrence <= endDate) &&
      occurrences.length < MAX_CATCH_UP_OCCURRENCES
    ) {
      occurrences.push(nextOccurrence);
      nextOccurrence = advanceRecurrenceDate(
        nextOccurrence,
        rule.startDate,
        rule.intervalCount,
        rule.intervalUnit,
      );
    }

    const hasEnded = Boolean(endDate && nextOccurrence > endDate);

    try {
      await prisma.$transaction(async (transaction) => {
        if (occurrences.length) {
          await transaction.transaction.createMany({
            data: occurrences.map((occurrence) => ({
              userId: rule.userId,
              categoryId: rule.categoryId,
              recurringPaymentId: rule.id,
              recurrenceOccurrence: occurrence,
              description: rule.description,
              amount: rule.amount,
              type: rule.type,
              occurredAt: occurrence,
            })),
            skipDuplicates: true,
          });
        }

        const update = await transaction.recurringPayment.updateMany({
          where: {
            id: rule.id,
            userId: rule.userId,
            isActive: true,
            nextOccurrence: rule.nextOccurrence,
          },
          data: {
            nextOccurrence,
            ...(hasEnded ? { isActive: false } : {}),
          },
        });

        if (update.count !== 1) {
          throw new Error('Recurring payment changed while being processed.');
        }
      });
      createdCount += occurrences.length;
    } catch (error) {
      failedCount += 1;
      logServerError('finance.recurring.process', error);
    }
  }

  return { createdCount, failedCount };
}
