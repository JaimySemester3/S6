import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>📄 Privacy Policy</h1>
      <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '1.5rem' }}>Last updated: June 2025</p>

      <p style={{ marginBottom: '1rem' }}>
        We value your privacy and are committed to protecting your personal data. This Privacy Policy explains what
        information we collect, how we use it, and your rights under the General Data Protection Regulation (GDPR).
      </p>

      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '0.5rem' }}>🔍 What We Collect</h2>
      <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
        <li>Your name, email, and Auth0 user ID</li>
        <li>Your tweets created using this platform</li>
        <li>Your GDPR consent preferences</li>
      </ul>

      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '0.5rem' }}>🛡️ How We Use Your Data</h2>
      <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
        <li>To provide access to your account and platform features</li>
        <li>To display tweets on your profile and timeline</li>
        <li>To store and respect your consent preferences</li>
      </ul>

      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '0.5rem' }}>🔐 How We Protect Your Data</h2>
      <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
        <li>Authentication is secured using Auth0</li>
        <li>Data is securely stored and access is restricted</li>
      </ul>

      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '0.5rem' }}>⚙️ Your GDPR Rights</h2>
      <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
        <li>Access, update, or delete your personal data</li>
        <li>Withdraw consent at any time</li>
        <li>
          Manage your privacy settings in the GDPR setting page{' '}
        </li>
      </ul>

      <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginTop: '2rem', marginBottom: '0.5rem' }}>🧾 Cookies and Tracking</h2>
      <p style={{ marginBottom: '1rem' }}>
        We do not use third-party tracking or advertising cookies. Only essential cookies for login/session are used.
      </p>

    </div>
  );
}
