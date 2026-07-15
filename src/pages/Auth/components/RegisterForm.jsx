import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, CheckSquare, Square } from 'lucide-react';

export default function RegisterForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newsletter, setNewsletter] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = email.replace(/[<>'"]/g, '').trim();
    const cleanPassword = password.replace(/[<>'"]/g, '').trim();
    const cleanFirstName = firstName.replace(/[<>'"\/\\&;$%]/g, '').trim();

    if (cleanEmail && cleanPassword && cleanFirstName) {
      onLogin(cleanEmail);
      navigate('/profile');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form animate-fade">
      <div className="form-row-double">
        <div className="form-input-group">
          <label>FIRST NAME</label>
          <input
            type="text"
            placeholder="FIRST NAME"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="form-input-group">
          <label>LAST NAME</label>
          <input
            type="text"
            placeholder="LAST NAME"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>

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
        <label>PASSWORD</label>
        <div className="input-with-icon">
          <Lock size={16} className="input-icon" />
          <input
            type="password"
            placeholder="CREATE PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="checkbox-row" onClick={() => setNewsletter(!newsletter)}>
        {newsletter ? <CheckSquare size={18} /> : <Square size={18} />}
        <span>SIGN UP FOR NEWSLETTER & LOYALTY UPDATES</span>
      </div>

      <button type="submit" className="submit-auth-btn">
        CREATE ACCOUNT
      </button>
    </form>
  );
}
