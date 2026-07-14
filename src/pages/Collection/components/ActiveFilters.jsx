import React from 'react';

export default function ActiveFilters({
  selectedSize, setSelectedSize,
  selectedColor, setSelectedColor,
  selectedPrice, setSelectedPrice,
  resetFilters
}) {
  const hasActiveFilters = selectedSize !== 'All' || selectedColor !== 'All' || selectedPrice !== 'All';

  if (!hasActiveFilters) return null;

  return (
    <div className="active-filters-tags">
      {selectedSize !== 'All' && (
        <span className="filter-tag" onClick={() => setSelectedSize('All')}>Size: {selectedSize} ✕</span>
      )}
      {selectedColor !== 'All' && (
        <span className="filter-tag" onClick={() => setSelectedColor('All')}>Color: {selectedColor} ✕</span>
      )}
      {selectedPrice !== 'All' && (
        <span className="filter-tag" onClick={() => setSelectedPrice('All')}>
          Price: {selectedPrice === 'under-80' ? 'Under $80' : '$80 & Over'} ✕
        </span>
      )}
      <button className="clear-filters-btn" onClick={resetFilters}>CLEAR ALL</button>
    </div>
  );
}
