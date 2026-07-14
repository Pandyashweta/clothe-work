import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Gift, Lock, Mail, User as UserIcon, Calendar, CheckSquare, Square, LogOut } from 'lucide-react';
import './Login.css';

export default function Login() {
  const { user, login, logout, orders, getPrice } = useApp();
  const [activeTab, setActiveTab] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newsletter, setNewsletter] = useState(true);

  const navigate = useNavigate();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      login(email);
      navigate('/');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (email.trim() && password.trim() && firstName.trim()) {
      login(email);
      navigate('/');
    }
  };

  // If already logged in, show User Account dashboard
  if (user) {
    return (
      <div className="account-page main-content container">
        <div className="account-grid">
          
          {/* Account Detail Section */}
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
                  <button className="shop-now-btn" onClick={() => navigate('/collections/dresses')}>
                    START SHOPPING
                  </button>
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
          </div>

          {/* Loyalty Section */}
          <div className="loyalty-portal-card">
            <div className="loyalty-header">
              <Gift size={24} className="loyalty-icon" />
              <h3>OH POLLY REWARDS</h3>
            </div>
            
            <div className="points-balance-container">
              <span className="balance-label">YOUR POINTS BALANCE</span>
              <span className="points-count">{user.points} POINTS</span>
              <p className="points-value">Equivalent to {getPrice(user.points / 10)} in cash vouchers.</p>
            </div>

            <div className="loyalty-tiers">
              <h4 className="tiers-title">AVAILABLE REWARDS</h4>
              
              <div className="reward-tier-card claimed">
                <div className="reward-info">
                  <h5>$5 OFF VOUCHER</h5>
                  <p>Unlocked at 50 Points</p>
                </div>
                <button className="reward-action-btn claimed" disabled>UNLOCKED</button>
              </div>

              <div className="reward-tier-card claimed">
                <div className="reward-info">
                  <h5>$10 OFF VOUCHER</h5>
                  <p>Unlocked at 100 Points</p>
                </div>
                <button className="reward-action-btn claimed" disabled>UNLOCKED</button>
              </div>

              <div className="reward-tier-card locked">
                <div className="reward-info">
                  <h5>$20 OFF VOUCHER</h5>
                  <p>Unlocked at 200 Points</p>
                </div>
                <button className="reward-action-btn locked" disabled>NEED 50 PTS</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="login-page main-content container">
      <div className="login-grid">
        
        {/* Left Side: Login / Register Form */}
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
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="auth-form animate-fade">
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
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="auth-form animate-fade">
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
          )}
        </div>

        {/* Right Side: Loyalty Rewards Info Card */}
        <div className="loyalty-info-card">
          <div className="card-top">
            <Gift size={32} className="loyalty-icon" />
            <h2 className="loyalty-card-title">OH POLLY REWARDS</h2>
            <p className="loyalty-card-subtitle">GET REWARDED EVERY TIME YOU SHOP</p>
          </div>
          
          <div className="rewards-info-list">
            <div className="reward-bullet">
              <span className="bullet-num">1</span>
              <div>
                <h5>EARN POINTS</h5>
                <p>Earn 5 points for every $1 spent. Convert points into vouchers.</p>
              </div>
            </div>

            <div className="reward-bullet">
              <span className="bullet-num">2</span>
              <div>
                <h5>FREE EXCLUSIVE DROPS</h5>
                <p>Get early notifications and exclusive member-only collections.</p>
              </div>
            </div>

            <div className="reward-bullet">
              <span className="bullet-num">3</span>
              <div>
                <h5>BIRTHDAY GIFTS</h5>
                <p>Receive double points and special coupon vouchers on your birthday.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
