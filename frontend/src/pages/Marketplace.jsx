import { useState } from 'react';
import { Store, Search, Star, Package, BadgeCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../lib/api.js';
import { useAsync } from '../lib/hooks.js';
import { Card, SectionHead, Spinner, ErrorState, Badge, SourceBadge } from '../components/ui.jsx';

const CATEGORIES = ['All', 'Seeds', 'Fertiliser', 'Crop Protection', 'Tools'];

function inr(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

export default function Marketplace() {
  const { t, lang, toast } = useApp();
  const [category, setCategory] = useState('All');
  const [q, setQ] = useState('');

  const { data, loading, error, reload } = useAsync(
    () => api.listings({ category: category === 'All' ? '' : category, q }, lang),
    [category, lang]
  );
  const { data: priceData } = useAsync(() => api.prices(lang), [lang]);

  return (
    <>
      <SectionHead
        eyebrow={t('nav.group.connect')}
        title={t('market.title')}
        sub={t('market.subtitle')}
        right={<SourceBadge source={data?.source} />}
      />

      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <div className="row wrap between" style={{ gap: 'var(--sp-3)' }}>
          <div className="chip-list">
            {CATEGORIES.map((c) => (
              <button key={c} className={`btn btn-sm ${category === c ? 'btn-primary' : ''}`} onClick={() => setCategory(c)}>
                {c === 'All' ? t('common.all') : c}
              </button>
            ))}
          </div>
          <div className="row" style={{ gap: 8, minWidth: 260, flex: 1, maxWidth: 380 }}>
            <Search size={16} style={{ color: 'var(--ink-3)' }} />
            <input className="input" placeholder={`${t('common.search')}…`} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
      </Card>

      {loading && !data && <Spinner label={t('common.loading')} />}
      {error && !data && <ErrorState error={error} onRetry={reload} retryLabel={t('common.retry')} />}

      {data && (
        <div className="grid g-auto" style={{ marginBottom: 'var(--sp-5)' }}>
          {data.listings.map((l) => (
            <Card key={l.id}>
              <div className="row between" style={{ alignItems: 'flex-start' }}>
                <Badge tone="accent">{l.category}</Badge>
                {l.verified && <span className="row" style={{ gap: 4, color: 'var(--ok)', fontSize: '0.74rem', fontWeight: 600 }}><BadgeCheck size={14} /> Verified</span>}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.08rem', fontWeight: 600, marginTop: 10, minHeight: 44 }}>{l.title}</div>
              <div className="row between" style={{ marginTop: 8 }}>
                <span className="stat-value" style={{ fontSize: 'var(--step-2)' }}>{inr(l.price)}</span>
                <span className="stat-unit">/ {l.unit}</span>
              </div>
              <div className="row between" style={{ marginTop: 10, fontSize: '0.8rem' }}>
                <span className="row" style={{ gap: 5 }}><Star size={13} style={{ color: 'var(--accent)' }} /> {l.rating} <span className="muted">({l.reviews})</span></span>
                <span className="row" style={{ gap: 5 }}><Package size={13} /> {l.stock} {t('market.stock').toLowerCase()}</span>
              </div>
              <hr className="divider" />
              <div className="row between">
                <div>
                  <div className="card-sub">{l.seller}</div>
                  <div className="src mono">{l.location}</div>
                </div>
                <button className="btn btn-sm btn-primary" onClick={() => toast(`Enquiry sent to ${l.seller} for ${l.title}`, 'ok')}>Enquire</button>
              </div>
              <div className="chip-list" style={{ marginTop: 10 }}>
                {l.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
              </div>
            </Card>
          ))}
          {!data.listings.length && <Card><div className="empty">{t('common.all')} — no listings match.</div></Card>}
        </div>
      )}

      <Card flush>
        <div className="card-head" style={{ padding: 'var(--sp-5) var(--sp-5) 0' }}>
          <h3 className="row" style={{ gap: 8 }}><Store size={18} /> {t('market.prices')}</h3>
          <span className="src mono">APMC · {priceData?.updated}</span>
        </div>
        <div style={{ overflowX: 'auto', padding: 'var(--sp-3) 0 0' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Market</th>
                <th className="num">{t('market.modal')}</th>
                <th className="num">Min</th>
                <th className="num">Max</th>
                <th className="num">{t('market.trend')}</th>
              </tr>
            </thead>
            <tbody>
              {(priceData?.prices || []).map((p) => {
                const up = p.trend.startsWith('+');
                return (
                  <tr key={p.crop}>
                    <td style={{ fontWeight: 600 }}>{p.crop}</td>
                    <td className="muted">{p.market}</td>
                    <td className="num" style={{ fontWeight: 600 }}>{inr(p.modal)}</td>
                    <td className="num muted">{inr(p.min)}</td>
                    <td className="num muted">{inr(p.max)}</td>
                    <td className="num">
                      <span className={up ? 'trend-up row' : 'trend-down row'} style={{ justifyContent: 'flex-end', gap: 4 }}>
                        {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{p.trend}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
