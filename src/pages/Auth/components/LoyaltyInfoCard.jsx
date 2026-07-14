import React from 'react';
import { Gift } from 'lucide-react';

export default function LoyaltyInfoCard() {
  return (
    <div className="loyalty-info-card">
      <div className="card-top">
        <Gift size={32} className="loyalty-icon" />
        <h2 className="loyalty-card-title">OH POLLY REWARDS</h2>
        <p className="loyalty-card-subtitle">GET REWARDED EVERY TIME YOU SHOP</p>
      </div>
      
      <div className="rewards-info-list">
        <div className="reward-bullet">
          <span className="bullet-num">1</span>
          <div>
            <h5>EARN POINTS</h5>
            <p>Earn 5 points for every $1 spent. Convert points into vouchers.</p>
          </div>
        </div>

        <div className="reward-bullet">
          <span className="bullet-num">2</span>
          <div>
            <h5>FREE EXCLUSIVE DROPS</h5>
            <p>Get early notifications and exclusive member-only collections.</p>
          </div>
        </div>

        <div className="reward-bullet">
          <span className="bullet-num">3</span>
          <div>
            <h5>BIRTHDAY GIFTS</h5>
            <p>Receive double points and special coupon vouchers on your birthday.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
