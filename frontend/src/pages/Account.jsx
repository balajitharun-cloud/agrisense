import { useState } from 'react';
import { UserRound, LogOut, Plus, Sprout, MapPin, Check } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../lib/api.js';
import { Card, SectionHead, Field, Badge, Spinner } from '../components/ui.jsx';
import { LANGUAGES } from '../i18n/strings.js';

export default function Account() {
  const { t, user, token, setUser, setSession, logout, regions, lang, setLang, regionId, districtId, changeRegion, setDistrictId, toast } = useApp();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [farm, setFarm] = useState({ name: '', crop: 'Ragi', areaAcres: 1 });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = mode === 'login'
        ? await api.login({ email: form.email, password: form.password })
        : await api.register({ ...form, language: lang, regionId, districtId });
      setSession(res.token, res.user);
      toast(`${mode === 'login' ? 'Welcome back' : 'Account created'}, ${res.user.name}`, 'ok');
      setForm({ name: '', email: '', password: '', phone: '' });
    } catch (err) {
      toast(err.message, 'alert');
    } finally {
      setBusy(false);
    }
  }

  function useDemo() {
    setMode('login');
    setForm({ name: '', email: 'demo@agrisense.in', password: 'demo1234', phone: '' });
    toast('Demo credentials filled - press Log in', 'ok');
  }

  async function savePrefs() {
    try {
      const res = await api.updateMe(token, { language: lang, regionId, districtId });
      setUser(res.user);
      toast('Preferences saved', 'ok');
      return res;
    } catch (err) {
      toast(err.message, 'alert');
    }
  }

  async function addFarm(e) {
    e.preventDefault();
    try {
      await api.addFarm(token, { ...farm, regionId, districtId });
      const me = await api.me(token);
      setUser(me.user);
      toast('Farm added', 'ok');
      setFarm({ name: '', crop: 'Ragi', areaAcres: 1 });
    } catch (err) {
      toast(err.message, 'alert');
    }
  }

  const region = regions.find((r) => r.id === regionId);

  if (!user) {
    return (
      <>
        <SectionHead eyebrow={t('nav.account')} title={t('app.tagline')} sub={t('account.guest')} />
        <div className="grid g-3" style={{ alignItems: 'start' }}>
          <Card className="span-2" style={{ background: 'var(--primary)', color: 'var(--primary-ink)', borderColor: 'var(--primary)' }}>
            <h1 style={{ color: 'var(--primary-ink)', fontSize: 'var(--step-4)', maxWidth: '18ch' }}>{t('app.tagline')}</h1>
            <p style={{ marginTop: 'var(--sp-4)', maxWidth: '52ch', opacity: 0.9 }}>{t('app.desc')}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 'var(--sp-5) 0 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.9rem' }}>
              {['Real-time sensor telemetry', 'Satellite soil & NDVI indices', 'Region-aware crop advice', 'Voice in your language'].map((f) => (
                <li key={f} className="row" style={{ gap: 8 }}><Check size={15} /> {f}</li>
              ))}
            </ul>
          </Card>
          <div>
            <div className="row" style={{ gap: 8, marginBottom: 'var(--sp-4)' }}>
              <button className={`btn btn-sm ${mode === 'login' ? 'btn-primary' : ''}`} onClick={() => setMode('login')}>{t('common.login')}</button>
              <button className={`btn btn-sm ${mode === 'signup' ? 'btn-primary' : ''}`} onClick={() => setMode('signup')}>{t('common.signup')}</button>
            </div>
            <form className="stack" onSubmit={submit} style={{ gap: 'var(--sp-4)' }}>
              {mode === 'signup' && (
                <Field label={t('common.name')}><input className="input" value={form.name} onChange={set('name')} required /></Field>
              )}
              <Field label={t('common.email')}><input className="input" type="email" value={form.email} onChange={set('email')} required /></Field>
              <Field label={t('common.password')}><input className="input" type="password" value={form.password} onChange={set('password')} required minLength={6} /></Field>
              {mode === 'signup' && (
                <Field label={t('common.phone')}><input className="input" value={form.phone} onChange={set('phone')} /></Field>
              )}
              <button className="btn btn-primary" disabled={busy} type="submit">
                {busy ? <Spinner label="" /> : mode === 'login' ? t('common.login') : t('common.signup')}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={useDemo}>{t('common.demo')} →</button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SectionHead eyebrow={t('nav.account')} title={user.name} sub={t('account.subtitle')} right={
        <button className="btn btn-sm" onClick={() => { logout(); toast('Signed out', 'ok'); }}><LogOut size={14} /> {t('common.logout')}</button>
      } />

      <div className="grid g-3" style={{ alignItems: 'start' }}>
        <Card>
          <div className="card-head"><h3 className="row" style={{ gap: 8 }}><UserRound size={18} /> {t('account.profile')}</h3></div>
          <div className="stack" style={{ gap: 10, fontSize: '0.9rem' }}>
            <div className="row between"><span className="muted">{t('common.name')}</span><span>{user.name}</span></div>
            <div className="row between"><span className="muted">{t('common.email')}</span><span className="mono" style={{ fontSize: '0.8rem' }}>{user.email}</span></div>
            <div className="row between"><span className="muted">{t('common.phone')}</span><span className="mono">{user.phone || '—'}</span></div>
            <div className="row between"><span className="muted">Member since</span><span className="mono">{new Date(user.createdAt).toLocaleDateString('en-IN')}</span></div>
          </div>
        </Card>

        <Card>
          <div className="card-head"><h3>{t('account.preferences')}</h3></div>
          <div className="stack" style={{ gap: 'var(--sp-4)' }}>
            <Field label={t('common.language')}>
              <select className="select" value={lang} onChange={(e) => setLang(e.target.value)}>
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
              </select>
            </Field>
            <Field label={t('common.region')}>
              <select className="select" value={regionId} onChange={(e) => changeRegion(e.target.value)}>
                {regions.map((r) => <option key={r.id} value={r.id}>{r.state}</option>)}
              </select>
            </Field>
            <Field label={t('common.district')}>
              <select className="select" value={districtId} onChange={(e) => setDistrictId(e.target.value)}>
                {(region?.districts || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </Field>
            <button className="btn btn-primary" onClick={savePrefs}>{t('common.save')}</button>
          </div>
        </Card>

        <Card className="span-3">
          <div className="card-head"><h3 className="row" style={{ gap: 8 }}><Sprout size={18} /> {t('account.farms')}</h3><Badge>{user.farms?.length || 0} plots</Badge></div>
          <div className="grid g-3" style={{ marginBottom: 'var(--sp-4)' }}>
            {(user.farms || []).map((f) => (
              <div key={f.id} className="card" style={{ background: 'var(--surface-2)' }}>
                <div style={{ fontWeight: 600, fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>{f.name}</div>
                <div className="card-sub mono" style={{ marginTop: 4 }}>{f.crop} · {f.areaAcres} acres</div>
                <div className="row" style={{ gap: 5, marginTop: 8, fontSize: '0.78rem', color: 'var(--ink-3)' }}>
                  <MapPin size={12} /> {regions.find((r) => r.id === f.regionId)?.state || f.regionId}
                </div>
              </div>
            ))}
            {!(user.farms || []).length && <div className="empty" style={{ gridColumn: 'span 3' }}>No farms added yet.</div>}
          </div>

          <form className="grid g-4" style={{ alignItems: 'end' }} onSubmit={addFarm}>
            <Field label={t('account.farmName')}><input className="input" value={farm.name} onChange={(e) => setFarm((f) => ({ ...f, name: e.target.value }))} required placeholder="e.g. North Plot" /></Field>
            <Field label={t('account.crop')}><input className="input" value={farm.crop} onChange={(e) => setFarm((f) => ({ ...f, crop: e.target.value }))} /></Field>
            <Field label={t('account.area')}><input className="input" type="number" min="0.1" step="0.1" value={farm.areaAcres} onChange={(e) => setFarm((f) => ({ ...f, areaAcres: e.target.value }))} /></Field>
            <button className="btn btn-primary" type="submit"><Plus size={15} /> {t('account.addFarm')}</button>
          </form>
        </Card>
      </div>
    </>
  );
}
