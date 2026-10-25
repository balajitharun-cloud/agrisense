// ---------------------------------------------------------------------------
// Voice service - ElevenLabs text-to-speech proxy.
// If ELEVENLABS_API_KEY is set, the server calls the ElevenLabs
// text-to-speech endpoint and streams back audio/mpeg. Otherwise it returns
// { available:false } and the frontend falls back to the browser's Web Speech
// API so the feature still works offline.
//
// ElevenLabs multilingual model (eleven_multilingual_v2) handles Hindi,
// Kannada, Tamil, Telugu, Marathi and more with the same voice id.
// ---------------------------------------------------------------------------

import { httpFetch } from './http.js';

const EL_BASE = 'https://api.elevenlabs.io/v1/text-to-speech';

export function voiceStatus() {
  return {
    available: Boolean(process.env.ELEVENLABS_API_KEY),
    provider: 'elevenlabs',
    model: process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2',
    voiceId: process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM',
    fallback: 'webspeech'
  };
}

// Returns a Buffer of audio, or throws. Caller maps errors to HTTP status.
export async function synthesize(text, { voiceId, model } = {}) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    const err = new Error('ELEVENLABS_API_KEY not configured');
    err.code = 'NO_KEY';
    throw err;
  }
  const voice = voiceId || process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
  const mdl = model || process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await httpFetch(`${EL_BASE}/${voice}`, {
      method: 'POST',
      headers: {
        'xi-api-key': key,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        model_id: mdl,
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true }
      }),
      signal: ctrl.signal
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      const err = new Error(`ElevenLabs ${res.status}: ${detail.slice(0, 200)}`);
      err.code = 'UPSTREAM';
      throw err;
    }
    return Buffer.from(await res.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
}
