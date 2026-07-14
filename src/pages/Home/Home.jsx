import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { products } from '../../data/products';

// Subcomponents
import HeroBanner from './components/HeroBanner';
import CategoryFluidGrid from './components/CategoryFluidGrid';
import PromoBanner from './components/PromoBanner';
import BestsellersCarousel from './components/BestsellersCarousel';
import InstagramShowcase from './components/InstagramShowcase';
import InstagramModal from './components/InstagramModal';
import AppDownloadBanner from './components/AppDownloadBanner';

import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { getPrice, toggleWishlist, wishlist } = useApp();

  const [instagramFeed, setInstagramFeed] = useState([]);
  const [activeInstaPost, setActiveInstaPost] = useState(null);

  useEffect(() => {
    fetch('/api/instagram/feed')
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setInstagramFeed(data.data);
        }
      })
      .catch(err => console.error("Error fetching Instagram feed:", err));
  }, []);

  return (
    <div className="home-page main-content">
      <HeroBanner onShopClick={() => navigate('/collections/dresses')} />
      
      <CategoryFluidGrid onCategoryClick={() => navigate('/collections/dresses')} />
      
      <PromoBanner />
      
      <BestsellersCarousel 
        products={products}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        getPrice={getPrice}
        onProductClick={(slug) => navigate(`/products/${slug}`)}
      />
      
      <InstagramShowcase 
        instagramFeed={instagramFeed}
        onPostClick={setActiveInstaPost}
      />
      
      <InstagramModal 
        activeInstaPost={activeInstaPost}
        onClose={() => setActiveInstaPost(null)}
      />
      
      <AppDownloadBanner />
    </div>
  );
}
