import { useMemo } from 'react';
import { Sprout, CalendarClock, Droplets, TrendingUp, Check } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../lib/api.js';
import { useAsync } from '../lib/hooks.js';
import { Card, SectionHead, Spinner, ErrorState, Badge, Meter, Field, SourceBadge } from '../components/ui.jsx';
import VoiceButton from '../components/VoiceButton.jsx';

const SEASONS = ['Kharif', 'Rabi', 'Summer', 'Annual', 'Perennial'];
const WATER = ['Low', 'Medium', 'High'];

export default function Crops() {
  const { t, lang, regionId, districtId, season, setSeason, water, setWater } = useApp();
  const { data, loading, error, reload } = useAsync(
    () => api.crops({ regionId, districtId, season, water, lang }),
    [regionId, districtId, season, water, lang]
  );

  const speech = useMemo(() => {
    if (!data) return '';
    const top = data.recommendations.slice(0, 3).map((r) => `${r.name}, match ${r.matchScore} percent`).join('; ');
    return `Top crop recommendations for ${data.district.name} in the ${data.season} season: ${top}.`;
  }, [data]);

  return (
    <>
      <SectionHead
        eyebrow={data ? `${data.region.state} · ${data.district.name}` : t('nav.group.advise')}
        title={t('crops.title')}
        sub={t('crops.subtitle')}
        right={<VoiceButton text={speech} />}
      />

      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <div className="grid g-4" style={{ alignItems: 'end' }}>
          <Field label={t('common.season')}>
            <select className="select" value={season} onChange={(e) => setSeason(e.target.value)}>
              {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label={t('common.water')}>
            <select className="select" value={water} onChange={(e) => setWater(e.target.value)}>
              {WATER.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </Field>
          <div className="span-2 row" style={{ gap: 8 }}>
            <Badge tone="info">Soil: {data?.district.soil || '—'}</Badge>
            <Badge tone="accent">Rainfall: {data?.district.rainfallMm || '—'} mm/yr</Badge>
            <Badge>Zone: {data?.region.agroZone || '—'}</Badge>
          </div>
        </div>
      </Card>

      {loading && !data && <Spinner label={t('common.loading')} />}
      {error && !data && <ErrorState error={error} onRetry={reload} retryLabel={t('common.retry')} />}

      {data && (
        <div className="grid g-2">
          {data.recommendations.map((r, idx) => (
            <Card key={r.cropId} style={idx === 0 ? { borderColor: 'var(--primary)', boxShadow: '0 0 0 3px var(--primary-soft)' } : undefined}>
              <div className="row between" style={{ alignItems: 'flex-start' }}>
                <div>
                  <div className="row" style={{ gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600 }}>{r.name}</span>
                    {idx === 0 && <Badge tone="ok"><Check size={11} /> Top pick</Badge>}
                  </div>
                  <div className="row wrap" style={{ gap: 12, marginTop: 8 }}>
                    <span className="row" style={{ gap: 5, fontSize: '0.8rem' }}><CalendarClock size={13} /> {r.durationDays} days</span>
                    <span className="row" style={{ gap: 5, fontSize: '0.8rem' }}><Droplets size={13} /> {r.waterNeed} water</span>
                    <span className="row" style={{ gap: 5, fontSize: '0.8rem' }}><TrendingUp size={13} /> profit index {r.profitIndex}/10</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="stat-value" style={{ fontSize: 'var(--step-3)' }}>{r.matchScore}<span className="stat-unit">%</span></div>
                  <div className="stat-label">{t('crops.match')}</div>
                </div>
              </div>
              <Meter value={r.matchScore} tone={r.matchScore > 75 ? '' : r.matchScore > 50 ? 'warn' : 'alert'} />
              <div style={{ marginTop: 'var(--sp-3)' }}>
                <div className="stat-label" style={{ marginBottom: 6 }}>{t('crops.why')}</div>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.84rem', color: 'var(--ink-2)' }}>
                  {r.reasons.map((reason, i) => <li key={i}>{reason}</li>)}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div style={{ marginTop: 'var(--sp-4)' }}>
        <SourceBadge source="catalog" />
        <span className="card-sub" style={{ marginLeft: 10 }}>
          Recommendations are scored transparently on soil match, season fit and water availability — no black box.
        </span>
      </div>
    </>
  );
}
