// ---------------------------------------------------------------------------
// Pesticide / plant-protection dataset.
// Each entry: target pest(s), recommended crop(s), active ingredient with its
// chemical formula, formulation, dosage, pre-harvest interval and safety notes.
// Content is for decision-support only and MUST be verified against the
// current CIB&RC label and a licensed agronomist before use.
// `local` holds translated names/notes where available; the /translate route
// fills the rest at request time.
// ---------------------------------------------------------------------------

export const PESTS = [
  {
    id: 'fall-armyworm',
    name: 'Fall Armyworm',
    crops: ['maize', 'jowar'],
    severity: 'high',
    local: { kn: 'ಬೇಸಿಗೆ ಸೈನ್ಯ ಹುಳು', hi: 'फॉल आर्मीवर्म', ta: 'இராணுவப் புழு' },
    signs: 'Ragged holes in whorl, moist sawdust-like frass near the funnel.'
  },
  {
    id: 'pink-bollworm',
    name: 'Pink Bollworm',
    crops: ['cotton'],
    severity: 'high',
    local: { kn: 'ಗುಲಾಬಿ ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು', hi: 'गुलाबी सुंडी', mr: 'गुलाबी बोंड अळी' },
    signs: 'Rosetted flowers, exit holes on bolls, pink larvae inside locules.'
  },
  {
    id: 'whitefly',
    name: 'Whitefly',
    crops: ['cotton', 'tomato', 'chilli'],
    severity: 'medium',
    local: { kn: 'ಬಿಳಿ ನೊಣ', hi: 'सफेद मक्खी', ta: 'வெள்ளை ஈ' },
    signs: 'Clouds of tiny white flies on disturbance, sticky honeydew, sooty mould.'
  },
  {
    id: 'bph',
    name: 'Brown Plant Hopper',
    crops: ['paddy'],
    severity: 'high',
    local: { kn: 'ಕಂದು ಸಸ್ಯ ಮಿಡತೆ', hi: 'भूरा फुदका', ta: 'பழுப்புத் தத்துப்பூச்சி' },
    signs: 'Hopper burn - circular patches of dried, lodged plants in the field.'
  },
  {
    id: 'leaf-blast',
    name: 'Rice Blast',
    crops: ['paddy'],
    severity: 'high',
    local: { kn: 'ಭತ್ತದ ಬ್ಲಾಸ್ಟ್ ರೋಗ', hi: 'धान का ब्लास्ट', ta: 'நெல் குலை நோய்' },
    signs: 'Spindle-shaped lesions with grey centre and brown margin on leaves.'
  },
  {
    id: 'coffee-borer',
    name: 'Coffee Berry Borer',
    crops: ['coffee'],
    severity: 'high',
    local: { kn: 'ಕಾಫಿ ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು', hi: 'कॉफ़ी बेरी बोरर' },
    signs: 'Small entry hole at berry tip, hollowed beans, fallen green berries.'
  },
  {
    id: 'tuta',
    name: 'Tomato Leaf Miner (Tuta)',
    crops: ['tomato'],
    severity: 'high',
    local: { kn: 'ಟೊಮೆಟೊ ಎಲೆ ಸುರಂಗ ಹುಳು', hi: 'टमाटर लीफ माइनर' },
    signs: 'Blotchy serpentine mines in leaves, larvae inside fruit near calyx.'
  },
  {
    id: 'thrips',
    name: 'Thrips',
    crops: ['chilli', 'onion', 'cotton'],
    severity: 'medium',
    local: { kn: 'ರಸಿಕೆ ಹುಳು', hi: 'थ्रिप्स', ta: 'இலைத் தத்துப்பூச்சி' },
    signs: 'Silvery streaks, upward leaf curl, flower drop in chilli.'
  },
  {
    id: 'aphids',
    name: 'Aphids',
    crops: ['mustard', 'chilli', 'tomato', 'sugarcane'],
    severity: 'medium',
    local: { kn: 'ಸಸ್ಯ ರಸಹೀರುವ ಹುಳು', hi: 'माहू', pa: 'ਤੇਲਾ' },
    signs: 'Clustered colonies on tender shoots, curled leaves, honeydew.'
  },
  {
    id: 'wheat-rust',
    name: 'Wheat Leaf Rust',
    crops: ['wheat'],
    severity: 'high',
    local: { kn: 'ಗೋಧಿ ತುಕ್ಕು ರೋಗ', hi: 'गेहूँ का रतुआ' },
    signs: 'Orange-brown powdery pustules scattered over the upper leaf surface.'
  }
];

export const PESTICIDES = [
  {
    id: 'imidacloprid',
    name: 'Imidacloprid 17.8% SL',
    type: 'Insecticide',
    activeIngredient: 'Imidacloprid',
    formula: 'C9H10ClN5O2',
    molarMass: '255.66 g/mol',
    iupac: 'N-[1-[(6-chloropyridin-3-yl)methyl]imidazolidin-2-ylidene]nitramide',
    class: 'Neonicotinoid',
    modeOfAction: 'Nicotinic acetylcholine receptor agonist - systemic',
    targets: ['bph', 'whitefly', 'aphids', 'thrips'],
    dosage: '0.3-0.5 ml per litre water; ~100-125 ml per acre',
    phi: '21 days',
    reentry: '12 hours',
    safety: 'Highly toxic to bees and pollinators. Do not spray during flowering. Wear gloves and a mask.',
    toxicityClass: 'WHO Class II (Moderately hazardous)'
  },
  {
    id: 'emamectin',
    name: 'Emamectin Benzoate 5% SG',
    type: 'Insecticide',
    activeIngredient: 'Emamectin benzoate',
    formula: 'C49H75NO13 (as benzoate salt)',
    molarMass: '886.1 g/mol (base)',
    iupac: 'Derivative of avermectin B1 (4"-deoxy-4"-epi-methylamino)',
    class: 'Avermectin / biopesticide-derived',
    modeOfAction: 'Glutamate-gated chloride channel activator - stomach poison',
    targets: ['fall-armyworm', 'tuta', 'pink-bollworm', 'thrips'],
    dosage: '0.4 g per litre water; ~88-100 g per acre',
    phi: '7 days',
    reentry: '24 hours',
    safety: 'Do not apply to crops in bloom; harmful if swallowed. Keep away from aquaculture.',
    toxicityClass: 'WHO Class Ib (Highly hazardous)'
  },
  {
    id: 'chlorantraniliprole',
    name: 'Chlorantraniliprole 18.5% SC',
    type: 'Insecticide',
    activeIngredient: 'Chlorantraniliprole',
    formula: 'C18H14BrCl2N5O2',
    molarMass: '483.15 g/mol',
    iupac: '3-bromo-N-[4-chloro-2-methyl-6-(methylcarbamoyl)phenyl]-1-(3-chloropyridin-2-yl)-1H-pyrazole-5-carboxamide',
    class: 'Diamide (Ryanodine receptor modulator)',
    modeOfAction: 'Ryanodine receptor activator causing muscle paralysis',
    targets: ['fall-armyworm', 'pink-bollworm', 'tuta', 'leaf-blast'],
    dosage: '0.3 ml per litre water; ~60-80 ml per acre',
    phi: '10 days',
    reentry: '12 hours',
    safety: 'Low toxicity to mammals; still use PPE. Avoid drift onto flowering weeds.',
    toxicityClass: 'WHO Class U (Unlikely to present acute hazard)'
  },
  {
    id: 'thiamethoxam',
    name: 'Thiamethoxam 25% WG',
    type: 'Insecticide',
    activeIngredient: 'Thiamethoxam',
    formula: 'C8H10ClN5O3S',
    molarMass: '291.71 g/mol',
    iupac: '3-[(2-chloro-1,3-thiazol-5-yl)methyl]-5-methyl-N-nitro-1,3,5-oxadiazinan-4-imine',
    class: 'Neonicotinoid',
    modeOfAction: 'Nicotinic acetylcholine receptor agonist - systemic',
    targets: ['whitefly', 'bph', 'aphids', 'thrips'],
    dosage: '0.3 g per litre water; ~100 g per acre',
    phi: '20 days',
    reentry: '12 hours',
    safety: 'Toxic to bees; restrict use before flowering. Rotate with a different MoA group.',
    toxicityClass: 'WHO Class III (Slightly hazardous)'
  },
  {
    id: 'tricyclazole',
    name: 'Tricyclazole 75% WP',
    type: 'Fungicide',
    activeIngredient: 'Tricyclazole',
    formula: 'C9H7N3S',
    molarMass: '189.24 g/mol',
    iupac: '5-methyl-1,2,4-triazolo[3,4-b][1,3]benzothiazole',
    class: 'Melanin biosynthesis inhibitor',
    modeOfAction: 'Prevents appressoria melanisation, blocking fungal penetration',
    targets: ['leaf-blast'],
    dosage: '0.6 g per litre water; ~120 g per acre',
    phi: '14 days',
    reentry: '24 hours',
    safety: 'Spray at boot-leaf and 50% flowering for best control. Avoid tank-mixing with alkaline products.',
    toxicityClass: 'WHO Class III (Slightly hazardous)'
  },
  {
    id: 'propiconazole',
    name: 'Propiconazole 25% EC',
    type: 'Fungicide',
    activeIngredient: 'Propiconazole',
    formula: 'C15H17Cl2N3O2',
    molarMass: '342.22 g/mol',
    iupac: '1-[[2-(2,4-dichlorophenyl)-4-propyl-1,3-dioxolan-2-yl]methyl]-1H-1,2,4-triazole',
    class: 'Triazole (DMI)',
    modeOfAction: 'Ergosterol biosynthesis inhibitor (C14-demethylase)',
    targets: ['wheat-rust', 'leaf-blast'],
    dosage: '1.0 ml per litre water; ~200 ml per acre',
    phi: '35 days',
    reentry: '24 hours',
    safety: 'Harmful if swallowed; possible skin sensitiser. Use full PPE.',
    toxicityClass: 'WHO Class II (Moderately hazardous)'
  },
  {
    id: 'mancozeb',
    name: 'Mancozeb 75% WP',
    type: 'Fungicide',
    activeIngredient: 'Mancozeb',
    formula: '[C4H6MnN2S4]x[Zn]y (coordination polymer)',
    molarMass: '~271.2 g/mol (monomer)',
    iupac: 'Manganese zinc ethylene bis(dithiocarbamate) polymer',
    class: 'Dithiocarbamate (multi-site)',
    modeOfAction: 'Multi-site contact fungicide disrupting fungal respiration',
    targets: ['leaf-blast', 'wheat-rust', 'tuta'],
    dosage: '2.0-2.5 g per litre water; ~500-600 g per acre',
    phi: '15 days',
    reentry: '24 hours',
    safety: 'Protective contact fungicide - cover both leaf surfaces. Suspected endocrine disruptor; strict PPE.',
    toxicityClass: 'WHO Class U (Unlikely to present acute hazard)'
  },
  {
    id: 'beuveria',
    name: 'Beauveria bassiana 1.15% WP (bio)',
    type: 'Bio-insecticide',
    activeIngredient: 'Beauveria bassiana (fungal spores)',
    formula: 'Biological agent (no single chemical formula)',
    molarMass: 'n/a',
    iupac: 'n/a - entomopathogenic fungus',
    class: 'Biopesticide',
    modeOfAction: 'Spores germinate on cuticle and colonise the insect, causing mycosis',
    targets: ['fall-armyworm', 'whitefly', 'aphids', 'thrips'],
    dosage: '5 g per litre water; ~1 kg per acre',
    phi: '0 days (residue-exempt)',
    reentry: '4 hours',
    safety: 'IPM- and organic-friendly. Do not tank-mix with chemical fungicides. Spray late evening.',
    toxicityClass: 'Practically non-toxic'
  }
];

export function pesticidesFor(pestId, cropId) {
  return PESTICIDES.filter(
    (p) => p.targets.includes(pestId) && (!cropId || true)
  );
}

export function pestById(id) {
  return PESTS.find((p) => p.id === id);
}
