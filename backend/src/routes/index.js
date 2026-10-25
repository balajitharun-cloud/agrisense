// ---------------------------------------------------------------------------
// API routes. One router, grouped by domain. Every response carries a
// `source` field so the client can show whether data is live or mock.
// ---------------------------------------------------------------------------

import { Router } from 'express';
import { REGIONS, getRegion, getDistrict, recommendCrops } from '../data/regions.js';
import { PESTS, PESTICIDES, pesticidesFor, pestById } from '../data/pesticides.js';
import { INPUT_LISTINGS, MANDI_PRICES } from '../data/marketplace.js';
import { GOV_ANNOUNCEMENTS } from '../data/gov.js';
import { NODES, readNode, readHistory } from '../services/sensors.js';
import { getWeather } from '../services/weather.js';
import { getSoilCondition } from '../services/satellite.js';
import { LANGUAGES, translateText, localize, localizeList, translateLines } from '../services/translate.js';
import { voiceStatus, synthesize } from '../services/voice.js';
import * as account from '../services/account.js';

const router = Router();
const lang = (req) => (req.query.lang || req.body?.lang || 'en').toLowerCase();

/* --------------------------------- meta --------------------------------- */
router.get('/meta', (req, res) => {
  res.json({
    app: 'AgriSense',
    version: '1.0.0',
    languages: LANGUAGES,
    voice: voiceStatus(),
    integrations: {
      weather: process.env.OPENWEATHER_API_KEY ? 'openweather' : 'open-meteo',
      satellite: process.env.SENTINEL_HUB_CLIENT_ID ? 'sentinel-hub' : 'simulated',
      marketplace: process.env.MARKETPLACE_API_BASE ? 'live' : 'mock',
      gov: process.env.GOV_FEED_URL ? 'live-feed' : 'mock',
      voice: process.env.ELEVENLABS_API_KEY ? 'elevenlabs' : 'mock'
    }
  });
});

/* -------------------------------- regions -------------------------------- */
router.get('/regions', (req, res) => {
  res.json({ source: 'catalog', regions: REGIONS.map((r) => ({ id: r.id, state: r.state, stateLocal: r.stateLocal, lat: r.lat, lon: r.lon, agroZone: r.agroZone, districts: r.districts })) });
});

router.get('/regions/:regionId/districts', (req, res) => {
  const region = getRegion(req.params.regionId);
  res.json({ source: 'catalog', region: { id: region.id, state: region.state }, districts: region.districts });
});

router.get('/crops/recommend', (req, res) => {
  const { regionId = 'ka', districtId, season = 'Kharif', water = 'Medium' } = req.query;
  const result = recommendCrops(regionId, districtId, season, water);
  const l = lang(req);
  const recommendations = result.recommendations.map((r) => ({
    ...r,
    name: r.local?.[l] || r.name,
    reasons: translateLines(r.reasons, l)
  }));
  res.json({ source: 'catalog', ...result, recommendations });
});

/* ------------------------------- pesticides ------------------------------ */
router.get('/pests', (req, res) => {
  const l = lang(req);
  res.json({ source: 'catalog', pests: PESTS.map((p) => ({ ...p, name: p.local?.[l] || p.name })) });
});

router.get('/pesticides', (req, res) => {
  const { pestId, cropId } = req.query;
  const l = lang(req);
  let list = pestId ? pesticidesFor(pestId, cropId) : PESTICIDES;
  list = list.map((p) => ({ ...p, safety: translateText(p.safety, l).text, targetNames: p.targets.map((t) => pestById(t)?.local?.[l] || pestById(t)?.name || t) }));
  res.json({ source: 'catalog', pest: pestId ? localize(pestById(pestId), l) : null, pesticides: list });
});

router.get('/pesticides/:id', (req, res) => {
  const l = lang(req);
  const p = PESTICIDES.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'not found' });
  res.json({ source: 'catalog', pesticide: { ...p, safety: translateText(p.safety, l).text } });
});

/* -------------------------------- sensors -------------------------------- */
router.get('/sensors/nodes', (req, res) => {
  res.json({ source: 'simulated', nodes: NODES });
});

router.get('/sensors/:nodeId', (req, res) => {
  const data = readNode(req.params.nodeId);
  const l = lang(req);
  data.alerts = data.alerts.map((a) => ({ ...a, message: translateText(a.message, l).text }));
  res.json(data);
});

router.get('/sensors/:nodeId/history', (req, res) => {
  const points = Math.min(Number(req.query.points) || 24, 72);
  res.json({ source: 'simulated', history: readHistory(req.params.nodeId, points) });
});

/* -------------------------------- weather -------------------------------- */
router.get('/weather', async (req, res, next) => {
  try {
    const region = getRegion(req.query.regionId);
    const district = req.query.districtId ? getDistrict(req.query.regionId, req.query.districtId) : region.districts[0];
    const lat = Number(req.query.lat) || region.lat;
    const lon = Number(req.query.lon) || region.lon;
    const w = await getWeather(lat, lon);
    const l = lang(req);
    w.suggestions = translateLines(w.suggestions, l);
    w.location = { regionId: region.id, regionName: region.state, districtId: district.id, districtName: district.name, lat, lon };
    res.json(w);
  } catch (e) {
    next(e);
  }
});

/* ------------------------------- satellite ------------------------------- */
router.get('/satellite/soil', (req, res) => {
  const region = getRegion(req.query.regionId);
  const district = getDistrict(req.query.regionId, req.query.districtId);
  const s = getSoilCondition(district, region);
  const l = lang(req);
  s.advice = translateLines(s.advice, l);
  res.json(s);
});

/* ------------------------------ marketplace ------------------------------ */
router.get('/marketplace/listings', (req, res) => {
  const { category, crop, q } = req.query;
  const l = lang(req);
  let list = INPUT_LISTINGS;
  if (category) list = list.filter((i) => i.category.toLowerCase() === String(category).toLowerCase());
  if (crop) list = list.filter((i) => i.crop === crop);
  if (q) list = list.filter((i) => (i.title + i.seller + i.tags.join(' ')).toLowerCase().includes(String(q).toLowerCase()));
  list = list.map((i) => ({ ...i, title: i.local?.[l] || i.title }));
  res.json({ source: process.env.MARKETPLACE_API_BASE ? 'live' : 'mock', count: list.length, listings: list });
});

router.get('/marketplace/prices', (req, res) => {
  const l = lang(req);
  res.json({ source: 'mock', updated: '2026-10-24', unit: '₹/quintal', prices: MANDI_PRICES.map((p) => ({ ...p, crop: p.local?.[l] || p.crop })) });
});

/* ----------------------------------- gov --------------------------------- */
router.get('/gov/announcements', (req, res) => {
  const { region, category, level } = req.query;
  const l = lang(req);
  let list = GOV_ANNOUNCEMENTS;
  if (region) list = list.filter((g) => g.region === 'All India' || g.region.toLowerCase().includes(String(region).toLowerCase()));
  if (category) list = list.filter((g) => g.category === category);
  if (level) list = list.filter((g) => g.level === level);
  list = list.map((g) => ({ ...g, title: g.local?.[l] || g.title }));
  res.json({ source: process.env.GOV_FEED_URL ? 'live-feed' : 'mock', count: list.length, announcements: list.sort((a, b) => b.date.localeCompare(a.date)) });
});

/* --------------------------------- voice --------------------------------- */
router.get('/voice/status', (req, res) => res.json(voiceStatus()));

router.post('/voice/tts', async (req, res) => {
  const { text, voiceId, model } = req.body || {};
  if (!text || typeof text !== 'string') return res.status(400).json({ error: 'text is required' });
  try {
    const audio = await synthesize(text.slice(0, 2000), { voiceId, model });
    res.set('Content-Type', 'audio/mpeg');
    res.set('Cache-Control', 'no-store');
    res.send(audio);
  } catch (e) {
    // Not configured or upstream failure -> tell client to use Web Speech.
    const status = e.code === 'NO_KEY' ? 501 : 502;
    res.status(status).json({ error: e.message, fallback: 'webspeech' });
  }
});

/* ------------------------------- translate ------------------------------- */
router.post('/translate', (req, res) => {
  const { text, lang: target = 'en' } = req.body || {};
  if (!text) return res.status(400).json({ error: 'text is required' });
  res.json(translateText(String(text), String(target).toLowerCase()));
});

/* -------------------------------- account -------------------------------- */
function auth(req) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  return { token, user: token ? account.userFromToken(token) : null };
}

router.post('/auth/register', (req, res) => {
  try {
    res.json(account.register(req.body || {}));
  } catch (e) {
    res.status(e.code === 'EXISTS' ? 409 : 400).json({ error: e.message });
  }
});

router.post('/auth/login', (req, res) => {
  try {
    res.json(account.login(req.body || {}));
  } catch {
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

router.post('/auth/logout', (req, res) => {
  const { token } = auth(req);
  if (token) account.logout(token);
  res.json({ ok: true });
});

router.get('/account/me', (req, res) => {
  const { user } = auth(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ user });
});

router.patch('/account/me', (req, res) => {
  const { token, user } = auth(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  try {
    res.json({ user: account.updateProfile(token, req.body || {}) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/account/farms', (req, res) => {
  const { token, user } = auth(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  try {
    res.json({ user: account.addFarm(token, req.body || {}) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
