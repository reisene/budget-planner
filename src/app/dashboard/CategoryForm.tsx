'use client';

import { createCategory } from '@/app/dashboard/actions';
import type { FinanceActionState } from '@/lib/finance/actionTypes';
import { TransactionType } from '@/lib/finance/types';
import { useActionState } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';

export default function CategoryForm() {
  const [state, action, pending] = useActionState<FinanceActionState, FormData>(
    createCategory,
    null,
  );

  return (
    <Form action={action} aria-busy={pending}>
      <Form.Group className='mb-3' controlId='category-name'>
        <Form.Label>Category name</Form.Label>
        <Form.Control name='name' maxLength={60} required />
      </Form.Group>
      <div className='row g-3'>
        <Form.Group className='col-sm-8' controlId='category-type'>
          <Form.Label>Used for</Form.Label>
          <Form.Select name='type' defaultValue={TransactionType.EXPENSE}>
            <option value={TransactionType.EXPENSE}>Expenses</option>
            <option value={TransactionType.INCOME}>Income</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className='col-sm-4' controlId='category-color'>
          <Form.Label>Color</Form.Label>
          <Form.Control name='color' type='color' defaultValue='#72ddb0' />
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
          'Add category'
        )}
      </Button>
    </Form>
  );
}
