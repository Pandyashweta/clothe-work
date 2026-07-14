import React from 'react';

export default function InstagramModal({ activeInstaPost, onClose }) {
  if (!activeInstaPost) return null;

  return (
    <div className="instagram-modal-overlay" onClick={onClose}>
      <div className="instagram-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="instagram-modal-close-btn" onClick={onClose}>×</button>
        <div className="instagram-modal-body">
          <div className="instagram-modal-media-wrapper">
            {activeInstaPost.media_type === 'VIDEO' ? (
              <video 
                src={activeInstaPost.media_url} 
                className="instagram-modal-video" 
                controls 
                autoPlay 
                loop 
                muted
              />
            ) : (
              <img 
                src={activeInstaPost.media_url} 
                alt="Instagram media" 
                className="instagram-modal-image" 
              />
            )}
          </div>
          <div className="instagram-modal-details">
            <div className="instagram-modal-header">
              <div className="instagram-avatar">
                <span>{activeInstaPost.username.substring(0, 2).toUpperCase()}</span>
              </div>
              <div className="instagram-meta">
                <span className="instagram-modal-username">@{activeInstaPost.username}</span>
                <span className="instagram-modal-time">
                  {new Date(activeInstaPost.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
            <hr className="instagram-modal-divider" />
            <div className="instagram-modal-caption-container">
              <p className="instagram-modal-caption">{activeInstaPost.caption}</p>
            </div>
            <div className="instagram-modal-footer">
              <div className="instagram-modal-stats">
                <span className="instagram-modal-likes-count">❤️ {activeInstaPost.likes ? activeInstaPost.likes.toLocaleString() : '1,200'} likes</span>
              </div>
              <a 
                href={activeInstaPost.permalink} 
                target="_blank" 
                rel="noreferrer" 
                className="instagram-view-btn"
              >
                View on Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
