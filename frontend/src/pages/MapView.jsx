import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Map as MapIcon, Sprout, ArrowRight, Layers, Info } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../lib/api.js';
import { useAsync } from '../lib/hooks.js';
import { KARNATAKA_MAP } from '../data/karnatakaMap.js';
import { Card, SectionHead, Spinner, ErrorState, Badge, Meter, Field } from '../components/ui.jsx';
import ShareButton, { buildShareUrl } from '../components/ShareButton.jsx';
import VoiceButton from '../components/VoiceButton.jsx';

// Fixed division colours that read acceptably on both light and dark grounds.
const DIVISION_COLORS = {
  bengaluru: '#2f6b45',
  mysuru: '#b06a1c',
  belagavi: '#2f5f8a',
  kalaburagi: '#9c4a2f'
};

const SEASONS = ['Kharif', 'Rabi', 'Summer', 'Annual', 'Perennial'];

export default function MapView() {
  const { t, lang, season, setSeason, changeRegion, setDistrictId, regions } = useApp();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [hovered, setHovered] = useState(null);

  // Division comes from the URL so a shared link restores the same view.
  const activeDivision = params.get('division') || 'bengaluru';

  useEffect(() => {
    const urlSeason = params.get('season');
    if (urlSeason && SEASONS.includes(urlSeason) && urlSeason !== season) setSeason(urlSeason);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectDivision(id) {
    const next = new URLSearchParams(params);
    next.set('division', id);
    next.set('season', season);
    setParams(next, { replace: true });
  }

  const { data: list, loading: listLoading } = useAsync(() => api.divisions(lang), [lang]);

  const { data: detail, loading, error, reload } = useAsync(
    () => api.division(activeDivision, { season, water: 'Medium', lang }),
    [activeDivision, season, lang]
  );

  const division = detail?.division;

  const speech = useMemo(() => {
    if (!division) return '';
    const top = (division.dominantCrops || []).slice(0, 3).map((c) => `${c.name} ${c.share} percent`).join(', ');
    return `${division.name}. ${division.climate}. Dominant crops: ${top}.`;
  }, [division]);

  function openInAdvisor() {
    if (!division) return;
    changeRegion('ka', regions);
    setDistrictId(division.representativeDistrictId);
    setSeason(season);
    navigate('/crops');
  }

  if (listLoading && !list) return <Spinner label={t('common.loading')} />;

  return (
    <>
      <SectionHead
        eyebrow={t('map.divisions')}
        title={t('map.title')}
        sub={t('map.subtitle')}
        right={
          <div className="row" style={{ gap: 8 }}>
            <ShareButton
              title={t('map.title')}
              text={`${t('map.shareText')}${division ? ` - ${division.name}` : ''}`}
              url={() => buildShareUrl('/map', { division: activeDivision, season })}
              label={t('share.action')}
            />
            {division && <VoiceButton text={speech} />}
          </div>
        }
      />

      <div className="map-layout">
        {/* ------------------------------ map ------------------------------ */}
        <Card>
          <div className="card-head">
            <h3 className="row" style={{ gap: 8 }}><MapIcon size={18} /> Karnataka</h3>
            <span className="src mono">{KARNATAKA_MAP.districts.length} districts</span>
          </div>

          <svg
            viewBox={KARNATAKA_MAP.viewBox}
            style={{ width: '100%', height: 'auto', display: 'block', maxHeight: 560 }}
            role="img"
            aria-label={t('map.title')}
          >
            {KARNATAKA_MAP.districts.map((d) => {
              const isActive = d.divisionId === activeDivision;
              const isHover = hovered === d.name;
              return (
                <path
                  key={d.name}
                  d={d.d}
                  fill={DIVISION_COLORS[d.divisionId] || 'var(--ink-3)'}
                  fillOpacity={isActive ? 0.95 : 0.42}
                  stroke={isHover ? '#fff' : 'rgba(255,255,255,0.45)'}
                  strokeWidth={isHover ? 1.8 : 0.9}
                  className="ka-district"
                  onClick={() => selectDivision(d.divisionId)}
                  onMouseEnter={() => setHovered(d.name)}
                  onMouseLeave={() => setHovered((h) => (h === d.name ? null : h))}
                  role="button"
                  tabIndex={0}
                  aria-label={`${d.display} - ${d.divisionId}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectDivision(d.divisionId);
                    }
                  }}
                >
                  <title>{`${d.display} - ${d.divisionId} division`}</title>
                </path>
              );
            })}
            {KARNATAKA_MAP.divisions.map((dv) => (
              <text
                key={dv.id}
                x={dv.labelX}
                y={dv.labelY}
                textAnchor="middle"
                className="ka-label"
              >
                {dv.id.toUpperCase()}
              </text>
            ))}
          </svg>

          {/* legend */}
          <div className="chip-list" style={{ marginTop: 'var(--sp-3)' }}>
            {KARNATAKA_MAP.divisions.map((dv) => (
              <button
                key={dv.id}
                className={`btn btn-sm ${activeDivision === dv.id ? 'btn-primary' : ''}`}
                onClick={() => selectDivision(dv.id)}
                style={{ gap: 7 }}
              >
                <span style={{ width: 10, height: 10, borderRadius: 2, background: DIVISION_COLORS[dv.id], display: 'inline-block' }} />
                {list?.divisions?.find((x) => x.id === dv.id)?.name || dv.name}
              </button>
            ))}
          </div>
          <div className="card-sub" style={{ marginTop: 10 }}>
            <Info size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />
            {t('map.selectHint')} Boundaries: {KARNATAKA_MAP.source}.
          </div>
        </Card>

        {/* --------------------------- detail panel --------------------------- */}
        <div className="stack" style={{ gap: 'var(--sp-4)' }}>
          <Card>
            <Field label={t('common.season')}>
              <select className="select" value={season} onChange={(e) => setSeason(e.target.value)} style={{ maxWidth: 220 }}>
                {SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>

            {loading && !detail && <Spinner label={t('common.loading')} />}
            {error && !detail && <ErrorState error={error} onRetry={reload} retryLabel={t('common.retry')} />}

            {division && (
              <>
                <div style={{ marginTop: 'var(--sp-4)' }}>
                  <div className="eyebrow">{t('map.divisions')}</div>
                  <h2 style={{ fontSize: 'var(--step-3)' }}>{division.name}</h2>
                  <p className="card-sub" style={{ marginTop: 6 }}>{division.climate}</p>
                  <p style={{ fontSize: '0.88rem', color: 'var(--ink-2)', marginTop: 8 }}>{division.note}</p>
                </div>

                <hr className="divider" />

                <div className="card-head" style={{ marginBottom: 10 }}>
                  <h3 className="row" style={{ gap: 8, fontSize: 'var(--step-1)' }}>
                    <Layers size={16} /> {t('map.dominantCrops')}
                  </h3>
                  <span className="src mono">indicative share</span>
                </div>
                <div className="stack" style={{ gap: 10 }}>
                  {division.dominantCrops.map((c) => (
                    <div key={c.cropId}>
                      <div className="row between" style={{ fontSize: '0.86rem' }}>
                        <span>{c.name}</span>
                        <span className="mono">{c.share}%</span>
                      </div>
                      <Meter value={c.share} max={35} />
                    </div>
                  ))}
                </div>

                <hr className="divider" />
                <div className="row between wrap" style={{ gap: 8 }}>
                  <div>
                    <div className="stat-label">{t('map.districts')}</div>
                    <div className="card-sub" style={{ marginTop: 2 }}>{division.districts.join(' · ')}</div>
                  </div>
                  <button className="btn btn-sm btn-primary" onClick={openInAdvisor}>
                    {t('map.openAdvisor')} <ArrowRight size={14} />
                  </button>
                </div>
              </>
            )}
          </Card>

          {detail && (
            <Card>
              <div className="card-head">
                <h3 className="row" style={{ gap: 8, fontSize: 'var(--step-1)' }}>
                  <Sprout size={16} /> {t('map.recommendations')}
                </h3>
                <Badge tone="info">{detail.season}</Badge>
              </div>
              <div className="stack" style={{ gap: 12 }}>
                {detail.recommendations.slice(0, 5).map((r, i) => (
                  <div key={r.cropId}>
                    <div className="row between" style={{ gap: 10 }}>
                      <span style={{ fontWeight: 600 }}>
                        {i === 0 && <Badge tone="ok" style={{ marginRight: 6 }}>top</Badge>}
                        {r.name}
                      </span>
                      <span className="mono" style={{ fontSize: '0.85rem' }}>{r.matchScore}%</span>
                    </div>
                    <Meter value={r.matchScore} tone={r.matchScore > 75 ? '' : r.matchScore > 50 ? 'warn' : 'alert'} />
                    <div className="card-sub" style={{ marginTop: 4, fontSize: '0.76rem' }}>{r.reasons[0]}</div>
                  </div>
                ))}
              </div>
              <div className="card-sub" style={{ marginTop: 'var(--sp-3)' }}>
                Scored on soil match, season fit and water availability for {detail.district.name}.
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
