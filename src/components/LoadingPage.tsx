import React from 'react';

const LoadingPage: React.FC = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'var(--background, #f9f9f9)'
  }}>
    <svg width="60" height="60" viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="20" fill="none" stroke="#0070f3" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite" />
      </circle>
    </svg>
    <h2 style={{ marginTop: 24, color: '#333' }}>Loading...</h2>
  </div>
);

export default LoadingPage;
