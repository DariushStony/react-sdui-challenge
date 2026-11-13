import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

/**
 * Wires the app's shared services. Each mount gets its own query client, so tests never share a
 * cache. Retries are off: a failed load shows its error and Retry button at once, and the person
 * decides when to try again (a hidden automatic retry would delay the message).
 */
function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          // `networkMode: 'always'`: by default the library pauses a request while the browser's
          // "offline" flag is set and waits for it to clear. That flag is a guess, and waiting would
          // leave the spinner or the busy button up for ever; the request is attempted and its
          // failure is shown instead.
          queries: { retry: false, refetchOnWindowFocus: false, networkMode: 'always' },
          mutations: { networkMode: 'always' },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export { Providers };
