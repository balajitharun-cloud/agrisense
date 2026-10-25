// ---------------------------------------------------------------------------
// HTTP helper.
// Node's built-in fetch does not honour HTTP(S)_PROXY environment variables.
// Many corporate and shared networks (including this sandbox) require a proxy,
// so we attach an undici ProxyAgent dispatcher when one is configured.
// Returns undefined when no proxy is set, which keeps plain fetch behaviour.
// ---------------------------------------------------------------------------

import { ProxyAgent } from 'undici';

let cached;
let cachedFor;

export function proxyDispatcher() {
  const proxy =
    process.env.HTTPS_PROXY || process.env.https_proxy ||
    process.env.HTTP_PROXY || process.env.http_proxy;
  if (!proxy) return undefined;
  if (cached && cachedFor === proxy) return cached;
  cached = new ProxyAgent(proxy);
  cachedFor = proxy;
  return cached;
}

// fetch with the proxy dispatcher applied (if any).
export function httpFetch(url, options = {}) {
  const dispatcher = proxyDispatcher();
  return fetch(url, dispatcher ? { ...options, dispatcher } : options);
}
