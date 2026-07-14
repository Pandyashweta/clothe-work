import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        
        {/* Newsletter Section */}
        <div className="newsletter-section">
          <div className="newsletter-text">
            <h3 className="newsletter-title">THE LIST EVERYONE WANTS TO BE ON</h3>
            <p className="newsletter-subtitle">
              Sign up for early access to collection drops, exclusive offers, and the latest trends.
            </p>
          </div>
          <form className="newsletter-form" onSubmit={handleSubmit}>
            {subscribed ? (
              <p className="subscription-success">THANK YOU! YOU'VE BEEN ADDED TO THE LIST.</p>
            ) : (
              <div className="input-group">
                <input 
                  type="email" 
                  placeholder="ENTER YOUR EMAIL ADDRESS" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-btn" aria-label="Subscribe">
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </form>
        </div>

        <hr className="footer-divider" />

        {/* Footer Navigation Columns */}
        <div className="footer-grid">
          
          <div className="footer-col">
            <h4 className="footer-col-title">HELP & INFO</h4>
            <ul className="footer-links">
              <li><a href="#track">TRACK ORDER</a></li>
              <li><a href="#delivery">DELIVERY INFORMATION</a></li>
              <li><a href="#returns">RETURNS & EXCHANGES</a></li>
              <li><a href="#size">SIZE GUIDE</a></li>
              <li><a href="#contact">CONTACT US</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">ABOUT OH POLLY</h4>
            <ul className="footer-links">
              <li><a href="#about">OUR STORY</a></li>
              <li><a href="#sustainability">SUSTAINABILITY</a></li>
              <li><a href="#careers">CAREERS</a></li>
              <li><a href="#student">STUDENT DISCOUNT</a></li>
              <li><a href="#affiliate">AFFILIATE PROGRAM</a></li>
              <li><a href="#rental">OH POLLY RENTAL</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">LEGAL</h4>
            <ul className="footer-links">
              <li><a href="#terms">TERMS & CONDITIONS</a></li>
              <li><a href="#privacy">PRIVACY POLICY</a></li>
              <li><a href="#cookies">COOKIE POLICY</a></li>
              <li><a href="#accessibility">ACCESSIBILITY</a></li>
              <li><a href="#promo">PROMOTION T&CS</a></li>
            </ul>
          </div>

          <div className="footer-col footer-socials-col">
            <h4 className="footer-col-title">CONNECT WITH US</h4>
            <p className="socials-text">Follow us on social for behind-the-scenes content and style inspo.</p>
            <div className="social-icons">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="social-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="social-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="Youtube" className="social-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/><path d="m10 15 5-3-5-3v6z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="social-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            </div>
            <div className="loyalty-badge">
              <p className="loyalty-title">OH POLLY REWARDS</p>
              <p className="loyalty-desc">Join now and earn points every time you shop.</p>
              <a href="#loyalty" className="loyalty-link">LEARN MORE</a>
            </div>
          </div>

        </div>

        <hr className="footer-divider" />

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="copyright">© 2026 OH POLLY LTD. ALL RIGHTS RESERVED.</p>
          
          <div className="payment-icons">
            {/* Standard safe mock representation of accepted cards */}
            <span className="payment-card visa">VISA</span>
            <span className="payment-card mastercard">MASTERCARD</span>
            <span className="payment-card amex">AMEX</span>
            <span className="payment-card paypal">PAYPAL</span>
            <span className="payment-card klarna">KLARNA</span>
            <span className="payment-card afterpay">AFTERPAY</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
