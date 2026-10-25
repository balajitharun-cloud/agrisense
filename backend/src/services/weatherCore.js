// ---------------------------------------------------------------------------
// Pure weather logic - no Node dependencies, no fetch.
// Shared by:
//   * services/weather.js   (Node server, fetches through an optional proxy)
//   * frontend/src/lib/staticApi.js (browser, fetches Open-Meteo directly)
// Keeping this free of `undici`/`node:*` is what lets the static GitHub Pages
// build reuse it verbatim instead of duplicating the rules.
// ---------------------------------------------------------------------------

export function codeToText(c) {
  if (c >= 95) return 'Thunderstorm';
  if (c >= 80) return 'Showers';
  if (c >= 61) return 'Rain';
  if (c >= 45) return 'Fog';
  if (c >= 2) return 'Partly cloudy';
  return 'Clear';
}

export function mockWeather(lat, lon) {
  const now = Date.now();
  const days = [];
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now + i * 86400000);
    const seed = Math.abs(Math.round(lat * 100 + lon * 100 + i * 37));
    const tmax = 28 + (seed % 6) - 2;
    const tmin = tmax - (8 + (seed % 4));
    const rain = i === 2 || i === 3 ? 12 + (seed % 20) : (seed % 5);
    days.push({
      date: d.toISOString().slice(0, 10),
      day: names[d.getDay()],
      tMax: tmax,
      tMin: tmin,
      rainMm: rain,
      humidity: 55 + (seed % 30),
      windKph: 6 + (seed % 14),
      condition: rain > 10 ? 'Rain' : rain > 3 ? 'Showers' : 'Partly cloudy'
    });
  }
  const current = {
    tempC: days[0].tMax - 3,
    humidity: days[0].humidity,
    windKph: days[0].windKph,
    rainMm: days[0].rainMm,
    condition: days[0].condition,
    soilTempC: days[0].tMax - 6,
    et0Mm: 3.2 + (Math.abs(Math.round(lat)) % 3)
  };
  return { current, daily: days, source: 'mock' };
}

// Map an Open-Meteo forecast payload to our internal shape.
export function transformOpenMeteo(j) {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daily = j.daily.time.map((date, i) => ({
    date,
    day: names[new Date(date).getDay()],
    tMax: Math.round(j.daily.temperature_2m_max[i]),
    tMin: Math.round(j.daily.temperature_2m_min[i]),
    rainMm: Math.round((j.daily.precipitation_sum[i] || 0) * 10) / 10,
    humidity: Math.round(j.daily.relative_humidity_2m_mean?.[i] ?? 60),
    windKph: Math.round(j.daily.wind_speed_10m_max[i]),
    condition: codeToText(j.daily.weather_code[i])
  }));
  const current = {
    tempC: Math.round(j.current.temperature_2m),
    humidity: Math.round(j.current.relative_humidity_2m),
    windKph: Math.round(j.current.wind_speed_10m),
    rainMm: Math.round((j.current.precipitation || 0) * 10) / 10,
    condition: codeToText(j.current.weather_code),
    soilTempC: j.current.soil_temperature_6cm != null ? Math.round(j.current.soil_temperature_6cm) : null,
    et0Mm: j.daily.et0_fao_evapotranspiration?.[0] != null
      ? Math.round(j.daily.et0_fao_evapotranspiration[0] * 10) / 10
      : null
  };
  return { current, daily, source: 'open-meteo' };
}

export function agronomySuggestion(weather) {
  const next3 = weather.daily.slice(0, 3);
  const rainSum = next3.reduce((s, d) => s + d.rainMm, 0);
  const maxT = Math.max(...next3.map((d) => d.tMax));
  const tips = [];
  if (rainSum > 20) tips.push('Heavy rain expected in 72h - postpone spraying and top-dressing; open field drains.');
  else if (rainSum > 5) tips.push('Light showers likely - a good window for urea top-dressing; avoid spraying 6h before rain.');
  else tips.push('Dry spell ahead - plan irrigation and mulch to conserve soil moisture.');
  if (maxT > 35) tips.push('Heat stress risk: irrigate early morning/evening, avoid mid-day operations.');
  if (weather.current.humidity > 80) tips.push('High humidity - scout for fungal disease and consider a protective fungicide.');
  return tips;
}

export const OPEN_METEO_URL = (lat, lon) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
  `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code,soil_temperature_6cm` +
  `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,wind_speed_10m_max,weather_code,et0_fao_evapotranspiration` +
  `&timezone=Asia%2FKolkata&forecast_days=7`;
