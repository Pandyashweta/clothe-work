import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { products } from '../../data/products';

// Subcomponents
import FilterBar from './components/FilterBar';
import ActiveFilters from './components/ActiveFilters';
import ProductGrid from './components/ProductGrid';

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
      <FilterBar 
        selectedSize={selectedSize} setSelectedSize={setSelectedSize}
        selectedColor={selectedColor} setSelectedColor={setSelectedColor}
        selectedPrice={selectedPrice} setSelectedPrice={setSelectedPrice}
        sortBy={sortBy} setSortBy={setSortBy}
      />

      {/* Active filters display */}
      <ActiveFilters 
        selectedSize={selectedSize} setSelectedSize={setSelectedSize}
        selectedColor={selectedColor} setSelectedColor={setSelectedColor}
        selectedPrice={selectedPrice} setSelectedPrice={setSelectedPrice}
        resetFilters={resetFilters}
      />

      {/* Product Count indicator */}
      <p className="product-count-label">{filteredProducts.length} PRODUCTS FOUND</p>

      {/* Product Grid */}
      <ProductGrid 
        filteredProducts={filteredProducts}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        getPrice={getPrice}
        onProductClick={(slug) => navigate(`/products/${slug}`)}
        resetFilters={resetFilters}
      />

    </div>
  );
}
