import React, { useRef } from 'react';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';

export default function BestsellersCarousel({ products, wishlist, toggleWishlist, getPrice, onProductClick }) {
  const carouselRef = useRef(null);

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
    <section className="showcase-section">
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
                onClick={() => onProductClick(product.slug)}
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
  );
}
