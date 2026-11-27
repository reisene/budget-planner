import { processDueRecurringPayments } from '@/lib/finance/recurringProcessor';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'Recurring payment processing is not configured.' },
      { status: 503 },
    );
  }

  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const result = await processDueRecurringPayments();
  return NextResponse.json(result, {
    status: result.failedCount ? 500 : 200,
  });
}
