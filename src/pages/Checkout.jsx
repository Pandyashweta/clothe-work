import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CreditCard, CheckCircle, ArrowRight, ShieldCheck, Mail, User as UserIcon } from 'lucide-react';
import './Checkout.css';

export default function Checkout() {
  const { cart, cartSubtotal, getPrice, addOrder } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve promo settings from cart page state
  const discountPercent = location.state?.discountPercent || 0;
  const promoApplied = location.state?.promoApplied || false;

  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const finalTotal = cartSubtotal - discountAmount;

  // Form States
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Success flow
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Sanitize contact and shipping inputs to prevent script injections
    const cleanFirstName = firstName.replace(/[<>'"/\\&;$%]/g, '').trim();
    const cleanLastName = lastName.replace(/[<>'"/\\&;$%]/g, '').trim();
    const cleanAddress = address.replace(/[<>'"/\\&;$%]/g, '').trim();
    const cleanCity = city.replace(/[<>'"/\\&;$%]/g, '').trim();
    const cleanPostcode = postcode.replace(/[<>'"/\\&;$%]/g, '').trim();

    // Trigger order creation in global state with sanitized data
    const addressObj = { 
      firstName: cleanFirstName, 
      lastName: cleanLastName, 
      address: cleanAddress, 
      city: cleanCity, 
      postcode: cleanPostcode 
    };
    const newId = addOrder(cart, finalTotal, addressObj);
    setOrderId(newId);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="checkout-page success-flow main-content container flex-center animate-fade">
        <div className="success-card">
          <CheckCircle size={64} className="success-icon" />
          <h1 className="success-title">THANK YOU FOR YOUR ORDER</h1>
          <p className="order-number-banner">ORDER NUMBER: <strong>{orderId}</strong></p>
          <p className="success-desc">
            We have received your order and sent a confirmation email to <strong>{email || 'customer@ohpolly.com'}</strong>.
            Your outfit is being carefully prepared for shipping.
          </p>

          <div className="shipping-recap-box">
            <h4>ESTIMATED DELIVERY</h4>
            <p className="delivery-date">Express Delivery: 2-3 Business Days</p>
            <p className="address-line">
              Delivering to: {firstName} {lastName}, {address}, {city}, {postcode}
            </p>
          </div>

          <button className="back-to-home-btn" onClick={() => navigate('/')}>
            CONTINUE SHOPPING <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // If cart is empty and not success, redirect to collections
  if (cart.length === 0) {
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

  return (
    <div className="checkout-page main-content container animate-fade">
      
      <div className="checkout-layout-grid">
        
        {/* Left Column: Form Details */}
        <form onSubmit={handlePlaceOrder} className="checkout-form-section">
          
          {/* Section: Contact */}
          <div className="checkout-form-block">
            <h3 className="block-title">1. CONTACT INFORMATION</h3>
            <div className="input-field">
              <label>EMAIL ADDRESS</label>
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Section: Shipping */}
          <div className="checkout-form-block">
            <h3 className="block-title">2. SHIPPING ADDRESS</h3>
            <div className="form-row">
              <div className="input-field">
                <label>FIRST NAME</label>
                <input 
                  type="text" 
                  placeholder="FIRST NAME" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="input-field">
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

            <div className="input-field">
              <label>STREET ADDRESS</label>
              <input 
                type="text" 
                placeholder="STREET ADDRESS" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="input-field">
                <label>CITY</label>
                <input 
                  type="text" 
                  placeholder="CITY" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div className="input-field">
                <label>POSTCODE / ZIP</label>
                <input 
                  type="text" 
                  placeholder="POSTCODE" 
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section: Payment */}
          <div className="checkout-form-block">
            <h3 className="block-title">3. PAYMENT DETAILS</h3>
            <div className="payment-type-selector">
              <div className="pay-option active">
                <CreditCard size={18} />
                <span>CREDIT CARD</span>
              </div>
            </div>

            <div className="input-field">
              <label>CARD NUMBER</label>
              <input 
                type="text" 
                placeholder="CARD NUMBER (16 DIGITS)" 
                value={cardNum}
                onChange={(e) => setCardNum(e.target.value)}
                maxLength={16}
                required
              />
            </div>

            <div className="form-row">
              <div className="input-field">
                <label>EXPIRY DATE</label>
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  value={cardExp}
                  onChange={(e) => setCardExp(e.target.value)}
                  maxLength={5}
                  required
                />
              </div>
              <div className="input-field">
                <label>SECURITY CODE (CVV)</label>
                <input 
                  type="password" 
                  placeholder="CVV" 
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  maxLength={3}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="place-order-cta">
            PLACE ORDER NOW ({getPrice(finalTotal)})
          </button>

          <p className="secure-checkout-notice">
            <ShieldCheck size={14} /> YOUR PAYMENT IS SECURED WITH END-TO-END 256-BIT ENCRYPTION.
          </p>

        </form>

        {/* Right Column: Order Recap */}
        <div className="checkout-recap-section">
          <h3 className="recap-title">ORDER RECAP</h3>
          
          <div className="checkout-recap-list">
            {cart.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="recap-item-card">
                <img src={item.images[0]} alt={item.name} className="recap-item-img" />
                <div className="recap-item-details">
                  <h4>{item.name}</h4>
                  <p className="recap-meta">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</p>
                  <span className="recap-price">{getPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
          </div>

          <hr className="recap-divider" />

          <div className="recap-summary">
            <div className="recap-row">
              <span>SUBTOTAL</span>
              <span>{getPrice(cartSubtotal)}</span>
            </div>
            
            {promoApplied && (
              <div className="recap-row promo">
                <span>PROMO CODE (-10%)</span>
                <span>-{getPrice(discountAmount)}</span>
              </div>
            )}

            <div className="recap-row">
              <span>SHIPPING</span>
              <span>FREE</span>
            </div>

            <hr className="recap-divider" />

            <div className="recap-row total">
              <span>TOTAL DUE</span>
              <span>{getPrice(finalTotal)}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
