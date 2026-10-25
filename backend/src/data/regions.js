// ---------------------------------------------------------------------------
// Region + crop recommendation dataset.
// Structure: state -> districts -> agro-climatic profile -> recommended crops.
// `crop` entries carry the soil/season/water needs used by the recommender.
// Replace/extend freely; the recommender reads this shape directly.
// ---------------------------------------------------------------------------

export const REGIONS = [
  {
    id: 'ka',
    state: 'Karnataka',
    stateLocal: { kn: 'ಕರ್ನಾಟಕ', hi: 'कर्नाटक' },
    lat: 15.3173,
    lon: 75.7139,
    agroZone: 'Deccan Plateau - semi-arid',
    districts: [
      { id: 'ka-blr-rural', name: 'Bengaluru Rural', soil: 'Red loam', rainfallMm: 900, tempRange: [18, 34] },
      { id: 'ka-mysuru', name: 'Mysuru', soil: 'Red sandy loam', rainfallMm: 800, tempRange: [18, 33] },
      { id: 'ka-mandya', name: 'Mandya', soil: 'Cauvery alluvial', rainfallMm: 700, tempRange: [19, 34] },
      { id: 'ka-belagavi', name: 'Belagavi', soil: 'Black cotton', rainfallMm: 1100, tempRange: [16, 35] },
      { id: 'ka-dharwad', name: 'Dharwad', soil: 'Black cotton', rainfallMm: 780, tempRange: [15, 36] },
      { id: 'ka-ballari', name: 'Ballari', soil: 'Red gravelly', rainfallMm: 550, tempRange: [20, 38] },
      { id: 'ka-kodagu', name: 'Kodagu', soil: 'Laterite', rainfallMm: 2700, tempRange: [14, 28] },
      { id: 'ka-shivamogga', name: 'Shivamogga', soil: 'Red lateritic', rainfallMm: 1800, tempRange: [18, 32] },
      { id: 'ka-kalaburagi', name: 'Kalaburagi', soil: 'Deep black', rainfallMm: 620, tempRange: [18, 40] },
      { id: 'ka-udupi', name: 'Udupi', soil: 'Coastal laterite', rainfallMm: 3200, tempRange: [22, 34] }
    ],
    crops: [
      { id: 'ragi', name: 'Ragi (Finger millet)', local: { kn: 'ರಾಗಿ', hi: 'रागी' }, seasons: ['Kharif'], waterNeed: 'Low', soil: ['Red loam', 'Red sandy loam', 'Red lateritic'], profitIndex: 7, durationDays: 110 },
      { id: 'jowar', name: 'Jowar (Sorghum)', local: { kn: 'ಜೋಳ', hi: 'ज्वार' }, seasons: ['Kharif', 'Rabi'], waterNeed: 'Low', soil: ['Black cotton', 'Deep black'], profitIndex: 6, durationDays: 120 },
      { id: 'maize', name: 'Maize', local: { kn: 'ಮೆಕ್ಕೆಜೋಳ', hi: 'मक्का' }, seasons: ['Kharif', 'Rabi'], waterNeed: 'Medium', soil: ['Red loam', 'Cauvery alluvial'], profitIndex: 8, durationDays: 100 },
      { id: 'cotton', name: 'Cotton', local: { kn: 'ಹತ್ತಿ', hi: 'कपास' }, seasons: ['Kharif'], waterNeed: 'Medium', soil: ['Black cotton', 'Deep black'], profitIndex: 9, durationDays: 165 },
      { id: 'sugarcane', name: 'Sugarcane', local: { kn: 'ಕಬ್ಬು', hi: 'गन्ना' }, seasons: ['Annual'], waterNeed: 'High', soil: ['Cauvery alluvial', 'Red loam'], profitIndex: 8, durationDays: 330 },
      { id: 'groundnut', name: 'Groundnut', local: { kn: 'ಶೇಂಗಾ', hi: 'मूंगफली' }, seasons: ['Kharif', 'Rabi'], waterNeed: 'Low', soil: ['Red sandy loam', 'Red gravelly'], profitIndex: 7, durationDays: 110 },
      { id: 'paddy', name: 'Paddy', local: { kn: 'ಭತ್ತ', hi: 'धान' }, seasons: ['Kharif'], waterNeed: 'High', soil: ['Coastal laterite', 'Cauvery alluvial'], profitIndex: 7, durationDays: 130 },
      { id: 'coffee', name: 'Coffee (Arabica)', local: { kn: 'ಕಾಫಿ', hi: 'कॉफ़ी' }, seasons: ['Perennial'], waterNeed: 'High', soil: ['Laterite', 'Red lateritic'], profitIndex: 10, durationDays: 365 },
      { id: 'arecanut', name: 'Arecanut', local: { kn: 'ಅಡಿಕೆ', hi: 'सुपारी' }, seasons: ['Perennial'], waterNeed: 'High', soil: ['Laterite', 'Coastal laterite'], profitIndex: 9, durationDays: 365 },
      { id: 'tomato', name: 'Tomato', local: { kn: 'ಟೊಮೆಟೊ', hi: 'टमाटर' }, seasons: ['Kharif', 'Rabi', 'Summer'], waterNeed: 'Medium', soil: ['Red loam', 'Red sandy loam'], profitIndex: 8, durationDays: 90 },
      { id: 'onion', name: 'Onion', local: { kn: 'ಈರುಳ್ಳಿ', hi: 'प्याज़' }, seasons: ['Kharif', 'Rabi'], waterNeed: 'Medium', soil: ['Black cotton', 'Red loam'], profitIndex: 8, durationDays: 100 },
      { id: 'chilli', name: 'Chilli', local: { kn: 'ಮೆಣಸಿನಕಾಯಿ', hi: 'मिर्च' }, seasons: ['Kharif', 'Rabi'], waterNeed: 'Medium', soil: ['Red loam', 'Black cotton'], profitIndex: 8, durationDays: 150 },
      { id: 'banana', name: 'Banana', local: { kn: 'ಬಾಳೆ', hi: 'केला' }, seasons: ['Annual'], waterNeed: 'High', soil: ['Cauvery alluvial', 'Laterite'], profitIndex: 8, durationDays: 300 }
    ]
  },
  {
    id: 'mh',
    state: 'Maharashtra',
    stateLocal: { mr: 'महाराष्ट्र', hi: 'महाराष्ट्र' },
    lat: 19.7515,
    lon: 75.7139,
    agroZone: 'Deccan - rain shadow',
    districts: [
      { id: 'mh-nashik', name: 'Nashik', soil: 'Black cotton', rainfallMm: 1000, tempRange: [15, 38] },
      { id: 'mh-pune', name: 'Pune', soil: 'Red loam', rainfallMm: 720, tempRange: [16, 37] },
      { id: 'mh-nagpur', name: 'Nagpur', soil: 'Black cotton', rainfallMm: 1100, tempRange: [18, 42] },
      { id: 'mh-vidarbha', name: 'Yavatmal (Vidarbha)', soil: 'Deep black', rainfallMm: 950, tempRange: [18, 43] },
      { id: 'mh-konkan', name: 'Ratnagiri', soil: 'Coastal laterite', rainfallMm: 3000, tempRange: [22, 34] }
    ],
    crops: [
      { id: 'cotton', name: 'Cotton', local: { mr: 'कापूस', hi: 'कपास' }, seasons: ['Kharif'], waterNeed: 'Medium', soil: ['Black cotton', 'Deep black'], profitIndex: 9, durationDays: 165 },
      { id: 'soybean', name: 'Soybean', local: { mr: 'सोयाबीन', hi: 'सोयाबीन' }, seasons: ['Kharif'], waterNeed: 'Medium', soil: ['Black cotton', 'Deep black'], profitIndex: 7, durationDays: 100 },
      { id: 'sugarcane', name: 'Sugarcane', local: { mr: 'ऊस', hi: 'गन्ना' }, seasons: ['Annual'], waterNeed: 'High', soil: ['Black cotton'], profitIndex: 8, durationDays: 330 },
      { id: 'onion', name: 'Onion', local: { mr: 'कांदा', hi: 'प्याज़' }, seasons: ['Kharif', 'Rabi'], waterNeed: 'Medium', soil: ['Black cotton', 'Red loam'], profitIndex: 9, durationDays: 100 },
      { id: 'grapes', name: 'Grapes', local: { mr: 'द्राक्ष', hi: 'अंगूर' }, seasons: ['Perennial'], waterNeed: 'Medium', soil: ['Red loam', 'Black cotton'], profitIndex: 10, durationDays: 365 },
      { id: 'paddy', name: 'Paddy', local: { mr: 'भात', hi: 'धान' }, seasons: ['Kharif'], waterNeed: 'High', soil: ['Coastal laterite'], profitIndex: 7, durationDays: 130 }
    ]
  },
  {
    id: 'pb',
    state: 'Punjab',
    stateLocal: { pa: 'ਪੰਜਾਬ', hi: 'पंजाब' },
    lat: 31.1471,
    lon: 75.3412,
    agroZone: 'Indo-Gangetic plain - irrigated',
    districts: [
      { id: 'pb-ludhiana', name: 'Ludhiana', soil: 'Alluvial', rainfallMm: 700, tempRange: [5, 42] },
      { id: 'pb-amritsar', name: 'Amritsar', soil: 'Alluvial', rainfallMm: 650, tempRange: [4, 42] },
      { id: 'pb-bathinda', name: 'Bathinda', soil: 'Sandy loam', rainfallMm: 450, tempRange: [5, 45] }
    ],
    crops: [
      { id: 'wheat', name: 'Wheat', local: { pa: 'ਕਣਕ', hi: 'गेहूँ' }, seasons: ['Rabi'], waterNeed: 'Medium', soil: ['Alluvial', 'Sandy loam'], profitIndex: 8, durationDays: 140 },
      { id: 'paddy', name: 'Paddy (Basmati)', local: { pa: 'ਝੋਨਾ', hi: 'धान' }, seasons: ['Kharif'], waterNeed: 'High', soil: ['Alluvial'], profitIndex: 8, durationDays: 130 },
      { id: 'maize', name: 'Maize', local: { pa: 'ਮੱਕੀ', hi: 'मक्का' }, seasons: ['Kharif'], waterNeed: 'Medium', soil: ['Alluvial', 'Sandy loam'], profitIndex: 7, durationDays: 100 },
      { id: 'mustard', name: 'Mustard', local: { pa: 'ਸਰੋਂ', hi: 'सरसों' }, seasons: ['Rabi'], waterNeed: 'Low', soil: ['Alluvial', 'Sandy loam'], profitIndex: 7, durationDays: 120 }
    ]
  },
  {
    id: 'tn',
    state: 'Tamil Nadu',
    stateLocal: { ta: 'தமிழ்நாடு', hi: 'तमिलनाडु' },
    lat: 11.1271,
    lon: 78.6569,
    agroZone: 'Cauvery delta - coastal',
    districts: [
      { id: 'tn-theni', name: 'Theni', soil: 'Red loam', rainfallMm: 850, tempRange: [20, 38] },
      { id: 'tn-thanjavur', name: 'Thanjavur', soil: 'Cauvery alluvial', rainfallMm: 1100, tempRange: [22, 38] },
      { id: 'tn-coimbatore', name: 'Coimbatore', soil: 'Red sandy loam', rainfallMm: 700, tempRange: [20, 36] },
      { id: 'tn-nilgiris', name: 'Nilgiris', soil: 'Laterite', rainfallMm: 1600, tempRange: [10, 25] }
    ],
    crops: [
      { id: 'paddy', name: 'Paddy', local: { ta: 'நெல்', hi: 'धान' }, seasons: ['Kharif', 'Rabi'], waterNeed: 'High', soil: ['Cauvery alluvial'], profitIndex: 7, durationDays: 130 },
      { id: 'banana', name: 'Banana', local: { ta: 'வாழை', hi: 'केला' }, seasons: ['Annual'], waterNeed: 'High', soil: ['Cauvery alluvial', 'Red loam'], profitIndex: 9, durationDays: 300 },
      { id: 'sugarcane', name: 'Sugarcane', local: { ta: 'கரும்பு', hi: 'गन्ना' }, seasons: ['Annual'], waterNeed: 'High', soil: ['Cauvery alluvial'], profitIndex: 8, durationDays: 330 },
      { id: 'coconut', name: 'Coconut', local: { ta: 'தென்னை', hi: 'नारियल' }, seasons: ['Perennial'], waterNeed: 'Medium', soil: ['Red sandy loam', 'Laterite'], profitIndex: 8, durationDays: 365 },
      { id: 'tea', name: 'Tea', local: { ta: 'தேயிலை', hi: 'चाय' }, seasons: ['Perennial'], waterNeed: 'High', soil: ['Laterite'], profitIndex: 9, durationDays: 365 }
    ]
  },
  {
    id: 'up',
    state: 'Uttar Pradesh',
    stateLocal: { hi: 'उत्तर प्रदेश' },
    lat: 26.8467,
    lon: 80.9462,
    agroZone: 'Gangetic plain - alluvial',
    districts: [
      { id: 'up-lucknow', name: 'Lucknow', soil: 'Alluvial', rainfallMm: 950, tempRange: [7, 44] },
      { id: 'up-meerut', name: 'Meerut', soil: 'Alluvial', rainfallMm: 800, tempRange: [5, 43] },
      { id: 'up-varanasi', name: 'Varanasi', soil: 'Alluvial', rainfallMm: 1000, tempRange: [8, 45] }
    ],
    crops: [
      { id: 'wheat', name: 'Wheat', local: { hi: 'गेहूँ' }, seasons: ['Rabi'], waterNeed: 'Medium', soil: ['Alluvial'], profitIndex: 8, durationDays: 140 },
      { id: 'sugarcane', name: 'Sugarcane', local: { hi: 'गन्ना' }, seasons: ['Annual'], waterNeed: 'High', soil: ['Alluvial'], profitIndex: 8, durationDays: 330 },
      { id: 'paddy', name: 'Paddy', local: { hi: 'धान' }, seasons: ['Kharif'], waterNeed: 'High', soil: ['Alluvial'], profitIndex: 7, durationDays: 130 },
      { id: 'potato', name: 'Potato', local: { hi: 'आलू' }, seasons: ['Rabi'], waterNeed: 'Medium', soil: ['Alluvial'], profitIndex: 8, durationDays: 95 }
    ]
  },
  {
    id: 'wb',
    state: 'West Bengal',
    stateLocal: { bn: 'পশ্চিমবঙ্গ', hi: 'पश्चिम बंगाल' },
    lat: 22.9868,
    lon: 87.855,
    agroZone: 'Bengal delta - humid',
    districts: [
      { id: 'wb-bardhaman', name: 'Bardhaman', soil: 'Alluvial', rainfallMm: 1500, tempRange: [12, 40] },
      { id: 'wb-murshidabad', name: 'Murshidabad', soil: 'Alluvial', rainfallMm: 1400, tempRange: [12, 40] }
    ],
    crops: [
      { id: 'paddy', name: 'Paddy', local: { bn: 'ধান', hi: 'धान' }, seasons: ['Kharif', 'Boro'], waterNeed: 'High', soil: ['Alluvial'], profitIndex: 8, durationDays: 130 },
      { id: 'jute', name: 'Jute', local: { bn: 'পাট', hi: 'जूट' }, seasons: ['Kharif'], waterNeed: 'High', soil: ['Alluvial'], profitIndex: 7, durationDays: 120 },
      { id: 'potato', name: 'Potato', local: { bn: 'আলু', hi: 'आलू' }, seasons: ['Rabi'], waterNeed: 'Medium', soil: ['Alluvial'], profitIndex: 8, durationDays: 95 },
      { id: 'mustard', name: 'Mustard', local: { bn: 'সরিষা', hi: 'सरसों' }, seasons: ['Rabi'], waterNeed: 'Low', soil: ['Alluvial'], profitIndex: 7, durationDays: 120 }
    ]
  }
];

export function getRegion(regionId) {
  return REGIONS.find((r) => r.id === regionId) || REGIONS[0];
}

export function getDistrict(regionId, districtId) {
  const region = getRegion(regionId);
  return region.districts.find((d) => d.id === districtId) || region.districts[0];
}

// Simple transparent scoring: soil match + season match + water fit.
// Deliberately explainable so an agronomist can audit the ranking.
export function recommendCrops(regionId, districtId, season, waterAvailability) {
  const region = getRegion(regionId);
  const district = getDistrict(regionId, districtId);
  const rows = region.crops.map((crop) => {
    const reasons = [];
    let score = 40;

    if (crop.soil.includes(district.soil)) {
      score += 25;
      reasons.push(`Soil match: ${district.soil}`);
    } else {
      reasons.push(`Soil mismatch (crop prefers ${crop.soil.join(' / ')})`);
    }

    if (crop.seasons.includes(season)) {
      score += 20;
      reasons.push(`Sown in ${season}`);
    } else {
      score -= 10;
      reasons.push(`Off-season for ${season}`);
    }

    const waterFit = { Low: 1, Medium: 2, High: 3 }[crop.waterNeed];
    const avail = { Low: 1, Medium: 2, High: 3 }[waterAvailability] || 2;
    if (waterFit <= avail) {
      score += 10;
      reasons.push(`Water need (${crop.waterNeed}) within availability (${waterAvailability})`);
    } else {
      score -= 15;
      reasons.push(`Needs more water (${crop.waterNeed}) than available (${waterAvailability})`);
    }

    score += Math.round(crop.profitIndex * 0.5);
    return {
      cropId: crop.id,
      name: crop.name,
      local: crop.local || {},
      matchScore: Math.max(0, Math.min(100, score)),
      durationDays: crop.durationDays,
      waterNeed: crop.waterNeed,
      profitIndex: crop.profitIndex,
      reasons
    };
  });
  return { region, district, season, waterAvailability, recommendations: rows.sort((a, b) => b.matchScore - a.matchScore) };
}
