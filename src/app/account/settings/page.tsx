import SettingsForm from '@/app/account/settings/SettingsForm';
import { getCurrentUserId } from '@/lib/currentUser';
import { prisma } from '@/lib/db';
import { getCurrencyOptions } from '@/lib/finance/currency';
import { ensureFinanceSetup } from '@/lib/finance/setup';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Alert, Card, CardBody, Container } from 'react-bootstrap';

export const metadata: Metadata = {
  title: 'Account settings',
  robots: { index: false, follow: false },
};

export default async function AccountSettingsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/auth/login');

  await ensureFinanceSetup(userId);
  const [settings, currencies, conversions] = await Promise.all([
    prisma.accountSettings.findUnique({ where: { userId } }),
    getCurrencyOptions(),
    prisma.currencyConversion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  if (!settings) redirect('/dashboard');

  return (
    <Container className='py-3' style={{ maxWidth: '52rem' }}>
      <header className='mb-4'>
        <p className='text-uppercase small text-primary fw-semibold mb-2'>
          Account
        </p>
        <h1 className='h2'>Settings</h1>
        <p className='text-body-secondary mb-0'>
          Choose the currency used throughout your personal budget.
        </p>
      </header>

      <Card className='mb-4'>
        <CardBody className='p-4'>
          <h2 className='h5'>Regional preferences</h2>
          <p className='text-body-secondary'>
            Your budget currently uses <strong>{settings.currency}</strong>.
            Updating it converts both historical amounts and active or paused
            recurring payment amounts.
          </p>
          <Alert variant='warning' className='mb-4'>
            Currency conversion uses a published reference rate, rounded to the
            new currency’s standard decimal precision. This is a budget-planning
            conversion, not a bank or accounting rate.
          </Alert>
          <SettingsForm currency={settings.currency} currencies={currencies} />
        </CardBody>
      </Card>

      <Card>
        <CardBody className='p-4'>
          <h2 className='h5'>Currency conversion history</h2>
          {conversions.length ? (
            <ul className='list-unstyled mb-0'>
              {conversions.map((conversion) => (
                <li
                  key={conversion.id}
                  className='d-flex justify-content-between gap-3 border-bottom py-3 last-border-0'
                >
                  <span>
                    {conversion.fromCurrency} → {conversion.toCurrency}
                    <span className='d-block small text-body-secondary'>
                      Rate date {conversion.rateDate.toISOString().slice(0, 10)}
                    </span>
                  </span>
                  <span className='text-end'>
                    {conversion.rate.toString()}
                    <span className='d-block small text-body-secondary'>
                      {conversion.source}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className='text-body-secondary mb-0'>
              Currency changes will appear here.
            </p>
          )}
        </CardBody>
      </Card>
    </Container>
  );
}
