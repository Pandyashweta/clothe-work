import React, { useState } from 'react';
import { LogOut, Shield, Key, Clock, Fingerprint, Eye, EyeOff, CheckCircle, AlertCircle, Loader } from 'lucide-react';

function getPasswordStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) score++;
  if (pwd.length >= 12) score++;
  if (score <= 1) return { label: 'VERY WEAK', level: 1, color: '#e74c3c' };
  if (score === 2) return { label: 'WEAK', level: 2, color: '#e67e22' };
  if (score === 3) return { label: 'FAIR', level: 3, color: '#f1c40f' };
  if (score === 4) return { label: 'STRONG', level: 4, color: '#27ae60' };
  return { label: 'VERY STRONG', level: 5, color: '#1a8a50' };
}

export default function AccountDashboard({ user, orders, getPrice, logout, onShopClick }) {
  const [showSecurity, setShowSecurity] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwStatus, setPwStatus] = useState(null); // 'success' | 'error' | null
  const [pwMessage, setPwMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const strength = newPassword ? getPasswordStrength(newPassword) : null;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwStatus(null);
    if (!newPassword || !confirmPassword) {
      setPwStatus('error'); setPwMessage('Both fields are required.'); return;
    }
    if (newPassword !== confirmPassword) {
      setPwStatus('error'); setPwMessage('Passwords do not match.'); return;
    }
    if (strength && strength.level < 3) {
      setPwStatus('error'); setPwMessage('Password is too weak. Please choose a stronger one.'); return;
    }
    setIsSaving(true);
    // Simulate API call (in production, POST to /api/auth/change-password)
    await new Promise(r => setTimeout(r, 1200));
    setIsSaving(false);
    setPwStatus('success');
    setPwMessage('Password updated successfully.');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPwStatus(null), 4000);
  };

  const formatDate = (iso) => {
    if (!iso) return 'N/A';
    try { return new Date(iso).toLocaleString(); } catch { return 'N/A'; }
  };

  return (
    <div className="account-main">
      <div className="account-header-row">
        <div>
          <span className="welcome-tag">WELCOME BACK</span>
          <h1 className="account-user-name">{user.name.toUpperCase()}</h1>
        </div>
        <button onClick={logout} className="logout-btn">
          <LogOut size={16} /> LOG OUT
        </button>
      </div>

      {/* Order History */}
      <div className="orders-section">
        <h3 className="orders-title">ORDER HISTORY</h3>
        {orders.length === 0 ? (
          <div className="empty-orders-view">
            <p>YOU HAVE NOT PLACED ANY ORDERS YET.</p>
            <button className="shop-now-btn" onClick={onShopClick}>START SHOPPING</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-item-card">
                <div className="order-header">
                  <div>
                    <span className="order-id">ORDER {order.id}</span>
                    <span className="order-date">{order.date}</span>
                  </div>
                  <span className="order-status-badge">{order.status}</span>
                </div>
                <div className="order-products-summary">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-product-line">
                      <span>{item.name} ({item.size} / {item.color}) x {item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="order-footer">
                  <span>DELIVERING TO: {order.address.firstName} {order.address.lastName}</span>
                  <span className="order-total-amount">TOTAL: {getPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Security Section ─────────────────────────────────────────── */}
      <div className="security-section">
        <button
          className="security-section-toggle"
          onClick={() => setShowSecurity(v => !v)}
        >
          <div className="security-toggle-left">
            <Shield size={18} className="security-shield-icon" />
            <span>ACCOUNT SECURITY</span>
          </div>
          <span className="security-toggle-arrow">{showSecurity ? '▲' : '▼'}</span>
        </button>

        {showSecurity && (
          <div className="security-panel animate-fade">

            {/* Session info */}
            <div className="security-info-grid">
              <div className="security-info-card">
                <Fingerprint size={20} className="sec-card-icon" />
                <div>
                  <span className="sec-card-label">SESSION ID</span>
                  <span className="sec-card-value">{user.sessionId || 'N/A'}</span>
                </div>
              </div>
              <div className="security-info-card">
                <Clock size={20} className="sec-card-icon" />
                <div>
                  <span className="sec-card-label">LAST LOGIN</span>
                  <span className="sec-card-value">{formatDate(user.lastLogin)}</span>
                </div>
              </div>
              <div className="security-info-card">
                <Shield size={20} className="sec-card-icon active" />
                <div>
                  <span className="sec-card-label">SESSION STATUS</span>
                  <span className="sec-card-value sec-active">● ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Security tips */}
            <div className="security-tips">
              <h4 className="sec-tips-title"><Shield size={13} /> SECURITY TIPS</h4>
              <ul className="sec-tips-list">
                <li>Use a unique password not used on any other site.</li>
                <li>Enable two-factor authentication for extra security.</li>
                <li>Never share your password with anyone, including Oh Polly support.</li>
                <li>Log out from shared or public devices after shopping.</li>
              </ul>
            </div>

            {/* Change Password */}
            <div className="change-password-block">
              <h4 className="change-pw-title"><Key size={14} /> CHANGE PASSWORD</h4>
              <form onSubmit={handleChangePassword} className="change-pw-form" noValidate>
                <div className="cpw-field">
                  <label>NEW PASSWORD</label>
                  <div className="cpw-input-wrap">
                    <input
                      type={showNew ? 'text' : 'password'}
                      placeholder="NEW PASSWORD"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button type="button" className="cpw-eye-btn" onClick={() => setShowNew(v => !v)}>
                      {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {newPassword && strength && (
                    <div className="cpw-strength">
                      <div className="strength-bar-track">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className="strength-bar-segment"
                            style={{ backgroundColor: i <= strength.level ? strength.color : '#e8e8e8' }} />
                        ))}
                      </div>
                      <span style={{ color: strength.color, fontSize: '10px', fontWeight: 700 }}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div className="cpw-field">
                  <label>CONFIRM NEW PASSWORD</label>
                  <div className="cpw-input-wrap">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="CONFIRM NEW PASSWORD"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button type="button" className="cpw-eye-btn" onClick={() => setShowConfirm(v => !v)}>
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {confirmPassword && newPassword && (
                    <p className={`match-indicator ${confirmPassword === newPassword ? 'match' : 'no-match'}`}>
                      {confirmPassword === newPassword
                        ? <><CheckCircle size={11} /> Passwords match</>
                        : <><AlertCircle size={11} /> Passwords do not match</>}
                    </p>
                  )}
                </div>

                {pwStatus === 'error' && (
                  <div className="auth-error-banner">
                    <AlertCircle size={13} /> {pwMessage}
                  </div>
                )}
                {pwStatus === 'success' && (
                  <div className="auth-success-banner">
                    <CheckCircle size={13} /> {pwMessage}
                  </div>
                )}

                <button type="submit" className="cpw-submit-btn" disabled={isSaving}>
                  {isSaving
                    ? <><Loader size={13} className="spin-icon" /> UPDATING...</>
                    : <><Key size={13} /> UPDATE PASSWORD</>}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
