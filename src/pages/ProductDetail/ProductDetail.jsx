import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { products } from '../../data/products';

// Subcomponents
import ProductGallery from './components/ProductGallery';
import ProductSelector from './components/ProductSelector';
import ProductAccordions from './components/ProductAccordions';
import SizeGuideModal from './components/SizeGuideModal';

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
        <ProductGallery 
          product={product}
          galleryImages={galleryImages}
          activeImageIndex={activeImageIndex}
          setActiveImageIndex={setActiveImageIndex}
        />

        {/* Right Column: Info & Actions */}
        <div className="info-section">
          <ProductSelector 
            product={product}
            selectedColor={selectedColor} setSelectedColor={setSelectedColor}
            selectedSize={selectedSize} setSelectedSize={setSelectedSize}
            isWishlisted={isWishlisted} toggleWishlist={toggleWishlist}
            isAdding={isAdding} handleAddToBag={handleAddToBag}
            getPrice={getPrice} setIsSizeGuideOpen={setIsSizeGuideOpen}
          />

          <hr className="detail-divider" />

          {/* Product Accordion */}
          <ProductAccordions 
            product={product}
            activeAccordion={activeAccordion}
            toggleAccordion={toggleAccordion}
          />
        </div>

      </div>

      {/* Size Guide Modal Popup */}
      <SizeGuideModal 
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
      />

    </div>
  );
}
