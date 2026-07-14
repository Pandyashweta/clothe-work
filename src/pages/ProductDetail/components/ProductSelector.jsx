import React from 'react';
import { Heart, Ruler } from 'lucide-react';

export default function ProductSelector({
  product,
  selectedColor, setSelectedColor,
  selectedSize, setSelectedSize,
  isWishlisted, toggleWishlist,
  isAdding, handleAddToBag,
  getPrice, setIsSizeGuideOpen
}) {
  return (
    <div className="info-section">
      <span className="brand-tag">OH POLLY</span>
      <div className="title-row">
        <h1 className="product-title">{product.name}</h1>
        <button 
          className="share-btn" 
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("PRODUCT LINK COPIED TO CLIPBOARD!");
          }}
          aria-label="Share product"
        >
          <Share2Icon size={18} />
        </button>
      </div>
      <p className="product-tagline">{product.tagline}</p>

      <div className="price-rating-row">
        <span className="product-price">{getPrice(product.price)}</span>
        <div className="rating-block">
          <span className="stars">★★★★★</span>
          <span className="count">({product.reviewCount} REVIEWS)</span>
        </div>
      </div>

      <hr className="detail-divider" />

      {/* Color Selection */}
      <div className="selector-group">
        <span className="selector-label">COLOR: <span className="selected-value">{selectedColor}</span></span>
        <div className="color-swatches">
          {product.colors.map((color) => (
            <button
              key={color}
              className={`color-swatch-btn ${selectedColor === color ? 'active' : ''}`}
              onClick={() => setSelectedColor(color)}
              style={{ 
                backgroundColor: 
                  color.toLowerCase() === 'chocolate' ? '#4a2c11' :
                  color.toLowerCase() === 'champagne' ? '#e3cfbb' :
                  color.toLowerCase() === 'noir' ? '#111111' :
                  color.toLowerCase() === 'olive' ? '#556b2f' :
                  color.toLowerCase() === 'cream' ? '#f5f2eb' :
                  color.toLowerCase() === 'black' ? '#000000' :
                  color.toLowerCase() === 'blush pink' ? '#ffd1dc' :
                  color.toLowerCase() === 'sage green' ? '#87a96b' : '#ffffff' 
              }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div className="selector-group">
        <div className="size-header-row">
          <span className="selector-label">SELECT SIZE: <span className="selected-value">{selectedSize || 'CHOOSE'}</span></span>
          <button className="size-guide-btn" onClick={() => setIsSizeGuideOpen(true)}>
            <Ruler size={14} /> SIZE GUIDE
          </button>
        </div>
        <div className="size-buttons-grid">
          {product.sizes.map((size) => (
            <button
              key={size}
              className={`size-btn ${selectedSize === size ? 'active' : ''}`}
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="cta-actions-group">
        <button 
          className={`add-to-bag-cta ${isAdding ? 'loading' : ''}`}
          onClick={handleAddToBag}
          disabled={isAdding}
        >
          {isAdding ? "ADDING TO BAG..." : "ADD TO BAG"}
        </button>
        <button 
          className={`wishlist-cta ${isWishlisted ? 'active' : ''}`}
          onClick={() => toggleWishlist(product)}
        >
          <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="payment-installments">
        <p>Or 4 interest-free payments of <strong>{getPrice(product.price / 4)}</strong> with <span>Klarna</span> or <span>Afterpay</span>.</p>
      </div>
    </div>
  );
}

// Inline helper Share2 icon
function Share2Icon({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
  );
}
