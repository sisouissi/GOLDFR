
import React from 'react';
import ReactDOM from 'react-dom/client';
import { COPDDecisionSupport } from './App'; // Changed to named import

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <COPDDecisionSupport />
  </React.StrictMode>
);