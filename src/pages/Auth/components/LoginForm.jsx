import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader, ShieldAlert } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import ForgotPasswordModal from '../../../components/ForgotPassword/ForgotPasswordModal';
import { safeRedirectPath } from '../../../utils/security';

export default function LoginForm() {
  const { loginWithCredentials, loginError, setLoginError, isLoggingIn, loginAttempts, getLockoutStatus } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Client-side validation errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Lockout countdown display (in seconds)
  const [lockCountdown, setLockCountdown] = useState(0);

  // Tick lockout countdown — getLockoutStatus returns remainingMs
  useEffect(() => {
    const { isLocked, remainingMs } = getLockoutStatus();
    if (isLocked && remainingMs > 0) {
      setLockCountdown(Math.ceil(remainingMs / 1000));
      const interval = setInterval(() => {
        const { isLocked: stillLocked, remainingMs: ms } = getLockoutStatus();
        if (!stillLocked) { clearInterval(interval); setLockCountdown(0); return; }
        setLockCountdown(Math.ceil(ms / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [loginAttempts, getLockoutStatus]);

  // Clear context error when user starts typing
  useEffect(() => {
    if (loginError) setLoginError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  const validateFields = () => {
    let valid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email address is required.'); valid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address.'); valid = false;
    } else {
      setEmailError('');
    }
    if (!password) {
      setPasswordError('Password is required.'); valid = false;
    } else {
      setPasswordError('');
    }
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    const { isLocked } = getLockoutStatus();
    if (isLocked) return;

    const result = await loginWithCredentials(email.trim(), password, rememberMe);
    if (result.success) {
      // Use safeRedirectPath to prevent open-redirect attacks
      const params = new URLSearchParams(location.search);
      const rawRedirect = params.get('redirect') || '';
      navigate(safeRedirectPath(rawRedirect) || '/profile', { replace: true });
    }
  };

  const { isLocked } = getLockoutStatus();
  const remainingAttempts = loginError?.remainingAttempts;
  const lockMins = Math.floor(lockCountdown / 60);
  const lockSecs = String(lockCountdown % 60).padStart(2, '0');

  return (
    <>
      <form onSubmit={handleSubmit} className="auth-form animate-fade" noValidate>

        {/* Lockout Banner */}
        {isLocked && lockCountdown > 0 && (
          <div className="auth-lockout-banner" role="alert">
            <ShieldAlert size={16} />
            <div>
              <strong>ACCOUNT TEMPORARILY LOCKED</strong>
              <p>Too many failed attempts. Try again in <strong>{lockMins}:{lockSecs}</strong>.</p>
            </div>
          </div>
        )}

        {/* General error */}
        {loginError && !isLocked && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={14} />
            <div>
              <span>{loginError.message}</span>
              {remainingAttempts !== undefined && remainingAttempts <= 3 && (
                <p className="attempts-warn">
                  {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining before lockout.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Email */}
        <div className={`form-input-group ${emailError ? 'has-error' : ''}`}>
          <label htmlFor="login-email">EMAIL ADDRESS</label>
          <div className="input-with-icon">
            <Mail size={16} className="input-icon" />
            <input
              id="login-email"
              type="email"
              placeholder="ENTER YOUR EMAIL"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              autoComplete="email"
              disabled={isLocked || isLoggingIn}
              required
            />
          </div>
          {emailError && <p className="field-error-msg"><AlertCircle size={11} /> {emailError}</p>}
        </div>

        {/* Password */}
        <div className={`form-input-group ${passwordError ? 'has-error' : ''}`}>
          <div className="label-row">
            <label htmlFor="login-password">PASSWORD</label>
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => setShowForgotPassword(true)}
            >
              FORGOT PASSWORD?
            </button>
          </div>
          <div className="input-with-icon input-with-action">
            <Lock size={16} className="input-icon" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="ENTER YOUR PASSWORD"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
              autoComplete="current-password"
              disabled={isLocked || isLoggingIn}
              required
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {passwordError && <p className="field-error-msg"><AlertCircle size={11} /> {passwordError}</p>}
        </div>

        {/* Remember Me */}
        <div className="remember-me-row" onClick={() => setRememberMe(v => !v)}>
          <div className={`custom-checkbox ${rememberMe ? 'checked' : ''}`}>
            {rememberMe && <CheckCircle size={12} />}
          </div>
          <span>REMEMBER ME ON THIS DEVICE</span>
        </div>

        {/* Demo account hint */}
        <div className="demo-hint-box">
          <span>🔑</span>
          <p>Demo: <strong>demo@ohpolly.com</strong> / <strong>OhPolly@2026!</strong></p>
        </div>

        <button
          type="submit"
          className="submit-auth-btn"
          disabled={isLocked || isLoggingIn}
        >
          {isLoggingIn
            ? <><Loader size={14} className="spin-icon" /> SIGNING IN...</>
            : 'LOG IN'}
        </button>

        {/* Attempt counter */}
        {!isLocked && loginAttempts.count > 0 && (
          <p className="attempt-counter-text">
            Failed attempts: {loginAttempts.count} / {5}
          </p>
        )}

        <div className="social-logins">
          <p className="social-divider"><span>OR LOG IN WITH</span></p>
          <div className="social-buttons-row">
            <button type="button" className="social-btn social-btn--apple">
              <span className="social-icon-apple" /> APPLE
            </button>
            <button type="button" className="social-btn social-btn--google">
              <span className="social-icon-google" /> GOOGLE
            </button>
          </div>
        </div>
      </form>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </>
  );
}
