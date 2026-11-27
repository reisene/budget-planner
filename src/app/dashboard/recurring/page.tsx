import RecurringPaymentForm from '@/app/dashboard/RecurringPaymentForm';
import { deactivateRecurringPayment } from '@/app/dashboard/actions';
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
  title: 'Recurring payments',
  robots: { index: false, follow: false },
};

export default async function RecurringPaymentsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/auth/login');

  await Promise.all([
    ensureFinanceSetup(userId),
    processDueRecurringPayments(userId),
  ]);
  const [settings, categories, payments] = await Promise.all([
    prisma.accountSettings.findUnique({ where: { userId } }),
    prisma.category.findMany({
      where: { userId, isArchived: false },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, type: true },
    }),
    prisma.recurringPayment.findMany({
      where: { userId },
      orderBy: [{ isActive: 'desc' }, { nextOccurrence: 'asc' }],
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
          <h1 className='h2'>Recurring payments</h1>
          <p className='text-body-secondary mb-0'>
            Set a flexible schedule. Due entries are added automatically.
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
              <h2 className='h5'>Create a schedule</h2>
              <p className='small text-body-secondary'>
                Choose how often the payment repeats. Intervals can be daily,
                weekly, monthly, yearly, or a custom number of those periods.
              </p>
              <RecurringPaymentForm
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
              <h2 className='h5 mb-3'>Your schedules</h2>
              {payments.length ? (
                <ul className='list-unstyled mb-0'>
                  {payments.map((payment) => (
                    <li
                      key={payment.id}
                      className='d-flex align-items-center gap-3 border-bottom py-3'
                    >
                      <div className='flex-grow-1 min-w-0'>
                        <span className='fw-semibold d-block text-truncate'>
                          {payment.description}
                        </span>
                        <span className='small text-body-secondary'>
                          {payment.category?.name ?? 'Uncategorized'}
                          {' · Every '}
                          {payment.intervalCount > 1
                            ? `${payment.intervalCount} `
                            : ''}
                          {payment.intervalUnit.toLowerCase()}
                          {payment.intervalCount > 1 ? 's' : ''}
                          {' · Next '}
                          {dateOnlyString(payment.nextOccurrence)}
                          {payment.endDate
                            ? ` · Ends ${dateOnlyString(payment.endDate)}`
                            : ''}
                        </span>
                        <span className='d-block small text-body-secondary'>
                          {payment.isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <span
                        className={`fw-semibold text-nowrap ${
                          payment.type === TransactionType.INCOME
                            ? 'text-success'
                            : ''
                        }`}
                      >
                        {formatMoney(
                          payment.amount.toString(),
                          settings?.currency ?? 'USD',
                        )}
                      </span>
                      {payment.isActive && (
                        <form action={deactivateRecurringPayment}>
                          <input type='hidden' name='id' value={payment.id} />
                          <Button
                            type='submit'
                            size='sm'
                            variant='outline-secondary'
                            aria-label={`Pause ${payment.description}`}
                          >
                            Pause
                          </Button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-body-secondary mb-0'>
                  No recurring payments yet. Add a schedule to automatically
                  create future entries.
                </p>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
