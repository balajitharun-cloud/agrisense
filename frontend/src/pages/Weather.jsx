import { useMemo } from 'react';
import { CloudSun, Droplets, Wind, Thermometer, Sun, Sprout } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../lib/api.js';
import { useAsync } from '../lib/hooks.js';
import { Card, SectionHead, SourceBadge, Spinner, ErrorState, Badge } from '../components/ui.jsx';
import VoiceButton from '../components/VoiceButton.jsx';

export default function Weather() {
  const { t, lang, regionId, districtId } = useApp();
  const { data, loading, error, reload } = useAsync(
    () => api.weather({ regionId, districtId }, lang),
    [regionId, districtId, lang]
  );

  const speech = useMemo(() => {
    if (!data) return '';
    const c = data.current;
    return `Current conditions at ${data.location.districtName}: ${c.condition}, ${c.tempC} degrees celsius, humidity ${c.humidity} percent, wind ${c.windKph} kilometres per hour. ${data.suggestions.join(' ')}`;
  }, [data]);

  if (loading && !data) return <Spinner label={t('common.loading')} />;
  if (error && !data) return <ErrorState error={error} onRetry={reload} retryLabel={t('common.retry')} />;

  const c = data.current;

  return (
    <>
      <SectionHead
        eyebrow={data.location.districtName}
        title={t('weather.title')}
        sub={t('weather.subtitle')}
        right={<div className="row" style={{ gap: 8 }}><SourceBadge source={data.source} /><VoiceButton text={speech} /></div>}
      />

      <div className="grid g-3" style={{ alignItems: 'start', marginBottom: 'var(--sp-4)' }}>
        <Card className="span-2">
          <div className="row between wrap" style={{ alignItems: 'flex-start' }}>
            <div>
              <div className="eyebrow">{c.condition}</div>
              <div className="stat-value" style={{ fontSize: 'var(--step-5)' }}>{c.tempC}<span className="stat-unit"> °C</span></div>
              <div className="card-sub" style={{ marginTop: 6 }}>{data.location.regionName} · {data.location.districtName}</div>
            </div>
            <div className="grid g-2" style={{ gap: 12, minWidth: 260 }}>
              <div className="row" style={{ gap: 8 }}><Droplets size={16} style={{ color: 'var(--info)' }} /><div><div className="stat-label">Humidity</div><span className="mono">{c.humidity}%</span></div></div>
              <div className="row" style={{ gap: 8 }}><Wind size={16} style={{ color: 'var(--ink-3)' }} /><div><div className="stat-label">Wind</div><span className="mono">{c.windKph} km/h</span></div></div>
              <div className="row" style={{ gap: 8 }}><Sprout size={16} style={{ color: 'var(--primary)' }} /><div><div className="stat-label">Soil temp</div><span className="mono">{c.soilTempC ?? '—'}°C</span></div></div>
              <div className="row" style={{ gap: 8 }}><Sun size={16} style={{ color: 'var(--accent)' }} /><div><div className="stat-label">ET₀</div><span className="mono">{c.et0Mm ?? '—'} mm</span></div></div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="card-head"><h3 className="row" style={{ gap: 8 }}><CloudSun size={18} /> {t('weather.advice')}</h3></div>
          <div className="stack" style={{ gap: 10 }}>
            {data.suggestions.map((s, i) => (
              <div key={i} className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                <span className="dot" style={{ color: 'var(--accent)', marginTop: 7 }} />
                <span style={{ fontSize: '0.9rem' }}>{s}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="card-head"><h3>{t('weather.forecast')}</h3><span className="src mono">7 days · mm rainfall</span></div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--sp-3)' }}>
          {data.daily.map((d, i) => (
            <div key={d.date} className="stack" style={{ gap: 8, padding: 'var(--sp-3)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', background: i === 0 ? 'var(--primary-soft)' : 'var(--surface-2)' }}>
              <div className="row between">
                <span style={{ fontWeight: 600, fontSize: '0.84rem' }}>{i === 0 ? t('common.today') : d.day}</span>
                <span className="src mono">{d.date.slice(5)}</span>
              </div>
              <div className="stat-value" style={{ fontSize: 'var(--step-2)' }}>{d.tMax}°<span className="stat-unit" style={{ fontSize: '0.75rem' }}> /{d.tMin}°</span></div>
              <div className="card-sub" style={{ minHeight: 32 }}>{d.condition}</div>
              <div className="row" style={{ gap: 5, fontSize: '0.78rem', color: 'var(--info)' }}><Droplets size={12} /><span className="mono">{d.rainMm} mm</span></div>
              <div className="row" style={{ gap: 5, fontSize: '0.78rem', color: 'var(--ink-3)' }}><Wind size={12} /><span className="mono">{d.windKph} km/h</span></div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ marginTop: 'var(--sp-4)' }}>
        <Badge tone="info">
          <Thermometer size={12} /> Weather source: {data.source === 'open-meteo' ? 'Open-Meteo (live)' : 'simulated fallback'} — set OPENWEATHER_API_KEY in the backend .env to switch providers.
        </Badge>
      </div>
    </>
  );
}
