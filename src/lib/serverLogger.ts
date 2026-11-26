export function logServerError(
  scope: string,
  error: unknown,
  extra?: Record<string, unknown>,
) {
  console.error(`[${scope}]`, error, extra ?? {});
}
