import React, { useState, useEffect } from 'react';
import './CookiePopup.css';

export default function CookiePopup() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('ohpolly_cookie_consent');
    if (!consent) {
      // Show popup after a short delay for smooth entrance
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('ohpolly_cookie_consent', 'accepted');
    setShowPopup(false);
  };

  const handleReject = () => {
    localStorage.setItem('ohpolly_cookie_consent', 'rejected');
    setShowPopup(false);
  };

  if (!showPopup) return null;

  return (
    <div className="cookie-popup-container">
      <div className="cookie-popup-card">
        <div className="cookie-text-content">
          <h4 className="cookie-title">YOUR PRIVACY MATTERS</h4>
          <p className="cookie-description">
            We use cookies to improve your experience, personalize advertisements and content, and analyze our traffic. 
            By clicking "ACCEPT ALL", you consent to our collection and usage of cookies in accordance with our Privacy Policy.
          </p>
        </div>
        <div className="cookie-actions-group">
          <button className="cookie-btn reject-btn" onClick={handleReject}>
            REJECT
          </button>
          <button className="cookie-btn accept-btn" onClick={handleAccept}>
            ACCEPT ALL
          </button>
        </div>
      </div>
    </div>
  );
}
