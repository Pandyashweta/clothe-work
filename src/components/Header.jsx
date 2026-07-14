import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import './Header.css';

const announcements = [
  "FREE EXPRESS SHIPPING ON ORDERS OVER $150",
  "SHOP NOW, PAY LATER WITH KLARNA & AFTERPAY",
  "NEW SEASON RESORT COLLECTION HAS ARRIVED",
  "DOWNLOAD THE OH POLLY APP FOR 10% OFF YOUR FIRST ORDER"
];

export default function Header() {
  const {
    cartCount,
    wishlist,
    currency,
    setCurrency,
    setIsCartOpen,
    isSearchOpen,
    setIsSearchOpen,
    user
  } = useApp();

  const [annIndex, setAnnIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  
  const navigate = useNavigate();

  // Rotate announcement bar every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnnIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Monitor scroll to shrink header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/collections/dresses?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  return (
    <header className={`header-wrapper ${isScrolled ? 'scrolled' : ''}`}>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <p className="announcement-text">{announcements[annIndex]}</p>
      </div>

      {/* Main Header Container */}
      <div className="main-header">
        <div className="container header-container">
          
          {/* Mobile Menu Trigger */}
          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Left Menu Items (Desktop Only) */}
          <nav className="desktop-nav">
            <Link to="/" className="nav-link">HOME</Link>
            <Link to="/collections/dresses" className="nav-link">NEW IN</Link>
            <Link to="/collections/dresses" className="nav-link">DRESSES</Link>
            <Link to="/collections/dresses" className="nav-link">SWIM</Link>
            <Link to="/collections/dresses" className="nav-link sale-link">SALE</Link>
          </nav>

          {/* Centered Logo */}
          <div className="header-logo-container">
            <Link to="/" className="header-logo">
              OH POLLY
            </Link>
          </div>

          {/* Right Utilities */}
          <div className="header-utilities">
            
            {/* Currency Selector */}
            <div className="utility-item currency-selector">
              <span className="currency-label">{currency}</span>
              <ChevronDown size={12} className="chevron" />
              <div className="currency-dropdown">
                <button onClick={() => setCurrency('USD')}>USD ($)</button>
                <button onClick={() => setCurrency('GBP')}>GBP (£)</button>
                <button onClick={() => setCurrency('EUR')}>EUR (€)</button>
                <button onClick={() => setCurrency('AUD')}>AUD (A$)</button>
              </div>
            </div>

            {/* Search Toggle */}
            <button 
              className="utility-item icon-btn" 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Toggle search"
            >
              <Search size={20} />
            </button>

            {/* Account Link */}
            <Link 
              to="/login" 
              className="utility-item icon-btn user-btn"
              aria-label="Account"
            >
              <User size={20} />
              {user && <span className="user-dot"></span>}
            </Link>

            {/* Wishlist Link */}
            <Link 
              to="/login" // Direct to login/wishlist segment
              className="utility-item icon-btn wishlist-btn"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="badge">{wishlist.length}</span>
              )}
            </Link>

            {/* Shopping Bag Trigger */}
            <button 
              className="utility-item icon-btn bag-btn" 
              onClick={() => setIsCartOpen(true)}
              aria-label="Open bag"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="badge">{cartCount}</span>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* Slide-out Search Panel */}
      <div className={`search-panel ${isSearchOpen ? 'open' : ''}`}>
        <div className="container search-panel-container">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input 
              type="text" 
              placeholder="SEARCH FOR DRESSES, SWIMWEAR, CLOTHING..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              autoFocus={isSearchOpen}
            />
            <button type="submit" className="search-submit-btn">
              <Search size={20} />
            </button>
          </form>
          <button 
            className="search-close-btn" 
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <div className={`mobile-nav-drawer-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
        <div className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <h3 className="drawer-title">MENU</h3>
            <button className="close-btn" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={22} />
            </button>
          </div>
          <div className="drawer-links">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="drawer-link">HOME</Link>
            <Link to="/collections/dresses" onClick={() => setIsMobileMenuOpen(false)} className="drawer-link">NEW IN</Link>
            <Link to="/collections/dresses" onClick={() => setIsMobileMenuOpen(false)} className="drawer-link">DRESSES</Link>
            <Link to="/collections/dresses" onClick={() => setIsMobileMenuOpen(false)} className="drawer-link">SWIMWEAR</Link>
            <Link to="/collections/dresses" onClick={() => setIsMobileMenuOpen(false)} className="drawer-link sale-link">SALE</Link>
            <hr />
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="drawer-link drawer-secondary-link">MY ACCOUNT</Link>
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="drawer-link drawer-secondary-link">MY WISHLIST</Link>
          </div>
          <div className="drawer-footer">
            <p className="drawer-shipping-info">✈ FREE SHIPPING OVER $150</p>
          </div>
        </div>
      </div>
    </header>
  );
}
