import React from 'react';

export default function ProductGallery({ product, galleryImages, activeImageIndex, setActiveImageIndex }) {
  return (
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
  );
}
