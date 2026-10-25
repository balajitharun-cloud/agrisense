import { AlertTriangle, Check, Info, Loader2 } from 'lucide-react';

export function Card({ children, className = '', flush = false, ...rest }) {
  return (
    <section className={`card ${flush ? 'flush' : ''} ${className}`} {...rest}>
      {children}
    </section>
  );
}

export function SectionHead({ title, sub, right, eyebrow }) {
  return (
    <div className="page-head" style={{ marginBottom: 'var(--sp-4)' }}>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <div className="row between wrap" style={{ alignItems: 'flex-end' }}>
        <div>
          <h1>{title}</h1>
          {sub && <p>{sub}</p>}
        </div>
        {right}
      </div>
    </div>
  );
}

export function Badge({ children, tone = '', className = '' }) {
  return <span className={`badge ${tone ? `badge-${tone}` : ''} ${className}`}>{children}</span>;
}

export function Stat({ label, value, unit, tone, hint }) {
  return (
    <div>
      <div className="stat-label">{label}</div>
      <div className="stat-row" style={{ marginTop: 6 }}>
        <span className="stat-value" style={tone ? { color: `var(--${tone})` } : undefined}>
          {value}
          {unit && <span className="stat-unit"> {unit}</span>}
        </span>
      </div>
      {hint && <div className="card-sub" style={{ marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

export function Meter({ value, max = 100, tone = '' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={`meter ${tone}`}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function SourceBadge({ source }) {
  const live = ['open-meteo', 'elevenlabs', 'live', 'live-feed'].includes(source);
  return (
    <span className="src row" style={{ gap: 5 }}>
      <i className={`dot ${live ? 'pulse' : ''}`} style={{ color: live ? 'var(--ok)' : 'var(--ink-3)' }} />
      {live ? 'Live' : 'Simulated'} · {source}
    </span>
  );
}

export function Spinner({ label }) {
  return (
    <div className="empty row" style={{ justifyContent: 'center', gap: 10 }}>
      <Loader2 size={18} className="spin" />
      {label || 'Loading…'}
    </div>
  );
}

export function ErrorState({ error, onRetry, retryLabel = 'Retry' }) {
  return (
    <div className="empty stack" style={{ alignItems: 'center' }}>
      <AlertTriangle size={22} style={{ color: 'var(--alert)' }} />
      <div>{error?.message || 'Something went wrong'}</div>
      {onRetry && <button className="btn btn-sm" onClick={onRetry}>{retryLabel}</button>}
    </div>
  );
}

export function EmptyState({ children }) {
  return <div className="empty">{children}</div>;
}

export function Toasts({ toasts }) {
  return (
    <div className="toasts">
      {toasts.map((tst) => (
        <div key={tst.id} className={`toast ${tst.kind}`} role="status">
          <span className="row" style={{ gap: 8 }}>
            {tst.kind === 'alert' ? <AlertTriangle size={15} /> : tst.kind === 'ok' ? <Check size={15} /> : <Info size={15} />}
            {tst.message}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Formula({ children }) {
  return <code className="formula">{children}</code>;
}
