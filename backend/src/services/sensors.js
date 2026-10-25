// ---------------------------------------------------------------------------
// Sensor service.
// Generates realistic, time-evolving telemetry for a node: air temperature,
// relative humidity, soil moisture, soil temperature, NPK, pH, light and leaf
// wetness. Values move on smooth diurnal curves so the dashboard looks alive.
//
// Plug-in point: replace `readNode()` with a call to your IoT gateway
// (MQTT broker / LoRaWAN network server / ThingsBoard REST) - the return
// shape is what the rest of the API expects.
// ---------------------------------------------------------------------------

// Deterministic hash so each node has its own stable "personality".
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function wave(t, periodMs, phase = 0) {
  return Math.sin((2 * Math.PI * t) / periodMs + phase);
}

export const NODES = [
  { id: 'node-blr-01', name: 'Block A - Ragi', regionId: 'ka', districtId: 'ka-blr-rural', crop: 'Ragi', lat: 13.10, lon: 77.55, status: 'online' },
  { id: 'node-mys-02', name: 'Block B - Sugarcane', regionId: 'ka', districtId: 'ka-mysuru', crop: 'Sugarcane', lat: 12.31, lon: 76.64, status: 'online' },
  { id: 'node-dwd-03', name: 'Block C - Maize', regionId: 'ka', districtId: 'ka-dharwad', crop: 'Maize', lat: 15.46, lon: 75.01, status: 'online' },
  { id: 'node-kod-04', name: 'Block D - Coffee', regionId: 'ka', districtId: 'ka-kodagu', crop: 'Coffee', lat: 12.42, lon: 75.74, status: 'online' },
  { id: 'node-blr-05', name: 'Block E - Tomato', regionId: 'ka', districtId: 'ka-blr-rural', crop: 'Tomato', lat: 13.13, lon: 78.13, status: 'offline' }
];

// Crop-specific comfort bands used to raise alerts.
const CROP_BANDS = {
  Ragi: { temp: [20, 32], humidity: [40, 70], soilMoisture: [25, 45] },
  Sugarcane: { temp: [22, 35], humidity: [55, 85], soilMoisture: [45, 70] },
  Maize: { temp: [18, 32], humidity: [50, 80], soilMoisture: [35, 60] },
  Coffee: { temp: [15, 28], humidity: [60, 90], soilMoisture: [45, 75] },
  Tomato: { temp: [18, 30], humidity: [50, 75], soilMoisture: [35, 60] },
  default: { temp: [18, 32], humidity: [45, 80], soilMoisture: [30, 60] }
};

export function readNode(nodeId) {
  const node = NODES.find((n) => n.id === nodeId) || NODES[0];
  const now = Date.now();
  const seed = hash(node.id);
  const t = now;

  // Diurnal cycle: temperature peaks mid-afternoon, humidity inversely.
  const dayMs = 86400000;
  const tempBase = 26 + (seed % 7) - 3;
  const temp = tempBase + 6 * wave(t, dayMs, -Math.PI / 2) + 0.4 * wave(t, 6 * 3600000, seed);
  const humidity = 62 + 14 * wave(t, dayMs, Math.PI / 2) + 1.5 * wave(t, 4 * 3600000, seed);
  const soilMoisture = 42 + 8 * wave(t, 1.5 * dayMs, seed) + 0.8 * wave(t, 3 * 3600000, seed);
  const soilTemp = temp - 2.5 + 0.6 * wave(t, dayMs, seed);

  const r = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));

  const node_bands = CROP_BANDS[node.crop] || CROP_BANDS.default;
  const readings = {
    airTempC: r(clamp(temp, 5, 46)),
    humidityPct: r(clamp(humidity, 15, 98)),
    soilMoisturePct: r(clamp(soilMoisture, 8, 95)),
    soilTempC: r(clamp(soilTemp, 5, 40)),
    soilPh: r(6.4 + 0.5 * wave(t, 2 * dayMs, seed), 2),
    ecDsM: r(0.9 + 0.25 * wave(t, 1.2 * dayMs, seed), 2),
    lightLux: Math.round(clamp(42000 + 40000 * wave(t, dayMs, -Math.PI / 2), 0, 95000)),
    leafWetnessPct: r(clamp(30 + 30 * wave(t, dayMs, Math.PI), 0, 100)),
    npk: {
      n: Math.round(clamp(220 + 40 * wave(t, 2 * dayMs, seed), 80, 340)),
      p: Math.round(clamp(28 + 10 * wave(t, 2.5 * dayMs, seed), 5, 60)),
      k: Math.round(clamp(190 + 35 * wave(t, 1.8 * dayMs, seed), 60, 300))
    }
  };

  const alerts = [];
  if (readings.airTempC > node_bands.temp[1]) alerts.push({ field: 'airTempC', level: 'warn', message: `Air temperature above comfort band (>${node_bands.temp[1]}°C) for ${node.crop}` });
  if (readings.airTempC < node_bands.temp[0]) alerts.push({ field: 'airTempC', level: 'warn', message: `Air temperature below comfort band (<${node_bands.temp[0]}°C)` });
  if (readings.humidityPct > node_bands.humidity[1]) alerts.push({ field: 'humidityPct', level: 'warn', message: `High humidity (>${node_bands.humidity[1]}%) - fungal disease risk` });
  if (readings.soilMoisturePct < node_bands.soilMoisture[0]) alerts.push({ field: 'soilMoisturePct', level: 'alert', message: `Soil moisture critically low (<${node_bands.soilMoisture[0]}%) - irrigate` });

  return {
    node: { id: node.id, name: node.name, crop: node.crop, regionId: node.regionId, districtId: node.districtId, lat: node.lat, lon: node.lon, status: node.status },
    timestamp: new Date(t).toISOString(),
    bands: node_bands,
    readings,
    alerts,
    source: 'simulated'
  };
}

// 24-point history for sparklines/charts (hourly, ending now).
export function readHistory(nodeId, points = 24) {
  const node = NODES.find((n) => n.id === nodeId) || NODES[0];
  const seed = hash(node.id);
  const out = [];
  const now = Date.now();
  for (let i = points - 1; i >= 0; i--) {
    const t = now - i * 3600000;
    const dayMs = 86400000;
    const tempBase = 26 + (seed % 7) - 3;
    out.push({
      t: new Date(t).toISOString(),
      airTempC: Math.round((tempBase + 6 * wave(t, dayMs, -Math.PI / 2)) * 10) / 10,
      humidityPct: Math.round((62 + 14 * wave(t, dayMs, Math.PI / 2)) * 10) / 10,
      soilMoisturePct: Math.round((42 + 8 * wave(t, 1.5 * dayMs, seed)) * 10) / 10
    });
  }
  return out;
}
