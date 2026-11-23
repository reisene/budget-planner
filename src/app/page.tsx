import { getBillingAccess } from '@/lib/billing';
import { getPlusPrices } from '@/lib/prices';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, Col, Container, Row } from 'react-bootstrap';
import CardBody from 'react-bootstrap/CardBody';

export const metadata: Metadata = {
  title: { absolute: 'Budget Planner — plan your money, simply' },
  description:
    'Track income and expenses, organise them into categories and stay in control of your budget.',
  alternates: { canonical: '/' },
};

const features = [
  {
    title: 'Income & expenses',
    text: 'Log every transaction in seconds, with unlimited entries on the free plan.',
  },
  {
    title: 'Categories',
    text: 'Group spending into categories to see exactly where your money goes.',
  },
  {
    title: 'Monthly overview',
    text: 'Compare income with expenses month by month and spot trends early.',
  },
  {
    title: 'Multiple budgets',
    text: 'Separate personal, household or project budgets with Plus.',
  },
  {
    title: 'CSV export',
    text: 'Take your data anywhere — export it to a spreadsheet whenever you need.',
  },
];

const steps = [
  { title: 'Create a free account', text: 'It takes less than a minute.' },
  { title: 'Add your income and expenses', text: 'Assign them to categories.' },
  {
    title: 'Review and adjust',
    text: 'Use the overview to plan the next month.',
  },
];

export default async function HomePage() {
  const [{ user }, prices] = await Promise.all([
    getBillingAccess(),
    getPlusPrices(),
  ]);

  return (
    <Container>
      <section className='text-center py-5' aria-labelledby='hero-title'>
        <h1 id='hero-title' className='display-4 fw-bold'>
          Plan your money, simply
        </h1>
        <p className='lead mx-auto my-4' style={{ maxWidth: '40rem' }}>
          Budget Planner helps you track income and expenses, organise them into
          categories and stay in control of your finances.
        </p>
        <p className='text-body-secondary'>
          Free forever. Upgrade to Plus only if you want more.
        </p>
        <div className='d-flex justify-content-center gap-3 flex-wrap'>
          {user ? (
            <Link href='/pricing' className='btn btn-primary btn-lg'>
              View your plan
            </Link>
          ) : (
            <>
              <Link href='/auth/register' className='btn btn-primary btn-lg'>
                Get started for free
              </Link>
              <Link
                href='/auth/login'
                className='btn btn-outline-secondary btn-lg'
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </section>

      <section className='py-5' aria-labelledby='features-title'>
        <h2 id='features-title' className='text-center mb-4'>
          Everything you need to stay on budget
        </h2>
        <Row className='g-4'>
          {features.map((feature) => (
            <Col key={feature.title} md={6} lg={4}>
              <Card className='h-100'>
                <CardBody>
                  <h3 className='h5'>{feature.title}</h3>
                  <p className='mb-0 text-body-secondary'>{feature.text}</p>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section className='py-5' aria-labelledby='how-title'>
        <h2 id='how-title' className='text-center mb-4'>
          How it works
        </h2>
        <ol className='list-unstyled row g-4 mb-0'>
          {steps.map((step, index) => (
            <li key={step.title} className='col-md-4 text-center'>
              <div className='fs-2 fw-bold text-primary' aria-hidden='true'>
                {index + 1}
              </div>
              <h3 className='h5'>
                <span className='visually-hidden'>Step {index + 1}: </span>
                {step.title}
              </h3>
              <p className='text-body-secondary'>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className='py-5' aria-labelledby='pricing-title'>
        <h2 id='pricing-title' className='text-center mb-4'>
          Free forever, Plus is optional
        </h2>
        <p className='text-center text-body-secondary mb-4'>
          Every account starts on the Free plan and stays there for good — no
          trial, no card required. Plus is an optional upgrade you can choose
          whenever you need more.
        </p>
        <Row className='justify-content-center g-4'>
          <Col md={5} lg={4}>
            <Card className='h-100'>
              <CardBody className='p-4'>
                <h3 className='h4'>Free — for life</h3>
                <p className='display-6 fw-bold'>0 zł</p>
                <ul className='mb-0'>
                  <li>Unlimited income and expense entries</li>
                  <li>Up to 10 categories</li>
                  <li>One budget</li>
                  <li>12 months of history</li>
                </ul>
              </CardBody>
            </Card>
          </Col>
          <Col md={5} lg={4}>
            <Card className='h-100 border-primary'>
              <CardBody className='p-4'>
                <h3 className='h4'>Plus — optional</h3>
                <p className='display-6 fw-bold'>
                  {prices ? `${prices.monthly} / month` : 'Paid plan'}
                </p>
                <ul className='mb-0'>
                  <li>Unlimited income and expense entries</li>
                  <li>Unlimited categories and history</li>
                  <li>Multiple budgets</li>
                  <li>CSV export</li>
                </ul>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <p className='text-center mt-4'>
          <Link href='/pricing'>Compare plans and see yearly pricing</Link>
        </p>
      </section>

      {!user && (
        <section className='text-center py-5' aria-labelledby='cta-title'>
          <h2 id='cta-title'>Ready to take control of your budget?</h2>
          <p className='text-body-secondary mb-0'>
            Start free — no card needed, and Free never expires.
          </p>
          <Link href='/auth/register' className='btn btn-primary btn-lg mt-3'>
            Create a free account
          </Link>
        </section>
      )}
    </Container>
  );
}
