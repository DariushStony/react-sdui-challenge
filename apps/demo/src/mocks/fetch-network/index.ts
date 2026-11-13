import { FetchInterceptor } from '@mswjs/interceptors/fetch';
import { InterceptorSource, defineNetwork } from 'msw/experimental';
import { handlers } from '../handlers/handlers';

// The same handlers as the worker (browser/) and the tests (test/server), answered by wrapping
// fetch in the page instead of by a service worker. It is only the fallback for a browser that will
// not register one (ADR-0018), so it listens to fetch alone: that is all the API client uses.
const fetchNetwork = defineNetwork({
  sources: [new InterceptorSource({ interceptors: [new FetchInterceptor()] })],
  handlers,
  onUnhandledFrame: 'bypass',
});

export { fetchNetwork };
