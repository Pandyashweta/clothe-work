import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader, User } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

// Password strength evaluation
function getPasswordStrength(pwd) {
  let score = 0;
  const checks = {
    length:    pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    number:    /\d/.test(pwd),
    special:   /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    long:      pwd.length >= 12,
  };
  Object.values(checks).forEach(v => { if (v) score++; });
  if (score <= 1) return { label: 'VERY WEAK', level: 1, color: '#e74c3c' };
  if (score === 2) return { label: 'WEAK',      level: 2, color: '#e67e22' };
  if (score === 3) return { label: 'FAIR',       level: 3, color: '#f1c40f' };
  if (score === 4) return { label: 'STRONG',     level: 4, color: '#27ae60' };
  return               { label: 'VERY STRONG', level: 5, color: '#1a8a50' };
}

export default function RegisterForm() {
  const { registerWithCredentials, login } = useApp();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [newsletter, setNewsletter] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Per-field errors
  const [errors, setErrors] = useState({});

  const strength = password ? getPasswordStrength(password) : null;

  const rules = [
    { id: 'length',    label: 'At least 8 characters',      met: password.length >= 8 },
    { id: 'uppercase', label: 'One uppercase letter (A-Z)',  met: /[A-Z]/.test(password) },
    { id: 'number',    label: 'One number (0-9)',            met: /\d/.test(password) },
    { id: 'special',   label: 'One special character (!@#…)',met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  const validate = () => {
    const e = {};
    if (!firstName.trim()) e.firstName = 'First name is required.';
    if (!lastName.trim())  e.lastName  = 'Last name is required.';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim())            e.email = 'Email is required.';
    else if (!emailRegex.test(email)) e.email = 'Please enter a valid email address.';

    if (!password) {
      e.password = 'Password is required.';
    } else if (strength && strength.level < 3) {
      e.password = 'Password is too weak. Please make it stronger.';
    }

    if (!confirm)            e.confirm = 'Please confirm your password.';
    else if (confirm !== password) e.confirm = 'Passwords do not match.';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setIsSubmitting(true);

    const result = await registerWithCredentials(email.trim(), password, firstName.trim(), lastName.trim());

    if (result && result.success) {
      navigate('/profile', { replace: true });
    } else {
      // Fallback: use legacy login if backend is offline
      if (result?.message?.includes('Connection')) {
        login(email.trim());
        navigate('/profile', { replace: true });
        return;
      }
      if (result?.error === 'EMAIL_EXISTS') {
        setErrors(prev => ({ ...prev, email: 'An account with this email already exists.' }));
      } else {
        setServerError(result?.message || 'Registration failed. Please try again.');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form animate-fade" noValidate>

      {serverError && (
        <div className="auth-error-banner" role="alert">
          <AlertCircle size={14} /> {serverError}
        </div>
      )}

      {/* Name row */}
      <div className="form-row-double">
        <div className={`form-input-group ${errors.firstName ? 'has-error' : ''}`}>
          <label htmlFor="reg-first">FIRST NAME</label>
          <div className="input-with-icon">
            <User size={16} className="input-icon" />
            <input
              id="reg-first"
              type="text"
              placeholder="FIRST NAME"
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); setErrors(p => ({...p, firstName: ''})); }}
              autoComplete="given-name"
            />
          </div>
          {errors.firstName && <p className="field-error-msg"><AlertCircle size={11} /> {errors.firstName}</p>}
        </div>

        <div className={`form-input-group ${errors.lastName ? 'has-error' : ''}`}>
          <label htmlFor="reg-last">LAST NAME</label>
          <div className="input-with-icon">
            <User size={16} className="input-icon" />
            <input
              id="reg-last"
              type="text"
              placeholder="LAST NAME"
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); setErrors(p => ({...p, lastName: ''})); }}
              autoComplete="family-name"
            />
          </div>
          {errors.lastName && <p className="field-error-msg"><AlertCircle size={11} /> {errors.lastName}</p>}
        </div>
      </div>

      {/* Email */}
      <div className={`form-input-group ${errors.email ? 'has-error' : ''}`}>
        <label htmlFor="reg-email">EMAIL ADDRESS</label>
        <div className="input-with-icon">
          <Mail size={16} className="input-icon" />
          <input
            id="reg-email"
            type="email"
            placeholder="ENTER YOUR EMAIL"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors(p => ({...p, email: ''})); }}
            autoComplete="email"
          />
        </div>
        {errors.email && <p className="field-error-msg"><AlertCircle size={11} /> {errors.email}</p>}
      </div>

      {/* Password */}
      <div className={`form-input-group ${errors.password ? 'has-error' : ''}`}>
        <label htmlFor="reg-password">CREATE PASSWORD</label>
        <div className="input-with-icon input-with-action">
          <Lock size={16} className="input-icon" />
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="CREATE A STRONG PASSWORD"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors(p => ({...p, password: ''})); }}
            autoComplete="new-password"
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

        {/* Strength meter */}
        {password && strength && (
          <div className="password-strength-container">
            <div className="strength-bar-track">
              {[1,2,3,4,5].map(i => (
                <div
                  key={i}
                  className="strength-bar-segment"
                  style={{ backgroundColor: i <= strength.level ? strength.color : '#e8e8e8' }}
                />
              ))}
            </div>
            <span className="strength-label" style={{ color: strength.color }}>
              {strength.label}
            </span>
          </div>
        )}

        {errors.password && <p className="field-error-msg"><AlertCircle size={11} /> {errors.password}</p>}

        {/* Rules checklist */}
        {password && (
          <ul className="password-rules-list">
            {rules.map(rule => (
              <li key={rule.id} className={`rule-item ${rule.met ? 'met' : 'unmet'}`}>
                <CheckCircle size={11} className="rule-icon" />
                {rule.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirm Password */}
      <div className={`form-input-group ${errors.confirm ? 'has-error' : ''}`}>
        <label htmlFor="reg-confirm">CONFIRM PASSWORD</label>
        <div className="input-with-icon input-with-action">
          <Lock size={16} className="input-icon" />
          <input
            id="reg-confirm"
            type={showConfirm ? 'text' : 'password'}
            placeholder="RE-ENTER YOUR PASSWORD"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setErrors(p => ({...p, confirm: ''})); }}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowConfirm(v => !v)}
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {/* Match indicator */}
        {confirm && password && (
          <p className={`match-indicator ${confirm === password ? 'match' : 'no-match'}`}>
            {confirm === password
              ? <><CheckCircle size={11} /> Passwords match</>
              : <><AlertCircle size={11} /> Passwords do not match</>}
          </p>
        )}

        {errors.confirm && <p className="field-error-msg"><AlertCircle size={11} /> {errors.confirm}</p>}
      </div>

      {/* Newsletter */}
      <div className="remember-me-row" onClick={() => setNewsletter(v => !v)}>
        <div className={`custom-checkbox ${newsletter ? 'checked' : ''}`}>
          {newsletter && <CheckCircle size={12} />}
        </div>
        <span>SIGN UP FOR NEWSLETTER & LOYALTY UPDATES</span>
      </div>

      <button type="submit" className="submit-auth-btn" disabled={isSubmitting}>
        {isSubmitting
          ? <><Loader size={14} className="spin-icon" /> CREATING ACCOUNT...</>
          : 'CREATE ACCOUNT'}
      </button>
    </form>
  );
}
