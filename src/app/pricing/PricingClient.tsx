'use client';

import type { PlusPrices } from '@/lib/prices';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Row } from 'react-bootstrap';

type Plan = 'monthly' | 'yearly';

type Props = {
  prices: PlusPrices | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  hasPlus: boolean;
  checkout: 'success' | 'cancelled' | null;
};

export default function PricingClient({
  prices,
  isLoggedIn,
  isAdmin,
  hasPlus,
  checkout,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<Plan | null>(null);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan>('monthly');

  async function choosePlan(plan: Plan) {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }

    setLoading(plan);
    setError('');

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const result = await response.json();

      if (!response.ok || !result.url) {
        throw new Error(result.error ?? 'Could not start checkout.');
      }

      window.location.href = result.url;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Checkout failed.');
      setLoading(null);
    }
  }

  const accountStatus = isAdmin
    ? 'Admin — full access'
    : hasPlus
      ? 'Plus'
      : 'Free';

  return (
    <Container className='py-5'>
      <h1 className='text-center'>Pricing</h1>
      <p className='text-center mb-4'>Current plan: {accountStatus}</p>

      {checkout === 'success' && (
        <Alert variant='success' role='status'>
          Thank you! Your payment is being processed — Plus will be active in a
          moment. Refresh the page if it does not appear.
        </Alert>
      )}
      {checkout === 'cancelled' && (
        <Alert variant='info' role='status'>
          Checkout cancelled. You have not been charged.
        </Alert>
      )}
      {error && (
        <Alert variant='danger' role='alert'>
          {error}
        </Alert>
      )}

      <Row className='justify-content-center g-4'>
        <Col md={5} lg={4}>
          <Card className='h-100'>
            <Card.Body className='d-flex flex-column p-4'>
              <Card.Title>Free</Card.Title>

              <div className='my-4'>
                <div className='display-4 fw-bold'>0 zł</div>
                <div className='text-body-secondary'>forever</div>
              </div>

              <ul className='mb-4'>
                <li>Unlimited income and expense entries</li>
                <li>Up to 10 categories</li>
                <li>One budget</li>
                <li>12 months of history</li>
              </ul>

              <div className='mt-auto'>
                {!isAdmin && !hasPlus && (
                  <Button className='w-100' variant='outline-primary' disabled>
                    Current plan
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={5} lg={4}>
          <Card className='h-100 border-primary'>
            <Card.Body className='d-flex flex-column p-4'>
              <Card.Title>Plus</Card.Title>

              <div className='my-4'>
                <div className='display-4 fw-bold'>
                  {prices ? prices[selectedPlan] : '—'}
                </div>
                <div className='text-body-secondary'>
                  {selectedPlan === 'monthly' ? 'per month' : 'per year'}
                </div>
              </div>

              <div className='d-flex gap-2 mb-3'>
                <Button
                  className='flex-fill'
                  variant={
                    selectedPlan === 'monthly' ? 'primary' : 'outline-primary'
                  }
                  aria-pressed={selectedPlan === 'monthly'}
                  onClick={() => setSelectedPlan('monthly')}
                >
                  Monthly
                </Button>
                <Button
                  className='flex-fill'
                  variant={
                    selectedPlan === 'yearly' ? 'primary' : 'outline-primary'
                  }
                  aria-pressed={selectedPlan === 'yearly'}
                  onClick={() => setSelectedPlan('yearly')}
                >
                  Yearly
                </Button>
              </div>

              {selectedPlan === 'yearly' && prices?.yearlySavings && (
                <p className='text-body-secondary'>
                  Save {prices.yearlySavings} per year
                </p>
              )}

              <ul className='mb-4'>
                <li>Unlimited income and expense entries</li>
                <li>Unlimited categories and history</li>
                <li>Multiple budgets</li>
                <li>CSV export</li>
              </ul>

              <div className='mt-auto'>
                {isAdmin ? (
                  <Button className='w-100' disabled>
                    Included with admin access
                  </Button>
                ) : hasPlus ? (
                  <Button className='w-100' disabled>
                    Current plan
                  </Button>
                ) : (
                  <Button
                    className='w-100'
                    disabled={loading !== null}
                    onClick={() => choosePlan(selectedPlan)}
                  >
                    {loading === selectedPlan ? 'Loading…' : 'Choose Plus'}
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
