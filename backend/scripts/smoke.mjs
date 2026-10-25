// Smoke test: boots the app on an ephemeral port and exercises every route.
// Run: node scripts/smoke.mjs
import app from '../src/app.js';

const server = app.listen(0);
await new Promise((r) => server.once('listening', r));
const base = `http://127.0.0.1:${server.address().port}`;

let pass = 0;
let fail = 0;
async function check(name, path, { method = 'GET', body, token, expect = 200 } = {}) {
  try {
    const res = await fetch(base + path, {
      method,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
    const ok = res.status === expect;
    let detail = '';
    let data = null;
    if (ok) {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        data = await res.json();
        detail = summarize(data);
      } else {
        const buf = await res.arrayBuffer();
        detail = `${buf.byteLength} bytes ${ct}`;
      }
    } else {
      detail = `expected ${expect}, got ${res.status}`;
    }
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(34)} ${detail}`);
    ok ? pass++ : fail++;
    return { res, data };
  } catch (e) {
    console.log(`FAIL  ${name.padEnd(34)} ${e.message}`);
    fail++;
  }
}

function summarize(j) {
  if (Array.isArray(j)) return `array[${j.length}]`;
  const keys = Object.keys(j);
  const counts = keys.filter((k) => Array.isArray(j[k])).map((k) => `${k}:${j[k].length}`);
  return counts.length ? counts.join(' ') : keys.slice(0, 4).join(',');
}

console.log('\n--- AgriSense API smoke test ---\n');
await check('GET /health', '/health');
await check('GET /api/meta', '/api/meta');
await check('GET /api/regions', '/api/regions');
await check('GET districts', '/api/regions/ka/districts');
await check('GET crops/recommend', '/api/crops/recommend?regionId=ka&districtId=ka-mysuru&season=Kharif&water=Medium');
await check('GET crops (kannada)', '/api/crops/recommend?regionId=ka&districtId=ka-mysuru&season=Kharif&water=Medium&lang=kn');
await check('GET /api/pests', '/api/pests?lang=kn');
await check('GET /api/pesticides', '/api/pesticides?pestId=fall-armyworm&lang=hi');
await check('GET pesticide by id', '/api/pesticides/imidacloprid');
await check('GET sensors/nodes', '/api/sensors/nodes');
await check('GET sensor node', '/api/sensors/node-blr-01?lang=kn');
await check('GET sensor history', '/api/sensors/node-blr-01/history?points=24');
await check('GET /api/weather', '/api/weather?regionId=ka&districtId=ka-mysuru&lang=kn');
await check('GET satellite/soil', '/api/satellite/soil?regionId=ka&districtId=ka-mysuru&lang=hi');
await check('GET marketplace/listings', '/api/marketplace/listings?category=Seeds&lang=kn');
await check('GET marketplace/prices', '/api/marketplace/prices?lang=kn');
await check('GET gov/announcements', '/api/gov/announcements?lang=kn');
await check('GET voice/status', '/api/voice/status');
await check('POST voice/tts (no key)', '/api/voice/tts', { method: 'POST', body: { text: 'hello' }, expect: 501 });
await check('POST /api/translate', '/api/translate', { method: 'POST', body: { text: 'Dry spell ahead - plan irrigation and mulch to conserve soil moisture.', lang: 'kn' } });

// Account flow
const email = `smoke_${Date.now()}@agrisense.in`;
const { data: regBody } = await check('POST auth/register', '/api/auth/register', { method: 'POST', body: { name: 'Smoke Test', email, password: 'secret123' } });
const token = regBody.token;
await check('GET account/me', '/api/account/me', { token });
await check('PATCH account/me', '/api/account/me', { method: 'PATCH', token, body: { language: 'kn' } });
await check('POST account/farms', '/api/account/farms', { method: 'POST', token, body: { name: 'North Plot', crop: 'Maize', areaAcres: 2.5 } });
await check('POST auth/login', '/api/auth/login', { method: 'POST', body: { email, password: 'secret123' } });
await check('login wrong password', '/api/auth/login', { method: 'POST', body: { email, password: 'nope' }, expect: 401 });
await check('account/me unauth', '/api/account/me', { expect: 401 });

console.log(`\n--- ${pass} passed, ${fail} failed ---\n`);
server.close();
process.exit(fail ? 1 : 0);
