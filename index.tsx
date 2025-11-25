
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { StoreProvider } from './context/StoreContext';

// Helper to show error
const showErrorOverlay = (title: string, message: string, stack?: string) => {
  // Prevent stacking
  if (document.getElementById('error-overlay')) return;

  const errorDisplay = document.createElement('div');
  errorDisplay.id = 'error-overlay';
  Object.assign(errorDisplay.style, {
    position: 'fixed', top: '0', left: '0', width: '100%', height: 'auto',
    maxHeight: '50vh', overflowY: 'auto', background: '#FF8A75', color: '#1A2A3A',
    zIndex: '999999', padding: '20px', fontFamily: 'monospace', fontWeight: 'bold',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
  });
  
  const h3 = document.createElement('h3');
  h3.textContent = `⚠️ ${title}`;
  h3.style.margin = '0 0 10px 0';
  errorDisplay.appendChild(h3);

  const msgDiv = document.createElement('div');
  msgDiv.textContent = message;
  Object.assign(msgDiv.style, {
    background: 'rgba(255,255,255,0.5)', padding: '10px',
    borderRadius: '8px', marginBottom: '10px'
  });
  errorDisplay.appendChild(msgDiv);

  if (stack) {
    const pre = document.createElement('pre');
    pre.textContent = stack;
    Object.assign(pre.style, {
      fontSize: '10px', opacity: '0.8', overflowX: 'auto',
      background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '4px'
    });
    errorDisplay.appendChild(pre);
  }

  const btn = document.createElement('button');
  btn.textContent = 'Dismiss';
  btn.onclick = () => errorDisplay.remove();
  Object.assign(btn.style, {
    marginTop: '10px', padding: '5px 10px', background: '#1A2A3A',
    color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
  });
  errorDisplay.appendChild(btn);
  
  document.body.appendChild(errorDisplay);
  console.error("Global Error Caught:", message, stack);
};

// Global Error Handler for debugging in browser environments
window.addEventListener('error', (event) => {
  showErrorOverlay('Uncaught Error Detected', event.message, event.error?.stack);
});

// Catch Async/Promise Errors
window.addEventListener('unhandledrejection', (event) => {
  showErrorOverlay('Unhandled Promise Rejection', event.reason?.message || 'Unknown Reason', event.reason?.stack);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>
);
