'use server';

import { getCurrentUserId } from '@/lib/currentUser';
import { prisma } from '@/lib/db';
import type { FinanceActionState } from '@/lib/finance/actionTypes';
import { parseDateOnly } from '@/lib/finance/dates';
import { processDueRecurringPayments } from '@/lib/finance/recurringProcessor';
import { ensureFinanceSetup } from '@/lib/finance/setup';
import { RecurrenceUnit, TransactionType } from '@/lib/finance/types';
import { revalidatePath } from 'next/cache';

const AMOUNT_PATTERN = /^(?:0|[1-9]\d{0,14})(?:\.\d{1,4})?$/;
const MAX_INTERVAL = 365;

function value(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

function validAmount(amount: string): boolean {
  return AMOUNT_PATTERN.test(amount) && Number(amount) > 0;
}

function parseType(type: string): TransactionType | null {
  return type === TransactionType.EXPENSE || type === TransactionType.INCOME
    ? type
    : null;
}

async function validateCategory(
  userId: string,
  categoryId: string,
  type: TransactionType,
): Promise<boolean> {
  if (!categoryId) return true;
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId, type, isArchived: false },
    select: { id: true },
  });
  return Boolean(category);
}

function refreshFinancePages() {
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/transactions');
  revalidatePath('/dashboard/recurring');
  revalidatePath('/dashboard/categories');
}

export async function createTransaction(
  _previousState: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, message: 'Please sign in to continue.' };

  const description = value(formData, 'description');
  const amount = value(formData, 'amount');
  const type = parseType(value(formData, 'type'));
  const occurredAt = parseDateOnly(value(formData, 'occurredAt'));
  const categoryId = value(formData, 'categoryId') || null;

  if (!description || description.length > 120) {
    return {
      ok: false,
      message: 'Description is required and must be 120 characters or fewer.',
    };
  }
  if (!validAmount(amount)) {
    return { ok: false, message: 'Enter an amount greater than zero.' };
  }
  if (!type || !occurredAt) {
    return { ok: false, message: 'Choose a transaction type and valid date.' };
  }

  await ensureFinanceSetup(userId);
  if (categoryId && !(await validateCategory(userId, categoryId, type))) {
    return { ok: false, message: 'Choose an active category for this type.' };
  }

  await prisma.transaction.create({
    data: {
      userId,
      description,
      amount,
      type,
      occurredAt,
      categoryId,
    },
  });

  refreshFinancePages();
  return { ok: true, message: 'Transaction added.' };
}

export async function createRecurringPayment(
  _previousState: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, message: 'Please sign in to continue.' };

  const description = value(formData, 'description');
  const amount = value(formData, 'amount');
  const type = parseType(value(formData, 'type'));
  const intervalCount = Number(value(formData, 'intervalCount'));
  const intervalUnit = value(formData, 'intervalUnit');
  const startDate = parseDateOnly(value(formData, 'startDate'));
  const endDateValue = value(formData, 'endDate');
  const endDate = endDateValue ? parseDateOnly(endDateValue) : null;
  const categoryId = value(formData, 'categoryId') || null;

  if (!description || description.length > 120) {
    return {
      ok: false,
      message: 'Description is required and must be 120 characters or fewer.',
    };
  }
  if (!validAmount(amount)) {
    return { ok: false, message: 'Enter an amount greater than zero.' };
  }
  if (!type || !startDate) {
    return { ok: false, message: 'Choose a type and valid start date.' };
  }
  if (
    !Object.values(RecurrenceUnit).includes(intervalUnit as RecurrenceUnit) ||
    !Number.isInteger(intervalCount) ||
    intervalCount < 1 ||
    intervalCount > MAX_INTERVAL
  ) {
    return { ok: false, message: 'Choose a valid recurring interval.' };
  }
  if (endDateValue && (!endDate || endDate < startDate)) {
    return {
      ok: false,
      message: 'The end date must be on or after the start date.',
    };
  }

  await ensureFinanceSetup(userId);
  if (categoryId && !(await validateCategory(userId, categoryId, type))) {
    return { ok: false, message: 'Choose an active category for this type.' };
  }

  await prisma.recurringPayment.create({
    data: {
      userId,
      description,
      amount,
      type,
      categoryId,
      intervalCount,
      intervalUnit: intervalUnit as RecurrenceUnit,
      startDate,
      nextOccurrence: startDate,
      endDate,
    },
  });

  await processDueRecurringPayments(userId);
  refreshFinancePages();
  return { ok: true, message: 'Recurring payment saved.' };
}

export async function deactivateRecurringPayment(
  formData: FormData,
): Promise<void> {
  const userId = await getCurrentUserId();
  const id = value(formData, 'id');
  if (!userId || !id) return;

  await prisma.recurringPayment.updateMany({
    where: { id, userId, isActive: true },
    data: { isActive: false },
  });
  refreshFinancePages();
}

export async function deleteTransaction(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  const id = value(formData, 'id');
  if (!userId || !id) return;

  await prisma.transaction.deleteMany({ where: { id, userId } });
  refreshFinancePages();
}

export async function createCategory(
  _previousState: FinanceActionState,
  formData: FormData,
): Promise<FinanceActionState> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, message: 'Please sign in to continue.' };

  const name = value(formData, 'name');
  const type = parseType(value(formData, 'type'));
  const color = value(formData, 'color');

  if (!name || name.length > 60) {
    return {
      ok: false,
      message: 'Enter a category name (up to 60 characters).',
    };
  }
  if (!type || !/^#[\da-fA-F]{6}$/.test(color)) {
    return { ok: false, message: 'Choose a valid type and color.' };
  }

  await ensureFinanceSetup(userId);
  const existing = await prisma.category.findFirst({
    where: { userId, type, name: { equals: name, mode: 'insensitive' } },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, message: 'A category with this name already exists.' };
  }

  await prisma.category.create({ data: { userId, name, type, color } });
  refreshFinancePages();
  return { ok: true, message: 'Category added.' };
}

export async function archiveCategory(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  const id = value(formData, 'id');
  if (!userId || !id) return;

  await prisma.category.updateMany({
    where: { id, userId, isArchived: false },
    data: { isArchived: true },
  });
  refreshFinancePages();
}
