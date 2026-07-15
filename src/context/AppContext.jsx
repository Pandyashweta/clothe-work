/**
 * AppContext — Zero Trust Frontend State
 * ───────────────────────────────────────
 * Security rules:
 * - Session tokens NEVER stored in localStorage/sessionStorage (they live in HttpOnly cookies)
 * - Sensitive user data NEVER persisted to localStorage
 * - All API calls go through secureApi() which auto-injects CSRF + credentials
 * - User object contains ONLY public profile data (no passwordHash, no tokens)
 * - On auth:unauthorized event → force logout
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { secureApi, secureStorage, invalidateCsrfToken } from '../utils/security';

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

// ─── Session Config ───────────────────────────────────────────────────────────
const SESSION_TIMEOUT_MS    = 30 * 60 * 1000;
const WARN_BEFORE_LOGOUT_MS =  2 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS   = 15 * 60 * 1000;

export const AppProvider = ({ children }) => {
  // ── Non-sensitive persisted state (localStorage is OK for these) ─────────
  const [cart,     setCart]     = useState(() => secureStorage.get('ohpolly_cart',     []));
  const [wishlist, setWishlist] = useState(() => secureStorage.get('ohpolly_wishlist', []));
  const [currency, setCurrency] = useState(() => secureStorage.get('ohpolly_currency', 'USD'));
  const [orders,   setOrders]   = useState(() => secureStorage.get('ohpolly_orders',   []));

  // ── Auth state — user object is public profile only, NO tokens ───────────
  const [user, setUser] = useState(null);       // populated by /api/auth/verify on mount
  const [authLoading, setAuthLoading] = useState(true); // true while checking session

  // ── UI state ──────────────────────────────────────────────────────────────
  const [isCartOpen,  setIsCartOpen]  = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ── Session warning state ─────────────────────────────────────────────────
  const [sessionExpiry,      setSessionExpiry]      = useState(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);

  // ── Login state ───────────────────────────────────────────────────────────
  const [loginError,    setLoginError]    = useState(null);
  const [isLoggingIn,   setIsLoggingIn]   = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(
    () => secureStorage.get('ohpolly_login_attempts', { count: 0, lockedUntil: 0 })
  );

  const activityTimerRef = useRef(null);
  const warnTimerRef     = useRef(null);
  const logoutTimerRef   = useRef(null);

  // ── Persist non-sensitive state ───────────────────────────────────────────
  useEffect(() => { secureStorage.set('ohpolly_cart',     cart);          }, [cart]);
  useEffect(() => { secureStorage.set('ohpolly_wishlist', wishlist);      }, [wishlist]);
  useEffect(() => { secureStorage.set('ohpolly_currency', currency);      }, [currency]);
  useEffect(() => { secureStorage.set('ohpolly_orders',   orders);        }, [orders]);
  useEffect(() => { secureStorage.set('ohpolly_login_attempts', loginAttempts); }, [loginAttempts]);

  // ── Session timer helpers ─────────────────────────────────────────────────
  const clearSessionTimers = useCallback(() => {
    clearTimeout(warnTimerRef.current);
    clearTimeout(logoutTimerRef.current);
  }, []);

  const performLogout = useCallback(async (silent = false) => {
    clearSessionTimers();
    if (!silent && user) {
      try { await secureApi('/api/auth/logout', { method: 'POST' }); } catch {}
    }
    setUser(null);
    setSessionExpiry(null);
    setShowSessionWarning(false);
    invalidateCsrfToken();
  }, [clearSessionTimers, user]);

  const startSessionTimers = useCallback((expiryTimestamp) => {
    clearSessionTimers();
    const remaining = expiryTimestamp - Date.now();
    if (remaining <= 0) { performLogout(true); return; }
    const warnIn = remaining - WARN_BEFORE_LOGOUT_MS;
    if (warnIn > 0) {
      warnTimerRef.current = setTimeout(() => setShowSessionWarning(true), warnIn);
    } else {
      setShowSessionWarning(true);
    }
    logoutTimerRef.current = setTimeout(() => {
      setShowSessionWarning(false);
      performLogout(true);
    }, remaining);
  }, [clearSessionTimers, performLogout]);

  const resetActivityTimer = useCallback(() => {
    if (!user) return;
    const newExpiry = Date.now() + SESSION_TIMEOUT_MS;
    setSessionExpiry(newExpiry);
    setShowSessionWarning(false);
    startSessionTimers(newExpiry);
  }, [user, startSessionTimers]);

  // Track activity to reset session timer
  useEffect(() => {
    if (!user) return;
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    const throttled = () => {
      clearTimeout(activityTimerRef.current);
      activityTimerRef.current = setTimeout(resetActivityTimer, 1000);
    };
    events.forEach((e) => window.addEventListener(e, throttled, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, throttled));
      clearTimeout(activityTimerRef.current);
    };
  }, [user, resetActivityTimer]);

  // Start/stop session timers when auth state changes
  useEffect(() => {
    if (user) {
      const expiry = Date.now() + SESSION_TIMEOUT_MS;
      setSessionExpiry(expiry);
      startSessionTimers(expiry);
    } else {
      clearSessionTimers();
    }
    return clearSessionTimers;
  }, [user, startSessionTimers, clearSessionTimers]);

  // ── On app mount: verify session cookie with backend ─────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await secureApi('/api/auth/verify');
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (data.success) setUser(data.user);
        }
      } catch {
        // No session or backend offline — fine, continue as guest
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Listen for 401 events (session expired mid-session) ──────────────────
  useEffect(() => {
    const handle = () => { performLogout(true); };
    window.addEventListener('auth:unauthorized', handle);
    return () => window.removeEventListener('auth:unauthorized', handle);
  }, [performLogout]);

  // ─────────────────────────────────────────────────────────────────────────
  // AUTH FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const getLockoutStatus = () => {
    const now = Date.now();
    if (loginAttempts.lockedUntil > now) {
      return { isLocked: true, remainingMs: loginAttempts.lockedUntil - now };
    }
    return { isLocked: false, remainingMs: 0 };
  };

  const loginWithCredentials = async (email, password, rememberMe = false) => {
    setIsLoggingIn(true);
    setLoginError(null);

    const { isLocked, remainingMs } = getLockoutStatus();
    if (isLocked) {
      setLoginError({ message: `Account locked. Try again in ${Math.ceil(remainingMs / 60000)} min.`, isLocked: true });
      setIsLoggingIn(false);
      return { success: false };
    }

    try {
      const res = await secureApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();

      if (data.success) {
        setLoginAttempts({ count: 0, lockedUntil: 0 });
        setLoginError(null);
        setUser(data.user);
        if (rememberMe) {
          secureStorage.set('ohpolly_remember_me', true);
        }
        setIsLoggingIn(false);
        return { success: true };
      } else {
        const newCount = Math.min((loginAttempts.count || 0) + 1, MAX_ATTEMPTS);
        const newLock  = newCount >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0;
        setLoginAttempts({ count: newCount, lockedUntil: newLock });
        setLoginError({
          message: data.message || 'Invalid email or password.',
          remainingAttempts: data.remainingAttempts,
          isLocked: newLock > 0,
        });
        setIsLoggingIn(false);
        return { success: false };
      }
    } catch {
      // Backend offline fallback — demo credentials only, no real auth
      if (email.toLowerCase() === 'demo@ohpolly.com' && password === 'OhPolly@2026!') {
        const demoUser = {
          email: 'demo@ohpolly.com',
          name: 'Demo User',
          firstName: 'Demo',
          lastName: 'User',
          points: 150,
          role: 'customer',
          emailVerified: true,
          twoFactorEnabled: false,
          lastLogin: new Date().toISOString(),
        };
        setUser(demoUser);
        setLoginAttempts({ count: 0, lockedUntil: 0 });
        setIsLoggingIn(false);
        return { success: true };
      }
      setLoginError({ message: 'Cannot connect to server. Please check your connection.' });
      setIsLoggingIn(false);
      return { success: false };
    }
  };

  const registerWithCredentials = async (email, password, firstName, lastName = '') => {
    try {
      const res = await secureApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, firstName, lastName }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error, message: data.message };
    } catch {
      return { success: false, message: 'Cannot connect to server. Please try again.' };
    }
  };

  const logout = useCallback(() => performLogout(false), [performLogout]);

  const extendSession = useCallback(() => {
    resetActivityTimer();
    setShowSessionWarning(false);
  }, [resetActivityTimer]);

  const requestPasswordReset = async (email) => {
    try {
      const res = await secureApi('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Cannot connect to server. Please try again.' };
    }
  };

  // Legacy shim — used by components that haven't migrated yet
  const login = (email) => {
    setUser({ email, name: email.split('@')[0], firstName: email.split('@')[0], points: 150, role: 'customer', lastLogin: new Date().toISOString() });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CART
  // ─────────────────────────────────────────────────────────────────────────

  const addToCart = (product, size, color) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.id === product.id && i.size === size && i.color === color);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { ...product, size, color, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id, size, color) =>
    setCart((prev) => prev.filter((i) => !(i.id === id && i.size === size && i.color === color)));

  const updateQuantity = (id, size, color, amount) =>
    setCart((prev) =>
      prev.map((i) =>
        i.id === id && i.size === size && i.color === color
          ? { ...i, quantity: Math.max(1, i.quantity + amount) }
          : i
      )
    );

  const clearCart = () => setCart([]);

  const toggleWishlist = (product) =>
    setWishlist((prev) =>
      prev.some((i) => i.id === product.id)
        ? prev.filter((i) => i.id !== product.id)
        : [...prev, product]
    );

  const addOrder = (orderItems, total, shippingAddress) => {
    // Generate UUID-style order ID (not predictable sequential)
    const orderId = 'OP-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString(),
      items: orderItems,
      total,
      address: shippingAddress,
      status: 'Processing',
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return orderId;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CURRENCY
  // ─────────────────────────────────────────────────────────────────────────

  const currencyRates = {
    USD: { symbol: '$', rate: 1 },
    GBP: { symbol: '£', rate: 0.78 },
    EUR: { symbol: '€', rate: 0.92 },
    AUD: { symbol: 'A$', rate: 1.51 },
  };

  const getPrice = (amountInUsd) => {
    const { symbol, rate } = currencyRates[currency] || currencyRates.USD;
    return `${symbol}${(amountInUsd * rate).toFixed(2)}`;
  };

  const cartCount    = cart.reduce((t, i) => t + i.quantity, 0);
  const cartSubtotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        // Cart
        cart, addToCart, removeFromCart, updateQuantity, clearCart,
        cartCount, cartSubtotal, isCartOpen, setIsCartOpen,
        // Wishlist
        wishlist, toggleWishlist,
        // Currency
        currency, setCurrency, getPrice,
        currencySymbol: currencyRates[currency]?.symbol || '$',
        // Auth
        user, authLoading,
        login, logout,
        loginWithCredentials,
        registerWithCredentials,
        requestPasswordReset,
        extendSession,
        loginError, setLoginError,
        isLoggingIn,
        loginAttempts,
        getLockoutStatus,
        // Session
        sessionExpiry,
        showSessionWarning,
        setShowSessionWarning,
        // Orders
        orders, addOrder,
        // Search
        isSearchOpen, setIsSearchOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
