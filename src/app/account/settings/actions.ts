'use server';

import { getCurrentUserId } from '@/lib/currentUser';
import { prisma } from '@/lib/db';
import type { FinanceActionState } from '@/lib/finance/actionTypes';
import {
  currencyFractionDigits,
  getExchangeRate,
  isCurrencyCode,
} from '@/lib/finance/currency';
import { ensureFinanceSetup } from '@/lib/finance/setup';
import { logServerError } from '@/lib/serverLogger';
import { revalidatePath } from 'next/cache';

export async function changeBudgetCurrency(
  _previousState: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, message: 'Please sign in to continue.' };

  const currency = String(formData.get('currency') ?? '')
    .trim()
    .toUpperCase();
  if (!isCurrencyCode(currency)) {
    return { ok: false, message: 'Choose a supported ISO 4217 currency.' };
  }

  await ensureFinanceSetup(userId);
  const settings = await prisma.accountSettings.findUnique({
    where: { userId },
    select: { currency: true },
  });
  if (!settings) {
    return { ok: false, message: 'Account settings could not be loaded.' };
  }
  if (settings.currency === currency) {
    return { ok: true, message: 'This is already your budget currency.' };
  }

  const [transactionCount, recurringPaymentCount] = await Promise.all([
    prisma.transaction.count({ where: { userId } }),
    prisma.recurringPayment.count({ where: { userId } }),
  ]);
  const hasFinancialData = transactionCount > 0 || recurringPaymentCount > 0;

  try {
    const exchangeRate = hasFinancialData
      ? await getExchangeRate(settings.currency, currency)
      : null;

    await prisma.$transaction(async (transaction) => {
      const settingsUpdate = await transaction.accountSettings.updateMany({
        where: { userId, currency: settings.currency },
        data: { currency },
      });
      if (settingsUpdate.count !== 1) {
        throw new Error('Budget currency changed in another request.');
      }

      if (!exchangeRate) return;

      const fractionDigits = currencyFractionDigits(currency);
      await transaction.$executeRaw`
        UPDATE "Transaction"
        SET "amount" = ROUND("amount" * CAST(${exchangeRate.rate} AS DECIMAL), ${fractionDigits})
        WHERE "userId" = ${userId}
      `;
      await transaction.$executeRaw`
        UPDATE "RecurringPayment"
        SET "amount" = ROUND("amount" * CAST(${exchangeRate.rate} AS DECIMAL), ${fractionDigits})
        WHERE "userId" = ${userId}
      `;
      await transaction.currencyConversion.create({
        data: {
          userId,
          fromCurrency: settings.currency,
          toCurrency: currency,
          rate: exchangeRate.rate,
          source: 'ExchangeRate-API',
          rateDate: exchangeRate.rateDate,
        },
      });
    });
  } catch (error) {
    logServerError('finance.currency.change', error);
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Currency could not be changed. Please try again later.',
    };
  }

  revalidatePath('/account/settings');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/transactions');
  revalidatePath('/dashboard/recurring');
  return {
    ok: true,
    message: hasFinancialData
      ? `Budget amounts were converted from ${settings.currency} to ${currency}.`
      : `Budget currency changed to ${currency}.`,
  };
}
