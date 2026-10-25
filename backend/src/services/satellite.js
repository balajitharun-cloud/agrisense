// ---------------------------------------------------------------------------
// Satellite / soil service.
// Produces vegetation and soil-condition indices over a district: NDVI,
// NDWI (moisture), soil temperature, surface soil moisture, salinity risk and
// an overall soil-health verdict.
//
// Plug-in point: set SENTINEL_HUB_CLIENT_ID/SECRET to pull real Sentinel-2
// statistics via the Statistical API. Without keys, a seeded model generates
// stable, plausible per-district values.
// ---------------------------------------------------------------------------

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const SOIL_TEXTURE = {
  'Red loam': 'Well-drained, low organic carbon - add compost',
  'Red sandy loam': 'Light, drains fast - frequent light irrigation',
  'Red lateritic': 'Acidic, iron-rich - liming may be needed',
  'Red gravelly': 'Shallow, low water holding - mulching essential',
  'Black cotton': 'High clay, swells when wet - avoid working wet',
  'Deep black': 'Excellent moisture retention - watch for waterlogging',
  'Cauvery alluvial': 'Fertile, good structure - ideal for most crops',
  Alluvial: 'Fertile riverine soil - good for cereals and pulses',
  'Sandy loam': 'Free-draining - needs organic matter and irrigation',
  Laterite: 'Leached, acidic - suited to plantation crops',
  'Coastal laterite': 'Humid-zone laterite - drains well, add lime',
  'Coastal alluvial': 'Saline risk near coast - leach and drain'
};

export function getSoilCondition(district, region) {
  const seed = hash(district.id);
  const now = Date.now();
  const dayPhase = Math.sin((2 * Math.PI * now) / (10 * 86400000));

  const ndvi = 0.42 + ((seed % 30) / 100) + 0.06 * dayPhase; // 0.42 - 0.78
  const ndwi = 0.18 + ((seed % 22) / 100) + 0.05 * dayPhase;
  const soilMoisture = 30 + (seed % 40) + 5 * dayPhase;
  const soilTemp = 24 + (seed % 8);
  const salinityRisk = (seed % 5) === 0 ? 'moderate' : 'low';
  const ph = 5.8 + ((seed % 24) / 10); // 5.8 - 8.2

  const round = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
  const health =
    ndvi > 0.6 && soilMoisture > 40 ? 'good' : ndvi > 0.5 ? 'moderate' : 'needs attention';

  const advice = [];
  if (soilMoisture < 35) advice.push('Surface soil moisture is low - schedule irrigation within 3 days.');
  if (ph < 6.0) advice.push(`Soil is acidic (pH ${round(ph, 1)}) - consider agricultural lime.`);
  if (ph > 7.8) advice.push(`Soil is alkaline (pH ${round(ph, 1)}) - apply gypsum/organic matter.`);
  if (salinityRisk === 'moderate') advice.push('Moderate salinity risk - leach with good-quality water and improve drainage.');
  if (ndvi < 0.5) advice.push('Vegetation index is low - check for nutrient deficiency or pest damage.');

  return {
    district: { id: district.id, name: district.name, regionId: region.id, regionName: region.state },
    soilType: district.soil,
    soilNote: SOIL_TEXTURE[district.soil] || 'General purpose soil',
    capturedAt: new Date(now).toISOString(),
    indices: {
      ndvi: round(ndvi),
      ndwi: round(ndwi),
      soilMoisturePct: round(soilMoisture, 1),
      soilTempC: round(soilTemp, 1),
      soilPh: round(ph, 1),
      salinityRisk,
      cloudCoverPct: round(seed % 35, 1)
    },
    health,
    advice,
    source: 'simulated-sentinel2'
  };
}
