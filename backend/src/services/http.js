// ---------------------------------------------------------------------------
// HTTP helper.
//
// Node's built-in fetch does not honour HTTP(S)_PROXY environment variables.
// Many corporate and shared networks (including some CI sandboxes) require a
// proxy, so we attach an undici ProxyAgent dispatcher when one is configured.
//
// IMPORTANT: `undici` v7 requires Node >= 20.18.1. It is therefore declared as
// an OPTIONAL dependency and imported lazily inside a try/catch, so the app
// still starts on Node 18 - it simply skips the proxy in that case instead of
// crashing at module load.
// ---------------------------------------------------------------------------

let ProxyAgentCtor = null;
let undiciChecked = false;
let cachedAgent = null;
let cachedFor = null;

async function loadProxyAgent() {
  if (undiciChecked) return ProxyAgentCtor;
  undiciChecked = true;
  try {
    const mod = await import('undici');
    ProxyAgentCtor = mod.ProxyAgent || mod.default?.ProxyAgent || null;
  } catch {
    // undici missing or too new for this Node version - run without a proxy.
    ProxyAgentCtor = null;
  }
  return ProxyAgentCtor;
}

export function proxyConfigured() {
  return Boolean(
    process.env.HTTPS_PROXY || process.env.https_proxy ||
    process.env.HTTP_PROXY || process.env.http_proxy
  );
}

async function proxyDispatcher() {
  if (!proxyConfigured()) return undefined;
  const Ctor = await loadProxyAgent();
  if (!Ctor) return undefined;
  const proxy =
    process.env.HTTPS_PROXY || process.env.https_proxy ||
    process.env.HTTP_PROXY || process.env.http_proxy;
  if (cachedAgent && cachedFor === proxy) return cachedAgent;
  try {
    cachedAgent = new Ctor(proxy);
    cachedFor = proxy;
    return cachedAgent;
  } catch {
    return undefined;
  }
}

// fetch with the proxy dispatcher applied when available.
export async function httpFetch(url, options = {}) {
  const dispatcher = await proxyDispatcher();
  return fetch(url, dispatcher ? { ...options, dispatcher } : options);
}
