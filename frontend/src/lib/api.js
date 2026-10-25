// Thin fetch wrapper. Relative /api URLs work in dev (Vite proxy) and in
// production (Express serves the built app and the API from one origin).

const BASE = '/api';

async function request(path, { method = 'GET', body, token, signal } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal
  });
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const payload = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const err = new Error((payload && payload.error) || `Request failed (${res.status})`);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  return payload;
}

export const api = {
  meta: () => request('/meta'),
  regions: () => request('/regions'),
  crops: (q) => request(`/crops/recommend?${new URLSearchParams(q)}`),
  pests: (lang) => request(`/pests?lang=${lang}`),
  pesticides: (q) => request(`/pesticides?${new URLSearchParams(q)}`),
  nodes: () => request('/sensors/nodes'),
  node: (id, lang) => request(`/sensors/${id}?lang=${lang}`),
  history: (id, points = 24) => request(`/sensors/${id}/history?points=${points}`),
  weather: (q, lang) => request(`/weather?${new URLSearchParams({ ...q, lang })}`),
  soil: (q, lang) => request(`/satellite/soil?${new URLSearchParams({ ...q, lang })}`),
  listings: (q, lang) => request(`/marketplace/listings?${new URLSearchParams({ ...q, lang })}`),
  prices: (lang) => request(`/marketplace/prices?lang=${lang}`),
  gov: (q, lang) => request(`/gov/announcements?${new URLSearchParams({ ...q, lang })}`),
  voiceStatus: () => request('/voice/status'),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  register: (body) => request('/auth/register', { method: 'POST', body }),
  me: (token) => request('/account/me', { token }),
  updateMe: (token, body) => request('/account/me', { method: 'PATCH', body, token }),
  addFarm: (token, body) => request('/account/farms', { method: 'POST', body, token })
};

// Text-to-speech: try the ElevenLabs proxy first; fall back to Web Speech.
export async function speak(text, lang = 'en') {
  const localeMap = {
    en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN',
    ml: 'ml-IN', mr: 'mr-IN', bn: 'bn-IN', gu: 'gu-IN', pa: 'pa-IN'
  };
  try {
    const res = await fetch(`${BASE}/voice/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
      return { provider: 'elevenlabs' };
    }
  } catch {
    /* fall through to Web Speech */
  }
  // Web Speech API fallback (works without any key).
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = localeMap[lang] || 'en-IN';
    u.rate = 0.98;
    window.speechSynthesis.speak(u);
    return { provider: 'webspeech' };
  }
  throw new Error('No speech engine available');
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
}
