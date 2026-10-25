import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Thermometer, Droplets, Sprout, FlaskConical, Sun, Waves } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../lib/api.js';
import { usePoll, useAsync } from '../lib/hooks.js';
import { Card, SectionHead, Badge, Meter, SourceBadge, Spinner, ErrorState, Stat } from '../components/ui.jsx';
import VoiceButton from '../components/VoiceButton.jsx';

function readingSummary(r) {
  if (!r) return '';
  const x = r.readings;
  return `Block ${r.node.name}. Air temperature ${x.airTempC} degrees, humidity ${x.humidityPct} percent, soil moisture ${x.soilMoisturePct} percent, soil pH ${x.soilPh}. Nitrogen ${x.npk.n}, phosphorus ${x.npk.p}, potassium ${x.npk.k} parts per million. ${r.alerts.length} alerts.`;
}

export default function Sensors() {
  const { t, lang } = useApp();
  const [activeId, setActiveId] = useState(null);

  const { data: nodesData, loading: nodesLoading } = useAsync(() => api.nodes(), []);
  const nodes = nodesData?.nodes || [];
  const current = activeId || nodes[0]?.id;

  const { data: reading, error, loading, reload } = usePoll(
    () => (current ? api.node(current, lang) : Promise.resolve(null)),
    8000,
    [current, lang]
  );

  const { data: history } = useAsync(
    () => (current ? api.history(current, 24) : Promise.resolve(null)),
    [current]
  );

  const chartData = useMemo(
    () => (history?.history || []).map((h) => ({
      time: new Date(h.t).toLocaleTimeString([], { hour: '2-digit' }),
      temp: h.airTempC,
      humidity: h.humidityPct,
      soil: h.soilMoisturePct
    })),
    [history]
  );

  if (nodesLoading && !nodes.length) return <Spinner label={t('common.loading')} />;

  const x = reading?.readings;

  return (
    <>
      <SectionHead
        eyebrow={t('nav.group.monitor')}
        title={t('sensors.title')}
        sub={t('sensors.subtitle')}
        right={reading && <div className="row" style={{ gap: 8 }}><SourceBadge source={reading.source} /><VoiceButton text={readingSummary(reading)} /></div>}
      />

      {/* Node selector */}
      <div className="grid g-auto" style={{ marginBottom: 'var(--sp-4)' }}>
        {nodes.map((n) => (
          <button
            key={n.id}
            className="card"
            onClick={() => setActiveId(n.id)}
            style={{
              textAlign: 'left', cursor: 'pointer',
              borderColor: current === n.id ? 'var(--primary)' : 'var(--line)',
              boxShadow: current === n.id ? '0 0 0 3px var(--primary-soft)' : 'var(--shadow)'
            }}
          >
            <div className="row between">
              <span style={{ fontWeight: 600 }}>{n.name}</span>
              <Badge tone={n.status === 'online' ? 'ok' : 'alert'}>
                <i className={`dot ${n.status === 'online' ? 'pulse' : ''}`} /> {n.status === 'online' ? t('common.live') : t('common.offline')}
              </Badge>
            </div>
            <div className="card-sub mono" style={{ marginTop: 6 }}>{n.crop} · {n.lat.toFixed(2)}, {n.lon.toFixed(2)}</div>
          </button>
        ))}
      </div>

      {error && !reading && <ErrorState error={error} onRetry={reload} retryLabel={t('common.retry')} />}
      {loading && !reading && <Spinner label={t('common.loading')} />}

      {reading && (
        <>
          {reading.alerts.length > 0 && (
            <Card style={{ marginBottom: 'var(--sp-4)', borderLeft: '3px solid var(--alert)' }}>
              <div className="stack" style={{ gap: 8 }}>
                {reading.alerts.map((a, i) => (
                  <div key={i} className="row" style={{ gap: 10 }}>
                    <Badge tone={a.level === 'alert' ? 'alert' : 'warn'}>{a.field}</Badge>
                    <span style={{ fontSize: '0.88rem' }}>{a.message}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="grid g-4" style={{ marginBottom: 'var(--sp-4)' }}>
            <Card>
              <div className="row between"><span className="stat-label">{t('common.temperature')}</span><Thermometer size={16} style={{ color: 'var(--accent)' }} /></div>
              <Stat value={x.airTempC} unit="°C" hint={`Comfort band ${reading.bands.temp[0]}–${reading.bands.temp[1]}°C`} />
              <Meter value={x.airTempC} max={45} tone={x.airTempC > reading.bands.temp[1] ? 'warn' : ''} />
            </Card>
            <Card>
              <div className="row between"><span className="stat-label">{t('common.humidity')}</span><Droplets size={16} style={{ color: 'var(--info)' }} /></div>
              <Stat value={x.humidityPct} unit="%" hint={`Comfort band ${reading.bands.humidity[0]}–${reading.bands.humidity[1]}%`} />
              <Meter value={x.humidityPct} tone={x.humidityPct > reading.bands.humidity[1] ? 'warn' : ''} />
            </Card>
            <Card>
              <div className="row between"><span className="stat-label">{t('common.soilMoisture')}</span><Waves size={16} style={{ color: 'var(--primary)' }} /></div>
              <Stat value={x.soilMoisturePct} unit="%" hint={`Target ${reading.bands.soilMoisture[0]}–${reading.bands.soilMoisture[1]}%`} />
              <Meter value={x.soilMoisturePct} tone={x.soilMoisturePct < reading.bands.soilMoisture[0] ? 'alert' : ''} />
            </Card>
            <Card>
              <div className="row between"><span className="stat-label">Soil temp</span><Sprout size={16} style={{ color: 'var(--primary)' }} /></div>
              <Stat value={x.soilTempC} unit="°C" hint="6 cm depth" />
              <Meter value={x.soilTempC} max={40} />
            </Card>
          </div>

          <div className="grid g-3" style={{ alignItems: 'start' }}>
            <Card className="span-2">
              <div className="card-head">
                <h3>{t('sensors.tempHumidity')}</h3>
                <span className="src mono">last 24h</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="var(--line)" vertical={false} />
                  <XAxis dataKey="time" tick={{ fill: 'var(--ink-3)', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'var(--line)' }} interval={3} />
                  <YAxis tick={{ fill: 'var(--ink-3)', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line-strong)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12 }}
                    labelStyle={{ color: 'var(--ink-3)' }}
                  />
                  <Line type="monotone" dataKey="temp" stroke="var(--accent)" strokeWidth={2} dot={false} name="Air °C" />
                  <Line type="monotone" dataKey="humidity" stroke="var(--info)" strokeWidth={2} dot={false} name="RH %" />
                  <Line type="monotone" dataKey="soil" stroke="var(--primary)" strokeWidth={2} dot={false} name="Soil %" />
                </LineChart>
              </ResponsiveContainer>
              <div className="row wrap" style={{ gap: 14, marginTop: 8 }}>
                <span className="row" style={{ gap: 6, fontSize: '0.8rem' }}><i className="dot" style={{ color: 'var(--accent)' }} /> Air temp</span>
                <span className="row" style={{ gap: 6, fontSize: '0.8rem' }}><i className="dot" style={{ color: 'var(--info)' }} /> Humidity</span>
                <span className="row" style={{ gap: 6, fontSize: '0.8rem' }}><i className="dot" style={{ color: 'var(--primary)' }} /> Soil moisture</span>
              </div>
            </Card>

            <div className="stack">
              <Card>
                <div className="card-head"><h3 className="row" style={{ gap: 8 }}><FlaskConical size={17} /> {t('sensors.npk')}</h3></div>
                <div className="stack">
                  {[['Nitrogen (N)', x.npk.n, 340], ['Phosphorus (P)', x.npk.p, 60], ['Potassium (K)', x.npk.k, 300]].map(([label, val, max]) => (
                    <div key={label}>
                      <div className="row between" style={{ fontSize: '0.82rem' }}><span>{label}</span><span className="mono">{val} ppm</span></div>
                      <Meter value={val} max={max} />
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <div className="card-head"><h3 className="row" style={{ gap: 8 }}><Sun size={17} /> {t('sensors.soil')}</h3></div>
                <div className="stack" style={{ gap: 8, fontSize: '0.86rem' }}>
                  <div className="row between"><span className="muted">Soil pH</span><span className="mono">{x.soilPh}</span></div>
                  <div className="row between"><span className="muted">Electrical conductivity</span><span className="mono">{x.ecDsM} dS/m</span></div>
                  <div className="row between"><span className="muted">Light</span><span className="mono">{x.lightLux.toLocaleString('en-IN')} lux</span></div>
                  <div className="row between"><span className="muted">Leaf wetness</span><span className="mono">{x.leafWetnessPct}%</span></div>
                  <div className="row between"><span className="muted">{t('common.updated')}</span><span className="mono">{new Date(reading.timestamp).toLocaleTimeString('en-IN')}</span></div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </>
  );
}
