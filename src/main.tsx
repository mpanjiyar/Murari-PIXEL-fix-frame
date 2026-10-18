import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initClientErrorLogger } from './services/clientErrorLogger';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';

// Initialize real-time automated client runtime error monitoring for Firestore
initClientErrorLogger();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
);
