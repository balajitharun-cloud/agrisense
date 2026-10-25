// ---------------------------------------------------------------------------
// Karnataka revenue divisions with their dominant crops.
//
// Karnataka has four revenue divisions: Bengaluru, Mysuru, Belagavi and
// Kalaburagi. Each groups several districts that share soil, rainfall and
// cropping patterns, which makes a division a useful recommendation unit.
//
// `dominantCrops[].share` is an INDICATIVE relative share of cultivated area
// within the division (rounded, for the UI's proportion bars) - it is not an
// official statistical series. Swap in Department of Agriculture figures if
// you need audited numbers.
// ---------------------------------------------------------------------------

export const DIVISIONS = [
  {
    id: 'bengaluru',
    name: 'Bengaluru Division',
    local: { kn: 'ಬೆಂಗಳೂರು ವಿಭಾಗ', hi: 'बेंगलुरु मंडल', ta: 'பெங்களூரு கோட்டம்' },
    representativeDistrictId: 'ka-blr-rural',
    districts: [
      'Bengaluru Urban', 'Bengaluru Rural', 'Chikkaballapura', 'Chitradurga',
      'Davanagere', 'Kolar', 'Ramanagara', 'Shivamogga', 'Tumakuru'
    ],
    climate: 'Semi-arid plateau, 700-900 mm annual rainfall, red loam soils',
    note: 'Ragi and maize country. Kolar and Chikkaballapur add vegetables; Tumakuru and Chitradurga grow pulses and groundnut on red soils.',
    dominantCrops: [
      { cropId: 'ragi', name: 'Ragi (Finger millet)', local: { kn: 'ರಾಗಿ' }, share: 28 },
      { cropId: 'maize', name: 'Maize', local: { kn: 'ಮೆಕ್ಕೆಜೋಳ' }, share: 20 },
      { cropId: 'groundnut', name: 'Groundnut', local: { kn: 'ಶೇಂಗಾ' }, share: 15 },
      { cropId: 'tomato', name: 'Tomato', local: { kn: 'ಟೊಮೆಟೊ' }, share: 12 },
      { cropId: 'onion', name: 'Onion', local: { kn: 'ಈರುಳ್ಳಿ' }, share: 10 },
      { cropId: 'chilli', name: 'Chilli', local: { kn: 'ಮೆಣಸಿನಕಾಯಿ' }, share: 8 }
    ]
  },
  {
    id: 'mysuru',
    name: 'Mysuru Division',
    local: { kn: 'ಮೈಸೂರು ವಿಭಾಗ', hi: 'मैसूरु मंडल', ta: 'மைசூரு கோட்டம்' },
    representativeDistrictId: 'ka-mysuru',
    districts: [
      'Mysuru', 'Mandya', 'Hassan', 'Kodagu', 'Chamarajanagar',
      'Chikkamagaluru', 'Dakshina Kannada', 'Udupi', 'Uttara Kannada'
    ],
    climate: 'Cauvery basin to high-rainfall Western Ghats, 800-3000 mm, alluvial to laterite',
    note: 'The most diverse division: Cauvery command area grows sugarcane and paddy, Hassan and Mandya add ragi, and the Ghats carry coffee, arecanut and banana.',
    dominantCrops: [
      { cropId: 'sugarcane', name: 'Sugarcane', local: { kn: 'ಕಬ್ಬು' }, share: 24 },
      { cropId: 'paddy', name: 'Paddy', local: { kn: 'ಭತ್ತ' }, share: 20 },
      { cropId: 'ragi', name: 'Ragi (Finger millet)', local: { kn: 'ರಾಗಿ' }, share: 16 },
      { cropId: 'coffee', name: 'Coffee', local: { kn: 'ಕಾಫಿ' }, share: 13 },
      { cropId: 'arecanut', name: 'Arecanut', local: { kn: 'ಅಡಿಕೆ' }, share: 10 },
      { cropId: 'banana', name: 'Banana', local: { kn: 'ಬಾಳೆ' }, share: 9 }
    ]
  },
  {
    id: 'belagavi',
    name: 'Belagavi Division',
    local: { kn: 'ಬೆಳಗಾವಿ ವಿಭಾಗ', hi: 'बेलगावी मंडल', mr: 'बेळगावी विभाग' },
    representativeDistrictId: 'ka-belagavi',
    districts: ['Belagavi', 'Bagalkot', 'Vijayapura', 'Dharwad', 'Gadag', 'Haveri'],
    climate: 'Northern black-soil belt, 600-1100 mm, deep black cotton soils',
    note: 'Black cotton soil heartland: jowar and cotton dominate, with sugarcane under canal command and maize on the eastern edges.',
    dominantCrops: [
      { cropId: 'jowar', name: 'Jowar (Sorghum)', local: { kn: 'ಜೋಳ' }, share: 26 },
      { cropId: 'cotton', name: 'Cotton', local: { kn: 'ಹತ್ತಿ' }, share: 21 },
      { cropId: 'sugarcane', name: 'Sugarcane', local: { kn: 'ಕಬ್ಬು' }, share: 18 },
      { cropId: 'maize', name: 'Maize', local: { kn: 'ಮೆಕ್ಕೆಜೋಳ' }, share: 14 },
      { cropId: 'groundnut', name: 'Groundnut', local: { kn: 'ಶೇಂಗಾ' }, share: 11 },
      { cropId: 'onion', name: 'Onion', local: { kn: 'ಈರುಳ್ಳಿ' }, share: 8 }
    ]
  },
  {
    id: 'kalaburagi',
    name: 'Kalaburagi Division',
    local: { kn: 'ಕಲಬುರಗಿ ವಿಭಾಗ', hi: 'कलबुरगी मंडल', mr: 'कलबुरगी विभाग' },
    representativeDistrictId: 'ka-kalaburagi',
    districts: ['Kalaburagi', 'Yadgir', 'Bidar', 'Raichur', 'Koppal', 'Ballari'],
    climate: 'Driest, hottest division, 450-700 mm, deep black and red gravelly soils',
    note: 'Rain-shadow, low-rainfall belt. Jowar is the staple, cotton and groundnut are the cash crops, and chilli is concentrated around Byadgi and Raichur.',
    dominantCrops: [
      { cropId: 'jowar', name: 'Jowar (Sorghum)', local: { kn: 'ಜೋಳ' }, share: 30 },
      { cropId: 'cotton', name: 'Cotton', local: { kn: 'ಹತ್ತಿ' }, share: 20 },
      { cropId: 'groundnut', name: 'Groundnut', local: { kn: 'ಶೇಂಗಾ' }, share: 18 },
      { cropId: 'chilli', name: 'Chilli', local: { kn: 'ಮೆಣಸಿನಕಾಯಿ' }, share: 12 },
      { cropId: 'maize', name: 'Maize', local: { kn: 'ಮೆಕ್ಕೆಜೋಳ' }, share: 10 },
      { cropId: 'onion', name: 'Onion', local: { kn: 'ಈರುಳ್ಳಿ' }, share: 6 }
    ]
  }
];

export function getDivision(id) {
  return DIVISIONS.find((d) => d.id === id) || null;
}

export function localizeDivision(division, lang = 'en') {
  if (!division) return null;
  return {
    ...division,
    name: division.local?.[lang] || division.name,
    dominantCrops: division.dominantCrops.map((c) => ({
      ...c,
      name: c.local?.[lang] || c.name
    }))
  };
}
