import React from 'react';
import { Heart } from 'lucide-react';

export default function ProductGrid({
  filteredProducts,
  wishlist,
  toggleWishlist,
  getPrice,
  onProductClick,
  resetFilters
}) {
  if (filteredProducts.length === 0) {
    return (
      <div className="no-products-view">
        <h3>NO PRODUCTS MATCH YOUR FILTERS</h3>
        <p>Try resetting filters or searching with different parameters.</p>
        <button onClick={resetFilters} className="reset-btn">RESET ALL FILTERS</button>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {filteredProducts.map((product) => {
        const isWishlisted = wishlist.some((item) => item.id === product.id);
        return (
          <div 
            key={product.id} 
            className="product-card animate-fade"
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

            <div className="product-card-details">
              <span className="product-card-brand">OH POLLY</span>
              <h3 className="product-card-title">{product.name}</h3>
              <p className="product-card-tagline">{product.tagline}</p>
              <div className="product-card-footer-info">
                <span className="product-card-price">{getPrice(product.price)}</span>
                <span className="product-card-rating">★ {product.rating}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
