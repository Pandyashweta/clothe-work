import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import './SessionTimeoutModal.css';

export default function SessionTimeoutModal() {
  const { showSessionWarning, sessionExpiry, extendSession, logout } = useApp();
  const [countdown, setCountdown] = useState(120); // seconds

  useEffect(() => {
    if (!showSessionWarning || !sessionExpiry) return;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((sessionExpiry - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) logout();
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [showSessionWarning, sessionExpiry, logout]);

  if (!showSessionWarning) return null;

  const mins = Math.floor(countdown / 60);
  const secs = String(countdown % 60).padStart(2, '0');

  return (
    <div className="session-timeout-overlay" role="alertdialog" aria-modal="true" aria-labelledby="session-title">
      <div className="session-timeout-card">
        {/* Animated clock icon */}
        <div className="session-icon-wrapper">
          <Clock size={40} className="session-clock-icon" />
        </div>

        <h2 id="session-title" className="session-title">SESSION EXPIRING SOON</h2>
        <p className="session-desc">
          Your session is about to expire due to inactivity. You will be automatically logged out in:
        </p>

        {/* Countdown display */}
        <div className="session-countdown">
          <span className="countdown-number">{mins}:{secs}</span>
        </div>

        {/* Progress bar */}
        <div className="session-progress-track">
          <div
            className="session-progress-bar"
            style={{ width: `${(countdown / 120) * 100}%` }}
          />
        </div>

        <div className="session-actions">
          <button className="session-btn stay-btn" onClick={extendSession}>
            <RefreshCw size={14} /> STAY LOGGED IN
          </button>
          <button className="session-btn leave-btn" onClick={() => logout()}>
            <LogOut size={14} /> LOG OUT NOW
          </button>
        </div>
      </div>
    </div>
  );
}
