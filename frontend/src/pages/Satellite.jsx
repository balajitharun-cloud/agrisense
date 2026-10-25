import { useMemo } from 'react';
import { Satellite as SatIcon, Leaf, Droplets, FlaskConical, Map, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../lib/api.js';
import { useAsync } from '../lib/hooks.js';
import { Card, SectionHead, SourceBadge, Spinner, ErrorState, Badge, Meter, Stat } from '../components/ui.jsx';
import VoiceButton from '../components/VoiceButton.jsx';

function Ring({ value, max = 1, label, tone = 'var(--primary)' }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = 52;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 132, height: 132 }}>
      <svg width="132" height="132" viewBox="0 0 132 132">
        <circle cx="66" cy="66" r={r} fill="none" stroke="var(--line)" strokeWidth="9" />
        <circle
          cx="66" cy="66" r={r} fill="none" stroke={tone} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          transform="rotate(-90 66 66)"
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <div className="stat-value" style={{ fontSize: 'var(--step-3)' }}>{value}</div>
          <div className="stat-label" style={{ fontSize: '0.62rem' }}>{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function Satellite() {
  const { t, lang, regionId, districtId } = useApp();
  const { data, loading, error, reload } = useAsync(
    () => api.soil({ regionId, districtId }, lang),
    [regionId, districtId, lang]
  );

  const speech = useMemo(() => {
    if (!data) return '';
    return `Soil and satellite reading for ${data.district.name}. Soil type ${data.soilType}. NDVI ${data.indices.ndvi}, surface moisture index ${data.indices.ndwi}. Overall health ${data.health}. ${data.advice.join(' ')}`;
  }, [data]);

  if (loading && !data) return <Spinner label={t('common.loading')} />;
  if (error && !data) return <ErrorState error={error} onRetry={reload} retryLabel={t('common.retry')} />;

  const i = data.indices;
  const healthTone = data.health === 'good' ? 'ok' : data.health === 'moderate' ? 'warn' : 'alert';

  return (
    <>
      <SectionHead
        eyebrow={`${data.district.regionName} · ${data.district.name}`}
        title={t('sat.title')}
        sub={t('sat.subtitle')}
        right={<div className="row" style={{ gap: 8 }}><SourceBadge source={data.source} /><VoiceButton text={speech} /></div>}
      />

      <div className="grid g-4" style={{ marginBottom: 'var(--sp-4)' }}>
        <Card className="row" style={{ justifyContent: 'center', gap: 'var(--sp-4)' }}>
          <Ring value={i.ndvi} max={1} label="NDVI" tone={healthTone === 'ok' ? 'var(--ok)' : healthTone === 'warn' ? 'var(--warn)' : 'var(--alert)'} />
          <div>
            <div className="stat-label">{t('sat.vegetation')}</div>
            <Badge tone={healthTone} style={{ marginTop: 8 }}>{data.health}</Badge>
          </div>
        </Card>
        <Card>
          <div className="row between"><span className="stat-label">{t('sat.moisture')}</span><Droplets size={16} style={{ color: 'var(--info)' }} /></div>
          <Stat value={i.ndwi} hint="NDWI · canopy water content" />
          <Meter value={i.ndwi} max={0.6} />
        </Card>
        <Card>
          <div className="row between"><span className="stat-label">Surface soil moisture</span><SatIcon size={16} style={{ color: 'var(--primary)' }} /></div>
          <Stat value={i.soilMoisturePct} unit="%" hint="top 5 cm" />
          <Meter value={i.soilMoisturePct} tone={i.soilMoisturePct < 35 ? 'alert' : ''} />
        </Card>
        <Card>
          <div className="row between"><span className="stat-label">Soil pH</span><FlaskConical size={16} style={{ color: 'var(--accent)' }} /></div>
          <Stat value={i.soilPh} hint={i.soilPh < 6 ? 'Acidic' : i.soilPh > 7.8 ? 'Alkaline' : 'Near neutral'} />
          <Meter value={i.soilPh} max={14} />
        </Card>
      </div>

      <div className="grid g-3" style={{ alignItems: 'start' }}>
        <Card className="span-2">
          <div className="card-head"><h3 className="row" style={{ gap: 8 }}><Map size={18} /> {t('sat.soilType')}</h3><span className="src mono">captured {new Date(data.capturedAt).toLocaleString('en-IN')}</span></div>
          <div className="grid g-3" style={{ gap: 'var(--sp-4)' }}>
            <div><div className="stat-label">Soil type</div><div style={{ fontWeight: 600, marginTop: 4 }}>{data.soilType}</div></div>
            <div><div className="stat-label">Surface temp</div><div className="mono" style={{ fontSize: '1.1rem' }}>{i.soilTempC}°C</div></div>
            <div><div className="stat-label">Salinity risk</div><Badge tone={i.salinityRisk === 'low' ? 'ok' : 'warn'} style={{ marginTop: 4 }}>{i.salinityRisk}</Badge></div>
            <div><div className="stat-label">Cloud cover</div><div className="mono" style={{ fontSize: '1.1rem' }}>{i.cloudCoverPct}%</div></div>
            <div className="span-2"><div className="stat-label">Agronomic note</div><div className="card-sub" style={{ marginTop: 4 }}>{data.soilNote}</div></div>
          </div>
          <div style={{ marginTop: 'var(--sp-4)' }}>
            <div className="card-sub">
              Simulated Sentinel-2 statistics. Add SENTINEL_HUB_CLIENT_ID and SENTINEL_HUB_CLIENT_SECRET to the backend .env to pull live imagery indices for this district.
            </div>
          </div>
        </Card>

        <Card>
          <div className="card-head"><h3 className="row" style={{ gap: 8 }}><AlertTriangle size={17} /> {t('sat.advice')}</h3></div>
          {data.advice.length ? (
            <div className="stack" style={{ gap: 10 }}>
              {data.advice.map((a, idx) => (
                <div key={idx} className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                  <span className="dot" style={{ color: 'var(--warn)', marginTop: 7 }} />
                  <span style={{ fontSize: '0.9rem' }}>{a}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="row" style={{ gap: 10, color: 'var(--ok)' }}><Leaf size={16} /> Soil indices are within healthy ranges.</div>
          )}
        </Card>
      </div>
    </>
  );
}
