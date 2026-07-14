import React, { useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { products } from '../data/products';
import { ArrowRight, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { getPrice, toggleWishlist, wishlist } = useApp();
  const carouselRef = useRef(null);

  const handleShopClick = () => {
    navigate('/collections/dresses');
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getSwatchHex = (col) => {
    const name = col.toLowerCase();
    if (name.includes('sky blue') || name.includes('aqua')) return '#add8e6';
    if (name.includes('pink') || name.includes('blush')) return '#f3ded7';
    if (name.includes('yellow')) return '#fbf4d9';
    if (name.includes('cream')) return '#f7f4ed';
    if (name.includes('chocolate')) return '#4a2c11';
    if (name.includes('olive')) return '#556b2f';
    if (name.includes('black') || name.includes('noir')) return '#111111';
    if (name.includes('sage')) return '#87a96b';
    return '#cccccc';
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

      {/* Showcase Showcase Bestsellers Carousel (Tabs style) */}
      <section className="showcase-section container">
        <div className="showcase-tabs-header">
          <button className="showcase-tab-btn active">Chosen For You</button>
          <button className="showcase-tab-btn">This Week's Bestsellers</button>
        </div>

        <div className="carousel-outer-wrapper">
          {/* Navigation Arrows */}
          <button className="carousel-nav-arrow left" onClick={() => scrollCarousel('left')} aria-label="Previous">
            <ChevronLeft size={20} />
          </button>
          <button className="carousel-nav-arrow right" onClick={() => scrollCarousel('right')} aria-label="Next">
            <ChevronRight size={20} />
          </button>

          {/* Carousel Scrollable List */}
          <div className="showcase-carousel" ref={carouselRef}>
            {products.map((product) => {
              const isWishlisted = wishlist.some((item) => item.id === product.id);
              return (
                <div 
                  key={product.id} 
                  className="showcase-product-card"
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

                  {/* Showcase Details below card */}
                  <div className="showcase-card-details">
                    <h3 className="showcase-card-title">{product.name}</h3>
                    <p className="showcase-card-tagline">{product.tagline}</p>
                    
                    {/* Color Swatches line */}
                    <div className="showcase-card-swatches-row">
                      <div className="swatch-dots-group">
                        {product.colors.slice(0, 2).map((col) => (
                          <span 
                            key={col} 
                            className="swatch-dot-circle" 
                            style={{ backgroundColor: getSwatchHex(col) }}
                          />
                        ))}
                      </div>
                      {product.colors.length > 2 && (
                        <span className="swatches-more-text">+{product.colors.length - 2} colours</span>
                      )}
                    </div>

                    <p className="showcase-card-price">{getPrice(product.price)}</p>
                    
                    {/* Review Ratings */}
                    <div className="showcase-card-rating">
                      <span className="stars-fill">★★★★★</span>
                      <span className="reviews-count-text">({product.reviewCount})</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
