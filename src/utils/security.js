/**
 * Security Utilities — Frontend
 * ─────────────────────────────
 * Provides: output sanitization, secure API wrapper with CSRF,
 * open-redirect prevention, and secure storage helpers.
 *
 * RULES:
 * - NEVER store tokens, passwords, or secrets here
 * - NEVER use innerHTML with unsanitized content
 * - ALWAYS sanitize before rendering user-controlled strings
 */

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT SANITIZER — strips XSS vectors from strings before rendering
// ─────────────────────────────────────────────────────────────────────────────

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
  '/': '&#x2F;',
};

/**
 * Sanitize a string for safe HTML rendering.
 * Use this on ANY user-controlled content before rendering.
 */
export function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'`/]/g, (c) => HTML_ESCAPE_MAP[c] || c);
}

/**
 * Sanitize an object's string values recursively.
 */
export function sanitizeObject(obj, depth = 0) {
  if (depth > 5) return {};
  if (typeof obj === 'string') return sanitize(obj);
  if (Array.isArray(obj)) return obj.map((v) => sanitizeObject(v, depth + 1));
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, sanitizeObject(v, depth + 1)])
    );
  }
  return obj;
}

/**
 * Strip null bytes and control characters from a string.
 */
export function cleanInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\0/g, '')                    // null bytes
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control chars
    .trim()
    .substring(0, 10000);                  // max length guard
}

// ─────────────────────────────────────────────────────────────────────────────
// OPEN REDIRECT PREVENTION
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_REDIRECT_PATHS = [
  '/profile',
  '/checkout',
  '/cart',
  '/collections/dresses',
  '/login',
  '/',
];

/**
 * Validates that a redirect destination is safe (same-origin, allowlisted).
 * Prevents open redirect attacks via ?redirect= params.
 */
export function safeRedirectPath(rawPath) {
  if (!rawPath || typeof rawPath !== 'string') return '/';

  try {
    // Reject anything that looks like an absolute URL
    const decoded = decodeURIComponent(rawPath);
    if (decoded.startsWith('http://') || decoded.startsWith('https://') || decoded.startsWith('//')) {
      console.warn('[Security] Open redirect attempt blocked:', decoded.substring(0, 100));
      return '/';
    }
    // Must start with /
    if (!decoded.startsWith('/')) return '/';
    // Check against allowlist (prefix match)
    const isAllowed = ALLOWED_REDIRECT_PATHS.some(
      (p) => decoded === p || decoded.startsWith(p + '/')
    );
    return isAllowed ? decoded : '/';
  } catch {
    return '/';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECURE API WRAPPER — auto-injects credentials (cookies) + CSRF token
// ─────────────────────────────────────────────────────────────────────────────

let _csrfToken = null;

/** Fetch and cache the CSRF token from the backend */
async function fetchCsrfToken() {
  try {
    const res = await fetch('/api/auth/csrf-token', {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`CSRF fetch failed: ${res.status}`);
    const data = await res.json();
    _csrfToken = data.csrfToken || null;
    return _csrfToken;
  } catch (err) {
    console.error('[Security] Failed to fetch CSRF token:', err.message);
    return null;
  }
}

/** Get cached CSRF token, fetching if not available */
export async function getCsrfToken() {
  if (!_csrfToken) {
    _csrfToken = await fetchCsrfToken();
  }
  return _csrfToken;
}

/** Invalidate cached CSRF token (call after any 403 CSRF error) */
export function invalidateCsrfToken() {
  _csrfToken = null;
}

/**
 * Secure fetch wrapper.
 * - Always includes credentials (HttpOnly cookies sent automatically)
 * - Injects X-CSRF-Token for all non-GET requests
 * - Never includes Authorization headers (tokens are in cookies)
 * - On 401: dispatches a custom 'auth:unauthorized' event
 * - On 403 CSRF: rotates CSRF token and retries once
 */
export async function secureApi(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const isMutating = !['GET', 'HEAD', 'OPTIONS'].includes(method);

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (isMutating) {
    const csrf = await getCsrfToken();
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }

  const fetchOptions = {
    ...options,
    method,
    headers,
    credentials: 'include', // Always send HttpOnly cookies
  };

  let response = await fetch(url, fetchOptions);

  // On CSRF failure: rotate token and retry once
  if (response.status === 403) {
    const body = await response.clone().json().catch(() => ({}));
    if (body.error === 'CSRF_INVALID' || body.error === 'CSRF_MISSING') {
      invalidateCsrfToken();
      const newCsrf = await getCsrfToken();
      if (newCsrf) {
        headers['X-CSRF-Token'] = newCsrf;
        response = await fetch(url, { ...fetchOptions, headers });
      }
    }
  }

  // On 401: signal that the user needs to re-authenticate
  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }

  return response;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECURE STORAGE — non-sensitive UI preferences only
// (Never store tokens, session data, or personal info)
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_STORAGE_KEYS = new Set([
  'ohpolly_cart',
  'ohpolly_wishlist',
  'ohpolly_currency',
  'ohpolly_orders',
  'ohpolly_remember_me',
  'ohpolly_login_attempts',
  'ohpolly_cookie_accepted',
]);

export const secureStorage = {
  get(key, fallback = null) {
    if (!ALLOWED_STORAGE_KEYS.has(key)) {
      console.error(`[SecureStorage] Blocked read of disallowed key: ${key}`);
      return fallback;
    }
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    if (!ALLOWED_STORAGE_KEYS.has(key)) {
      console.error(`[SecureStorage] Blocked write to disallowed key: ${key}`);
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[SecureStorage] Write failed for key ${key}:`, e.message);
    }
  },

  del(key) {
    if (!ALLOWED_STORAGE_KEYS.has(key)) return;
    try { localStorage.removeItem(key); } catch {}
  },

  clear() {
    // Only clear known keys — don't nuke all localStorage (other libraries may use it)
    ALLOWED_STORAGE_KEYS.forEach((k) => this.del(k));
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PASSWORD STRENGTH EVALUATOR
// ─────────────────────────────────────────────────────────────────────────────

export function evaluatePasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '#ccc', level: 0 };
  let score = 0;
  const checks = {
    length8:   pwd.length >= 8,
    length12:  pwd.length >= 12,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number:    /\d/.test(pwd),
    special:   /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd),
    noRepeats: !/(.)\1{2,}/.test(pwd),
  };
  Object.values(checks).forEach((v) => { if (v) score++; });
  if (score <= 2) return { score, label: 'VERY WEAK', color: '#e74c3c', level: 1 };
  if (score === 3) return { score, label: 'WEAK',      color: '#e67e22', level: 2 };
  if (score === 4) return { score, label: 'FAIR',      color: '#f1c40f', level: 3 };
  if (score === 5) return { score, label: 'STRONG',    color: '#27ae60', level: 4 };
  return               { score, label: 'VERY STRONG', color: '#1a8a50', level: 5 };
}

export const PASSWORD_RULES = [
  { id: 'length',    label: 'At least 8 characters',       test: (p) => p.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter',         test: (p) => /[A-Z]/.test(p) },
  { id: 'number',    label: 'One number',                   test: (p) => /\d/.test(p) },
  { id: 'special',   label: 'One special character (!@#…)', test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
];
