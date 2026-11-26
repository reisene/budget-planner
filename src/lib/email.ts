import { logServerError } from '@/lib/serverLogger';
import pkg from '@/package.json';
import { Resend } from 'resend';

export type ContactEmailPayload = {
  name: string;
  email: string;
  subject: string;
  category?: string;
  message: string;
  userId?: string | null;
};

let resend: Resend | null | undefined;

function getResend(): Resend | null {
  if (resend !== undefined) return resend;
  const key = process.env.RESEND_API_KEY;
  resend = key ? new Resend(key) : null;
  return resend;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const getFromEmail = () =>
  process.env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev';
const getNotifyEmail = () => pkg.author.email;

type Result = { ok: boolean };

async function send(
  scope: string,
  params: Parameters<Resend['emails']['send']>[0],
): Promise<Result> {
  const client = getResend();
  if (!client) {
    console.warn(`[${scope}] RESEND_API_KEY is not set, skipping email.`);
    return { ok: false };
  }
  try {
    const result = await client.emails.send(params);
    if (result.error) {
      logServerError(scope, result.error);
      return { ok: false };
    }
    return { ok: true };
  } catch (error) {
    logServerError(scope, error);
    return { ok: false };
  }
}

export async function sendAdminContactNotification(
  p: ContactEmailPayload,
): Promise<Result> {
  const rows = [
    ['From', `${escapeHtml(p.name)} &lt;${escapeHtml(p.email)}&gt;`],
    ['Subject', escapeHtml(p.subject)],
    ['Category', escapeHtml(p.category || '—')],
    ['User ID', escapeHtml(p.userId || 'anonymous')],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0"><strong>${k}</strong></td><td>${v}</td></tr>`,
    )
    .join('');

  return send('sendAdminContactNotification', {
    from: getFromEmail(),
    to: getNotifyEmail(),
    replyTo: `${p.name.replace(/[<>"]/g, '')} <${p.email}>`,
    subject: `[Contact form] ${p.subject}`,
    html: `<table>${rows}</table><div style="margin-top:16px;padding:12px;background:#f5f5f5;white-space:pre-wrap">${escapeHtml(p.message)}</div>`,
  });
}

export async function sendUserContactConfirmation(
  p: ContactEmailPayload,
): Promise<Result> {
  return send('sendUserContactConfirmation', {
    from: getFromEmail(),
    to: p.email,
    subject: `Confirmation: ${p.subject}`,
    html: `<p>Hi ${escapeHtml(p.name)},</p><p>Thanks for contacting Budget Planner. We usually reply within 24–48 hours.</p><p>A copy of your message:</p><div style="padding:12px;background:#f5f5f5;white-space:pre-wrap">${escapeHtml(p.message)}</div>`,
  });
}
