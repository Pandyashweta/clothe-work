import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ChevronUp, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './Footer.css';

export default function Footer() {
  const { user } = useApp();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setPhone('');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container">
        
        {/* Instagram Header (Top Center) */}
        <div className="footer-instagram-header">
          <a href="https://instagram.com/ohpolly" target="_blank" rel="noreferrer" className="instagram-link">
            Follow us on instagram @ohpolly
          </a>
        </div>

        <hr className="footer-divider" />

        {/* Footer Navigation Columns */}
        <div className="footer-grid">
          
          {/* Column 1: Information */}
          <div className="footer-col">
            <h4 className="footer-col-title">Information</h4>
            <ul className="footer-links">
              <li><Link to={user ? '/profile' : '/login'}>My Account</Link></li>
              <li><a href="#contact">Help & Contact</a></li>
              <li><Link to={user ? '/profile' : '/login'}>Rewards</Link></li>
              <li><a href="#delivery">Delivery Information</a></li>
              <li><a href="#size">Size Guide</a></li>
              <li><a href="#returns">Returns</a></li>
              <li><a href="#giftcards">Gift Cards</a></li>
            </ul>

            <div className="footer-extra-links">
              <a href="#track" className="extra-link track-order-link">
                <MapPin size={14} className="pin-icon" /> Track My Order
              </a>
              <a href="#privacy-settings" className="extra-link">
                Privacy Settings
              </a>
            </div>
          </div>

          {/* Column 2: About Oh Polly */}
          <div className="footer-col">
            <h4 className="footer-col-title">About Oh Polly</h4>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#sustainability">Sustainability</a></li>
              <li><a href="#rental">Rental</a></li>
              <li><a href="#preloved">Oh Polly Pre-Loved</a></li>
              <li><a href="#clothingbank">Online Clothing Bank</a></li>
              <li><a href="#slavery">Modern Slavery Statement</a></li>
              <li><a href="#genderpay">Gender Pay Gap Report</a></li>
            </ul>
          </div>

          {/* Column 3: T&Cs */}
          <div className="footer-col">
            <h4 className="footer-col-title">T&Cs</h4>
            <ul className="footer-links">
              <li><a href="#terms">Terms & Conditions</a></li>
              <li><a href="#yourdata">Your Data</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#klarna">Klarna Faq</a></li>
              <li><a href="#clearpay">Clearpay Faq</a></li>
              <li><a href="#promoterms">Promotion T&C's</a></li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Badges */}
          <div className="footer-col footer-newsletter-col">
            <p className="newsletter-text">
              The list everyone wants to be on. Sign up to get early access, VIP perks, and exclusive offers straight to your inbox.
            </p>
            
            <form className="footer-subscribe-form" onSubmit={handleSubmit}>
              {subscribed ? (
                <p className="subscribe-success-msg">THANK YOU! YOU'VE BEEN SUBSCRIBED.</p>
              ) : (
                <div className="subscribe-fields">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="subscribe-input"
                  />
                  <div className="phone-input-group">
                    <select 
                      value={countryCode} 
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="country-select"
                    >
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+61">+61</option>
                    </select>
                    <input 
                      type="tel" 
                      placeholder="Phone Number" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="phone-input"
                    />
                  </div>
                  <button type="submit" className="subscribe-submit-btn">
                    Subscribe
                  </button>
                </div>
              )}
            </form>

            {/* App Store Badges */}
            <div className="app-download-badges">
              <a href="#appstore" className="app-badge-link">
                <span className="badge-icon-apple"></span>
                <span className="badge-text">Download on the<br /><strong>App Store</strong></span>
              </a>
              <a href="#googleplay" className="app-badge-link">
                <span className="badge-icon-google"></span>
                <span className="badge-text">GET IT ON<br /><strong>Google Play</strong></span>
              </a>
            </div>



          </div>

        </div>

        <hr className="footer-divider" />

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="copyright-label">2015-2026 © Oh Polly Ltd. All rights reserved</p>
          
          {/* Scroll to Top Circle Button */}
          <button className="scroll-to-top-btn" onClick={scrollToTop} aria-label="Scroll to top">
            <ChevronUp size={16} />
          </button>
        </div>

      </div>

      {/* Floating Chat Support Widget (Bottom-Right) */}
      <div className="support-chat-widget-floating" onClick={() => alert("SUPPORT CHAT IS CURRENTLY OFFLINE. PLEASE SUBMIT AN EMAIL!")}>
        <MessageSquare size={20} className="chat-bubble-icon" />
      </div>
    </footer>
  );
}
