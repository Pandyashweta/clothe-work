import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function PromoBanner() {
  return (
    <section className="promo-banner">
      <div className="container promo-container">
        <div className="promo-text">
          <span className="promo-tag">EXCLUSIVE BENEFITS</span>
          <h3 className="promo-title">EARN DOUBLE POINTS ON THE NEW RESORT DROP</h3>
          <p className="promo-desc">
            Join Oh Polly Rewards and convert points into cash vouchers. Plus, get birthday gifts and VIP access.
          </p>
        </div>
        <Link to="/login" className="promo-cta-btn">
          JOIN NOW <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
