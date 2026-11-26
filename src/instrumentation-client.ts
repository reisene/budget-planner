import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  integrations: [
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration({
      colorScheme: 'dark',
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  dataCollection: {
    userInfo: false,
    graphQL: { document: false, variables: false },
    genAI: { inputs: false, outputs: false },
    databaseQueryData: false,
    queues: false,
    httpBodies: [],
    httpHeaders: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
    cookies: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
    urlQueryParams: { deny: ['forwarded', '-ip', 'remote-', 'via', '-user'] },
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
