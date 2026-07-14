import React from 'react';

export default function FilterBar({
  selectedSize, setSelectedSize,
  selectedColor, setSelectedColor,
  selectedPrice, setSelectedPrice,
  sortBy, setSortBy
}) {
  return (
    <div className="filters-bar">
      <div className="filter-group">
        {/* Size Filter */}
        <div className="filter-select-wrapper">
          <span className="filter-label">SIZE:</span>
          <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
            <option value="All">ALL SIZES</option>
            <option value="XXS">XXS</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>
        </div>

        {/* Color Filter */}
        <div className="filter-select-wrapper">
          <span className="filter-label">COLOR:</span>
          <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
            <option value="All">ALL COLORS</option>
            <option value="Chocolate">CHOCOLATE</option>
            <option value="Olive">OLIVE</option>
            <option value="Cream">CREAM</option>
            <option value="Blush Pink">BLUSH PINK</option>
          </select>
        </div>

        {/* Price Filter */}
        <div className="filter-select-wrapper">
          <span className="filter-label">PRICE:</span>
          <select value={selectedPrice} onChange={(e) => setSelectedPrice(e.target.value)}>
            <option value="All">ALL PRICES</option>
            <option value="under-80">UNDER $80</option>
            <option value="80-over">$80 AND OVER</option>
          </select>
        </div>
      </div>

      {/* Sort and Count */}
      <div className="sort-group">
        <div className="filter-select-wrapper">
          <span className="filter-label">SORT BY:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="Featured">FEATURED</option>
            <option value="price-asc">PRICE: LOW TO HIGH</option>
            <option value="price-desc">PRICE: HIGH TO LOW</option>
            <option value="rating">CUSTOMER RATING</option>
          </select>
        </div>
      </div>
    </div>
  );
}
