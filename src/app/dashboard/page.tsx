import { Prisma } from '@/generated/prisma/client';
import { getCurrentUserId } from '@/lib/currentUser';
import { prisma } from '@/lib/db';
import { formatMoney } from '@/lib/finance/currency';
import { dateOnlyString, parseDateOnly } from '@/lib/finance/dates';
import { processDueRecurringPayments } from '@/lib/finance/recurringProcessor';
import { ensureFinanceSetup } from '@/lib/finance/setup';
import { TransactionType } from '@/lib/finance/types';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Card,
  CardBody,
  Col,
  Container,
  ProgressBar,
  Row,
} from 'react-bootstrap';

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
};

type DashboardProps = {
  searchParams: Promise<{ month?: string | string[] }>;
};

export default async function DashboardPage({ searchParams }: DashboardProps) {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/auth/login');

  await Promise.all([
    ensureFinanceSetup(userId),
    processDueRecurringPayments(userId),
  ]);

  const params = await searchParams;
  const monthValue = Array.isArray(params.month)
    ? params.month[0]
    : params.month;
  const validMonth = /^\d{4}-\d{2}$/.test(monthValue ?? '')
    ? parseDateOnly(`${monthValue}-01`)
    : null;
  const now = new Date();
  const monthStart =
    validMonth ??
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonth = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
  );
  const previousMonth = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() - 1, 1),
  );
  const currentMonthKey = dateOnlyString(monthStart).slice(0, 7);
  const previousMonthKey = dateOnlyString(previousMonth).slice(0, 7);
  const nextMonthKey = dateOnlyString(nextMonth).slice(0, 7);
  const monthLabel = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(monthStart);
  const today = parseDateOnly(dateOnlyString(now))!;

  const [
    settings,
    totals,
    recentTransactions,
    categoryGroups,
    upcomingPayments,
  ] = await Promise.all([
    prisma.accountSettings.findUnique({ where: { userId } }),
    prisma.transaction.groupBy({
      by: ['type'],
      where: { userId, occurredAt: { gte: monthStart, lt: nextMonth } },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: [{ occurredAt: 'desc' }, { createdAt: 'desc' }],
      take: 8,
      include: { category: { select: { name: true } } },
    }),
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: TransactionType.EXPENSE,
        occurredAt: { gte: monthStart, lt: nextMonth },
      },
      _sum: { amount: true },
    }),
    prisma.recurringPayment.findMany({
      where: { userId, isActive: true, nextOccurrence: { gte: today } },
      orderBy: { nextOccurrence: 'asc' },
      take: 5,
      include: { category: { select: { name: true } } },
    }),
  ]);

  const currency = settings?.currency ?? 'USD';
  const income =
    totals.find((item) => item.type === TransactionType.INCOME)?._sum.amount ??
    new Prisma.Decimal(0);
  const expenses =
    totals.find((item) => item.type === TransactionType.EXPENSE)?._sum.amount ??
    new Prisma.Decimal(0);
  const balance = income.minus(expenses);
  const groupedCategoryIds = categoryGroups
    .map((group) => group.categoryId)
    .filter((id): id is string => Boolean(id));
  const categoryRecords = groupedCategoryIds.length
    ? await prisma.category.findMany({
        where: { userId, id: { in: groupedCategoryIds } },
        select: { id: true, name: true, color: true },
      })
    : [];
  const categoryById = new Map(
    categoryRecords.map((category) => [category.id, category]),
  );
  const categorySpending = categoryGroups
    .map((group) => ({
      id: group.categoryId ?? 'uncategorized',
      name: group.categoryId
        ? (categoryById.get(group.categoryId)?.name ?? 'Archived category')
        : 'Uncategorized',
      color: group.categoryId
        ? (categoryById.get(group.categoryId)?.color ?? '#70867e')
        : '#70867e',
      amount: group._sum.amount ?? new Prisma.Decimal(0),
    }))
    .sort((left, right) => right.amount.comparedTo(left.amount));
  const maxCategoryAmount = Math.max(
    0,
    ...categorySpending.map((category) => Number(category.amount.toString())),
  );

  return (
    <Container className='py-3'>
      <header className='d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4'>
        <div>
          <p className='text-uppercase small text-primary fw-semibold mb-2'>
            Personal finance
          </p>
          <h1 className='h2 mb-1'>Your budget</h1>
          <p className='text-body-secondary mb-0'>
            A clear view of your money, transactions, and upcoming payments.
          </p>
        </div>
        <div className='d-flex flex-wrap gap-2'>
          <Link href='/dashboard/transactions' className='btn btn-primary'>
            Add transaction
          </Link>
          <Link href='/dashboard/recurring' className='btn btn-outline-primary'>
            Add recurring payment
          </Link>
        </div>
      </header>

      <nav className='d-flex flex-wrap gap-2 mb-4' aria-label='Budget sections'>
        <Link
          href='/dashboard/transactions'
          className='btn btn-sm btn-outline-secondary'
        >
          Transactions
        </Link>
        <Link
          href='/dashboard/recurring'
          className='btn btn-sm btn-outline-secondary'
        >
          Recurring payments
        </Link>
        <Link
          href='/dashboard/categories'
          className='btn btn-sm btn-outline-secondary'
        >
          Categories
        </Link>
        <Link
          href='/account/settings'
          className='btn btn-sm btn-outline-secondary'
        >
          Account settings · {currency}
        </Link>
      </nav>

      <section aria-labelledby='monthly-overview-title' className='mb-4'>
        <div className='d-flex justify-content-between align-items-center gap-3 flex-wrap mb-3'>
          <h2 id='monthly-overview-title' className='h4 mb-0'>
            Monthly overview
          </h2>
          <div className='d-flex align-items-center gap-2'>
            <Link
              href={`/dashboard?month=${previousMonthKey}`}
              className='btn btn-sm btn-outline-secondary'
              aria-label='Previous month'
            >
              Previous
            </Link>
            <span className='fw-semibold text-nowrap' aria-live='polite'>
              {monthLabel}
            </span>
            <Link
              href={`/dashboard?month=${nextMonthKey}`}
              className='btn btn-sm btn-outline-secondary'
              aria-label='Next month'
            >
              Next
            </Link>
          </div>
        </div>
        <Row className='g-3'>
          <Col sm={6} xl={4}>
            <Card className='h-100'>
              <CardBody>
                <p className='small text-body-secondary mb-2'>Income</p>
                <p className='h3 text-success mb-0'>
                  {formatMoney(income.toString(), currency)}
                </p>
              </CardBody>
            </Card>
          </Col>
          <Col sm={6} xl={4}>
            <Card className='h-100'>
              <CardBody>
                <p className='small text-body-secondary mb-2'>Expenses</p>
                <p className='h3 mb-0'>
                  {formatMoney(expenses.toString(), currency)}
                </p>
              </CardBody>
            </Card>
          </Col>
          <Col sm={6} xl={4}>
            <Card className='h-100 border-primary'>
              <CardBody>
                <p className='small text-body-secondary mb-2'>Net balance</p>
                <p
                  className={`h3 mb-0 ${balance.isNegative() ? 'text-warning' : 'text-primary'}`}
                >
                  {formatMoney(balance.toString(), currency)}
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </section>

      <Row className='g-4'>
        <Col lg={6}>
          <Card className='h-100'>
            <CardBody className='p-4'>
              <div className='d-flex justify-content-between gap-3 mb-3'>
                <div>
                  <h2 className='h5 mb-1'>Spending by category</h2>
                  <p className='small text-body-secondary mb-0'>{monthLabel}</p>
                </div>
                <Link href='/dashboard/categories' className='small'>
                  Manage categories
                </Link>
              </div>
              {categorySpending.length ? (
                <ul className='list-unstyled mb-0'>
                  {categorySpending.map((category) => {
                    const percentage = maxCategoryAmount
                      ? Math.round(
                          (Number(category.amount.toString()) /
                            maxCategoryAmount) *
                            100,
                        )
                      : 0;
                    return (
                      <li key={category.id} className='mb-3'>
                        <div className='d-flex justify-content-between gap-3 mb-1'>
                          <span>{category.name}</span>
                          <span className='text-nowrap'>
                            {formatMoney(category.amount.toString(), currency)}
                          </span>
                        </div>
                        <ProgressBar
                          now={percentage}
                          aria-label={`${category.name}: ${percentage}% of highest category spending`}
                          style={
                            {
                              '--bs-progress-bar-bg': category.color,
                            } as React.CSSProperties
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className='text-body-secondary mb-0'>
                  No expenses recorded for this month yet.
                </p>
              )}
            </CardBody>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className='h-100'>
            <CardBody className='p-4'>
              <div className='d-flex justify-content-between gap-3 mb-3'>
                <div>
                  <h2 className='h5 mb-1'>Upcoming recurring payments</h2>
                  <p className='small text-body-secondary mb-0'>
                    Automatically added on their due dates
                  </p>
                </div>
                <Link href='/dashboard/recurring' className='small'>
                  Manage
                </Link>
              </div>
              {upcomingPayments.length ? (
                <ul className='list-unstyled mb-0'>
                  {upcomingPayments.map((payment) => (
                    <li
                      key={payment.id}
                      className='d-flex justify-content-between gap-3 border-bottom py-3'
                    >
                      <span>
                        <span className='d-block fw-semibold'>
                          {payment.description}
                        </span>
                        <span className='small text-body-secondary'>
                          {dateOnlyString(payment.nextOccurrence)}
                          {' · '}
                          {payment.category?.name ?? 'Uncategorized'}
                        </span>
                      </span>
                      <span className='text-nowrap'>
                        {formatMoney(payment.amount.toString(), currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-body-secondary mb-0'>
                  No upcoming payments. Add a recurring schedule to plan ahead.
                </p>
              )}
            </CardBody>
          </Card>
        </Col>
        <Col xs={12}>
          <Card>
            <CardBody className='p-4'>
              <div className='d-flex justify-content-between gap-3 mb-3'>
                <h2 className='h5 mb-0'>Recent transactions</h2>
                <Link href='/dashboard/transactions' className='small'>
                  View all
                </Link>
              </div>
              {recentTransactions.length ? (
                <ul className='list-unstyled row g-0 mb-0'>
                  {recentTransactions.map((transaction) => (
                    <li
                      key={transaction.id}
                      className='col-12 col-md-6 d-flex justify-content-between gap-3 border-bottom py-3 px-md-3'
                    >
                      <span className='min-w-0'>
                        <span className='d-block fw-semibold text-truncate'>
                          {transaction.description}
                        </span>
                        <span className='small text-body-secondary'>
                          {dateOnlyString(transaction.occurredAt)}
                          {' · '}
                          {transaction.category?.name ?? 'Uncategorized'}
                        </span>
                      </span>
                      <span
                        className={`text-nowrap ${
                          transaction.type === TransactionType.INCOME
                            ? 'text-success'
                            : ''
                        }`}
                      >
                        {transaction.type === TransactionType.EXPENSE
                          ? '−'
                          : '+'}
                        {formatMoney(transaction.amount.toString(), currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div>
                  <p className='text-body-secondary'>
                    Your dashboard is ready. Add a first transaction to see your
                    monthly overview and category breakdown.
                  </p>
                  <Link
                    href='/dashboard/transactions'
                    className='btn btn-primary'
                  >
                    Add your first transaction
                  </Link>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
      <p className='small text-body-secondary mt-3 mb-0' aria-live='polite'>
        Viewing {currentMonthKey} · All amounts are in {currency}.
      </p>
    </Container>
  );
}
