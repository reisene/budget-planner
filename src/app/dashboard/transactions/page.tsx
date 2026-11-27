import TransactionForm from '@/app/dashboard/TransactionForm';
import { deleteTransaction } from '@/app/dashboard/actions';
import { getCurrentUserId } from '@/lib/currentUser';
import { prisma } from '@/lib/db';
import { formatMoney } from '@/lib/finance/currency';
import { dateOnlyString } from '@/lib/finance/dates';
import { processDueRecurringPayments } from '@/lib/finance/recurringProcessor';
import { ensureFinanceSetup } from '@/lib/finance/setup';
import { TransactionType } from '@/lib/finance/types';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button, Card, CardBody, Col, Container, Row } from 'react-bootstrap';

export const metadata: Metadata = {
  title: 'Transactions',
  robots: { index: false, follow: false },
};

export default async function TransactionsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/auth/login');

  await Promise.all([
    ensureFinanceSetup(userId),
    processDueRecurringPayments(userId),
  ]);
  const [settings, categories, transactions] = await Promise.all([
    prisma.accountSettings.findUnique({ where: { userId } }),
    prisma.category.findMany({
      where: { userId, isArchived: false },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, type: true },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: [{ occurredAt: 'desc' }, { createdAt: 'desc' }],
      take: 100,
      include: { category: { select: { name: true } } },
    }),
  ]);

  return (
    <Container className='py-3'>
      <header className='d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4'>
        <div>
          <p className='text-uppercase small text-primary fw-semibold mb-2'>
            Budget
          </p>
          <h1 className='h2'>Transactions</h1>
          <p className='text-body-secondary mb-0'>
            Add manual entries and review the latest activity.
          </p>
        </div>
        <Link href='/dashboard' className='btn btn-outline-secondary'>
          Back to dashboard
        </Link>
      </header>

      <Row className='g-4'>
        <Col lg={5}>
          <Card>
            <CardBody className='p-4'>
              <h2 className='h5'>Add a transaction</h2>
              <TransactionForm
                categories={categories}
                today={dateOnlyString(new Date())}
                currency={settings?.currency ?? 'USD'}
              />
            </CardBody>
          </Card>
        </Col>
        <Col lg={7}>
          <Card>
            <CardBody className='p-4'>
              <h2 className='h5 mb-3'>Recent entries</h2>
              {transactions.length ? (
                <ul className='list-unstyled mb-0'>
                  {transactions.map((transaction) => (
                    <li
                      key={transaction.id}
                      className='d-flex align-items-center gap-3 border-bottom py-3'
                    >
                      <div className='flex-grow-1 min-w-0'>
                        <span className='fw-semibold d-block text-truncate'>
                          {transaction.description}
                        </span>
                        <span className='small text-body-secondary'>
                          {dateOnlyString(transaction.occurredAt)}
                          {' · '}
                          {transaction.category?.name ?? 'Uncategorized'}
                          {transaction.recurringPaymentId ? ' · Recurring' : ''}
                        </span>
                      </div>
                      <span
                        className={`fw-semibold text-nowrap ${
                          transaction.type === TransactionType.INCOME
                            ? 'text-success'
                            : ''
                        }`}
                      >
                        {transaction.type === TransactionType.EXPENSE
                          ? '−'
                          : '+'}
                        {formatMoney(
                          transaction.amount.toString(),
                          settings?.currency ?? 'USD',
                        )}
                      </span>
                      <form action={deleteTransaction}>
                        <input type='hidden' name='id' value={transaction.id} />
                        <Button
                          type='submit'
                          size='sm'
                          variant='outline-secondary'
                          aria-label={`Delete ${transaction.description}`}
                        >
                          Delete
                        </Button>
                      </form>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-body-secondary mb-0'>
                  No transactions yet. Add your first entry using the form.
                </p>
              )}
              {transactions.length === 100 && (
                <p className='small text-body-secondary mt-3 mb-0'>
                  Showing the 100 most recent entries.
                </p>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
