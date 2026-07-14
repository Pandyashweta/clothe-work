import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import './NotFound.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page main-content container flex-center animate-fade">
      <div className="not-found-card">
        <AlertTriangle size={48} className="error-icon" />
        <h1 className="error-code">404</h1>
        <h2 className="error-title">PAGE NOT FOUND</h2>
        <p className="error-description">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. 
          Double check the URL or return to our homepage to continue shopping.
        </p>
        <button className="back-home-btn" onClick={() => navigate('/')}>
          <Home size={16} /> RETURN TO HOMEPAGE
        </button>
      </div>
    </div>
  );
}
