type CurrencyApiResponse = {
  result: string;
  base_code?: string;
  time_last_update_utc?: string;
  conversion_rates?: Record<string, number>;
  supported_codes?: [string, string][];
  'error-type'?: string;
};

export type ExchangeRate = {
  rate: string;
  rateDate: Date;
};

export type CurrencyOption = {
  code: string;
  name: string;
};

const API_BASE_URL = 'https://v6.exchangerate-api.com/v6';

function apiKey(): string {
  const key = process.env.EXCHANGERATE_API_KEY;
  if (!key) throw new Error('Currency conversion is not configured yet.');
  return key;
}

async function requestCurrencyApi(path: string): Promise<CurrencyApiResponse> {
  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(apiKey())}/${path}`,
    { cache: 'no-store', signal: AbortSignal.timeout(10_000) },
  );
  const payload = (await response.json()) as CurrencyApiResponse;

  if (!response.ok || payload.result !== 'success') {
    const reason = payload['error-type'] ?? `HTTP ${response.status}`;
    throw new Error(
      `The currency service could not provide a rate (${reason}).`,
    );
  }

  return payload;
}

export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string,
): Promise<ExchangeRate> {
  if (fromCurrency === toCurrency) {
    return { rate: '1', rateDate: new Date() };
  }

  const payload = await requestCurrencyApi(
    `latest/${encodeURIComponent(fromCurrency)}`,
  );
  const rate = payload.conversion_rates?.[toCurrency];
  if (!rate || !Number.isFinite(rate) || rate <= 0) {
    throw new Error(
      `The currency service does not support ${fromCurrency} to ${toCurrency}.`,
    );
  }

  const parsedRateDate = payload.time_last_update_utc
    ? new Date(payload.time_last_update_utc)
    : new Date();

  return {
    rate: rate.toString(),
    rateDate: Number.isNaN(parsedRateDate.getTime())
      ? new Date()
      : parsedRateDate,
  };
}

export async function getCurrencyOptions(): Promise<CurrencyOption[]> {
  const key = process.env.EXCHANGERATE_API_KEY;
  let codes: [string, string][] | undefined;

  if (key) {
    try {
      const payload = await requestCurrencyApi('codes');
      codes = payload.supported_codes;
    } catch {
      codes = undefined;
    }
  }

  const fallbackCodes =
    typeof Intl.supportedValuesOf === 'function'
      ? Intl.supportedValuesOf('currency').map(
          (code) => [code, code] as [string, string],
        )
      : ['CAD', 'EUR', 'GBP', 'JPY', 'PLN', 'USD'].map(
          (code) => [code, code] as [string, string],
        );

  return (codes ?? fallbackCodes)
    .map(([code, name]) => ({ code, name }))
    .sort((left, right) => left.code.localeCompare(right.code));
}

export function isCurrencyCode(value: string): boolean {
  if (!/^[A-Z]{3}$/.test(value)) return false;
  if (typeof Intl.supportedValuesOf !== 'function') return true;
  return Intl.supportedValuesOf('currency').includes(value);
}

export function currencyFractionDigits(currency: string): number {
  try {
    return (
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
      }).resolvedOptions().maximumFractionDigits ?? 2
    );
  } catch {
    return 2;
  }
}

export function formatMoney(amount: string | number, currency: string): string {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) return `${amount} ${currency}`;

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(numericAmount);
  } catch {
    return `${numericAmount.toFixed(2)} ${currency}`;
  }
}
