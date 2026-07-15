import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createHash, randomBytes } from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the backend directory regardless of cwd
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
const SESSION_DURATION_MS = (parseInt(process.env.SESSION_DURATION_MINUTES) || 30) * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
const LOCKOUT_DURATION_MS = (parseInt(process.env.LOCKOUT_DURATION_MINUTES) || 5) * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────────
// CORS — only allow whitelisted origins
// ─────────────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, same-origin)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation: origin not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ─────────────────────────────────────────────────────────────────────────────
// Body parser with size limit to prevent oversized payload attacks
// ─────────────────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ─────────────────────────────────────────────────────────────────────────────
// Security Headers middleware — applied to EVERY response
// ─────────────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Basic XSS filter for older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // HSTS — force HTTPS for 1 year (enable when behind HTTPS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  // Control referrer info sent with requests
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Restrict browser features
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Remove Express fingerprint header
  res.removeHeader('X-Powered-By');
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// In-memory Rate Limiter (IP-based, no external deps)
// ─────────────────────────────────────────────────────────────────────────────
const rateLimitStore = new Map(); // { ip: { count, resetAt } }

function rateLimiter(maxRequests, windowMs) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const record = rateLimitStore.get(ip);

    if (!record || now > record.resetAt) {
      rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    record.count++;
    if (record.count > maxRequests) {
      const retryAfterSecs = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSecs);
      return res.status(429).json({
        success: false,
        error: 'TOO_MANY_REQUESTS',
        message: `Too many requests. Please retry after ${retryAfterSecs} seconds.`,
        retryAfter: retryAfterSecs,
      });
    }
    next();
  };
}

// Clean up the rate limit store every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) rateLimitStore.delete(ip);
  }
}, 10 * 60 * 1000);

// ─────────────────────────────────────────────────────────────────────────────
// Input Sanitizer — strips dangerous HTML/script characters
// ─────────────────────────────────────────────────────────────────────────────
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>'"`;]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Password Hasher — deterministic SHA-256 + salt (simulates bcrypt behaviour)
// ─────────────────────────────────────────────────────────────────────────────
function hashPassword(password, salt) {
  const s = salt || randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(`${s}:${password}:${JWT_SECRET}`)
    .digest('hex');
  return { hash: `${s}:${hash}`, salt: s };
}

function verifyPassword(password, storedHash) {
  try {
    const [salt] = storedHash.split(':');
    const { hash } = hashPassword(password, salt);
    return hash === storedHash;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Token generator — HMAC-signed token (simulates JWT behaviour)
// ─────────────────────────────────────────────────────────────────────────────
function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'TOKEN' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + SESSION_DURATION_MS })).toString('base64url');
  const signature = createHash('sha256').update(`${header}.${body}.${JWT_SECRET}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token) {
  try {
    const [header, body, signature] = token.split('.');
    const expectedSig = createHash('sha256').update(`${header}.${body}.${JWT_SECRET}`).digest('base64url');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp < Date.now()) return null; // expired
    return payload;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// In-Memory User Store (replace with a real DB in production)
// ─────────────────────────────────────────────────────────────────────────────
const userStore = new Map(); // { email: { passwordHash, firstName, lastName, createdAt, points } }
const loginAttemptStore = new Map(); // { email: { attempts, lockedUntil } }

// Pre-seed a demo account for testing
const demoHash = hashPassword('OhPolly@2026!');
userStore.set('demo@ohpolly.com', {
  passwordHash: demoHash.hash,
  firstName: 'Demo',
  lastName: 'User',
  createdAt: new Date().toISOString(),
  points: 150,
});

// ─────────────────────────────────────────────────────────────────────────────
// Auth middleware — validates Bearer token on protected endpoints
// ─────────────────────────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'Missing or invalid auth token.' });
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, error: 'TOKEN_EXPIRED', message: 'Session expired. Please log in again.' });
  }
  req.user = payload;
  next();
}

// ─────────────────────────────────────────────────────────────────────────────
// ── AUTH ROUTES ──────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', rateLimiter(10, 60_000), (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Validate presence
  if (!email || !password || !firstName) {
    return res.status(400).json({ success: false, error: 'MISSING_FIELDS', message: 'Email, password, and first name are required.' });
  }

  const cleanEmail = sanitizeString(email).toLowerCase();
  const cleanFirstName = sanitizeString(firstName);
  const cleanLastName = sanitizeString(lastName || '');

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ success: false, error: 'INVALID_EMAIL', message: 'Please provide a valid email address.' });
  }

  // Password strength: min 8 chars, 1 uppercase, 1 number, 1 special char
  const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  if (!strongPasswordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      error: 'WEAK_PASSWORD',
      message: 'Password must be at least 8 characters with 1 uppercase letter, 1 number, and 1 special character.',
    });
  }

  // Check if user already exists
  if (userStore.has(cleanEmail)) {
    return res.status(409).json({ success: false, error: 'EMAIL_EXISTS', message: 'An account with this email already exists.' });
  }

  // Hash password and store user
  const { hash } = hashPassword(password);
  userStore.set(cleanEmail, {
    passwordHash: hash,
    firstName: cleanFirstName,
    lastName: cleanLastName,
    createdAt: new Date().toISOString(),
    points: 0,
    lastLogin: null,
  });

  const token = generateToken({ email: cleanEmail, firstName: cleanFirstName });

  return res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    token,
    user: { email: cleanEmail, name: `${cleanFirstName} ${cleanLastName}`.trim(), firstName: cleanFirstName, points: 0 },
    expiresIn: SESSION_DURATION_MS,
  });
});

// POST /api/auth/login
app.post('/api/auth/login', rateLimiter(20, 60_000), (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'MISSING_FIELDS', message: 'Email and password are required.' });
  }

  const cleanEmail = sanitizeString(email).toLowerCase();
  const now = Date.now();

  // Check lockout
  const attemptRecord = loginAttemptStore.get(cleanEmail);
  if (attemptRecord && attemptRecord.lockedUntil > now) {
    const remainingSecs = Math.ceil((attemptRecord.lockedUntil - now) / 1000);
    return res.status(423).json({
      success: false,
      error: 'ACCOUNT_LOCKED',
      message: `Account temporarily locked. Try again in ${Math.ceil(remainingSecs / 60)} minute(s).`,
      remainingSeconds: remainingSecs,
      lockedUntil: attemptRecord.lockedUntil,
    });
  }

  const user = userStore.get(cleanEmail);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    // Track failed attempt
    const existing = loginAttemptStore.get(cleanEmail) || { attempts: 0, lockedUntil: 0 };
    const attempts = (now > existing.lockedUntil ? 0 : existing.attempts) + 1;
    const lockedUntil = attempts >= MAX_LOGIN_ATTEMPTS ? now + LOCKOUT_DURATION_MS : 0;

    loginAttemptStore.set(cleanEmail, { attempts, lockedUntil });

    const remainingAttempts = Math.max(0, MAX_LOGIN_ATTEMPTS - attempts);
    return res.status(401).json({
      success: false,
      error: 'INVALID_CREDENTIALS',
      message: remainingAttempts > 0
        ? `Invalid email or password. ${remainingAttempts} attempt(s) remaining.`
        : 'Account locked due to too many failed attempts.',
      remainingAttempts,
      locked: lockedUntil > 0,
      lockedUntil: lockedUntil || undefined,
    });
  }

  // Clear failed attempts on success
  loginAttemptStore.delete(cleanEmail);

  // Update last login
  user.lastLogin = new Date().toISOString();

  const token = generateToken({ email: cleanEmail, firstName: user.firstName });

  return res.json({
    success: true,
    message: 'Logged in successfully.',
    token,
    user: {
      email: cleanEmail,
      name: `${user.firstName} ${user.lastName}`.trim(),
      firstName: user.firstName,
      points: user.points,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
    expiresIn: SESSION_DURATION_MS,
  });
});

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', rateLimiter(5, 60_000), (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'MISSING_EMAIL', message: 'Email is required.' });
  }
  const cleanEmail = sanitizeString(email).toLowerCase();
  // Always return success to prevent email enumeration attacks
  const exists = userStore.has(cleanEmail);
  if (exists) {
    // In production: send real email with signed reset link
    const resetToken = randomBytes(32).toString('hex');
    console.log(`[RESET] Token for ${cleanEmail}: ${resetToken} (would be emailed in production)`);
  }
  return res.json({
    success: true,
    message: 'If an account exists with that email, a password reset link has been sent.',
  });
});

// GET /api/auth/verify — validate a token
app.get('/api/auth/verify', requireAuth, (req, res) => {
  const user = userStore.get(req.user.email);
  if (!user) return res.status(404).json({ success: false, error: 'USER_NOT_FOUND' });
  return res.json({
    success: true,
    user: {
      email: req.user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
      firstName: user.firstName,
      points: user.points,
      lastLogin: user.lastLogin,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ── INSTAGRAM FEED ───────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_INSTAGRAM_FEED = [
  { id: "1", media_type: "VIDEO", media_url: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0542d87e17c07ba913c9edc2380a786&profile_id=139&oauth2_token_id=57447761", thumbnail_url: "/images/products/product_dress3.png", caption: "Sela dress in action ✨ designed to snatch curves. Shop link in bio. #ohpolly #irl #fashion", likes: 1420, username: "sarah_style", permalink: "https://instagram.com", timestamp: "2026-07-14T09:00:00+0000" },
  { id: "2", media_type: "IMAGE", media_url: "/images/products/product_dress2.png", thumbnail_url: "/images/products/product_dress2.png", caption: "Elegance is effortless in Livia 💛 The perfect lace details. #ootd #summerdresses #ohpolly", likes: 980, username: "mya_rose", permalink: "https://instagram.com", timestamp: "2026-07-14T08:30:00+0000" },
  { id: "3", media_type: "VIDEO", media_url: "https://player.vimeo.com/external/435674703.sd.mp4?s=7f77f1396a802779fa7ec5d4be108605c48b26f5&profile_id=165&oauth2_token_id=57447761", thumbnail_url: "/images/products/product_dress1.png", caption: "Valencia drape mini in chocolate 🍫 date night ready. #ohpolly #satindress #luxury", likes: 2150, username: "elizabeth_gray", permalink: "https://instagram.com", timestamp: "2026-07-14T08:00:00+0000" },
  { id: "4", media_type: "IMAGE", media_url: "/images/products/product_dress4.png", thumbnail_url: "/images/products/product_dress4.png", caption: "Obsessed with the Analia corset mini dress 🌸 Pink perfection. #corsetdress #ohpolly #irl", likes: 1105, username: "chloe_luxe", permalink: "https://instagram.com", timestamp: "2026-07-14T07:15:00+0000" },
  { id: "5", media_type: "VIDEO", media_url: "https://player.vimeo.com/external/482898951.sd.mp4?s=d009088ffc32ef8508e6c71c4c114f09d846ff9b&profile_id=165&oauth2_token_id=57447761", thumbnail_url: "/images/ui/hero_model.png", caption: "Resort drop is here 🌴 Sorrento backless knit dress. #resortwear #ohpolly #summerfit", likes: 1845, username: "sophia_travels", permalink: "https://instagram.com", timestamp: "2026-07-14T06:00:00+0000" },
];

app.get('/api/instagram/feed', rateLimiter(30, 60_000), async (req, res) => {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token || token === 'YOUR_INSTAGRAM_ACCESS_TOKEN_HERE') {
    return res.json({ data: MOCK_INSTAGRAM_FEED, source: 'mock-backend-fallback' });
  }
  try {
    const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username';
    const response = await fetch(`https://graph.instagram.com/me/media?fields=${fields}&access_token=${token}`);
    if (!response.ok) throw new Error(`Instagram API error: ${response.status}`);
    const data = await response.json();
    return res.json({ data: data.data || [], source: 'instagram-graph-api' });
  } catch (error) {
    console.error('[Instagram] Falling back to mock:', error.message);
    return res.json({ data: MOCK_INSTAGRAM_FEED, source: 'mock-backend-fallback', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Global error handler
// ─────────────────────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({ success: false, error: 'SERVER_ERROR', message: 'An internal server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`\n✅ Oh Polly Express backend running on http://localhost:${PORT}`);
  console.log(`   Auth API : POST /api/auth/login | /api/auth/register | /api/auth/forgot-password`);
  console.log(`   Allowed origins: ${allowedOrigins.join(', ')}\n`);
});
