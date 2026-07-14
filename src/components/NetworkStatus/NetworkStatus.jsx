import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import './NetworkStatus.css';

export default function NetworkStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      setIsOffline(false);
    } else {
      // Flash the screen briefly to show click feedback
      const overlay = document.querySelector('.offline-overlay');
      if (overlay) {
        overlay.classList.add('flash-effect');
        setTimeout(() => overlay.classList.remove('flash-effect'), 300);
      }
    }
  };

  if (!isOffline) return null;

  return (
    <div className="offline-overlay">
      <div className="offline-card animate-fade">
        <WifiOff size={48} className="offline-icon" />
        <h2 className="offline-title">NO CONNECTION</h2>
        <p className="offline-desc">
          Your internet connection was lost. Please check your network cables, Wi-Fi status, or router and try again.
        </p>
        <div className="connection-loader">
          <div className="pulse-circle"></div>
          <span>WAITING FOR NETWORK...</span>
        </div>
        <button className="retry-btn" onClick={handleRetry}>
          <RefreshCw size={14} className="retry-spinner-icon" /> RETRY CONNECTION
        </button>
      </div>
    </div>
  );
}
