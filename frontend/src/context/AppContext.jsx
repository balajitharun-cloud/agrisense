import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { translate } from '../i18n/strings.js';
import { api } from '../lib/api.js';

const AppContext = createContext(null);

const STORAGE = {
  theme: 'agrisense.theme',
  lang: 'agrisense.lang',
  region: 'agrisense.region',
  district: 'agrisense.district',
  token: 'agrisense.token'
};

function load(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => load(STORAGE.theme, 'light'));
  const [lang, setLang] = useState(() => load(STORAGE.lang, 'en'));
  const [regionId, setRegionId] = useState(() => load(STORAGE.region, 'ka'));
  const [districtId, setDistrictId] = useState(() => load(STORAGE.district, 'ka-mysuru'));
  const [season, setSeason] = useState('Kharif');
  const [water, setWater] = useState('Medium');
  const [regions, setRegions] = useState([]);
  const [token, setToken] = useState(() => load(STORAGE.token, ''));
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Theme -> <html data-theme>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE.theme, theme); } catch { /* ignore */ }
  }, [theme]);

  useEffect(() => { try { localStorage.setItem(STORAGE.lang, lang); } catch { /* ignore */ } }, [lang]);
  useEffect(() => { try { localStorage.setItem(STORAGE.region, regionId); } catch { /* ignore */ } }, [regionId]);
  useEffect(() => { try { localStorage.setItem(STORAGE.district, districtId); } catch { /* ignore */ } }, [districtId]);

  useEffect(() => {
    api.regions().then((r) => setRegions(r.regions)).catch(() => setRegions([]));
  }, []);

  // Restore session.
  useEffect(() => {
    if (!token) { setUser(null); return; }
    api.me(token).then((r) => setUser(r.user)).catch(() => { setToken(''); try { localStorage.removeItem(STORAGE.token); } catch { /* ignore */ } });
  }, [token]);

  const t = useCallback((key) => translate(key, lang), [lang]);

  const toast = useCallback((message, kind = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);

  const changeRegion = useCallback((id, regionsList) => {
    setRegionId(id);
    const list = regionsList || regions;
    const region = list.find((r) => r.id === id);
    if (region && region.districts[0]) setDistrictId(region.districts[0].id);
  }, [regions]);

  const setSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken || '');
    setUser(nextUser || null);
    try {
      if (nextToken) localStorage.setItem(STORAGE.token, nextToken);
      else localStorage.removeItem(STORAGE.token);
    } catch { /* ignore */ }
  }, []);

  const logout = useCallback(() => setSession('', null), [setSession]);

  const value = useMemo(() => ({
    theme, setTheme, toggleTheme: () => setTheme((v) => (v === 'light' ? 'dark' : 'light')),
    lang, setLang, t,
    regionId, districtId, setDistrictId, changeRegion, regions,
    season, setSeason, water, setWater,
    token, user, setUser, setSession, logout,
    toasts, toast
  }), [theme, lang, t, regionId, districtId, changeRegion, regions, season, water, token, user, setSession, logout, toasts, toast]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
