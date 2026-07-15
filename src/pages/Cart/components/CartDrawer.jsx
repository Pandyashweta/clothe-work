import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { products } from '../../../data/products';
import './CartDrawer.css';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    getPrice
  } = useApp();

  const navigate = useNavigate();

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isCartOpen]);

  // Find recommendations: products not in cart
  const recommendations = products.filter(
    (prod) => !cart.some((item) => item.id === prod.id)
  );

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleCartClick = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  return (
    <div className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}>
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <h3 className="drawer-title">YOUR BAG ({cart.reduce((a, b) => a + b.quantity, 0)})</h3>
          <button className="drawer-close-btn" onClick={() => setIsCartOpen(false)} aria-label="Close cart">
            <X size={22} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="empty-cart-view">
              <p className="empty-msg">YOUR BAG IS CURRENTLY EMPTY.</p>
              <button className="shop-all-btn" onClick={() => { setIsCartOpen(false); navigate('/collections/dresses'); }}>
                SHOP OUR LATEST DROPS
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="cart-item-card">
                  <img src={item.images[0]} alt={item.name} className="item-img" />
                  <div className="item-info">
                    <div className="item-header">
                      <h4 className="item-name">{item.name}</h4>
                      <button 
                        className="item-remove-btn"
                        onClick={() => removeFromCart(item.id, item.size, item.color)}
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="item-meta">Size: {item.size} | Color: {item.color}</p>
                    <div className="item-price-qty">
                      <div className="qty-controls">
                        <button onClick={() => updateQuantity(item.id, item.size, item.color, -1)}>
                          <Minus size={12} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.size, item.color, 1)}>
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="item-total-price">{getPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations / Cross-sells */}
          {recommendations.length > 0 && (
            <div className="cart-recommendations">
              <h4 className="recommendations-title">WE THINK YOU'LL LOVE</h4>
              <div className="recommendations-list">
                {recommendations.slice(0, 2).map((prod) => (
                  <div key={prod.id} className="recommendation-item">
                    <img src={prod.images[0]} alt={prod.name} className="rec-img" />
                    <div className="rec-info">
                      <h5 className="rec-name">{prod.name}</h5>
                      <span className="rec-price">{getPrice(prod.price)}</span>
                      <button 
                        className="rec-view-btn"
                        onClick={() => {
                          setIsCartOpen(false);
                          navigate(`/products/${prod.slug}`);
                        }}
                      >
                        VIEW DRESS
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="subtotal-row">
              <span>SUBTOTAL</span>
              <span className="subtotal-amount">{getPrice(cartSubtotal)}</span>
            </div>
            <p className="shipping-note">Taxes and shipping calculated at checkout.</p>
            
            <div className="drawer-cta-group">
              <button className="view-bag-btn" onClick={handleCartClick}>
                VIEW BAG
              </button>
              <button className="checkout-btn" onClick={handleCheckoutClick}>
                CHECKOUT NOW <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
