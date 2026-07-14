import React from 'react';

export default function InstagramShowcase({ instagramFeed, onPostClick }) {
  if (!instagramFeed || instagramFeed.length === 0) return null;

  return (
    <section className="instagram-showcase-section">
      <h2 className="instagram-section-title">Spotted: Irl Looks You Love</h2>
      <div className="instagram-marquee-container">
        <div className="instagram-marquee-content">
          {[...instagramFeed, ...instagramFeed, ...instagramFeed].map((post, idx) => (
            <div 
              key={`${post.id}-${idx}`} 
              className="instagram-post-card"
              onClick={() => onPostClick(post)}
            >
              <div className="instagram-img-wrapper">
                <img src={post.thumbnail_url || post.media_url} alt="Instagram look" className="instagram-img" />
                {post.media_type === 'VIDEO' && (
                  <div className="instagram-video-badge">
                    <span className="video-badge-icon">▶</span>
                  </div>
                )}
                <div className="instagram-post-overlay">
                  <span className="instagram-username">@{post.username}</span>
                  <span className="instagram-likes">❤️ {post.likes ? post.likes.toLocaleString() : '1,200'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
