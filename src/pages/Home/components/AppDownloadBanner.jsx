import React from 'react';

export default function AppDownloadBanner() {
  return (
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
  );
}
