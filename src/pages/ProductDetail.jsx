import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { products } from '../data/products';
import { Heart, ChevronDown, ChevronUp, Share2, Ruler, HelpCircle } from 'lucide-react';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const { getPrice, addToCart, toggleWishlist, wishlist } = useApp();

  // Find product by slug
  const product = products.find((p) => p.slug === slug) || products[0];

  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState('');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState('description');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const isWishlisted = wishlist.some((item) => item.id === product.id);

  // Define multiple mock thumbnails for gallery using the same image
  const galleryImages = [
    product.images[0],
    product.images[0], // Mock second view (same image for fallback)
    product.images[0], // Mock detail view
  ];

  const handleAddToBag = () => {
    if (!selectedSize) {
      alert("PLEASE SELECT A SIZE");
      return;
    }
    
    setIsAdding(true);
    setTimeout(() => {
      addToCart(product, selectedSize, selectedColor);
      setIsAdding(false);
    }, 800); // Mock network latency
  };

  const toggleAccordion = (section) => {
    if (activeAccordion === section) {
      setActiveAccordion('');
    } else {
      setActiveAccordion(section);
    }
  };

  return (
    <div className="product-detail-page main-content container">
      
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <Link to="/">HOME</Link>
        <span className="separator">/</span>
        <Link to="/collections/dresses">DRESSES</Link>
        <span className="separator">/</span>
        <span className="current">{product.name}</span>
      </div>

      {/* Product View Split */}
      <div className="product-detail-grid">
        
        {/* Left Column: Gallery */}
        <div className="gallery-section">
          <div className="thumbnail-list">
            {galleryImages.map((img, index) => (
              <button 
                key={index} 
                className={`thumb-btn ${activeImageIndex === index ? 'active' : ''}`}
                onClick={() => setActiveImageIndex(index)}
              >
                <img src={img} alt={`${product.name} preview ${index + 1}`} />
              </button>
            ))}
          </div>
          <div className="main-image-wrapper">
            <img 
              src={galleryImages[activeImageIndex]} 
              alt={product.name} 
              className="main-detail-img" 
            />
          </div>
        </div>

        {/* Right Column: Info & Actions */}
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
              <Share2 size={18} />
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

          <hr className="detail-divider" />

          {/* Product Accordion */}
          <div className="detail-accordions">
            
            {/* Accordion Item: Description */}
            <div className="accordion-item">
              <button className="accordion-header" onClick={() => toggleAccordion('description')}>
                <span>DESCRIPTION</span>
                {activeAccordion === 'description' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeAccordion === 'description' && (
                <div className="accordion-body">
                  <p>{product.description}</p>
                </div>
              )}
            </div>

            {/* Accordion Item: Fit & Fabric */}
            <div className="accordion-item">
              <button className="accordion-header" onClick={() => toggleAccordion('fabric')}>
                <span>FABRIC & FIT DETAILS</span>
                {activeAccordion === 'fabric' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeAccordion === 'fabric' && (
                <div className="accordion-body">
                  <ul className="accordion-list">
                    {product.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                    <li>True to size fit. Designed to snatch curves.</li>
                    <li>Model is 5'7" and wearing size S.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Accordion Item: Delivery & Returns */}
            <div className="accordion-item">
              <button className="accordion-header" onClick={() => toggleAccordion('shipping')}>
                <span>DELIVERY & RETURNS</span>
                {activeAccordion === 'shipping' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeAccordion === 'shipping' && (
                <div className="accordion-body">
                  <p><strong>Next Day Delivery:</strong> Order before 8pm for UK Next Day Delivery.</p>
                  <p><strong>International Shipping:</strong> Express worldwide shipping available. Delivery in 3-5 business days.</p>
                  <p><strong>Returns:</strong> Return unused items in original packaging within 14 days of purchase. Sale items are store credit only.</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Size Guide Modal Popup */}
      {isSizeGuideOpen && (
        <div className="modal-overlay" onClick={() => setIsSizeGuideOpen(false)}>
          <div className="modal-content size-guide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>OH POLLY SIZE GUIDE</h3>
              <button className="modal-close-btn" onClick={() => setIsSizeGuideOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <table className="size-guide-table">
                <thead>
                  <tr>
                    <th>SIZE</th>
                    <th>BUST (INCHES)</th>
                    <th>WAIST (INCHES)</th>
                    <th>HIPS (INCHES)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>XXS (US 0)</td>
                    <td>30 - 31</td>
                    <td>22 - 23</td>
                    <td>32 - 33</td>
                  </tr>
                  <tr>
                    <td>XS (US 2)</td>
                    <td>32 - 33</td>
                    <td>24 - 25</td>
                    <td>34 - 35</td>
                  </tr>
                  <tr>
                    <td>S (US 4)</td>
                    <td>34 - 35</td>
                    <td>26 - 27</td>
                    <td>36 - 37</td>
                  </tr>
                  <tr>
                    <td>M (US 6)</td>
                    <td>36 - 37</td>
                    <td>28 - 29</td>
                    <td>38 - 39</td>
                  </tr>
                  <tr>
                    <td>L (US 8)</td>
                    <td>38 - 40</td>
                    <td>30 - 32</td>
                    <td>40 - 42</td>
                  </tr>
                  <tr>
                    <td>XL (US 10)</td>
                    <td>41 - 43</td>
                    <td>33 - 35</td>
                    <td>43 - 45</td>
                  </tr>
                </tbody>
              </table>
              <div className="modal-help-tip">
                <HelpCircle size={14} />
                <span>Sizes fit snug. If between sizes, we recommend ordering a size up.</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
