import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Droplets, Thermometer, TriangleAlert, ArrowRight, CloudSun, Satellite } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../lib/api.js';
import { usePoll } from '../lib/hooks.js';
import { Card, SectionHead, Badge, Meter, SourceBadge, Spinner, ErrorState } from '../components/ui.jsx';
import Sparkline from '../components/Sparkline.jsx';
import VoiceButton from '../components/VoiceButton.jsx';

export default function Dashboard() {
  const { t, lang, regionId, districtId, season } = useApp();

  const { data, loading, error, reload } = usePoll(async () => {
    const { nodes } = await api.nodes();
    const readings = await Promise.all(
      nodes.map((n) => api.node(n.id, lang).catch(() => null))
    );
    const weather = await api.weather({ regionId, districtId }, lang).catch(() => null);
    const soil = await api.soil({ regionId, districtId }, lang).catch(() => null);
    const gov = await api.gov({ region: '' }, lang).catch(() => ({ announcements: [] }));
    return { nodes, readings: readings.filter(Boolean), weather, soil, gov: gov.announcements?.slice(0, 3) || [] };
  }, 10000, [lang, regionId, districtId]);

  const stats = useMemo(() => {
    const readings = data?.readings || [];
    if (!readings.length) return null;
    const online = readings.filter((r) => r.node.status === 'online');
    const avg = (key) => online.reduce((s, r) => s + r.readings[key], 0) / (online.length || 1);
    const alerts = readings.flatMap((r) => r.alerts.map((a) => ({ ...a, node: r.node.name })));
    return {
      activeNodes: online.length,
      total: readings.length,
      avgTemp: avg('airTempC').toFixed(1),
      avgHumidity: avg('humidityPct').toFixed(0),
      avgMoisture: avg('soilMoisturePct').toFixed(0),
      alerts
    };
  }, [data]);

  if (loading && !data) return <Spinner label={t('common.loading')} />;
  if (error && !data) return <ErrorState error={error} onRetry={reload} retryLabel={t('common.retry')} />;

  const summaryLine = stats
    ? `Across ${stats.activeNodes} active blocks, average air temperature is ${stats.avgTemp} degrees and humidity ${stats.avgHumidity} percent. ${stats.alerts.length} alerts need attention.`
    : '';

  return (
    <>
      <SectionHead
        eyebrow={`${season} · ${data?.weather?.location?.districtName || ''}`}
        title={t('dash.title')}
        sub={t('dash.subtitle')}
        right={<div className="row" style={{ gap: 8 }}><VoiceButton text={summaryLine} label={t('voice.readAloud')} /><button className="btn btn-sm" onClick={reload}>{t('common.refresh')}</button></div>}
      />

      <div className="grid g-4" style={{ marginBottom: 'var(--sp-4)' }}>
        <Card>
          <div className="row between">
            <span className="stat-label">{t('dash.activeNodes')}</span>
            <Activity size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="stat-value" style={{ marginTop: 10 }}>{stats?.activeNodes ?? '—'}<span className="stat-unit"> / {stats?.total ?? '—'}</span></div>
          <div className="card-sub" style={{ marginTop: 6 }}>sensor blocks online</div>
        </Card>
        <Card>
          <div className="row between">
            <span className="stat-label">{t('dash.avgTemp')}</span>
            <Thermometer size={16} style={{ color: 'var(--accent)' }} />
          </div>
          <div className="stat-value" style={{ marginTop: 10 }}>{stats?.avgTemp ?? '—'}<span className="stat-unit"> °C</span></div>
          <div className="card-sub" style={{ marginTop: 6 }}>canopy air temperature</div>
        </Card>
        <Card>
          <div className="row between">
            <span className="stat-label">{t('dash.avgHumidity')}</span>
            <Droplets size={16} style={{ color: 'var(--info)' }} />
          </div>
          <div className="stat-value" style={{ marginTop: 10 }}>{stats?.avgHumidity ?? '—'}<span className="stat-unit"> %</span></div>
          <div className="card-sub" style={{ marginTop: 6 }}>relative humidity</div>
        </Card>
        <Card>
          <div className="row between">
            <span className="stat-label">{t('dash.alerts')}</span>
            <TriangleAlert size={16} style={{ color: stats?.alerts.length ? 'var(--alert)' : 'var(--ok)' }} />
          </div>
          <div className="stat-value" style={{ marginTop: 10, color: stats?.alerts.length ? 'var(--alert)' : 'var(--ok)' }}>{stats?.alerts.length ?? 0}</div>
          <div className="card-sub" style={{ marginTop: 6 }}>across all blocks</div>
        </Card>
      </div>

      <div className="grid g-3" style={{ alignItems: 'start' }}>
        {/* Needs attention */}
        <Card className="span-2">
          <div className="card-head">
            <h3>{t('dash.attention')}</h3>
            <Link className="btn btn-sm" to="/sensors">{t('common.view')} <ArrowRight size={14} /></Link>
          </div>
          {!stats?.alerts.length ? (
            <div className="row" style={{ gap: 10, color: 'var(--ok)' }}>
              <Badge tone="ok">All clear</Badge> {t('dash.allClear')}
            </div>
          ) : (
            <div className="stack">
              {stats.alerts.map((a, i) => (
                <div key={i} className="row between" style={{ gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                  <div className="row" style={{ gap: 10 }}>
                    <span className={`dot ${a.level === 'alert' ? '' : 'pulse'}`} style={{ color: `var(--${a.level === 'alert' ? 'alert' : 'warn'})` }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{a.node}</div>
                      <div className="card-sub">{a.message}</div>
                    </div>
                  </div>
                  <Badge tone={a.level === 'alert' ? 'alert' : 'warn'}>{a.field}</Badge>
                </div>
              ))}
            </div>
          )}

          <hr className="divider" />
          <div className="grid g-2" style={{ gap: 'var(--sp-4)' }}>
            {(data?.readings || []).filter((r) => r.node.status === 'online').slice(0, 4).map((r) => (
              <div key={r.node.id} className="row between" style={{ gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.node.name}</div>
                  <div className="card-sub mono">{r.readings.airTempC}°C · {r.readings.humidityPct}% · soil {r.readings.soilMoisturePct}%</div>
                </div>
                <Sparkline data={[r.readings.soilMoisturePct - 4, r.readings.soilMoisturePct - 1, r.readings.soilMoisturePct + 2, r.readings.soilMoisturePct]} color="var(--primary)" width={80} height={28} />
              </div>
            ))}
          </div>
        </Card>

        {/* Weather snapshot */}
        <Card>
          <div className="card-head">
            <h3 className="row" style={{ gap: 8 }}><CloudSun size={18} /> {t('weather.title')}</h3>
            <SourceBadge source={data?.weather?.source} />
          </div>
          {data?.weather ? (
            <>
              <div className="row between">
                <div>
                  <div className="stat-value">{data.weather.current.tempC}<span className="stat-unit">°C</span></div>
                  <div className="card-sub">{data.weather.current.condition} · {data.weather.current.humidity}% RH</div>
                </div>
                <VoiceButton text={data.weather.suggestions.join(' ')} label={null} className="btn btn-sm btn-icon" />
              </div>
              <div className="stack" style={{ marginTop: 14, gap: 6 }}>
                {data.weather.daily.slice(0, 4).map((d) => (
                  <div key={d.date} className="row between mono" style={{ fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--ink-2)' }}>{d.day}</span>
                    <span>{d.tMin}° – {d.tMax}°</span>
                    <span className="row" style={{ gap: 4, color: 'var(--info)' }}><Droplets size={12} />{d.rainMm}mm</span>
                  </div>
                ))}
              </div>
              <hr className="divider" />
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.84rem', color: 'var(--ink-2)' }}>
                {data.weather.suggestions.slice(0, 2).map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </>
          ) : <div className="card-sub">—</div>}
        </Card>

        {/* Soil */}
        <Card>
          <div className="card-head">
            <h3 className="row" style={{ gap: 8 }}><Satellite size={18} /> {t('sat.title')}</h3>
            <SourceBadge source={data?.soil?.source} />
          </div>
          {data?.soil ? (
            <>
              <div className="stat-label">{t('sat.vegetation')}</div>
              <div className="row between" style={{ margin: '8px 0' }}>
                <span className="stat-value" style={{ fontSize: 'var(--step-3)' }}>{data.soil.indices.ndvi}</span>
                <Badge tone={data.soil.health === 'good' ? 'ok' : data.soil.health === 'moderate' ? 'warn' : 'alert'}>{data.soil.health}</Badge>
              </div>
              <Meter value={data.soil.indices.ndvi} max={1} tone={data.soil.health === 'good' ? '' : 'warn'} />
              <div className="grid g-2" style={{ marginTop: 14, gap: 10 }}>
                <div><div className="stat-label">Soil moisture</div><div className="mono" style={{ fontSize: '1.05rem' }}>{data.soil.indices.soilMoisturePct}%</div></div>
                <div><div className="stat-label">Soil pH</div><div className="mono" style={{ fontSize: '1.05rem' }}>{data.soil.indices.soilPh}</div></div>
              </div>
              <hr className="divider" />
              <div className="card-sub">{data.soil.advice[0] || '—'}</div>
            </>
          ) : <div className="card-sub">—</div>}
        </Card>

        {/* Gov */}
        <Card className="span-3">
          <div className="card-head">
            <h3>{t('gov.title')}</h3>
            <Link className="btn btn-sm" to="/gov">{t('common.view')} <ArrowRight size={14} /></Link>
          </div>
          <div className="grid g-3">
            {(data?.gov || []).map((g) => (
              <div key={g.id} className="stack" style={{ gap: 6 }}>
                <div className="row between">
                  <Badge tone={g.urgency === 'high' ? 'alert' : g.category === 'Subsidy' ? 'ok' : 'info'}>{g.category}</Badge>
                  <span className="src mono">{g.date}</span>
                </div>
                <div style={{ fontWeight: 600, fontFamily: 'var(--font-display)', fontSize: '1.02rem' }}>{g.title}</div>
                <div className="card-sub">{g.summary.slice(0, 110)}…</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
