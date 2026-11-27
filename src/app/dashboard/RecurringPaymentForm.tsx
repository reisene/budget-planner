'use client';

import { createRecurringPayment } from '@/app/dashboard/actions';
import type { FinanceActionState } from '@/lib/finance/actionTypes';
import { TransactionType } from '@/lib/finance/types';
import { useActionState, useState } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';

type CategoryOption = {
  id: string;
  name: string;
  type: TransactionType;
};

export default function RecurringPaymentForm({
  categories,
  today,
  currency,
}: {
  categories: CategoryOption[];
  today: string;
  currency: string;
}) {
  const [state, action, pending] = useActionState<FinanceActionState, FormData>(
    createRecurringPayment,
    null,
  );
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);

  return (
    <Form action={action} aria-busy={pending}>
      <Form.Group className='mb-3' controlId='recurring-description'>
        <Form.Label>Payment name</Form.Label>
        <Form.Control name='description' maxLength={120} required />
      </Form.Group>
      <div className='row g-3'>
        <Form.Group className='col-sm-6' controlId='recurring-type'>
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
        <Form.Group className='col-sm-6' controlId='recurring-amount'>
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
      <Form.Group className='my-3' controlId='recurring-category'>
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
      <div className='row g-3'>
        <Form.Group className='col-sm-6' controlId='recurring-frequency'>
          <Form.Label>Repeat every</Form.Label>
          <div className='input-group'>
            <Form.Control
              name='intervalCount'
              type='number'
              min='1'
              max='365'
              defaultValue='1'
              required
              aria-label='Repeat interval count'
            />
            <Form.Select name='intervalUnit' aria-label='Repeat interval unit'>
              <option value='WEEK'>week(s)</option>
              <option value='MONTH'>month(s)</option>
              <option value='YEAR'>year(s)</option>
              <option value='DAY'>day(s)</option>
            </Form.Select>
          </div>
        </Form.Group>
        <Form.Group className='col-sm-6' controlId='recurring-start-date'>
          <Form.Label>First payment date</Form.Label>
          <Form.Control
            name='startDate'
            type='date'
            defaultValue={today}
            required
          />
        </Form.Group>
      </div>
      <Form.Group className='mt-3' controlId='recurring-end-date'>
        <Form.Label>End date (optional)</Form.Label>
        <Form.Control name='endDate' type='date' />
      </Form.Group>

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
          'Save recurring payment'
        )}
      </Button>
    </Form>
  );
}
