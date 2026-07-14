import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Minus, Plus, Trash2, ArrowRight, Tag } from 'lucide-react';
import './Cart.css';

export default function Cart() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    getPrice
  } = useApp();

  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'OHPOLLY10') {
      setPromoApplied(true);
      setDiscountPercent(10);
      setPromoError('');
    } else {
      setPromoError('INVALID PROMO CODE. TRY "OHPOLLY10"');
      setPromoApplied(false);
      setDiscountPercent(0);
    }
  };

  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const finalTotal = cartSubtotal - discountAmount;

  const handleCheckoutClick = () => {
    navigate('/checkout', { state: { discountPercent, promoApplied } });
  };

  return (
    <div className="cart-page main-content container animate-fade">
      
      {/* Title */}
      <h1 className="cart-page-title">YOUR BAG</h1>

      {cart.length === 0 ? (
        <div className="cart-empty-state">
          <p>YOUR BAG IS CURRENTLY EMPTY.</p>
          <p className="empty-subtext">Add items to your bag to start building your dream outfits.</p>
          <Link to="/collections/dresses" className="continue-shopping-cta">
            CONTINUE SHOPPING
          </Link>
        </div>
      ) : (
        <div className="cart-layout-grid">
          
          {/* Left Column: Cart Items */}
          <div className="cart-items-section">
            <div className="cart-table-header">
              <span className="col-prod">PRODUCT</span>
              <span className="col-qty">QUANTITY</span>
              <span className="col-price">TOTAL</span>
            </div>

            <div className="cart-items-body">
              {cart.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="cart-item-row">
                  
                  {/* Product Details */}
                  <div className="col-prod prod-details-cell">
                    <img src={item.images[0]} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-details">
                      <span className="cart-brand">OH POLLY</span>
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-meta">Size: {item.size} | Color: {item.color}</p>
                      <button 
                        className="cart-item-remove-btn"
                        onClick={() => removeFromCart(item.id, item.size, item.color)}
                      >
                        <Trash2 size={14} /> REMOVE
                      </button>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="col-qty qty-cell">
                    <div className="qty-controls">
                      <button onClick={() => updateQuantity(item.id, item.size, item.color, -1)}>
                        <Minus size={12} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.size, item.color, 1)}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="col-price price-cell">
                    <span className="cart-item-total">{getPrice(item.price * item.quantity)}</span>
                  </div>

                </div>
              ))}
            </div>

            <div className="cart-footer-actions">
              <Link to="/collections/dresses" className="back-to-shop-btn">
                ← CONTINUE SHOPPING
              </Link>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="order-summary-section">
            <h3 className="summary-title">ORDER SUMMARY</h3>
            
            <div className="summary-rows">
              <div className="summary-row">
                <span>SUBTOTAL</span>
                <span>{getPrice(cartSubtotal)}</span>
              </div>

              {promoApplied && (
                <div className="summary-row promo-row">
                  <span className="promo-tag-text"><Tag size={12} /> OHPOLLY10 (-10%)</span>
                  <span>-{getPrice(discountAmount)}</span>
                </div>
              )}

              <div className="summary-row">
                <span>SHIPPING</span>
                <span>FREE (EXPRESS)</span>
              </div>

              <hr className="summary-divider" />

              <div className="summary-row total-row">
                <span>TOTAL</span>
                <span className="total-amount">{getPrice(finalTotal)}</span>
              </div>
            </div>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="promo-form">
              <div className="promo-input-group">
                <input 
                  type="text" 
                  placeholder="PROMO CODE" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="promo-input"
                  disabled={promoApplied}
                />
                <button type="submit" className="promo-apply-btn" disabled={promoApplied}>
                  {promoApplied ? "APPLIED" : "APPLY"}
                </button>
              </div>
              {promoError && <p className="promo-error-msg">{promoError}</p>}
              {!promoApplied && <p className="promo-hint-msg">Try code "OHPOLLY10" for 10% off.</p>}
            </form>

            <button className="proceed-to-checkout-btn" onClick={handleCheckoutClick}>
              PROCEED TO CHECKOUT <ArrowRight size={16} />
            </button>

            <div className="security-badges-note">
              <p>🔒 SECURE CHECKOUT SHIELD</p>
              <p className="subtext">We accept Visa, Mastercard, American Express, Apple Pay, Klarna, and Afterpay.</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
