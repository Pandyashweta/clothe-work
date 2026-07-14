import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { products } from '../data/products';
import { ArrowRight, Heart } from 'lucide-react';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { getPrice, toggleWishlist, wishlist } = useApp();

  const handleShopClick = () => {
    navigate('/collections/dresses');
  };

  return (
    <div className="home-page main-content">
      
      {/* Hero Banner Section */}
      <section className="hero-banner" style={{ backgroundImage: "url('/images/hero_model.png')" }}>
        <div className="hero-overlay"></div>
        <div className="hero-content container">
          <h1 className="hero-title">THE RESORT COLLECTION</h1>
          <p className="hero-subtitle">ELEGANT SILHOUETTES DESIGNED TO CAPTIVATE</p>
          <button className="hero-cta-btn" onClick={handleShopClick}>
            SHOP THE DROP
          </button>
        </div>
      </section>

      {/* Category Section (4-column grid immediately below Hero) */}
      <section className="categories-section-fluid">
        <div className="categories-grid-four">
          
          <div className="category-card-new" onClick={handleShopClick}>
            <div className="category-img-wrapper">
              <img src="/images/product_dress1.png" alt="Co-Ords" className="category-img" />
            </div>
            <div className="category-label-overlay">
              <span>Co-Ords</span>
            </div>
          </div>

          <div className="category-card-new" onClick={handleShopClick}>
            <div className="category-img-wrapper">
              <img src="/images/product_dress2.png" alt="Swim" className="category-img" />
            </div>
            <div className="category-label-overlay">
              <span>Swim</span>
            </div>
          </div>

          <div className="category-card-new" onClick={handleShopClick}>
            <div className="category-img-wrapper">
              <img src="/images/product_dress4.png" alt="Pink Dresses" className="category-img" />
            </div>
            <div className="category-label-overlay">
              <span>Pink Dresses</span>
            </div>
          </div>

          <div className="category-card-new" onClick={handleShopClick}>
            <div className="category-img-wrapper">
              <img src="/images/product_dress3.png" alt="Jumpsuits & Rompers" className="category-img" />
            </div>
            <div className="category-label-overlay">
              <span>Jumpsuits & Rompers</span>
            </div>
          </div>

        </div>
      </section>

      {/* Loyalty Banner */}
      <section className="promo-banner">
        <div className="container promo-container">
          <div className="promo-text">
            <span className="promo-tag">EXCLUSIVE BENEFITS</span>
            <h3 className="promo-title">EARN DOUBLE POINTS ON THE NEW RESORT DROP</h3>
            <p className="promo-desc">
              Join Oh Polly Rewards and convert points into cash vouchers. Plus, get birthday gifts and VIP access.
            </p>
          </div>
          <Link to="/login" className="promo-cta-btn">
            JOIN NOW <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Trending Now Section */}
      <section className="trending-section container">
        <div className="section-header">
          <h2 className="section-title">TRENDING NOW</h2>
          <Link to="/collections/dresses" className="view-all-link">
            VIEW ALL DRESSES <ArrowRight size={14} />
          </Link>
        </div>

        <div className="product-grid">
          {products.slice(0, 4).map((product) => {
            const isWishlisted = wishlist.some((item) => item.id === product.id);
            return (
              <div 
                key={product.id} 
                className="product-card"
                onClick={() => navigate(`/products/${product.slug}`)}
              >
                <div className="product-img-container">
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="product-card-img" 
                  />
                  
                  {/* Quick Add Overlay */}
                  <div className="product-card-overlay">
                    <span className="quick-buy-text">QUICK VIEW</span>
                  </div>

                  {/* Wishlist Button */}
                  <button 
                    className={`wishlist-card-btn ${isWishlisted ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                    aria-label="Add to wishlist"
                  >
                    <Heart size={18} fill={isWishlisted ? "var(--color-black)" : "none"} />
                  </button>
                </div>

                <div className="product-card-details">
                  <span className="product-card-brand">OH POLLY</span>
                  <h3 className="product-card-title">{product.name}</h3>
                  <p className="product-card-tagline">{product.tagline}</p>
                  <p className="product-card-price">{getPrice(product.price)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Style Inspiration Grid (Static Banner) */}
      <section className="inspire-section container">
        <div className="inspire-banner">
          <div className="inspire-content">
            <h3 className="inspire-title">DOWNLOAD THE APP</h3>
            <p className="inspire-desc">Enjoy app-only drops, faster checkout, and exclusive discounts.</p>
            <div className="app-buttons">
              <a href="#ios" className="app-btn">APP STORE</a>
              <a href="#android" className="app-btn">GOOGLE PLAY</a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
