import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Thermometer, CloudSun, Satellite, Sprout, ShieldAlert,
  Store, Megaphone, UserRound, Sun, Moon, Menu, X, Languages, MapPin, Sprout as SproutIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { LANGUAGES } from '../i18n/strings.js';
import { Toasts } from './ui.jsx';

const NAV = [
  { group: 'nav.group.monitor', items: [
    { to: '/', icon: LayoutDashboard, key: 'nav.overview', end: true },
    { to: '/sensors', icon: Thermometer, key: 'nav.sensors' },
    { to: '/weather', icon: CloudSun, key: 'nav.weather' },
    { to: '/satellite', icon: Satellite, key: 'nav.satellite' }
  ] },
  { group: 'nav.group.advise', items: [
    { to: '/crops', icon: Sprout, key: 'nav.crops' },
    { to: '/protection', icon: ShieldAlert, key: 'nav.protection' }
  ] },
  { group: 'nav.group.connect', items: [
    { to: '/marketplace', icon: Store, key: 'nav.market' },
    { to: '/gov', icon: Megaphone, key: 'nav.gov' },
    { to: '/account', icon: UserRound, key: 'nav.account' }
  ] }
];

const TITLES = {
  '/': 'dash.title', '/sensors': 'sensors.title', '/weather': 'weather.title',
  '/satellite': 'sat.title', '/crops': 'crops.title', '/protection': 'prot.title',
  '/marketplace': 'market.title', '/gov': 'gov.title', '/account': 'account.title'
};

export default function Layout({ children }) {
  const { t, theme, toggleTheme, lang, setLang, regions, regionId, districtId, setDistrictId, changeRegion, user, toasts } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const region = regions.find((r) => r.id === regionId);
  const titleKey = TITLES[location.pathname] || 'app.name';

  return (
    <div className="app">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><SproutIcon size={20} /></div>
          <div>
            <div className="brand-name">{t('app.name')}</div>
            <div className="brand-sub">Farm Intelligence</div>
          </div>
        </div>
        <nav className="nav">
          {NAV.map((section) => (
            <div key={section.group}>
              <div className="nav-group-label">{t(section.group)}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <item.icon size={17} />
                  <span>{t(item.key)}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="row between">
            <span>{user ? user.name : t('common.login')}</span>
            <span className="src">{user ? '·' : ''}</span>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="btn btn-ghost btn-icon" style={{ display: 'none' }} onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="topbar-title">{t(titleKey)}</div>
          <div className="topbar-spacer" />

          {/* Region */}
          <div className="row" style={{ gap: 6 }}>
            <MapPin size={15} style={{ color: 'var(--ink-3)' }} />
            <select
              className="select"
              style={{ width: 'auto', padding: '6px 30px 6px 10px' }}
              value={regionId}
              onChange={(e) => changeRegion(e.target.value)}
              aria-label={t('common.region')}
            >
              {regions.map((r) => <option key={r.id} value={r.id}>{r.state}</option>)}
            </select>
            <select
              className="select"
              style={{ width: 'auto', padding: '6px 30px 6px 10px' }}
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              aria-label={t('common.district')}
            >
              {(region?.districts || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          {/* Language */}
          <div className="row" style={{ gap: 6 }}>
            <Languages size={15} style={{ color: 'var(--ink-3)' }} />
            <select
              className="select"
              style={{ width: 'auto', padding: '6px 30px 6px 10px' }}
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label={t('common.language')}
            >
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
            </select>
          </div>

          {/* Theme */}
          <button className="btn btn-ghost btn-icon" onClick={toggleTheme} title={theme === 'light' ? t('common.dark') : t('common.light')}>
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>

          <NavLink to="/account" className="btn btn-sm">
            <UserRound size={15} />
            {user ? user.name.split(' ')[0] : t('common.login')}
          </NavLink>
        </header>

        <main className="content">{children}</main>
      </div>

      <Toasts toasts={toasts} />

      <style>{`
        @media (max-width: 760px) {
          .topbar button[aria-label="Menu"] { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
}
