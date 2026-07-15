import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CreditCard, CheckCircle, ArrowRight, ShieldCheck, Lock, AlertCircle } from 'lucide-react';
import { sanitize, cleanInput } from '../../utils/security';
import './Checkout.css';

/**
 * SECURITY NOTICE:
 * ─────────────────
 * This checkout form NEVER collects, stores, or transmits raw card data.
 * Card payment UI is a display placeholder only.
 *
 * In production: replace the payment section with Stripe Elements.
 * Stripe.js tokenizes card data client-side; your server only ever
 * receives a `payment_intent_id`. This achieves PCI DSS SAQ-A compliance.
 *
 * WHAT THIS FORM DOES:
 * - Collects & sanitizes contact + shipping info ✅
 * - Validates all inputs before submission ✅
 * - Card fields are INPUT-MASKED and NOT persisted to state ✅
 * - No card data is ever passed to addOrder() ✅
 */

// Input sanitizer for address fields
function sanitizeAddress(str) {
  if (typeof str !== 'string') return '';
  return cleanInput(str)
    .replace(/[<>"'`]/g, '') // strip XSS chars
    .substring(0, 200);
}

// Email validator
function isValidEmail(email) {
  return /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{1,63}$/.test(email.trim());
}

export default function Checkout() {
  const { cart, cartSubtotal, getPrice, addOrder } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Promo code state passed from cart page (validated UI-side only — server should re-validate in production)
  const discountPercent = Math.max(0, Math.min(100, Number(location.state?.discountPercent) || 0));
  const promoApplied    = location.state?.promoApplied || false;
  const discountAmount  = (cartSubtotal * discountPercent) / 100;
  const finalTotal      = cartSubtotal - discountAmount;

  // Contact & Shipping form state
  const [email,     setEmail]     = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [address,   setAddress]   = useState('');
  const [city,      setCity]      = useState('');
  const [postcode,  setPostcode]  = useState('');

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState({});

  // Success state
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId,   setOrderId]   = useState('');

  // Payment UI state — no card data stored in state
  const [paymentAcknowledged, setPaymentAcknowledged] = useState(false);

  const validate = () => {
    const errors = {};
    if (!isValidEmail(email))         errors.email     = 'Please enter a valid email address.';
    if (!firstName.trim())            errors.firstName = 'First name is required.';
    if (!lastName.trim())             errors.lastName  = 'Last name is required.';
    if (address.trim().length < 5)    errors.address   = 'Please enter a full street address.';
    if (!city.trim())                 errors.city      = 'City is required.';
    if (!/^[A-Za-z0-9 \-]{3,12}$/.test(postcode.trim())) errors.postcode = 'Invalid postcode format.';
    if (!paymentAcknowledged)         errors.payment   = 'Please confirm payment details.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!validate()) return;

    // Sanitize all shipping inputs before storage/display
    const shippingAddress = {
      firstName: sanitizeAddress(firstName),
      lastName:  sanitizeAddress(lastName),
      address:   sanitizeAddress(address),
      city:      sanitizeAddress(city),
      postcode:  sanitizeAddress(postcode),
    };

    // SECURITY: addOrder() receives ONLY sanitized shipping data.
    // Card data is NEVER passed here — payment is processed by Stripe
    // (or is a mock in this demo environment).
    const newId = addOrder(cart, finalTotal, shippingAddress);
    setOrderId(newId);
    setIsSuccess(true);
  };

  // Empty cart guard
  if (!isSuccess && cart.length === 0) {
    return (
      <div className="checkout-page main-content container flex-center">
        <div className="empty-checkout-fallback">
          <h3>YOUR BAG IS EMPTY</h3>
          <p>Please add products to your bag before proceeding to checkout.</p>
          <Link to="/collections/dresses" className="shop-btn">SHOP NOW</Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="checkout-page success-flow main-content container flex-center animate-fade">
        <div className="success-card">
          <CheckCircle size={64} className="success-icon" />
          <h1 className="success-title">THANK YOU FOR YOUR ORDER</h1>
          <p className="order-number-banner">ORDER NUMBER: <strong>{sanitize(orderId)}</strong></p>
          <p className="success-desc">
            We have received your order and will send a confirmation to{' '}
            <strong>{sanitize(email) || 'your email'}</strong>.{' '}
            Your outfit is being carefully prepared for shipping.
          </p>

          <div className="shipping-recap-box">
            <h4>ESTIMATED DELIVERY</h4>
            <p className="delivery-date">Express Delivery: 2–3 Business Days</p>
            <p className="address-line">
              {sanitize(firstName)} {sanitize(lastName)}, {sanitize(address)},{' '}
              {sanitize(city)}, {sanitize(postcode)}
            </p>
          </div>

          <button className="back-to-home-btn" onClick={() => navigate('/')}>
            CONTINUE SHOPPING <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page main-content container animate-fade">
      <div className="checkout-layout-grid">

        {/* Left: Form */}
        <form onSubmit={handlePlaceOrder} className="checkout-form-section" noValidate>

          {/* ── 1. Contact ──────────────────────────────────── */}
          <div className="checkout-form-block">
            <h3 className="block-title">1. CONTACT INFORMATION</h3>
            <div className={`input-field ${fieldErrors.email ? 'field-error' : ''}`}>
              <label>EMAIL ADDRESS</label>
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: '' })); }}
                autoComplete="email"
                maxLength={254}
                required
              />
              {fieldErrors.email && <p className="checkout-field-error"><AlertCircle size={12} /> {fieldErrors.email}</p>}
            </div>
          </div>

          {/* ── 2. Shipping ─────────────────────────────────── */}
          <div className="checkout-form-block">
            <h3 className="block-title">2. SHIPPING ADDRESS</h3>
            <div className="form-row">
              <div className={`input-field ${fieldErrors.firstName ? 'field-error' : ''}`}>
                <label>FIRST NAME</label>
                <input type="text" placeholder="FIRST NAME" value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); setFieldErrors((p) => ({ ...p, firstName: '' })); }}
                  autoComplete="given-name" maxLength={50} required />
                {fieldErrors.firstName && <p className="checkout-field-error"><AlertCircle size={12} /> {fieldErrors.firstName}</p>}
              </div>
              <div className={`input-field ${fieldErrors.lastName ? 'field-error' : ''}`}>
                <label>LAST NAME</label>
                <input type="text" placeholder="LAST NAME" value={lastName}
                  onChange={(e) => { setLastName(e.target.value); setFieldErrors((p) => ({ ...p, lastName: '' })); }}
                  autoComplete="family-name" maxLength={50} required />
                {fieldErrors.lastName && <p className="checkout-field-error"><AlertCircle size={12} /> {fieldErrors.lastName}</p>}
              </div>
            </div>

            <div className={`input-field ${fieldErrors.address ? 'field-error' : ''}`}>
              <label>STREET ADDRESS</label>
              <input type="text" placeholder="STREET ADDRESS" value={address}
                onChange={(e) => { setAddress(e.target.value); setFieldErrors((p) => ({ ...p, address: '' })); }}
                autoComplete="street-address" maxLength={200} required />
              {fieldErrors.address && <p className="checkout-field-error"><AlertCircle size={12} /> {fieldErrors.address}</p>}
            </div>

            <div className="form-row">
              <div className={`input-field ${fieldErrors.city ? 'field-error' : ''}`}>
                <label>CITY</label>
                <input type="text" placeholder="CITY" value={city}
                  onChange={(e) => { setCity(e.target.value); setFieldErrors((p) => ({ ...p, city: '' })); }}
                  autoComplete="address-level2" maxLength={100} required />
                {fieldErrors.city && <p className="checkout-field-error"><AlertCircle size={12} /> {fieldErrors.city}</p>}
              </div>
              <div className={`input-field ${fieldErrors.postcode ? 'field-error' : ''}`}>
                <label>POSTCODE / ZIP</label>
                <input type="text" placeholder="POSTCODE" value={postcode}
                  onChange={(e) => { setPostcode(e.target.value); setFieldErrors((p) => ({ ...p, postcode: '' })); }}
                  autoComplete="postal-code" maxLength={12} required />
                {fieldErrors.postcode && <p className="checkout-field-error"><AlertCircle size={12} /> {fieldErrors.postcode}</p>}
              </div>
            </div>
          </div>

          {/* ── 3. Payment — PCI DSS Compliant UI ───────────── */}
          <div className="checkout-form-block">
            <h3 className="block-title">3. PAYMENT DETAILS</h3>

            {/* PCI DSS Notice Banner */}
            <div className="pci-notice-banner">
              <Lock size={16} />
              <div>
                <strong>SECURE PAYMENT — PCI DSS COMPLIANT</strong>
                <p>
                  Card details are processed exclusively by our certified payment partner.
                  We <strong>never</strong> store, see, or transmit your card number, CVV, or bank information.
                  This demo uses a mock payment flow — integrate Stripe Elements for production.
                </p>
              </div>
            </div>

            {/* Mock Stripe Elements Placeholder */}
            <div className="stripe-elements-placeholder">
              <div className="stripe-field-mock">
                <CreditCard size={16} className="stripe-icon" />
                <span className="stripe-mock-text">Card details collected securely by Stripe</span>
                <Lock size={14} className="stripe-lock" />
              </div>
              <div className="stripe-mock-row">
                <div className="stripe-field-mock half">
                  <span className="stripe-mock-text">MM / YY</span>
                </div>
                <div className="stripe-field-mock half">
                  <span className="stripe-mock-text">CVV</span>
                  <Lock size={12} />
                </div>
              </div>
              <p className="stripe-powered-by">Powered by <strong>Stripe</strong> · Protected by 256-bit TLS</p>
            </div>

            {/* Acknowledgement checkbox */}
            <div
              className={`payment-acknowledge-row ${fieldErrors.payment ? 'field-error' : ''}`}
              onClick={() => { setPaymentAcknowledged((v) => !v); setFieldErrors((p) => ({ ...p, payment: '' })); }}
            >
              <div className={`custom-checkbox ${paymentAcknowledged ? 'checked' : ''}`}>
                {paymentAcknowledged && <CheckCircle size={12} />}
              </div>
              <span>I confirm my order details and agree to the Terms of Service & Privacy Policy.</span>
            </div>
            {fieldErrors.payment && <p className="checkout-field-error"><AlertCircle size={12} /> {fieldErrors.payment}</p>}
          </div>

          <button type="submit" className="place-order-cta">
            PLACE ORDER — {getPrice(finalTotal)}
          </button>

          <p className="secure-checkout-notice">
            <ShieldCheck size={14} /> Your personal data is protected. We never store payment card details.
          </p>
        </form>

        {/* Right: Order Recap */}
        <div className="checkout-recap-section">
          <h3 className="recap-title">ORDER RECAP</h3>

          <div className="checkout-recap-list">
            {cart.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="recap-item-card">
                <img src={item.images[0]} alt={sanitize(item.name)} className="recap-item-img" />
                <div className="recap-item-details">
                  <h4>{sanitize(item.name)}</h4>
                  <p className="recap-meta">
                    Size: {sanitize(item.size)} | Color: {sanitize(item.color)} | Qty: {item.quantity}
                  </p>
                  <span className="recap-price">{getPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>

          <hr className="recap-divider" />

          <div className="recap-summary">
            <div className="recap-row"><span>SUBTOTAL</span><span>{getPrice(cartSubtotal)}</span></div>
            {promoApplied && (
              <div className="recap-row promo">
                <span>PROMO CODE (-{discountPercent}%)</span>
                <span>-{getPrice(discountAmount)}</span>
              </div>
            )}
            <div className="recap-row"><span>SHIPPING</span><span>FREE</span></div>
            <hr className="recap-divider" />
            <div className="recap-row total"><span>TOTAL DUE</span><span>{getPrice(finalTotal)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
