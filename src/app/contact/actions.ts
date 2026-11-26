'use server';

import { getCurrentUserId } from '@/lib/currentUser';
import { prisma } from '@/lib/db';
import {
  sendAdminContactNotification,
  sendUserContactConfirmation,
} from '@/lib/email';
import { checkRateLimit } from '@/lib/rateLimit';
import { logServerError } from '@/lib/serverLogger';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { checkBotId } from 'botid/server';

export type ContactState = { ok: boolean; message: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (formData: FormData, key: string) =>
  String(formData.get(key) ?? '').trim();

export async function submitContactForm(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  try {
    const verification = await checkBotId({
      advancedOptions: { checkLevel: 'basic' },
    });
    if (verification.isBot) {
      return { ok: false, message: 'Request blocked. Please try again later.' };
    }
  } catch (error) {
    logServerError('contact.botid', error);
    return { ok: false, message: 'Verification failed. Please try again.' };
  }

  if (!(await verifyTurnstileToken(formData, 'contact'))) {
    return {
      ok: false,
      message: 'Human verification failed. Please try again.',
    };
  }

  const userId = await getCurrentUserId();

  const limit = await checkRateLimit('contactForm', userId);
  if (!limit.ok) return { ok: false, message: limit.message };

  // Honeypot: pretend success so bots learn nothing.
  if (str(formData, 'hp_website')) {
    return { ok: true, message: 'Thanks! Your message has been sent.' };
  }

  const name = str(formData, 'name');
  const email = str(formData, 'email');
  const category = str(formData, 'category');
  const subject =
    str(formData, 'subject') || category || 'Contact form message';
  const message = str(formData, 'message');

  if (name.length < 2 || name.length > 100) {
    return { ok: false, message: 'Please enter your name (2–100 characters).' };
  }
  if (!EMAIL_RE.test(email) || email.length > 150) {
    return { ok: false, message: 'Please enter a valid email address.' };
  }
  if (subject.length > 200) {
    return { ok: false, message: 'Subject is too long (max 200 characters).' };
  }
  if (message.length < 10 || message.length > 5000) {
    return { ok: false, message: 'Message must be 10–5000 characters long.' };
  }

  try {
    await prisma.contactMessage.create({
      data: { userId, name, email, subject, message },
    });
  } catch (error) {
    logServerError('contact.save', error);
    return {
      ok: false,
      message: 'Could not send your message. Please try again later.',
    };
  }

  const payload = { name, email, subject, category, message, userId };
  const results = await Promise.allSettled([
    sendAdminContactNotification(payload),
    sendUserContactConfirmation(payload),
  ]);
  results.forEach((r) => {
    if (r.status === 'rejected') logServerError('contact.email', r.reason);
  });

  return {
    ok: true,
    message:
      'Thanks! Your message has been sent. We usually reply within 24–48 hours.',
  };
}
