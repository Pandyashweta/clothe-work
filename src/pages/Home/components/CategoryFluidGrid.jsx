import React from 'react';

export default function CategoryFluidGrid({ onCategoryClick }) {
  return (
    <section className="categories-section-fluid">
      <div className="categories-grid-four">
        
        <div className="category-card-new" onClick={onCategoryClick}>
          <div className="category-img-wrapper">
            <img src="/images/products/product_dress1.png" alt="Co-Ords" className="category-img" />
          </div>
          <div className="category-label-overlay">
            <span>Co-Ords</span>
          </div>
        </div>

        <div className="category-card-new" onClick={onCategoryClick}>
          <div className="category-img-wrapper">
            <img src="/images/products/product_dress2.png" alt="Swim" className="category-img" />
          </div>
          <div className="category-label-overlay">
            <span>Swim</span>
          </div>
        </div>

        <div className="category-card-new" onClick={onCategoryClick}>
          <div className="category-img-wrapper">
            <img src="/images/products/product_dress4.png" alt="Pink Dresses" className="category-img" />
          </div>
          <div className="category-label-overlay">
            <span>Pink Dresses</span>
          </div>
        </div>

        <div className="category-card-new" onClick={onCategoryClick}>
          <div className="category-img-wrapper">
            <img src="/images/products/product_dress3.png" alt="Jumpsuits & Rompers" className="category-img" />
          </div>
          <div className="category-label-overlay">
            <span>Jumpsuits & Rompers</span>
          </div>
        </div>

      </div>
    </section>
  );
}
