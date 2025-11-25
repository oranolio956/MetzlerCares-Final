import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Helper to show error
const showErrorOverlay = (title, message, stack) => {
  const existingError = document.getElementById('error-overlay');
  if (existingError) return;

  const errorDisplay = document.createElement('div');
  errorDisplay.id = 'error-overlay';
  errorDisplay.style.position = 'fixed';
  errorDisplay.style.top = '0';
  errorDisplay.style.left = '0';
  errorDisplay.style.width = '100%';
  errorDisplay.style.height = 'auto';
  errorDisplay.style.maxHeight = '50vh';
  errorDisplay.style.overflowY = 'auto';
  errorDisplay.style.background = '#FF8A75';
  errorDisplay.style.color = '#1A2A3A';
  errorDisplay.style.zIndex = '999999';
  errorDisplay.style.padding = '20px';
  errorDisplay.style.fontFamily = 'monospace';
  errorDisplay.style.fontWeight = 'bold';
  errorDisplay.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
  
  errorDisplay.innerHTML = `
    <h3 style="margin:0 0 10px 0;">⚠️ ${title}</h3>
    <div style="background: rgba(255,255,255,0.5); padding: 10px; border-radius: 8px; margin-bottom: 10px;">
      ${message}
    </div>
    ${stack ? `<pre style="font-size: 10px; opacity: 0.8; overflow-x: auto; background: rgba(0,0,0,0.1); padding: 10px; border-radius: 4px;">${stack}</pre>` : ''}
    <button onclick="document.getElementById('error-overlay').remove()" style="margin-top: 10px; padding: 5px 10px; background: #1A2A3A; color: white; border: none; border-radius: 4px; cursor: pointer;">Dismiss</button>
  `;
  
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
    <App />
  </React.StrictMode>
);