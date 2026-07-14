import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

// Subcomponents
import AccountDashboard from './components/AccountDashboard';
import LoyaltyPortal from './components/LoyaltyPortal';

import './Profile.css';

export default function Profile() {
  const { user, logout, orders, getPrice } = useApp();
  const navigate = useNavigate();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="account-page main-content container">
      <div className="account-grid">
        <AccountDashboard 
          user={user}
          orders={orders}
          getPrice={getPrice}
          logout={logout}
          onShopClick={() => navigate('/collections/dresses')}
        />
        
        <LoyaltyPortal 
          user={user}
          getPrice={getPrice}
        />
      </div>
    </div>
  );
}
