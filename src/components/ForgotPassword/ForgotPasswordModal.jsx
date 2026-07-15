import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './ForgotPasswordModal.css';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const { requestPasswordReset } = useApp();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (val) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(val.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Please enter your email address.');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    const result = await requestPasswordReset(email);

    if (result && result.success) {
      setStatus('success');
    } else {
      setStatus('error');
      setMessage(result?.message || 'Something went wrong. Please try again.');
    }
  };

  const handleClose = () => {
    setEmail('');
    setStatus('idle');
    setMessage('');
    setEmailError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fp-overlay" onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="fp-title">
      <div className="fp-modal" onClick={(e) => e.stopPropagation()}>
        {/* Back / Close */}
        <button className="fp-back-btn" onClick={handleClose} aria-label="Close">
          <ArrowLeft size={16} /> BACK TO LOGIN
        </button>

        {status === 'success' ? (
          <div className="fp-success-state">
            <div className="fp-success-icon-wrap">
              <CheckCircle size={48} className="fp-check-icon" />
            </div>
            <h2 className="fp-title">CHECK YOUR INBOX</h2>
            <p className="fp-desc">
              If <strong>{email}</strong> is linked to an Oh Polly account, you'll receive a password reset link within a few minutes.
            </p>
            <p className="fp-small-note">Didn't receive it? Check your spam folder or try again.</p>
            <button className="fp-resend-btn" onClick={() => { setStatus('idle'); }}>
              TRY A DIFFERENT EMAIL
            </button>
          </div>
        ) : (
          <>
            <div className="fp-icon-wrap">
              <Mail size={32} className="fp-mail-icon" />
            </div>
            <h2 id="fp-title" className="fp-title">FORGOT YOUR PASSWORD?</h2>
            <p className="fp-desc">
              Enter your account email address and we'll send you a secure link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="fp-form" noValidate>
              <div className={`fp-input-group ${emailError ? 'has-error' : ''}`}>
                <label htmlFor="fp-email">EMAIL ADDRESS</label>
                <div className="fp-input-wrapper">
                  <Mail size={16} className="fp-input-icon" />
                  <input
                    id="fp-email"
                    type="email"
                    placeholder="YOUR EMAIL ADDRESS"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                    autoComplete="email"
                    disabled={status === 'loading'}
                  />
                </div>
                {emailError && (
                  <p className="fp-field-error">
                    <AlertCircle size={12} /> {emailError}
                  </p>
                )}
              </div>

              {status === 'error' && (
                <div className="fp-error-banner">
                  <AlertCircle size={14} /> {message}
                </div>
              )}

              <button
                type="submit"
                className="fp-submit-btn"
                disabled={status === 'loading'}
              >
                {status === 'loading'
                  ? <><Loader size={14} className="spin-icon" /> SENDING...</>
                  : 'SEND RESET LINK'}
              </button>
            </form>

            <p className="fp-security-note">
              🔒 For security, reset links expire after 15 minutes.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
