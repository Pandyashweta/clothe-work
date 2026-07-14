import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = email.replace(/[<>'"]/g, '').trim();
    const cleanPassword = password.replace(/[<>'"]/g, '').trim();
    if (cleanEmail && cleanPassword) {
      onLogin(cleanEmail);
      navigate('/profile');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form animate-fade">
      <div className="form-input-group">
        <label>EMAIL ADDRESS</label>
        <div className="input-with-icon">
          <Mail size={16} className="input-icon" />
          <input
            type="email"
            placeholder="ENTER YOUR EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-input-group">
        <div className="label-row">
          <label>PASSWORD</label>
          <a href="#forgot" className="forgot-password-link">FORGOT PASSWORD?</a>
        </div>
        <div className="input-with-icon">
          <Lock size={16} className="input-icon" />
          <input
            type="password"
            placeholder="ENTER YOUR PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>

      <button type="submit" className="submit-auth-btn">
        LOG IN
      </button>

      <div className="social-logins">
        <p className="social-divider"><span>OR LOG IN WITH</span></p>
        <div className="social-buttons-row">
          <button type="button" className="social-btn">APPLE</button>
          <button type="button" className="social-btn">GOOGLE</button>
        </div>
      </div>
    </form>
  );
}
