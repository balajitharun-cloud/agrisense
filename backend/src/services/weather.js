// ---------------------------------------------------------------------------
// Weather service (Node).
// Fetches Open-Meteo through the optional egress proxy, and falls back to a
// realistic mock so the UI never breaks. All pure mapping/rules live in
// weatherCore.js so the browser build can reuse them.
// ---------------------------------------------------------------------------

import { httpFetch } from './http.js';
import {
  mockWeather,
  transformOpenMeteo,
  agronomySuggestion,
  OPEN_METEO_URL
} from './weatherCore.js';

async function fetchOpenMeteo(lat, lon) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await httpFetch(OPEN_METEO_URL(lat, lon), { signal: ctrl.signal });
    if (!res.ok) throw new Error(`open-meteo ${res.status}`);
    return transformOpenMeteo(await res.json());
  } finally {
    clearTimeout(timer);
  }
}

export async function getWeather(lat, lon) {
  let data;
  try {
    data = await fetchOpenMeteo(lat, lon);
  } catch {
    data = mockWeather(lat, lon);
  }
  return { ...data, suggestions: agronomySuggestion(data) };
}

export { mockWeather, agronomySuggestion };
