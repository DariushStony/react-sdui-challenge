import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { startMocks } from './mocks/start';
import './ui/base.css';
import './ui/tokens.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element in index.html');

// The mock (when enabled) must be listening before the first request. If it cannot start, the app
// still mounts and says why.
void startMocks().then((mock) => {
  createRoot(root).render(
    <StrictMode>
      <App {...(mock.type === 'failed' ? { mockFailure: mock.reason } : {})} />
    </StrictMode>,
  );
});
