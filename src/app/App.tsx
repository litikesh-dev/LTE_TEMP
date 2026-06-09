import { lazy, Suspense } from 'react';
import { ErrorBoundary } from '@/app/providers/ErrorBoundary';
import { Login } from '@/pages/login';
import { isLoggedIn } from '@/shared/api/session';
import '@/shared/config/env'; // Fails fast if env vars are missing
import '@/app/styles/App.css';

// Lazy so the account-data bootstrap (top-level await in accountData.ts) only
// runs once the user is "logged in" — the login screen needs no account data.
const AppRouter = lazy(() =>
  import('@/app/providers/Router').then(m => ({ default: m.AppRouter }))
);

function App() {
  if (!isLoggedIn()) {
    return (
      <ErrorBoundary>
        <Login />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <AppRouter />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
