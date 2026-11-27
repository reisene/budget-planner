'use client';

import { changeBudgetCurrency } from '@/app/account/settings/actions';
import type { FinanceActionState } from '@/lib/finance/actionTypes';
import type { CurrencyOption } from '@/lib/finance/currency';
import { useActionState } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';

export default function SettingsForm({
  currency,
  currencies,
}: {
  currency: string;
  currencies: CurrencyOption[];
}) {
  const [state, action, pending] = useActionState<FinanceActionState, FormData>(
    changeBudgetCurrency,
    null,
  );

  return (
    <Form action={action} aria-busy={pending}>
      <Form.Group className='mb-3' controlId='budget-currency'>
        <Form.Label>Budget currency</Form.Label>
        <Form.Select name='currency' defaultValue={currency} required>
          {currencies.map((option) => (
            <option key={option.code} value={option.code}>
              {option.code} — {option.name}
            </option>
          ))}
        </Form.Select>
        <Form.Text className='text-body-secondary'>
          Changing currency converts existing transactions and recurring amounts
          using the latest available rate. The rate and its date are recorded.
        </Form.Text>
      </Form.Group>

      {state && (
        <Alert
          variant={state.ok ? 'success' : 'danger'}
          role={state.ok ? 'status' : 'alert'}
        >
          {state.message}
        </Alert>
      )}

      <Button type='submit' disabled={pending}>
        {pending ? (
          <>
            <Spinner size='sm' className='me-2' aria-hidden='true' />
            Updating…
          </>
        ) : (
          'Save currency'
        )}
      </Button>
    </Form>
  );
}
