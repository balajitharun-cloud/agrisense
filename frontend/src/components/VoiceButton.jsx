import { useState } from 'react';
import { Volume2, Square, Loader2 } from 'lucide-react';
import { speak, stopSpeaking } from '../lib/api.js';
import { useApp } from '../context/AppContext.jsx';

// Reads the given text aloud. Uses the ElevenLabs proxy when configured,
// otherwise the browser's Web Speech engine.
export default function VoiceButton({ text, label, className = 'btn btn-sm', title }) {
  const { lang, t, toast } = useApp();
  const [state, setState] = useState('idle'); // idle | loading | playing

  async function onClick() {
    if (state === 'playing') {
      stopSpeaking();
      setState('idle');
      return;
    }
    if (!text) return;
    setState('loading');
    try {
      const res = await speak(text, lang);
      setState('playing');
      toast(res.provider === 'elevenlabs' ? 'Playing via ElevenLabs' : 'Playing via device voice', 'ok');
      // Web Speech has no reliable end event across browsers; reset after a while.
      const est = Math.min(30000, 2200 + text.length * 55);
      setTimeout(() => setState((s) => (s === 'playing' ? 'idle' : s)), est);
    } catch (e) {
      setState('idle');
      toast(e.message || 'Voice unavailable', 'alert');
    }
  }

  return (
    <button className={className} onClick={onClick} title={title || t('voice.readAloud')} disabled={state === 'loading'}>
      {state === 'loading' ? <Loader2 size={15} className="spin" /> : state === 'playing' ? <Square size={15} /> : <Volume2 size={15} />}
      {label !== null && (state === 'playing' ? t('voice.playing') : label || t('voice.readAloud'))}
    </button>
  );
}
