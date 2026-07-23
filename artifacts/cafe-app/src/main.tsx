import { createRoot } from 'react-dom/client';
import { setAuthTokenGetter } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// Every API call goes through custom-fetch.ts, which — when this getter is
// registered — automatically attaches `Authorization: Bearer <token>`.
// Without this, admin-only endpoints (like requesting a storage upload URL)
// have no way to know the browser is logged in.
setAuthTokenGetter(() => localStorage.getItem('adminToken'));

createRoot(document.getElementById('root')!).render(<App />);
