'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { BsCheckCircleFill, BsExclamationTriangleFill } from 'react-icons/bs';
import { submitContactForm } from './actions';

const CATEGORIES = [
  { value: 'General question', hint: 'What would you like to ask?' },
  {
    value: 'Bug report or calculation issue',
    hint: 'Describe what went wrong',
  },
  { value: 'Feature suggestion', hint: 'What would you like to see?' },
  { value: 'Collaboration or other', hint: 'What is this about?' },
];

type Props = { defaultName?: string; defaultEmail?: string };

function ContactFormContent({
  defaultName,
  defaultEmail,
  onReset,
}: Props & { onReset: () => void }) {
  const [state, action, pending] = useActionState(submitContactForm, null);
  const [category, setCategory] = useState('');
  const hint =
    CATEGORIES.find((c) => c.value === category)?.hint ?? 'Optional subject';
  const successRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.ok) successRef.current?.focus();
    else if (state && !state.ok) errorRef.current?.focus();
  }, [state]);

  if (state?.ok) {
    return (
      <div className='text-center py-4'>
        <BsCheckCircleFill
          size={48}
          className='text-success mb-3'
          aria-hidden='true'
        />
        <h3 className='h4' ref={successRef} tabIndex={-1}>
          Message sent
        </h3>
        <p className='text-body-secondary' role='status'>
          {state.message}
        </p>
        <Button variant='outline-primary' onClick={onReset}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <Form action={action} aria-busy={pending}>
      <p className='text-body-secondary small'>
        Fields marked <span aria-hidden='true'>*</span>
        <span className='visually-hidden'>with an asterisk</span> are required.
      </p>
      <div style={{ display: 'none' }} aria-hidden='true'>
        <label htmlFor='hp_website'>Website</label>
        <input
          id='hp_website'
          name='hp_website'
          type='text'
          tabIndex={-1}
          autoComplete='off'
        />
      </div>

      <Form.Group className='mb-3' controlId='contact-category'>
        <Form.Label>Category</Form.Label>
        <Form.Select
          name='category'
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value=''>Choose a category…</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.value}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className='mb-3' controlId='contact-subject'>
        <Form.Label>Subject (optional)</Form.Label>
        <Form.Control
          name='subject'
          type='text'
          maxLength={200}
          aria-describedby='contact-subject-hint'
        />
        <Form.Text id='contact-subject-hint' className='text-body-secondary'>
          {hint}
        </Form.Text>
      </Form.Group>

      <Form.Group className='mb-3' controlId='contact-name'>
        <Form.Label>
          Name <span aria-hidden='true'>*</span>
        </Form.Label>
        <Form.Control
          name='name'
          type='text'
          required
          aria-required='true'
          minLength={2}
          maxLength={100}
          autoComplete='name'
          defaultValue={defaultName}
        />
      </Form.Group>

      <Form.Group className='mb-3' controlId='contact-email'>
        <Form.Label>
          Email <span aria-hidden='true'>*</span>
        </Form.Label>
        <Form.Control
          name='email'
          type='email'
          required
          aria-required='true'
          maxLength={150}
          autoComplete='email'
          defaultValue={defaultEmail}
        />
      </Form.Group>

      <Form.Group className='mb-3' controlId='contact-message'>
        <Form.Label>
          Message <span aria-hidden='true'>*</span>
        </Form.Label>
        <Form.Control
          as='textarea'
          name='message'
          rows={6}
          required
          aria-required='true'
          minLength={10}
          maxLength={5000}
        />
      </Form.Group>

      {state && !state.ok && (
        <Alert
          variant='danger'
          role='alert'
          ref={errorRef}
          tabIndex={-1}
          className='d-flex align-items-center gap-2'
        >
          <BsExclamationTriangleFill aria-hidden='true' />
          <span>{state.message}</span>
        </Alert>
      )}

      <Button type='submit' aria-disabled={pending}>
        {pending ? (
          <>
            <Spinner size='sm' className='me-2' aria-hidden='true' />
            Sending…
          </>
        ) : (
          'Send message'
        )}
      </Button>
      <div className='visually-hidden' role='status' aria-live='polite'>
        {pending ? 'Sending your message' : ''}
      </div>
    </Form>
  );
}

export default function ContactForm(props: Props) {
  const [resetKey, setResetKey] = useState(0);
  return (
    <ContactFormContent
      key={resetKey}
      {...props}
      onReset={() => setResetKey((k) => k + 1)}
    />
  );
}
