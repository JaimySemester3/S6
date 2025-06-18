// react-frontend/src/components/ConsentPopup.jsx

import React from 'react';

export default function ConsentPopup({ onConsent, onReject }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h3>Consent Required</h3>
        <p>We use your data to provide this service. Do you consent?</p>
        <button
          onClick={onConsent}
          style={{ marginRight: '1rem' }}
        >
          ✅ I Consent
        </button>
        <button onClick={onReject}>❌ No, Log Me Out</button>
      </div>
    </div>
  );
}
