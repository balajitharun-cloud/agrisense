// ---------------------------------------------------------------------------
// Account service (in-memory demo store).
// Passwords are hashed with scrypt + per-user salt (never stored in clear).
// Sessions use an opaque random bearer token held server-side.
//
// Plug-in point: swap the Map for a real database (Postgres/Mongo) and the
// token for a signed JWT. The route contracts stay identical.
// ---------------------------------------------------------------------------

import crypto from 'node:crypto';

const users = new Map(); // email -> user record
const sessions = new Map(); // token -> email

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, stored) {
  const [salt, expected] = stored.split(':');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(derived, 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || '',
    language: u.language || 'en',
    regionId: u.regionId || 'ka',
    districtId: u.districtId || 'ka-blr-rural',
    farms: u.farms || [],
    createdAt: u.createdAt
  };
}

export function register({ name, email, password, phone, language, regionId, districtId }) {
  if (!name || !email || !password) {
    const e = new Error('name, email and password are required');
    e.code = 'BAD_INPUT';
    throw e;
  }
  const key = email.trim().toLowerCase();
  if (users.has(key)) {
    const e = new Error('An account with this email already exists');
    e.code = 'EXISTS';
    throw e;
  }
  const user = {
    id: 'usr_' + crypto.randomBytes(6).toString('hex'),
    name: name.trim(),
    email: key,
    phone: phone || '',
    language: language || 'en',
    regionId: regionId || 'ka',
    districtId: districtId || 'ka-blr-rural',
    passwordHash: hashPassword(password),
    farms: [],
    createdAt: new Date().toISOString()
  };
  users.set(key, user);
  return { user: publicUser(user), token: issueToken(key) };
}

export function login({ email, password }) {
  const key = (email || '').trim().toLowerCase();
  const user = users.get(key);
  if (!user || !verifyPassword(password || '', user.passwordHash)) {
    const e = new Error('Invalid email or password');
    e.code = 'AUTH';
    throw e;
  }
  return { user: publicUser(user), token: issueToken(key) };
}

function issueToken(email) {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, email);
  return token;
}

export function userFromToken(token) {
  const email = sessions.get(token);
  if (!email) return null;
  const u = users.get(email);
  return u ? publicUser(u) : null;
}

export function logout(token) {
  sessions.delete(token);
}

export function updateProfile(token, patch) {
  const email = sessions.get(token);
  const u = email && users.get(email);
  if (!u) {
    const e = new Error('Not authenticated');
    e.code = 'AUTH';
    throw e;
  }
  for (const k of ['name', 'phone', 'language', 'regionId', 'districtId']) {
    if (patch[k] != null) u[k] = patch[k];
  }
  return publicUser(u);
}

export function addFarm(token, farm) {
  const email = sessions.get(token);
  const u = email && users.get(email);
  if (!u) {
    const e = new Error('Not authenticated');
    e.code = 'AUTH';
    throw e;
  }
  const record = {
    id: 'farm_' + crypto.randomBytes(4).toString('hex'),
    name: farm.name || 'Untitled plot',
    crop: farm.crop || 'Ragi',
    areaAcres: Number(farm.areaAcres) || 1,
    regionId: farm.regionId || u.regionId,
    districtId: farm.districtId || u.districtId,
    createdAt: new Date().toISOString()
  };
  u.farms.push(record);
  return publicUser(u);
}

// Seed one demo account so the UI has something to sign in with.
register({
  name: 'Demo Farmer',
  email: 'demo@agrisense.in',
  password: 'demo1234',
  phone: '+91 90000 00000',
  language: 'kn',
  regionId: 'ka',
  districtId: 'ka-mysuru'
});
