import { useState } from 'react';
import { Megaphone, ExternalLink, CalendarDays, Building2, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../lib/api.js';
import { useAsync } from '../lib/hooks.js';
import { Card, SectionHead, Spinner, ErrorState, Badge, SourceBadge } from '../components/ui.jsx';
import VoiceButton from '../components/VoiceButton.jsx';

const CATEGORIES = ['All', 'Advisory', 'Subsidy', 'Scheme', 'Market', 'Weather Advisory', 'Regulation'];

export default function Gov() {
  const { t, lang, regionId, regions } = useApp();
  const [category, setCategory] = useState('All');
  const regionName = regions.find((r) => r.id === regionId)?.state || '';

  const { data, loading, error, reload } = useAsync(
    () => api.gov({ region: regionName, category: category === 'All' ? '' : category }, lang),
    [regionName, category, lang]
  );

  return (
    <>
      <SectionHead
        eyebrow={regionName}
        title={t('gov.title')}
        sub={t('gov.subtitle')}
        right={<SourceBadge source={data?.source} />}
      />

      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <div className="chip-list">
          {CATEGORIES.map((c) => (
            <button key={c} className={`btn btn-sm ${category === c ? 'btn-primary' : ''}`} onClick={() => setCategory(c)}>
              {c === 'All' ? t('common.all') : c}
            </button>
          ))}
        </div>
      </Card>

      {loading && !data && <Spinner label={t('common.loading')} />}
      {error && !data && <ErrorState error={error} onRetry={reload} retryLabel={t('common.retry')} />}

      {data && (
        <div className="stack" style={{ gap: 'var(--sp-3)' }}>
          {data.announcements.map((g) => (
            <Card key={g.id} style={g.urgency === 'high' ? { borderLeft: '3px solid var(--alert)' } : undefined}>
              <div className="row between wrap" style={{ alignItems: 'flex-start', gap: 'var(--sp-3)' }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div className="row wrap" style={{ gap: 8, marginBottom: 8 }}>
                    <Badge tone={g.urgency === 'high' ? 'alert' : g.category === 'Subsidy' ? 'ok' : 'info'}>{g.category}</Badge>
                    <Badge>{g.level === 'central' ? 'Central' : 'State'}</Badge>
                    {g.urgency === 'high' && <Badge tone="alert">High priority</Badge>}
                  </div>
                  <h3 style={{ fontSize: 'var(--step-2)' }}>{g.title}</h3>
                  <p style={{ color: 'var(--ink-2)', margin: '8px 0 10px', fontSize: '0.9rem' }}>{g.summary}</p>
                  <div className="row wrap" style={{ gap: 16, fontSize: '0.78rem', color: 'var(--ink-3)' }}>
                    <span className="row" style={{ gap: 5 }}><CalendarDays size={13} /> <span className="mono">{g.date}</span></span>
                    <span className="row" style={{ gap: 5 }}><Building2 size={13} /> {g.ministry}</span>
                    <span className="row" style={{ gap: 5 }}><MapPin size={13} /> {g.region}</span>
                  </div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <VoiceButton text={`${g.title}. ${g.summary}`} label={null} className="btn btn-sm btn-icon" />
                  <a className="btn btn-sm" href={g.link} target="_blank" rel="noreferrer">
                    {t('gov.readMore')} <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            </Card>
          ))}
          {!data.announcements.length && <Card><div className="empty"><Megaphone size={20} /> No announcements for this filter.</div></Card>}
        </div>
      )}

      <div style={{ marginTop: 'var(--sp-4)' }}>
        <span className="card-sub">
          Mock advisory feed. Set GOV_FEED_URL in the backend .env to ingest a live PIB / State Agriculture / IMD agro-advisory feed.
        </span>
      </div>
    </>
  );
}
