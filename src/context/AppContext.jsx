import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const localData = localStorage.getItem('ohpolly_cart');
      return localData ? JSON.parse(localData) : [];
    } catch { return []; }
  });
  
  const [wishlist, setWishlist] = useState(() => {
    try {
      const localData = localStorage.getItem('ohpolly_wishlist');
      return localData ? JSON.parse(localData) : [];
    } catch { return []; }
  });
  
  const [currency, setCurrency] = useState('USD'); // Default currency
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const localUser = localStorage.getItem('ohpolly_user');
      return localUser ? JSON.parse(localUser) : null;
    } catch { return null; }
  });
  const [orders, setOrders] = useState(() => {
    try {
      const localOrders = localStorage.getItem('ohpolly_orders');
      return localOrders ? JSON.parse(localOrders) : [];
    } catch { return []; }
  });

  // Persist state to localstorage
  useEffect(() => {
    localStorage.setItem('ohpolly_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('ohpolly_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('ohpolly_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ohpolly_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ohpolly_orders', JSON.stringify(orders));
  }, [orders]);

  // Currency conversion symbols and rates
  const currencyRates = {
    USD: { symbol: '$', rate: 1 },
    GBP: { symbol: '£', rate: 0.78 },
    EUR: { symbol: '€', rate: 0.92 },
    AUD: { symbol: 'A$', rate: 1.51 }
  };

  const getPrice = (amountInUsd) => {
    const { symbol, rate } = currencyRates[currency];
    const converted = (amountInUsd * rate).toFixed(2);
    return `${symbol}${converted}`;
  };

  const addToCart = (product, size, color) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.size === size && item.color === color
      );
      
      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += 1;
        return newCart;
      }
      
      return [...prevCart, { ...product, size, color, quantity: 1 }];
    });
    
    // Automatically slide cart drawer open
    setIsCartOpen(true);
  };

  const removeFromCart = (id, size, color) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.id === id && item.size === size && item.color === color))
    );
  };

  const updateQuantity = (id, size, color, amount) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === id && item.size === size && item.color === color) {
          const newQty = item.quantity + amount;
          return { ...item, quantity: newQty > 0 ? newQty : 1 };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (product) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((item) => item.id === product.id);
      if (exists) {
        return prevWishlist.filter((item) => item.id !== product.id);
      }
      return [...prevWishlist, product];
    });
  };

  const login = (email) => {
    setUser({ email, name: email.split('@')[0], points: 150 });
  };

  const logout = () => {
    setUser(null);
  };

  const addOrder = (orderItems, total, shippingAddress) => {
    const newOrder = {
      id: 'OP-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString(),
      items: orderItems,
      total,
      address: shippingAddress,
      status: 'Processing'
    };
    setOrders((prevOrders) => [newOrder, ...prevOrders]);
    clearCart();
    return newOrder.id;
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        cart,
        wishlist,
        currency,
        setCurrency,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        user,
        orders,
        login,
        logout,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        addOrder,
        getPrice,
        cartCount,
        cartSubtotal,
        currencySymbol: currencyRates[currency].symbol
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
