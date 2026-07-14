import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Global Components
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

// Pages
import Home from './pages/Home';
import Collection from './pages/Collection';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app-container">
          <Header />
          <CartDrawer />
          
          <main className="main-content-layout">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/collections/dresses" element={<Collection />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
