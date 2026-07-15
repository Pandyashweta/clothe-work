import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

// Subcomponents
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import LoyaltyInfoCard from './components/LoyaltyInfoCard';

import './Auth.css';

export default function Auth() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

  // If already logged in, redirect to profile page
  useEffect(() => {
    if (user) navigate('/profile', { replace: true });
  }, [user, navigate]);

  // Don't render while redirecting
  if (user) return null;

  return (
    <div className="auth-page main-content">
      <div className="auth-grid container">

        {/* Left Side: Login / Register Form Card */}
        <div className="form-card">
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              LOG IN
            </button>
            <button
              className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              CREATE ACCOUNT
            </button>
          </div>

          {activeTab === 'login' ? (
            <LoginForm />
          ) : (
            <RegisterForm />
          )}
        </div>

        {/* Right Side: Loyalty Rewards Info Card */}
        <LoyaltyInfoCard />

      </div>
    </div>
  );
}
