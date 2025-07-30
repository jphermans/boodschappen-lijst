import React from 'react';
import ReactDOM from 'react-dom/client';

// Simple test component to check if React renders
function TestApp() {
  return (
    <div style={{ padding: '20px', background: '#f0f0f0' }}>
      <h1>Test Render</h1>
      <p>If you see this, React is working</p>
    </div>
  );
}

// Test rendering without theme system
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);