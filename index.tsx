
console.log("index.tsx: Script execution started. Attempting to load React and App...");

import React from 'react';
import ReactDOM from 'react-dom/client';
import { COPDDecisionSupport } from './App'; // Path should be relative to index.tsx

console.log("index.tsx: React and COPDDecisionSupport imported. Looking for root element...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("index.tsx: Root element with ID 'root' not found in the DOM.");
  throw new Error("Could not find root element to mount to");
}

console.log("index.tsx: Root element found. Creating React root and rendering app...");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <COPDDecisionSupport />
  </React.StrictMode>
);

console.log("index.tsx: App rendering initiated.");
