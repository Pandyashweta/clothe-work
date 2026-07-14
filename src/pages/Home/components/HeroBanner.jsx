import React from 'react';

export default function HeroBanner({ onShopClick }) {
  return (
    <section className="hero-banner" style={{ backgroundImage: "url('/images/ui/hero_model.png')" }}>
      <div className="hero-overlay"></div>
      <div className="hero-content container">
        <h1 className="hero-title">THE RESORT COLLECTION</h1>
        <p className="hero-subtitle">ELEGANT SILHOUETTES DESIGNED TO CAPTIVATE</p>
        <button className="hero-cta-btn" onClick={onShopClick}>
          SHOP THE DROP
        </button>
      </div>
    </section>
  );
}
