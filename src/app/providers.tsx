import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

/**
 * Wires the app's shared services. Each mount gets its own query client, so tests never share a
 * cache. Retries are off: a failed load shows its error and Retry button at once, and the person
 * decides when to try again (a hidden automatic retry would delay the message).
 */
export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
