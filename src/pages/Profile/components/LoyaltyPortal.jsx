import React from 'react';
import { Gift } from 'lucide-react';

export default function LoyaltyPortal({ user, getPrice }) {
  return (
    <div className="loyalty-portal-card">
      <div className="loyalty-header">
        <Gift size={24} className="loyalty-icon" />
        <h3>OH POLLY REWARDS</h3>
      </div>
      
      <div className="points-balance-container">
        <span className="balance-label">YOUR POINTS BALANCE</span>
        <span className="points-count">{user.points} POINTS</span>
        <p className="points-value">Equivalent to {getPrice(user.points / 10)} in cash vouchers.</p>
      </div>

      <div className="loyalty-tiers">
        <h4 className="tiers-title">AVAILABLE REWARDS</h4>
        
        <div className="reward-tier-card claimed">
          <div className="reward-info">
            <h5>$5 OFF VOUCHER</h5>
            <p>Unlocked at 50 Points</p>
          </div>
          <button className="reward-action-btn claimed" disabled>UNLOCKED</button>
        </div>

        <div className="reward-tier-card claimed">
          <div className="reward-info">
            <h5>$10 OFF VOUCHER</h5>
            <p>Unlocked at 100 Points</p>
          </div>
          <button className="reward-action-btn claimed" disabled>UNLOCKED</button>
        </div>

        <div className="reward-tier-card locked">
          <div className="reward-info">
            <h5>$20 OFF VOUCHER</h5>
            <p>Unlocked at 200 Points</p>
          </div>
          <button className="reward-action-btn locked" disabled>NEED 50 PTS</button>
        </div>
      </div>
    </div>
  );
}
