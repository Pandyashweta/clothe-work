import React from 'react';
import { LogOut } from 'lucide-react';

export default function AccountDashboard({ user, orders, getPrice, logout, onShopClick }) {
  return (
    <div className="account-main">
      <div className="account-header-row">
        <div>
          <span className="welcome-tag">WELCOME BACK</span>
          <h1 className="account-user-name">{user.name.toUpperCase()}</h1>
        </div>
        <button onClick={logout} className="logout-btn">
          <LogOut size={16} /> LOG OUT
        </button>
      </div>

      {/* Order History */}
      <div className="orders-section">
        <h3 className="orders-title">ORDER HISTORY</h3>
        {orders.length === 0 ? (
          <div className="empty-orders-view">
            <p>YOU HAVE NOT PLACED ANY ORDERS YET.</p>
            <button className="shop-now-btn" onClick={onShopClick}>
              START SHOPPING
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-item-card">
                <div className="order-header">
                  <div>
                    <span className="order-id">ORDER {order.id}</span>
                    <span className="order-date">{order.date}</span>
                  </div>
                  <span className="order-status-badge">{order.status}</span>
                </div>
                <div className="order-products-summary">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-product-line">
                      <span>{item.name} ({item.size} / {item.color}) x {item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="order-footer">
                  <span>DELIVERING TO: {order.address.firstName} {order.address.lastName}</span>
                  <span className="order-total-amount">TOTAL: {getPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
