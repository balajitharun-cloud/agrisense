import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

// Build a shareable, self-describing URL. Uses Vite's BASE_URL so it works
// both at the domain root and under /agrisense/ on GitHub Pages.
export function buildShareUrl(path, params = {}) {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const url = new URL(window.location.origin + base + path);
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, String(v));
  });
  return url.toString();
}

// Share via the native sheet when available (mobile), otherwise copy the link.
export default function ShareButton({ title, text, url, label, className = 'btn btn-sm' }) {
  const { t, toast } = useApp();
  const [done, setDone] = useState(false);

  async function onClick() {
    const shareUrl = typeof url === 'function' ? url() : url;
    if (!shareUrl) return;
    const payload = { title: title || 'AgriSense', text: text || '', url: shareUrl };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        setDone(true);
        setTimeout(() => setDone(false), 2000);
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return; // user cancelled - stay quiet
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
      toast(t('share.copied'), 'ok');
    } catch {
      toast(t('share.failed'), 'alert');
    }
  }

  return (
    <button className={className} onClick={onClick} title={t('share.title')}>
      {done ? <Check size={15} /> : <Share2 size={15} />}
      {label !== null && (done ? t('share.copiedShort') : label || t('share.action'))}
    </button>
  );
}
