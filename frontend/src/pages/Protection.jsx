import { useState, useMemo } from 'react';
import { ShieldAlert, Beaker, Clock, ShieldCheck, TriangleAlert, Bug } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../lib/api.js';
import { useAsync } from '../lib/hooks.js';
import { Card, SectionHead, Spinner, ErrorState, Badge, Formula } from '../components/ui.jsx';
import VoiceButton from '../components/VoiceButton.jsx';

export default function Protection() {
  const { t, lang } = useApp();
  const [pestId, setPestId] = useState(null);

  const { data: pestData, loading: pestsLoading } = useAsync(() => api.pests(lang), [lang]);
  const pests = pestData?.pests || [];
  const active = pestId || pests[0]?.id;

  const { data, loading, error, reload } = useAsync(
    () => api.pesticides({ pestId: active, lang }),
    [active, lang]
  );

  const speech = useMemo(() => {
    if (!data?.pesticides?.length) return '';
    const p = data.pesticides[0];
    return `For ${data.pest?.name}. Recommended: ${p.name}. Active ingredient ${p.activeIngredient}, chemical formula ${p.formula}. Dosage ${p.dosage}. Pre-harvest interval ${p.phi}. ${p.safety}`;
  }, [data]);

  if (pestsLoading && !pests.length) return <Spinner label={t('common.loading')} />;

  return (
    <>
      <SectionHead
        eyebrow={t('nav.group.advise')}
        title={t('prot.title')}
        sub={t('prot.subtitle')}
        right={<VoiceButton text={speech} />}
      />

      <Card style={{ marginBottom: 'var(--sp-4)' }}>
        <div className="stat-label" style={{ marginBottom: 10 }}>{t('prot.pest')}</div>
        <div className="chip-list">
          {pests.map((p) => (
            <button
              key={p.id}
              className={`btn btn-sm ${active === p.id ? 'btn-primary' : ''}`}
              onClick={() => setPestId(p.id)}
            >
              <Bug size={13} /> {p.name}
              <Badge tone={p.severity === 'high' ? 'alert' : 'warn'}>{p.severity}</Badge>
            </button>
          ))}
        </div>
        {data?.pest && (
          <div className="card-sub" style={{ marginTop: 12 }}>
            <strong>Signs:</strong> {data.pest.signs} · <strong>Crops:</strong> {data.pest.crops.join(', ')}
          </div>
        )}
      </Card>

      {loading && !data && <Spinner label={t('common.loading')} />}
      {error && !data && <ErrorState error={error} onRetry={reload} retryLabel={t('common.retry')} />}

      {data && (
        <div className="grid g-2">
          {data.pesticides.map((p) => (
            <Card key={p.id}>
              <div className="row between" style={{ alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600 }}>{p.name}</div>
                  <div className="card-sub" style={{ marginTop: 2 }}>{p.type} · {p.class}</div>
                </div>
                <Badge tone={p.toxicityClass.includes('Highly') ? 'alert' : p.toxicityClass.includes('Moderately') ? 'warn' : 'ok'}>
                  {p.toxicityClass}
                </Badge>
              </div>

              <div className="stack" style={{ gap: 12, marginTop: 'var(--sp-4)' }}>
                <div>
                  <div className="stat-label row" style={{ gap: 6 }}><Beaker size={13} /> {t('prot.activeIngredient')}</div>
                  <div style={{ marginTop: 4 }}>{p.activeIngredient}</div>
                  <div className="row wrap" style={{ gap: 8, marginTop: 6 }}>
                    <Formula>{p.formula}</Formula>
                    <span className="src mono">M = {p.molarMass}</span>
                  </div>
                  <div className="card-sub" style={{ marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>{p.iupac}</div>
                </div>

                <div className="grid g-2" style={{ gap: 12 }}>
                  <div>
                    <div className="stat-label row" style={{ gap: 6 }}><ShieldAlert size={13} /> {t('prot.dosage')}</div>
                    <div className="mono" style={{ fontSize: '0.86rem', marginTop: 4 }}>{p.dosage}</div>
                  </div>
                  <div>
                    <div className="stat-label row" style={{ gap: 6 }}><Clock size={13} /> {t('prot.phi')}</div>
                    <div className="mono" style={{ fontSize: '0.86rem', marginTop: 4 }}>{p.phi} · re-entry {p.reentry}</div>
                  </div>
                </div>

                <div>
                  <div className="stat-label">Mode of action</div>
                  <div className="card-sub" style={{ marginTop: 2 }}>{p.modeOfAction}</div>
                </div>

                <div>
                  <div className="stat-label row" style={{ gap: 6 }}><ShieldCheck size={13} /> {t('prot.safety')}</div>
                  <div className="row" style={{ gap: 8, alignItems: 'flex-start', marginTop: 4 }}>
                    <TriangleAlert size={14} style={{ color: 'var(--warn)', marginTop: 3, flex: 'none' }} />
                    <span style={{ fontSize: '0.86rem' }}>{p.safety}</span>
                  </div>
                </div>

                <div className="row between">
                  <div className="chip-list">
                    {p.targetNames.map((tn, i) => <Badge key={i} tone="info">{tn}</Badge>)}
                  </div>
                  <VoiceButton text={`${p.name}. Active ingredient ${p.activeIngredient}. Dosage ${p.dosage}. Safety: ${p.safety}`} label={null} className="btn btn-sm btn-icon" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div style={{ marginTop: 'var(--sp-4)' }}>
        <Badge tone="warn"><TriangleAlert size={12} /> {t('prot.disclaimer')}</Badge>
      </div>
    </>
  );
}
