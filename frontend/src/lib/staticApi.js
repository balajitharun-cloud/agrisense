// ---------------------------------------------------------------------------
// Static API adapter for the GitHub Pages build.
//
// GitHub Pages serves static files only, so there is no Express server. This
// module implements the SAME method surface as lib/api.js by importing the
// backend's pure modules directly into the browser bundle:
//   * data/*.js         - plain data + the crop-scoring function
//   * services/sensors  - the diurnal telemetry model (Date-based, stateless)
//   * services/satellite- the seeded soil-index model
//   * services/translate- the phrase dictionary
//   * services/weatherCore - pure weather mapping (no undici)
//
// Weather stays LIVE: Open-Meteo is CORS-enabled, so the browser calls it
// directly and falls back to the mock if that fails.
// Accounts become browser-local (localStorage + SHA-256 hashed passwords)
// because there is no server to hold a session.
// ---------------------------------------------------------------------------

import { getRegion, getDistrict, recommendCrops, REGIONS } from '../../../backend/src/data/regions.js';
import { PESTS, PESTICIDES, pesticidesFor, pestById } from '../../../backend/src/data/pesticides.js';
import { INPUT_LISTINGS, MANDI_PRICES } from '../../../backend/src/data/marketplace.js';
import { GOV_ANNOUNCEMENTS } from '../../../backend/src/data/gov.js';
import { NODES, readNode, readHistory } from '../../../backend/src/services/sensors.js';
import { getSoilCondition } from '../../../backend/src/services/satellite.js';
import { LANGUAGES, translateText, localize, translateLines } from '../../../backend/src/services/translate.js';
import {
  mockWeather, transformOpenMeteo, agronomySuggestion, OPEN_METEO_URL
} from '../../../backend/src/services/weatherCore.js';

const wait = (ms = 90) => new Promise((r) => setTimeout(r, ms)); // keeps the UI's loading states honest

/* ------------------------------- meta ---------------------------------- */
async function meta() {
  return {
    app: 'AgriSense',
    version: '1.0.0-static',
    languages: LANGUAGES,
    voice: {
      available: false,
      provider: 'webspeech',
      model: 'browser',
      voiceId: null,
      fallback: 'webspeech',
      note: 'Static build: voice uses the browser Web Speech engine. Deploy the Node backend and set ELEVENLABS_API_KEY for ElevenLabs.'
    },
    integrations: {
      weather: 'open-meteo (browser)',
      satellite: 'simulated',
      marketplace: 'mock',
      gov: 'mock',
      voice: 'webspeech',
      api: 'static (no backend)'
    }
  };
}

/* ------------------------------- regions -------------------------------- */
async function regions() {
  return {
    source: 'catalog',
    regions: REGIONS.map((r) => ({
      id: r.id, state: r.state, stateLocal: r.stateLocal, lat: r.lat, lon: r.lon,
      agroZone: r.agroZone, districts: r.districts
    }))
  };
}

async function crops({ regionId = 'ka', districtId, season = 'Kharif', water = 'Medium', lang = 'en' }) {
  await wait();
  const result = recommendCrops(regionId, districtId, season, water);
  return {
    source: 'catalog',
    ...result,
    recommendations: result.recommendations.map((r) => ({
      ...r,
      name: r.local?.[lang] || r.name,
      reasons: translateLines(r.reasons, lang)
    }))
  };
}

/* ------------------------------ pesticides ------------------------------ */
async function pests(lang = 'en') {
  return { source: 'catalog', pests: PESTS.map((p) => ({ ...p, name: p.local?.[lang] || p.name })) };
}

async function pesticides({ pestId, cropId, lang = 'en' } = {}) {
  await wait();
  const list = (pestId ? pesticidesFor(pestId, cropId) : PESTICIDES).map((p) => ({
    ...p,
    safety: translateText(p.safety, lang).text,
    targetNames: p.targets.map((t) => pestById(t)?.local?.[lang] || pestById(t)?.name || t)
  }));
  return { source: 'catalog', pest: pestId ? localize(pestById(pestId), lang) : null, pesticides: list };
}

/* -------------------------------- sensors ------------------------------- */
async function nodes() {
  return { source: 'simulated', nodes: NODES };
}

async function node(nodeId, lang = 'en') {
  const data = readNode(nodeId);
  data.alerts = data.alerts.map((a) => ({ ...a, message: translateText(a.message, lang).text }));
  return data;
}

async function history(nodeId, points = 24) {
  return { source: 'simulated', history: readHistory(nodeId, Math.min(points, 72)) };
}

/* -------------------------------- weather ------------------------------- */
async function weather({ regionId = 'ka', districtId, lat, lon } = {}, lang = 'en') {
  const region = getRegion(regionId);
  const district = districtId ? getDistrict(regionId, districtId) : region.districts[0];
  const la = Number(lat) || region.lat;
  const lo = Number(lon) || region.lon;

  let data;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    try {
      const res = await fetch(OPEN_METEO_URL(la, lo), { signal: ctrl.signal });
      if (!res.ok) throw new Error(`open-meteo ${res.status}`);
      data = transformOpenMeteo(await res.json());
    } finally {
      clearTimeout(timer);
    }
  } catch {
    data = mockWeather(la, lo);
  }

  return {
    ...data,
    suggestions: translateLines(agronomySuggestion(data), lang),
    location: {
      regionId: region.id, regionName: region.state,
      districtId: district.id, districtName: district.name, lat: la, lon: lo
    }
  };
}

/* ------------------------------- satellite ------------------------------ */
async function soil({ regionId = 'ka', districtId } = {}, lang = 'en') {
  await wait();
  const region = getRegion(regionId);
  const district = getDistrict(regionId, districtId);
  const s = getSoilCondition(district, region);
  s.advice = translateLines(s.advice, lang);
  return s;
}

/* ------------------------------ marketplace ----------------------------- */
async function listings({ category, crop, q } = {}, lang = 'en') {
  let list = INPUT_LISTINGS;
  if (category) list = list.filter((i) => i.category.toLowerCase() === String(category).toLowerCase());
  if (crop) list = list.filter((i) => i.crop === crop);
  if (q) {
    const needle = String(q).toLowerCase();
    list = list.filter((i) => (i.title + i.seller + i.tags.join(' ')).toLowerCase().includes(needle));
  }
  return {
    source: 'mock',
    count: list.length,
    listings: list.map((i) => ({ ...i, title: i.local?.[lang] || i.title }))
  };
}

async function prices(lang = 'en') {
  return {
    source: 'mock', updated: '2026-10-24', unit: '₹/quintal',
    prices: MANDI_PRICES.map((p) => ({ ...p, crop: p.local?.[lang] || p.crop }))
  };
}

/* ---------------------------------- gov --------------------------------- */
async function gov({ region, category, level } = {}, lang = 'en') {
  let list = GOV_ANNOUNCEMENTS;
  if (region) list = list.filter((g) => g.region === 'All India' || g.region.toLowerCase().includes(String(region).toLowerCase()));
  if (category) list = list.filter((g) => g.category === category);
  if (level) list = list.filter((g) => g.level === level);
  return {
    source: 'mock',
    count: list.length,
    announcements: list
      .map((g) => ({ ...g, title: g.local?.[lang] || g.title }))
      .sort((a, b) => b.date.localeCompare(a.date))
  };
}

/* --------------------------------- voice -------------------------------- */
async function voiceStatus() {
  return { available: false, provider: 'webspeech', fallback: 'webspeech' };
}

/* -------------------------------- account -------------------------------
 * Browser-local demo accounts. Passwords are SHA-256 hashed before being
 * written to localStorage - still a demo store, not a security boundary.
 * ---------------------------------------------------------------------- */
const USERS_KEY = 'agrisense.static.users';
const SESSION_KEY = 'agrisense.static.session';

function readUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); } catch { return []; }
}
function writeUsers(users) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch { /* quota/private mode */ }
}
function readSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}
function writeSession(s) {
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
}

async function hashPassword(password) {
  const data = new TextEncoder().encode('agrisense-demo:' + password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function publicUser(u) {
  const { passwordHash, ...rest } = u;
  return rest;
}

async function register({ name, email, password, phone, language, regionId, districtId }) {
  if (!name || !email || !password) throw new Error('name, email and password are required');
  const key = email.trim().toLowerCase();
  const users = readUsers();
  if (users.some((u) => u.email === key)) throw new Error('An account with this email already exists');
  const user = {
    id: 'usr_' + Math.random().toString(36).slice(2, 10),
    name: name.trim(),
    email: key,
    phone: phone || '',
    language: language || 'en',
    regionId: regionId || 'ka',
    districtId: districtId || 'ka-mysuru',
    passwordHash: await hashPassword(password),
    farms: [],
    createdAt: new Date().toISOString()
  };
  users.push(user);
  writeUsers(users);
  const token = 'static_' + Math.random().toString(36).slice(2);
  writeSession({ token, email: key });
  return { user: publicUser(user), token };
}

async function login({ email, password }) {
  const key = (email || '').trim().toLowerCase();
  const users = readUsers();
  const user = users.find((u) => u.email === key);
  if (!user || user.passwordHash !== (await hashPassword(password || ''))) {
    throw new Error('Invalid email or password');
  }
  const token = 'static_' + Math.random().toString(36).slice(2);
  writeSession({ token, email: key });
  return { user: publicUser(user), token };
}

async function me() {
  const session = readSession();
  if (!session) throw new Error('Not authenticated');
  const user = readUsers().find((u) => u.email === session.email);
  if (!user) throw new Error('Not authenticated');
  return { user: publicUser(user) };
}

async function updateMe(patch = {}) {
  const session = readSession();
  if (!session) throw new Error('Not authenticated');
  const users = readUsers();
  const user = users.find((u) => u.email === session.email);
  if (!user) throw new Error('Not authenticated');
  for (const k of ['name', 'phone', 'language', 'regionId', 'districtId']) {
    if (patch[k] != null) user[k] = patch[k];
  }
  writeUsers(users);
  return { user: publicUser(user) };
}

async function addFarm(farm = {}) {
  const session = readSession();
  if (!session) throw new Error('Not authenticated');
  const users = readUsers();
  const user = users.find((u) => u.email === session.email);
  if (!user) throw new Error('Not authenticated');
  user.farms = user.farms || [];
  user.farms.push({
    id: 'farm_' + Math.random().toString(36).slice(2, 8),
    name: farm.name || 'Untitled plot',
    crop: farm.crop || 'Ragi',
    areaAcres: Number(farm.areaAcres) || 1,
    regionId: farm.regionId || user.regionId,
    districtId: farm.districtId || user.districtId,
    createdAt: new Date().toISOString()
  });
  writeUsers(users);
  return { user: publicUser(user) };
}

async function logout() {
  writeSession(null);
  return { ok: true };
}

// Seed the same demo credentials as the server build, so the UI's
// "Use demo account" button works identically on Pages.
if (typeof localStorage !== 'undefined' && !readUsers().length) {
  hashPassword('demo1234').then((passwordHash) => {
    writeUsers([{
      id: 'usr_demo',
      name: 'Demo Farmer',
      email: 'demo@agrisense.in',
      phone: '+91 90000 00000',
      language: 'kn',
      regionId: 'ka',
      districtId: 'ka-mysuru',
      passwordHash,
      farms: [],
      createdAt: new Date().toISOString()
    }]);
  }).catch(() => { /* crypto unavailable - user can still register */ });
}

export const api = {
  meta, regions, crops, pests, pesticides,
  nodes, node, history,
  weather, soil,
  listings, prices, gov,
  voiceStatus,
  register, login, me, updateMe, addFarm, logout
};

export default api;
