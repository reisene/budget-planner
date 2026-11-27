import CategoryForm from '@/app/dashboard/CategoryForm';
import { archiveCategory } from '@/app/dashboard/actions';
import { getCurrentUserId } from '@/lib/currentUser';
import { prisma } from '@/lib/db';
import { ensureFinanceSetup } from '@/lib/finance/setup';
import { TransactionType } from '@/lib/finance/types';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button, Card, CardBody, Col, Container, Row } from 'react-bootstrap';

export const metadata: Metadata = {
  title: 'Categories',
  robots: { index: false, follow: false },
};

export default async function CategoriesPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/auth/login');

  await ensureFinanceSetup(userId);
  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: [{ isArchived: 'asc' }, { type: 'asc' }, { name: 'asc' }],
  });

  return (
    <Container className='py-3'>
      <header className='d-flex justify-content-between align-items-start gap-3 flex-wrap mb-4'>
        <div>
          <p className='text-uppercase small text-primary fw-semibold mb-2'>
            Budget
          </p>
          <h1 className='h2'>Categories</h1>
          <p className='text-body-secondary mb-0'>
            Organize income and expenses with your own categories.
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
              <h2 className='h5'>Add a category</h2>
              <p className='small text-body-secondary'>
                Categories are private to your account and can be used for
                transactions or recurring payments.
              </p>
              <CategoryForm />
            </CardBody>
          </Card>
        </Col>
        <Col lg={7}>
          <Card>
            <CardBody className='p-4'>
              <h2 className='h5 mb-3'>Your categories</h2>
              {categories.length ? (
                <ul className='list-unstyled mb-0'>
                  {categories.map((category) => (
                    <li
                      key={category.id}
                      className='d-flex align-items-center gap-3 border-bottom py-3'
                    >
                      <span
                        aria-hidden='true'
                        className='rounded-circle flex-shrink-0'
                        style={{
                          backgroundColor: category.color,
                          width: 0.75 + 'rem',
                          height: 0.75 + 'rem',
                        }}
                      />
                      <div className='flex-grow-1'>
                        <span className='fw-semibold'>{category.name}</span>
                        <span className='d-block small text-body-secondary'>
                          {category.type === TransactionType.EXPENSE
                            ? 'Expense'
                            : 'Income'}
                          {category.isArchived ? ' · Archived' : ''}
                        </span>
                      </div>
                      {!category.isArchived && (
                        <form action={archiveCategory}>
                          <input type='hidden' name='id' value={category.id} />
                          <Button
                            type='submit'
                            size='sm'
                            variant='outline-secondary'
                            aria-label={`Archive ${category.name}`}
                          >
                            Archive
                          </Button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='text-body-secondary mb-0'>
                  No categories yet. Add one to get started.
                </p>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
