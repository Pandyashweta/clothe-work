import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { products } from '../data/products';
import { Heart } from 'lucide-react';
import './Collection.css';

export default function Collection() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getPrice, toggleWishlist, wishlist } = useApp();

  const searchQuery = searchParams.get('search') || '';

  // Filter States
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [sortBy, setSortBy] = useState('Featured');
  
  const [filteredProducts, setFilteredProducts] = useState(products);

  // Sync filters
  useEffect(() => {
    let result = [...products];

    // Apply search query if present
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply size filter
    if (selectedSize !== 'All') {
      result = result.filter((p) => p.sizes.includes(selectedSize));
    }

    // Apply color filter
    if (selectedColor !== 'All') {
      result = result.filter((p) => 
        p.colors.some(c => c.toLowerCase() === selectedColor.toLowerCase())
      );
    }

    // Apply price filter
    if (selectedPrice !== 'All') {
      if (selectedPrice === 'under-80') {
        result = result.filter((p) => p.price < 80);
      } else if (selectedPrice === '80-over') {
        result = result.filter((p) => p.price >= 80);
      }
    }

    // Apply sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedSize, selectedColor, selectedPrice, sortBy]);

  const resetFilters = () => {
    setSelectedSize('All');
    setSelectedColor('All');
    setSelectedPrice('All');
    setSortBy('Featured');
  };

  return (
    <div className="collection-page main-content container">
      
      {/* Page Header */}
      <div className="collection-header">
        <h1 className="collection-title">
          {searchQuery ? `Search Results for "${searchQuery}"` : "DRESSES"}
        </h1>
        <p className="collection-desc">
          Discover our curated collection of luxury satin, structured crepe, and fine knit dresses designed to capture attention and frame your curves. From jaw-dropping mini dresses to floor-sweeping backless maxis, find your new season favourite here.
        </p>
      </div>

      {/* Filters Bar */}
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

      {/* Active filters display */}
      {(selectedSize !== 'All' || selectedColor !== 'All' || selectedPrice !== 'All') && (
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
      )}

      {/* Product Count indicator */}
      <p className="product-count-label">{filteredProducts.length} PRODUCTS FOUND</p>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="no-products-view">
          <h3>NO PRODUCTS MATCH YOUR FILTERS</h3>
          <p>Try resetting filters or searching with different parameters.</p>
          <button onClick={resetFilters} className="reset-btn">RESET ALL FILTERS</button>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => {
            const isWishlisted = wishlist.some((item) => item.id === product.id);
            return (
              <div 
                key={product.id} 
                className="product-card animate-fade"
                onClick={() => navigate(`/products/${product.slug}`)}
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
      )}

    </div>
  );
}
