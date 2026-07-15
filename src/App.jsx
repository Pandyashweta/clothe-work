import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Global Components (via barrel)
import {
  Header,
  Footer,
  CartDrawer,
  CookiePopup,
  NetworkStatus,
  ErrorBoundary
} from './components/global';

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

            <main>
              <Routes>
                {/* Core pages */}
                <Route path="/"                        element={<Home />} />
                <Route path="/collections/dresses"     element={<Collection />} />
                <Route path="/products/:slug"          element={<ProductDetail />} />

                {/* Auth */}
                <Route path="/login"                   element={<Auth />} />
                {/* Legacy /register alias → /login */}
                <Route path="/register"                element={<Navigate to="/login" replace />} />

                {/* Shopping flow */}
                <Route path="/cart"                    element={<Cart />} />
                <Route path="/checkout"                element={<Checkout />} />

                {/* Account */}
                <Route path="/profile"                 element={<Profile />} />

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
