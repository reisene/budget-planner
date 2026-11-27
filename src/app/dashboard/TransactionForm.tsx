'use client';

import { createTransaction } from '@/app/dashboard/actions';
import type { FinanceActionState } from '@/lib/finance/actionTypes';
import { TransactionType } from '@/lib/finance/types';
import { useActionState, useState } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';

type CategoryOption = {
  id: string;
  name: string;
  type: TransactionType;
};

export default function TransactionForm({
  categories,
  today,
  currency,
}: {
  categories: CategoryOption[];
  today: string;
  currency: string;
}) {
  const [state, action, pending] = useActionState<FinanceActionState, FormData>(
    createTransaction,
    null,
  );
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);

  return (
    <Form action={action} aria-busy={pending}>
      <Form.Group className='mb-3' controlId='transaction-description'>
        <Form.Label>Description</Form.Label>
        <Form.Control name='description' maxLength={120} required />
      </Form.Group>
      <div className='row g-3'>
        <Form.Group className='col-sm-6' controlId='transaction-type'>
          <Form.Label>Type</Form.Label>
          <Form.Select
            name='type'
            value={type}
            onChange={(event) => setType(event.target.value as TransactionType)}
          >
            <option value={TransactionType.EXPENSE}>Expense</option>
            <option value={TransactionType.INCOME}>Income</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className='col-sm-6' controlId='transaction-amount'>
          <Form.Label>Amount ({currency})</Form.Label>
          <Form.Control
            name='amount'
            type='number'
            min='0.0001'
            step='0.0001'
            inputMode='decimal'
            required
          />
        </Form.Group>
      </div>
      <div className='row g-3 mt-0'>
        <Form.Group className='col-sm-6' controlId='transaction-category'>
          <Form.Label>Category</Form.Label>
          <Form.Select name='categoryId' defaultValue=''>
            <option value=''>Uncategorized</option>
            {categories
              .filter((category) => category.type === type)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className='col-sm-6' controlId='transaction-date'>
          <Form.Label>Date</Form.Label>
          <Form.Control
            name='occurredAt'
            type='date'
            defaultValue={today}
            required
          />
        </Form.Group>
      </div>

      {state && (
        <Alert
          className='mt-3 mb-0'
          variant={state.ok ? 'success' : 'danger'}
          role={state.ok ? 'status' : 'alert'}
        >
          {state.message}
        </Alert>
      )}

      <Button className='mt-3' type='submit' disabled={pending}>
        {pending ? (
          <>
            <Spinner size='sm' className='me-2' aria-hidden='true' />
            Saving…
          </>
        ) : (
          'Add transaction'
        )}
      </Button>
    </Form>
  );
}
