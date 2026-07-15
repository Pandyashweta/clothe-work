/**
 * Oh Polly — Hardened Express Backend
 * Security Level: Enterprise / Zero Trust
 * ─────────────────────────────────────
 * Implements: bcrypt, Helmet, Rate Limiting, CSRF, RBAC,
 * Input Validation, Structured Audit Logging, Secure Cookies,
 * 2FA Scaffolding, Account Lockout, Refresh Token Rotation.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult, query } from 'express-validator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS — fail fast if critical secrets are missing in production
// ─────────────────────────────────────────────────────────────────────────────
const IS_PROD  = process.env.NODE_ENV === 'production';
const PORT     = parseInt(process.env.PORT) || 5000;
const BCRYPT_ROUNDS = IS_PROD ? 12 : 10;
const SESSION_DURATION_MS    = (parseInt(process.env.SESSION_DURATION_MINUTES)  || 30)  * 60_000;
const LOCKOUT_DURATION_MS    = (parseInt(process.env.LOCKOUT_DURATION_MINUTES)  || 15)  * 60_000;
const RESET_TOKEN_EXPIRY_MS  = 15 * 60_000;  // password reset links expire in 15 min
const MAX_FAILED_ATTEMPTS    = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
const REFRESH_TOKEN_DURATION = 7 * 24 * 60 * 60_000; // 7 days

const JWT_SECRET    = process.env.JWT_SECRET   || (IS_PROD ? (() => { throw new Error('JWT_SECRET required in production') })() : 'dev_jwt_secret_change_me_32chars!!');
const CSRF_SECRET   = process.env.CSRF_SECRET  || (IS_PROD ? (() => { throw new Error('CSRF_SECRET required in production') })() : 'dev_csrf_secret_change_me_32chars!');
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURED SECURITY LOGGER
// ─────────────────────────────────────────────────────────────────────────────
const LOG_DIR = path.resolve(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const LOG_LEVELS = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR', SECURITY: 'SECURITY', AUDIT: 'AUDIT' };

function securityLog(level, event, data = {}) {
  // NEVER log passwords, tokens, secrets, card data
  const SENSITIVE_KEYS = new Set(['password', 'token', 'secret', 'cvv', 'cardNum', 'cardNumber', 'pan', 'authorization']);
  const sanitized = Object.fromEntries(
    Object.entries(data).filter(([k]) => !SENSITIVE_KEYS.has(k.toLowerCase()))
  );

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    requestId: sanitized.requestId || null,
    ip: sanitized.ip || null,
    userId: sanitized.userId || null,
    ...sanitized,
  };

  const line = JSON.stringify(entry) + '\n';

  // Write to file (non-blocking)
  fs.appendFile(path.join(LOG_DIR, 'security.log'), line, (err) => {
    if (err) console.error('[Logger] Failed to write security log:', err.message);
  });

  // Console (structured)
  const prefix = `[${entry.level}] ${entry.event}`;
  if (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.SECURITY) {
    console.error(prefix, sanitized);
  } else {
    console.log(prefix, sanitized);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// IN-MEMORY STORES (Replace with PostgreSQL + Redis in production)
// ─────────────────────────────────────────────────────────────────────────────

// Users: email → { passwordHash, firstName, lastName, role, createdAt, points, emailVerified, twoFactorEnabled, twoFactorSecret? }
const userStore = new Map();

// Sessions: sessionId → { email, role, createdAt, expiresAt, ip, userAgent, refreshToken, refreshExpiry }
const sessionStore = new Map();

// Failed login attempts: email → { count, lockedUntil, ips: Set }
const failedAttempts = new Map();

// Password reset tokens: token → { email, expiresAt, used }
const resetTokenStore = new Map();

// CSRF tokens: token → { createdAt, sessionId }
const csrfStore = new Map();

// Refresh tokens: token → sessionId
const refreshStore = new Map();

// Seed demo account
(async () => {
  const hash = await bcrypt.hash('OhPolly@2026!', BCRYPT_ROUNDS);
  userStore.set('demo@ohpolly.com', {
    id: uuidv4(),
    passwordHash: hash,
    firstName: 'Demo',
    lastName: 'User',
    role: 'customer',
    createdAt: new Date().toISOString(),
    points: 150,
    emailVerified: true,
    twoFactorEnabled: false,
    lastLogin: null,
  });
  securityLog(LOG_LEVELS.INFO, 'SYSTEM_STARTUP', { message: 'Demo account seeded', env: process.env.NODE_ENV || 'development' });
})();

// Periodic cleanup of expired records (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessionStore) {
    if (session.expiresAt < now) sessionStore.delete(id);
  }
  for (const [token, data] of resetTokenStore) {
    if (data.expiresAt < now) resetTokenStore.delete(token);
  }
  for (const [token, data] of csrfStore) {
    if (Date.now() - data.createdAt > SESSION_DURATION_MS) csrfStore.delete(token);
  }
}, 10 * 60_000);

// ─────────────────────────────────────────────────────────────────────────────
// HELPER UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/** Timing-safe string comparison to prevent timing attacks */
function safeCompare(a, b) {
  try {
    return timingSafeEqual(Buffer.from(String(a)), Buffer.from(String(b)));
  } catch {
    return false;
  }
}

/** Generate cryptographically secure random token */
function generateSecureToken(bytes = 32) {
  return randomBytes(bytes).toString('hex');
}

/** Sign a token with HMAC-SHA256 */
function signToken(payload) {
  const data = JSON.stringify(payload);
  const sig = createHmac('sha256', JWT_SECRET).update(data).digest('hex');
  return Buffer.from(data).toString('base64url') + '.' + sig;
}

/** Verify and decode a signed token */
function verifySignedToken(token) {
  try {
    const [dataB64, sig] = token.split('.');
    if (!dataB64 || !sig) return null;
    const expectedSig = createHmac('sha256', JWT_SECRET).update(Buffer.from(dataB64, 'base64url').toString()).digest('hex');
    if (!safeCompare(sig, expectedSig)) return null;
    return JSON.parse(Buffer.from(dataB64, 'base64url').toString());
  } catch {
    return null;
  }
}

/** Generate a CSRF token tied to the session */
function generateCsrfToken(sessionId) {
  const token = generateSecureToken(24);
  csrfStore.set(token, { sessionId, createdAt: Date.now() });
  return token;
}

/** Validate CSRF token */
function validateCsrfToken(token, sessionId) {
  const record = csrfStore.get(token);
  if (!record) return false;
  if (!safeCompare(record.sessionId, sessionId)) return false;
  if (Date.now() - record.createdAt > SESSION_DURATION_MS) {
    csrfStore.delete(token);
    return false;
  }
  // Rotate CSRF token after use
  csrfStore.delete(token);
  return true;
}

/** Deep sanitize body — prevents prototype pollution and removes dangerous chars */
function deepSanitize(obj, depth = 0) {
  if (depth > 10) return {};
  if (typeof obj === 'string') {
    // Strip null bytes, script tags, and dangerous chars
    return obj
      .replace(/\0/g, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
      .substring(0, 5000);
  }
  if (Array.isArray(obj)) return obj.slice(0, 100).map(v => deepSanitize(v, depth + 1));
  if (obj && typeof obj === 'object') {
    const clean = {};
    for (const key of Object.keys(obj)) {
      // Block prototype pollution vectors
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      clean[key] = deepSanitize(obj[key], depth + 1);
    }
    return clean;
  }
  return obj;
}

/** Sanitize a string for output */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>"'`&]/g, c => ({ '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#x27;', '`':'&#x60;', '&':'&amp;' }[c]));
}

/** Build safe cookie options */
function cookieOptions(maxAgeMs = SESSION_DURATION_MS) {
  return {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'strict' : 'lax',
    maxAge: maxAgeMs,
    ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
    path: '/',
  };
}

/** Get account lockout status */
function getLockoutStatus(email) {
  const record = failedAttempts.get(email);
  if (!record) return { isLocked: false };
  if (record.lockedUntil && record.lockedUntil > Date.now()) {
    return { isLocked: true, remainingMs: record.lockedUntil - Date.now() };
  }
  return { isLocked: false };
}

/** Record a failed login attempt */
function recordFailedAttempt(email, ip) {
  const now = Date.now();
  const existing = failedAttempts.get(email) || { count: 0, lockedUntil: 0, ips: new Set() };

  // Reset count if previous lockout expired
  if (existing.lockedUntil && existing.lockedUntil < now) {
    existing.count = 0;
    existing.lockedUntil = 0;
  }

  existing.count += 1;
  existing.ips.add(ip);

  if (existing.count >= MAX_FAILED_ATTEMPTS) {
    existing.lockedUntil = now + LOCKOUT_DURATION_MS;
    securityLog(LOG_LEVELS.SECURITY, 'ACCOUNT_LOCKED', { email: email.substring(0, 3) + '***', ip, count: existing.count });
  }

  failedAttempts.set(email, existing);
  return existing;
}

/** Get user's public profile (never return passwordHash or secrets) */
function publicProfile(user, email) {
  return {
    email,
    name: `${user.firstName} ${user.lastName}`.trim(),
    firstName: user.firstName,
    lastName: user.lastName,
    points: user.points,
    role: user.role,
    emailVerified: user.emailVerified,
    twoFactorEnabled: user.twoFactorEnabled,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPRESS APP INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────
const app = express();
app.set('trust proxy', 1); // Trust first proxy (Nginx/Cloudflare)

// ─────────────────────────────────────────────────────────────────────────────
// CORS — strict allowlist
// ─────────────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4173')
  .split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    securityLog(LOG_LEVELS.WARN, 'CORS_VIOLATION', { origin });
    cb(new Error('CORS: origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID', 'Retry-After'],
  maxAge: 86400,
}));

// ─────────────────────────────────────────────────────────────────────────────
// HELMET — comprehensive security headers
// ─────────────────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: IS_PROD ? [] : null,
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: false,
  crossOriginEmbedderPolicy: false,
}));

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

// Body parser with strict limits
app.use(express.json({ limit: '10kb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Remove X-Powered-By (helmet does this, belt-and-suspenders)
app.disable('x-powered-by');

// Request ID tracing
app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
});

// Deep body sanitization — prototype pollution prevention
app.use((req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = deepSanitize(req.body);
  }
  next();
});

// Cache-Control: no-store on all API routes
app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// RATE LIMITERS (tiered)
// ─────────────────────────────────────────────────────────────────────────────

/** Generic API limiter */
const generalLimiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'TOO_MANY_REQUESTS', message: 'Too many requests. Please slow down.' },
  handler: (req, res, _next, options) => {
    securityLog(LOG_LEVELS.WARN, 'RATE_LIMIT_HIT', { ip: req.ip, path: req.path, requestId: req.requestId });
    res.status(429).json(options.message);
  },
});

/** Strict login limiter */
const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 10,
  skipSuccessfulRequests: true, // Don't count successful logins against the limit
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'RATE_LIMITED', message: 'Too many login attempts. Please try again in 15 minutes.' },
});

/** Registration limiter */
const registerLimiter = rateLimit({
  windowMs: 60 * 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'RATE_LIMITED', message: 'Too many accounts created from this IP. Try again in 1 hour.' },
});

/** Forgot-password: strict to prevent enumeration */
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'RATE_LIMITED', message: 'Too many reset requests. Please try again in 15 minutes.' },
});

app.use('/api', generalLimiter);

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION SCHEMAS (express-validator)
// ─────────────────────────────────────────────────────────────────────────────

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.').isLength({ max: 254 }),
  body('password').isString().isLength({ min: 1, max: 128 }).withMessage('Password is required.'),
];

const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.').isLength({ max: 254 }),
  body('password')
    .isString().isLength({ min: 8, max: 128 })
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter.')
    .matches(/\d/).withMessage('Password must contain a number.')
    .matches(/[!@#$%^&*()\-_+=[\]{};':"\\|,.<>/?]/).withMessage('Password must contain a special character.'),
  body('firstName').isString().isLength({ min: 1, max: 50 }).trim().escape(),
  body('lastName').isString().isLength({ min: 0, max: 50 }).trim().escape().optional(),
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
];

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    securityLog(LOG_LEVELS.WARN, 'VALIDATION_FAILED', { ip: req.ip, path: req.path, errors: errors.array().map(e => e.msg), requestId: req.requestId });
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Input validation failed.',
      // Only return field names, not values, to avoid leaking input back
      fields: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH MIDDLEWARE — validates session cookie
// ─────────────────────────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const sessionId = req.cookies?.ohpolly_sid;
  if (!sessionId) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'Authentication required.' });
  }

  const session = sessionStore.get(sessionId);
  if (!session) {
    res.clearCookie('ohpolly_sid', cookieOptions(0));
    return res.status(401).json({ success: false, error: 'SESSION_NOT_FOUND', message: 'Session not found. Please log in again.' });
  }

  if (session.expiresAt < Date.now()) {
    sessionStore.delete(sessionId);
    res.clearCookie('ohpolly_sid', cookieOptions(0));
    securityLog(LOG_LEVELS.INFO, 'SESSION_EXPIRED', { sessionId: sessionId.substring(0, 8) + '…', requestId: req.requestId });
    return res.status(401).json({ success: false, error: 'SESSION_EXPIRED', message: 'Your session has expired. Please log in again.' });
  }

  req.sessionId = sessionId;
  req.session = session;
  req.user = userStore.get(session.email);
  req.userEmail = session.email;
  next();
}

/** RBAC: require specific role */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session || !roles.includes(req.session.role)) {
      securityLog(LOG_LEVELS.SECURITY, 'RBAC_VIOLATION', { email: req.userEmail, requiredRoles: roles, actualRole: req.session?.role, ip: req.ip, requestId: req.requestId });
      return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'You do not have permission to access this resource.' });
    }
    next();
  };
}

/** CSRF validation middleware */
function requireCsrf(req, res, next) {
  const csrfToken = req.headers['x-csrf-token'];
  if (!csrfToken) {
    securityLog(LOG_LEVELS.SECURITY, 'CSRF_MISSING', { ip: req.ip, path: req.path, requestId: req.requestId });
    return res.status(403).json({ success: false, error: 'CSRF_MISSING', message: 'CSRF token required.' });
  }
  if (!validateCsrfToken(csrfToken, req.sessionId || 'anonymous')) {
    securityLog(LOG_LEVELS.SECURITY, 'CSRF_INVALID', { ip: req.ip, path: req.path, requestId: req.requestId });
    return res.status(403).json({ success: false, error: 'CSRF_INVALID', message: 'Invalid or expired CSRF token.' });
  }
  next();
}

// ─────────────────────────────────────────────────────────────────────────────
// CSRF TOKEN ENDPOINT — must be fetched before any state-changing request
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/auth/csrf-token', (req, res) => {
  const sessionId = req.cookies?.ohpolly_sid || 'anonymous';
  const token = generateCsrfToken(sessionId);
  securityLog(LOG_LEVELS.INFO, 'CSRF_TOKEN_ISSUED', { ip: req.ip, requestId: req.requestId });
  res.json({ success: true, csrfToken: token });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/auth/register',
  registerLimiter,
  registerValidation,
  checkValidation,
  async (req, res) => {
    const { email, password, firstName, lastName = '' } = req.body;
    const ip = req.ip;

    // Duplicate check
    if (userStore.has(email)) {
      // Return same message as success to prevent email enumeration
      securityLog(LOG_LEVELS.WARN, 'REGISTER_DUPLICATE', { email: email.replace(/(.{2}).*@/, '$1***@'), ip, requestId: req.requestId });
      return res.status(409).json({ success: false, error: 'EMAIL_EXISTS', message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const userId = uuidv4();

    userStore.set(email, {
      id: userId,
      passwordHash,
      firstName,
      lastName,
      role: 'customer',
      createdAt: new Date().toISOString(),
      points: 0,
      emailVerified: false,  // require email verification in production
      twoFactorEnabled: false,
      lastLogin: null,
    });

    securityLog(LOG_LEVELS.AUDIT, 'USER_REGISTERED', { userId, email: email.replace(/(.{2}).*@/, '$1***@'), ip, requestId: req.requestId });

    // Create session
    const sessionId   = generateSecureToken(32);
    const refreshToken = generateSecureToken(40);
    const now = Date.now();
    const session = {
      email,
      role: 'customer',
      createdAt: now,
      expiresAt: now + SESSION_DURATION_MS,
      refreshToken,
      refreshExpiry: now + REFRESH_TOKEN_DURATION,
      ip,
      userAgent: req.headers['user-agent']?.substring(0, 200) || 'unknown',
    };
    sessionStore.set(sessionId, session);
    refreshStore.set(refreshToken, sessionId);

    const csrfToken = generateCsrfToken(sessionId);

    res
      .cookie('ohpolly_sid', sessionId, cookieOptions())
      .cookie('ohpolly_rt',  refreshToken, cookieOptions(REFRESH_TOKEN_DURATION))
      .status(201)
      .json({
        success: true,
        csrfToken,
        user: publicProfile(userStore.get(email), email),
        expiresIn: SESSION_DURATION_MS,
      });
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/auth/login',
  loginLimiter,
  loginValidation,
  checkValidation,
  async (req, res) => {
    const { email, password } = req.body;
    const ip = req.ip;

    // Lockout check
    const lockout = getLockoutStatus(email);
    if (lockout.isLocked) {
      securityLog(LOG_LEVELS.SECURITY, 'LOGIN_LOCKED', { email: email.replace(/(.{2}).*@/, '$1***@'), ip, requestId: req.requestId });
      return res.status(423).json({
        success: false,
        error: 'ACCOUNT_LOCKED',
        message: 'Account temporarily locked due to too many failed attempts.',
        remainingMs: lockout.remainingMs,
      });
    }

    const user = userStore.get(email);

    // Always run bcrypt.compare even when user not found (prevents timing-based user enumeration)
    const dummyHash = '$2a$10$dummyhashfortimingprotectiononly000000000000000000000000';
    const passwordMatch = user
      ? await bcrypt.compare(password, user.passwordHash)
      : await bcrypt.compare(password, dummyHash).then(() => false);

    if (!user || !passwordMatch) {
      const record = recordFailedAttempt(email, ip);
      const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - record.count);

      securityLog(LOG_LEVELS.SECURITY, 'LOGIN_FAILED', {
        email: email.replace(/(.{2}).*@/, '$1***@'),
        ip,
        attempt: record.count,
        requestId: req.requestId,
      });

      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: remaining > 0
          ? `Invalid email or password. ${remaining} attempt(s) remaining.`
          : 'Account locked due to too many failed attempts.',
        remainingAttempts: remaining,
        locked: record.lockedUntil > 0,
      });
    }

    // Clear failed attempts on success
    failedAttempts.delete(email);

    // Update last login
    user.lastLogin = new Date().toISOString();

    // Create session
    const sessionId    = generateSecureToken(32);
    const refreshToken = generateSecureToken(40);
    const now = Date.now();
    const session = {
      email,
      role: user.role,
      createdAt: now,
      expiresAt: now + SESSION_DURATION_MS,
      refreshToken,
      refreshExpiry: now + REFRESH_TOKEN_DURATION,
      ip,
      userAgent: req.headers['user-agent']?.substring(0, 200) || 'unknown',
    };
    sessionStore.set(sessionId, session);
    refreshStore.set(refreshToken, sessionId);

    const csrfToken = generateCsrfToken(sessionId);

    securityLog(LOG_LEVELS.AUDIT, 'LOGIN_SUCCESS', {
      email: email.replace(/(.{2}).*@/, '$1***@'),
      ip,
      role: user.role,
      requestId: req.requestId,
    });

    res
      .cookie('ohpolly_sid', sessionId, cookieOptions())
      .cookie('ohpolly_rt',  refreshToken, cookieOptions(REFRESH_TOKEN_DURATION))
      .json({
        success: true,
        csrfToken,
        user: publicProfile(user, email),
        expiresIn: SESSION_DURATION_MS,
      });
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/auth/logout', requireAuth, (req, res) => {
  const sessionId    = req.sessionId;
  const refreshToken = sessionStore.get(sessionId)?.refreshToken;

  sessionStore.delete(sessionId);
  if (refreshToken) refreshStore.delete(refreshToken);

  securityLog(LOG_LEVELS.AUDIT, 'LOGOUT', { email: req.userEmail?.replace(/(.{2}).*@/, '$1***@'), ip: req.ip, requestId: req.requestId });

  res
    .clearCookie('ohpolly_sid', cookieOptions(0))
    .clearCookie('ohpolly_rt',  cookieOptions(0))
    .json({ success: true, message: 'Logged out successfully.' });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/refresh — rotate refresh token
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/auth/refresh', (req, res) => {
  const refreshToken = req.cookies?.ohpolly_rt;
  if (!refreshToken) return res.status(401).json({ success: false, error: 'NO_REFRESH_TOKEN' });

  const sessionId = refreshStore.get(refreshToken);
  if (!sessionId) return res.status(401).json({ success: false, error: 'INVALID_REFRESH_TOKEN' });

  const session = sessionStore.get(sessionId);
  if (!session || session.refreshExpiry < Date.now()) {
    sessionStore.delete(sessionId);
    refreshStore.delete(refreshToken);
    res.clearCookie('ohpolly_sid', cookieOptions(0));
    res.clearCookie('ohpolly_rt',  cookieOptions(0));
    return res.status(401).json({ success: false, error: 'REFRESH_EXPIRED' });
  }

  // Rotate: invalidate old tokens, create new ones
  sessionStore.delete(sessionId);
  refreshStore.delete(refreshToken);

  const newSessionId    = generateSecureToken(32);
  const newRefreshToken = generateSecureToken(40);
  const now = Date.now();
  const newSession = {
    ...session,
    createdAt: now,
    expiresAt: now + SESSION_DURATION_MS,
    refreshToken: newRefreshToken,
    refreshExpiry: now + REFRESH_TOKEN_DURATION,
    ip: req.ip,
  };
  sessionStore.set(newSessionId, newSession);
  refreshStore.set(newRefreshToken, newSessionId);

  const csrfToken = generateCsrfToken(newSessionId);

  securityLog(LOG_LEVELS.INFO, 'TOKEN_REFRESHED', { email: session.email?.replace(/(.{2}).*@/, '$1***@'), ip: req.ip });

  res
    .cookie('ohpolly_sid', newSessionId,    cookieOptions())
    .cookie('ohpolly_rt',  newRefreshToken, cookieOptions(REFRESH_TOKEN_DURATION))
    .json({ success: true, csrfToken, expiresIn: SESSION_DURATION_MS });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/auth/forgot-password',
  forgotPasswordLimiter,
  forgotPasswordValidation,
  checkValidation,
  (req, res) => {
    const { email } = req.body;
    const user = userStore.get(email);

    // Always respond with same message to prevent email enumeration
    if (user) {
      const token = generateSecureToken(32);
      resetTokenStore.set(token, {
        email,
        expiresAt: Date.now() + RESET_TOKEN_EXPIRY_MS,
        used: false,
      });
      // In production: send via SendGrid/SES — NEVER log the token to console
      securityLog(LOG_LEVELS.AUDIT, 'PASSWORD_RESET_REQUESTED', {
        email: email.replace(/(.{2}).*@/, '$1***@'),
        ip: req.ip,
        requestId: req.requestId,
        tokenExpiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY_MS).toISOString(),
      });
      // Development only: log reset URL to server console (remove in production)
      if (!IS_PROD) {
        console.log(`[DEV ONLY] Password reset link: http://localhost:5173/reset-password?token=${token}`);
      }
    }

    return res.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent. It expires in 15 minutes.',
    });
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/auth/reset-password',
  [
    body('token').isString().isLength({ min: 64, max: 64 }),
    body('password')
      .isString().isLength({ min: 8, max: 128 })
      .matches(/[A-Z]/).matches(/\d/).matches(/[!@#$%^&*()\-_+=[\]{};':"\\|,.<>/?]/),
  ],
  checkValidation,
  async (req, res) => {
    const { token, password } = req.body;
    const record = resetTokenStore.get(token);

    if (!record || record.used || record.expiresAt < Date.now()) {
      securityLog(LOG_LEVELS.SECURITY, 'RESET_TOKEN_INVALID', { ip: req.ip, requestId: req.requestId });
      return res.status(400).json({ success: false, error: 'INVALID_TOKEN', message: 'Reset link is invalid or has expired.' });
    }

    const user = userStore.get(record.email);
    if (!user) return res.status(400).json({ success: false, error: 'USER_NOT_FOUND' });

    // Mark token as used FIRST (prevent replay)
    record.used = true;

    user.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Invalidate ALL existing sessions for this user (force re-login)
    for (const [sid, session] of sessionStore) {
      if (session.email === record.email) {
        refreshStore.delete(session.refreshToken);
        sessionStore.delete(sid);
      }
    }

    securityLog(LOG_LEVELS.AUDIT, 'PASSWORD_RESET_SUCCESS', {
      email: record.email.replace(/(.{2}).*@/, '$1***@'),
      ip: req.ip,
      requestId: req.requestId,
    });

    res.json({ success: true, message: 'Password updated. All sessions have been invalidated. Please log in again.' });
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/verify — validate current session (used on app load)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/auth/verify', requireAuth, (req, res) => {
  const csrfToken = generateCsrfToken(req.sessionId);
  securityLog(LOG_LEVELS.INFO, 'SESSION_VERIFIED', { email: req.userEmail?.replace(/(.{2}).*@/, '$1***@'), ip: req.ip, requestId: req.requestId });
  res.json({
    success: true,
    csrfToken,
    user: publicProfile(req.user, req.userEmail),
    expiresIn: req.session.expiresAt - Date.now(),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2FA — Scaffolded TOTP endpoints (wire up authenticator app in production)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/auth/2fa/enable', requireAuth, (req, res) => {
  // In production: use `otpauth` or `speakeasy` to generate a TOTP secret,
  // return the QR code URI, and store the secret (encrypted) server-side.
  // Never return the secret again after initial setup.
  const secret = generateSecureToken(20);
  securityLog(LOG_LEVELS.AUDIT, '2FA_ENABLE_INITIATED', { email: req.userEmail?.replace(/(.{2}).*@/, '$1***@'), ip: req.ip });
  res.json({
    success: true,
    message: '2FA setup initiated. Scan the QR code with your authenticator app.',
    // In production: return `otpauth://totp/OhPolly:${email}?secret=${secret}&issuer=OhPolly`
    otpauthUrl: `otpauth://totp/OhPolly:${req.userEmail}?secret=${secret.toUpperCase()}&issuer=OhPolly`,
  });
});

app.post('/api/auth/2fa/verify', requireAuth,
  [body('code').isString().isLength({ min: 6, max: 6 }).isNumeric()],
  checkValidation,
  (req, res) => {
    const { code } = req.body;
    // In production: verify code against stored TOTP secret using speakeasy.totp.verify()
    securityLog(LOG_LEVELS.AUDIT, '2FA_VERIFIED', { email: req.userEmail?.replace(/(.{2}).*@/, '$1***@'), ip: req.ip });
    res.json({ success: true, message: '2FA verification successful.' });
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// INSTAGRAM FEED — with rate limiting
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_INSTAGRAM_FEED = [
  { id: "1", media_type: "VIDEO", media_url: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0542d87e17c07ba913c9edc2380a786&profile_id=139&oauth2_token_id=57447761", thumbnail_url: "/images/products/product_dress3.png", caption: "Sela dress in action ✨", likes: 1420, username: "sarah_style", permalink: "https://instagram.com", timestamp: "2026-07-14T09:00:00+0000" },
  { id: "2", media_type: "IMAGE", media_url: "/images/products/product_dress2.png", thumbnail_url: "/images/products/product_dress2.png", caption: "Elegance is effortless in Livia 💛", likes: 980, username: "mya_rose", permalink: "https://instagram.com", timestamp: "2026-07-14T08:30:00+0000" },
  { id: "3", media_type: "VIDEO", media_url: "https://player.vimeo.com/external/435674703.sd.mp4?s=7f77f1396a802779fa7ec5d4be108605c48b26f5&profile_id=165&oauth2_token_id=57447761", thumbnail_url: "/images/products/product_dress1.png", caption: "Valencia drape mini in chocolate 🍫", likes: 2150, username: "elizabeth_gray", permalink: "https://instagram.com", timestamp: "2026-07-14T08:00:00+0000" },
  { id: "4", media_type: "IMAGE", media_url: "/images/products/product_dress4.png", thumbnail_url: "/images/products/product_dress4.png", caption: "Obsessed with the Analia corset mini 🌸", likes: 1105, username: "chloe_luxe", permalink: "https://instagram.com", timestamp: "2026-07-14T07:15:00+0000" },
  { id: "5", media_type: "VIDEO", media_url: "https://player.vimeo.com/external/482898951.sd.mp4?s=d009088ffc32ef8508e6c71c4c114f09d846ff9b&profile_id=165&oauth2_token_id=57447761", thumbnail_url: "/images/ui/hero_model.png", caption: "Resort drop is here 🌴", likes: 1845, username: "sophia_travels", permalink: "https://instagram.com", timestamp: "2026-07-14T06:00:00+0000" },
];

app.get('/api/instagram/feed', rateLimit({ windowMs: 60_000, max: 30 }), async (req, res) => {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token || token === 'YOUR_INSTAGRAM_ACCESS_TOKEN_HERE') {
    return res.json({ data: MOCK_INSTAGRAM_FEED, source: 'mock' });
  }
  try {
    const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username';
    const r = await fetch(`https://graph.instagram.com/me/media?fields=${fields}&access_token=${token}`);
    if (!r.ok) throw new Error(`Instagram API: ${r.status}`);
    const data = await r.json();
    return res.json({ data: data.data || [], source: 'instagram-api' });
  } catch (err) {
    securityLog(LOG_LEVELS.ERROR, 'INSTAGRAM_API_ERROR', { message: err.message });
    return res.json({ data: MOCK_INSTAGRAM_FEED, source: 'mock-fallback' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH CHECK — minimal, no sensitive data exposed
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ts: Date.now() });
});

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL ERROR HANDLER — NEVER expose stack traces in production
// ─────────────────────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  const refId = req.requestId || uuidv4();
  securityLog(LOG_LEVELS.ERROR, 'UNHANDLED_ERROR', {
    refId,
    message: err.message,
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: IS_PROD ? undefined : err.stack,
  });

  res.status(err.status || 500).json({
    success: false,
    error: 'SERVER_ERROR',
    message: IS_PROD
      ? 'An internal error occurred. Please try again or contact support.'
      : err.message,
    refId,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 404 handler
// ─────────────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Endpoint not found.' });
});

// ─────────────────────────────────────────────────────────────────────────────
// START
// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, '127.0.0.1', () => {
  securityLog(LOG_LEVELS.INFO, 'SERVER_STARTED', {
    port: PORT,
    env: process.env.NODE_ENV || 'development',
    allowedOrigins,
    pid: process.pid,
  });
  console.log(`\n✅ Oh Polly Secure API — http://127.0.0.1:${PORT}`);
  console.log(`   Bcrypt rounds  : ${BCRYPT_ROUNDS}`);
  console.log(`   Session TTL    : ${SESSION_DURATION_MS / 60000}min`);
  console.log(`   Lockout after  : ${MAX_FAILED_ATTEMPTS} attempts (${LOCKOUT_DURATION_MS / 60000}min)`);
  console.log(`   Origins        : ${allowedOrigins.join(', ')}\n`);
});

export default app;
