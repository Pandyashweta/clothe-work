import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Global Components
import {
  Header,
  Footer,
  CartDrawer,
  CookiePopup,
  NetworkStatus,
  ErrorBoundary
} from './components/global';

// Security Components
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import SessionTimeoutModal from './components/SessionTimeout/SessionTimeoutModal';

// Pages
import Home          from './pages/Home/Home';
import Collection   from './pages/Collection/Collection';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Auth          from './pages/Auth/Auth';
import Cart          from './pages/Cart/Cart';
import Checkout      from './pages/Checkout/Checkout';
import Profile       from './pages/Profile/Profile';
import Sitemap       from './pages/Sitemap/Sitemap';
import NotFound      from './pages/NotFound/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <div className="app-container">
            <Header />
            <CartDrawer />
            <CookiePopup />
            <NetworkStatus />

            {/* Session timeout warning — shown 2 min before auto-logout */}
            <SessionTimeoutModal />

            <main>
              <Routes>
                {/* Public pages */}
                <Route path="/"                        element={<Home />} />
                <Route path="/collections/dresses"     element={<Collection />} />
                <Route path="/products/:slug"          element={<ProductDetail />} />

                {/* Auth — redirect to profile if already logged in */}
                <Route path="/login"                   element={<Auth />} />
                <Route path="/register"                element={<Navigate to="/login" replace />} />

                {/* Shopping flow — Cart is public, Checkout is protected */}
                <Route path="/cart"                    element={<Cart />} />
                <Route path="/checkout"                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />

                {/* Account — protected */}
                <Route path="/profile"                 element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                {/* Sitemap */}
                <Route path="/sitemap"                 element={<Sitemap />} />

                {/* 404 catch-all */}
                <Route path="*"                        element={<NotFound />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
