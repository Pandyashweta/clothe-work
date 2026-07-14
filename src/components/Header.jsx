import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react';
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
    user,
    currencySymbol
  } = useApp();

  const [annIndex, setAnnIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Interaction states to control header transparency
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
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

  // Window click listener to reset the clicked header state when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setIsClicked(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const sanitizedQuery = searchQuery.replace(/[<>'"/\\&;$%]/g, '').trim();
    if (sanitizedQuery) {
      navigate(`/collections/dresses?search=${sanitizedQuery}`);
      setSearchQuery('');
    }
  };

  const showWhiteHeader = isScrolled || isHovered || isFocused || isClicked;

  return (
    <header 
      className={`header-wrapper ${showWhiteHeader ? 'white-bg' : ''} ${isScrolled ? 'scrolled' : ''}`}
      onClick={(e) => {
        setIsClicked(true);
        e.stopPropagation(); // Avoid triggering window's handleOutsideClick immediately
      }}
    >
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

          {/* Left-Aligned Cursive Logo */}
          <div className="header-logo-container">
            <Link to="/" className="header-logo-brand">
              <span className="logo-script">oh</span>
              <span className="logo-text">POLLY</span>
            </Link>
          </div>

          {/* Center Main Navigation List */}
          <nav className="desktop-nav">
            
            {/* Nav Item: New In (with Mega Menu) */}
            <div 
              className="nav-item-wrapper has-mega"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Link to="/collections/dresses" className="nav-link">New In</Link>
              
              {/* Mega Menu Dropdown */}
              <div className="mega-menu">
                <div className="container mega-menu-container">
                  <div className="mega-menu-grid">
                    
                    {/* Col 1 */}
                    <div className="mega-col">
                      <h4 className="mega-col-title">New In</h4>
                      <ul className="mega-links">
                        <li><Link to="/collections/dresses">View All</Link></li>
                        <li><Link to="/collections/dresses">New In This Month</Link></li>
                        <li><Link to="/collections/dresses">Bo+Tee New In</Link></li>
                      </ul>
                    </div>

                    {/* Col 2 */}
                    <div className="mega-col">
                      <h4 className="mega-col-title">Featured</h4>
                      <ul className="mega-links">
                        <li><Link to="/collections/dresses">Bestsellers</Link></li>
                        <li><Link to="/collections/dresses">Back In Stock</Link></li>
                        <li><Link to="/collections/dresses">Trending</Link></li>
                        <li><Link to="/login">Rental</Link></li>
                        <li><Link to="/collections/dresses">Pre-Order</Link></li>
                        <li><Link to="/collections/dresses">Oh Polly Pre-Loved</Link></li>
                      </ul>
                    </div>

                    {/* Col 3 */}
                    <div className="mega-col">
                      <h4 className="mega-col-title">Collections</h4>
                      <ul className="mega-links">
                        <li><Link to="/collections/dresses">Summer Reservations</Link></li>
                        <li><Link to="/collections/dresses">Eivissa</Link></li>
                        <li><Link to="/collections/dresses">Resort Nights</Link></li>
                        <li><Link to="/collections/dresses">Saltwater & Pearls</Link></li>
                        <li><Link to="/collections/dresses">Embellished Bloom</Link></li>
                      </ul>
                    </div>

                    {/* Col 4: Image Card */}
                    <div className="mega-col mega-img-col">
                      <div className="mega-image-card">
                        <img src="/images/product_dress4.png" alt="New Season Drop" />
                        <div className="mega-image-overlay">
                          <h5>New In</h5>
                          <Link to="/collections/dresses" className="shop-now-underline">Shop Now</Link>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Mega Menu Footer Sub-bar */}
                  <div className="mega-menu-footer">
                    <Link to="/collections/dresses" className="mega-footer-pink-btn">
                      Shop New In
                    </Link>
                    <div className="mega-footer-links">
                      <a href="#size">Size Guide</a>
                      <a href="#delivery">Delivery</a>
                      <a href="#returns">Returns</a>
                      <a href="#contact">Contact Us</a>
                      <a href="#faq">FAQ's</a>
                      <a href="#preloved">Oh Polly Pre-Loved</a>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <Link to="/collections/dresses" className="nav-link">Resort</Link>
            <Link to="/collections/dresses" className="nav-link">Dresses</Link>
            <Link to="/collections/dresses" className="nav-link">Occasion</Link>
            <Link to="/collections/dresses" className="nav-link">Clothing</Link>
            <Link to="/collections/dresses" className="nav-link">Shoes</Link>
            <Link to="/collections/dresses" className="nav-link">Swim</Link>
            <Link to="/collections/dresses" className="nav-link">Bo+Tee</Link>
            <Link to="/collections/dresses" className="nav-link sale-link">Sale</Link>
          </nav>

          {/* Right Utilities & Inline Search */}
          <div className="header-utilities">
            
            {/* Inline Search Bar */}
            <form onSubmit={handleSearchSubmit} className="inline-search-bar">
              <input 
                type="text" 
                placeholder="Try searching for... White Dresses"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              <button type="submit" aria-label="Search">
                <Search size={16} />
              </button>
            </form>

            {/* Account Icon */}
            <Link 
              to="/login" 
              className="utility-item icon-btn user-btn"
              aria-label="Account"
            >
              <User size={18} />
              {user && <span className="user-dot"></span>}
            </Link>

            {/* Wishlist Heart */}
            <Link 
              to="/login"
              className="utility-item icon-btn wishlist-btn"
              aria-label="Wishlist"
            >
              <Heart size={18} />
              {wishlist.length > 0 && (
                <span className="badge">{wishlist.length}</span>
              )}
            </Link>

            {/* Currency switcher: e.g. GBP/£ */}
            <div className="utility-item currency-selector">
              <span className="currency-label">{currency}/{currencySymbol}</span>
              <div className="currency-dropdown">
                <button onClick={() => setCurrency('USD')}>USD ($)</button>
                <button onClick={() => setCurrency('GBP')}>GBP (£)</button>
                <button onClick={() => setCurrency('EUR')}>EUR (€)</button>
                <button onClick={() => setCurrency('AUD')}>AUD (A$)</button>
              </div>
            </div>

            {/* Shopping Bag Trigger */}
            <button 
              className="utility-item icon-btn bag-btn" 
              onClick={() => setIsCartOpen(true)}
              aria-label="Open bag"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="badge">{cartCount}</span>
              )}
            </button>

          </div>
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
