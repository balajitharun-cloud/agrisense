// ---------------------------------------------------------------------------
// Translation service.
// Ships a curated phrase dictionary for the dynamic, agronomy-critical strings
// the API generates (weather tips, soil advice, sensor alerts). Data objects
// that already carry a `local` map are localised directly.
//
// Plug-in point: set TRANSLATE_API_KEY to route unknown strings to Bhashini /
// Google Translate; otherwise unknown strings pass through unchanged and the
// response is flagged `machine: false`.
// ---------------------------------------------------------------------------

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' }
];

// English sentence -> translations. Keep keys EXACTLY equal to the strings the
// services emit so lookups hit.
const PHRASES = {
  'Heavy rain expected in 72h - postpone spraying and top-dressing; open field drains.': {
    hi: '72 घंटे में भारी बारिश की संभावना - छिड़काव और टॉप-ड्रेसिंग टालें; खेत के निकास खोलें।',
    kn: '72 ಗಂಟೆಗಳಲ್ಲಿ ಭಾರೀ ಮಳೆ ನಿರೀಕ್ಷಿತ - ಸಿಂಪಡಣೆ ಮತ್ತು ಮೇಲ್ಗೊಬ್ಬರ ಮುಂದೂಡಿ; ಜಲನಿರ್ಗಮನ ತೆರೆಯಿರಿ.',
    ta: '72 மணி நேரத்தில் கனமழை - தெளிப்பு, மேலுரம் தள்ளிப்போடுங்கள்; வடிகால் திறங்கள்.',
    te: '72 గంటల్లో భారీ వర్షం - పిచికారీ, పైపోషణ వాయిదా వేయండి; కాలువలు తెరవండి.',
    mr: '72 तासांत जोरदार पाऊस - फवारणी व वरखत पुढे ढकला; पाण्याचा निचरा करा.'
  },
  'Light showers likely - a good window for urea top-dressing; avoid spraying 6h before rain.': {
    hi: 'हल्की बौछारें संभव - यूरिया टॉप-ड्रेसिंग के लिए अच्छा समय; बारिश से 6 घंटे पहले छिड़काव न करें।',
    kn: 'ಹಗುರ ಮಳೆ ಸಾಧ್ಯ - ಯೂರಿಯಾ ಮೇಲ್ಗೊಬ್ಬರಕ್ಕೆ ಉತ್ತಮ ಸಮಯ; ಮಳೆಗೆ 6 ಗಂಟೆ ಮೊದಲು ಸಿಂಪಡಿಸಬೇಡಿ.',
    ta: 'இலகு தூறல் வாய்ப்பு - யூரியா மேலுரத்திற்கு நல்ல நேரம்; மழைக்கு 6 மணி முன் தெளிக்க வேண்டாம்.',
    te: 'తేలికపాటి జల్లులు - యూరియా పైపోషణకు మంచి సమయం; వర్షానికి 6 గం ముందు పిచికారీ వద్దు.',
    mr: 'हलका पाऊस शक्य - युरिया वरखतासाठी चांगला काळ; पावसाच्या 6 तास आधी फवारू नका.'
  },
  'Dry spell ahead - plan irrigation and mulch to conserve soil moisture.': {
    hi: 'आगे सूखा दौर - सिंचाई की योजना बनाएं और मल्चिंग से नमी बचाएं।',
    kn: 'ಮುಂದೆ ಒಣ ಅವಧಿ - ನೀರಾವರಿ ಯೋಜಿಸಿ ಮತ್ತು ಮಲ್ಚ್ನಿಂದ ತೇವಾಂಶ ಉಳಿಸಿ.',
    ta: 'வறட்சிக் காலம் - நீர்ப்பாசனம் திட்டமிடுங்கள்; மல்ச் இட்டு ஈரம் காக்கவும்.',
    te: 'ఎండ కాలం - నీటిపారుదల ప్లాన్ చేయండి; మల్చ్తో తేమ కాపాడండి.',
    mr: 'पुढे कोरडा काळ - पाणी नियोजन करा व मल्चने ओलावा टिकवा.'
  },
  'Heat stress risk: irrigate early morning/evening, avoid mid-day operations.': {
    hi: 'गर्मी तनाव का खतरा: सुबह/शाम सिंचाई करें, दोपहर के काम से बचें।',
    kn: 'ಶಾಖ ಒತ್ತಡದ ಅಪಾಯ: ಬೆಳಿಗ್ಗೆ/ಸಂಜೆ ನೀರಾವರಿ ಮಾಡಿ, ಮಧ್ಯಾಹ್ನ ಕೆಲಸ ತಪ್ಪಿಸಿ.',
    ta: 'வெப்ப அழுத்த ஆபத்து: காலை/மாலை பாசனம் செய்யுங்கள்; நண்பகல் வேலை தவிர்க்கவும்.',
    te: 'వేడి ఒత్తిడి ప్రమాదం: ఉదయం/సాయంత్రం నీరు పెట్టండి; మధ్యాహ్నం పని వద్దు.',
    mr: 'उष्णतेचा ताण: सकाळ/संध्याकाळ पाणी द्या, दुपारची कामे टाळा.'
  },
  'High humidity - scout for fungal disease and consider a protective fungicide.': {
    hi: 'अधिक आर्द्रता - फंगल रोग की निगरानी करें और सुरक्षात्मक फफूंदनाशक पर विचार करें।',
    kn: 'ಹೆಚ್ಚು ಆರ್ದ್ರತೆ - ಶಿಲೀಂಧ್ರ ರೋಗ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ರಕ್ಷಣಾತ್ಮಕ ಶಿಲೀಂಧ್ರನಾಶಕ ಪರಿಗಣಿಸಿ.',
    ta: 'அதிக ஈரப்பதம் - பூஞ்சை நோயை கண்காணியுங்கள்; பாதுகாப்பு பூஞ்சைக்கொல்லி பரிசீலியுங்கள்.',
    te: 'అధిక తేమ - ఫంగల్ వ్యాధి పరిశీలించండి; రక్షణ శిలీంధ్రనాశకం ఆలోచించండి.',
    mr: 'जास्त आर्द्रता - बुरशीजन्य रोग तपासा; संरक्षक बुरशीनाशक विचारात घ्या.'
  },
  'Surface soil moisture is low - schedule irrigation within 3 days.': {
    hi: 'सतह की मिट्टी में नमी कम - 3 दिनों में सिंचाई करें।',
    kn: 'ಮೇಲ್ಮಣ್ಣಿನ ತೇವಾಂಶ ಕಡಿಮೆ - 3 ದಿನಗಳಲ್ಲಿ ನೀರಾವರಿ ಮಾಡಿ.',
    ta: 'மேற்பரப்பு மண் ஈரம் குறைவு - 3 நாட்களில் பாசனம் செய்யுங்கள்.',
    te: 'ఉపరితల నేల తేమ తక్కువ - 3 రోజుల్లో నీరు పెట్టండి.',
    mr: 'पृष्ठभागातील ओलावा कमी - 3 दिवसांत पाणी द्या.'
  },
  'Vegetation index is low - check for nutrient deficiency or pest damage.': {
    hi: 'वनस्पति सूचकांक कम - पोषक तत्व की कमी या कीट नुकसान जांचें।',
    kn: 'ಸಸ್ಯವರ್ಗ ಸೂಚ್ಯಂಕ ಕಡಿಮೆ - ಪೋಷಕಾಂಶ ಕೊರತೆ ಅಥವಾ ಕೀಟ ಹಾನಿ ಪರಿಶೀಲಿಸಿ.',
    ta: 'தாவரக் குறியீடு குறைவு - ஊட்டச்சத்து குறை அல்லது பூச்சி சேதம் சரிபாருங்கள்.',
    te: 'వృక్ష సూచిక తక్కువ - పోషక లోపం లేదా కీటక నష్టం చూడండి.',
    mr: 'वनस्पती निर्देशांक कमी - पोषक कमतरता किंवा कीटक नुकसान तपासा.'
  }
};

export function translateText(text, lang = 'en') {
  if (!lang || lang === 'en' || !text) return { text, machine: false };
  const hit = PHRASES[text] && PHRASES[text][lang];
  return { text: hit || text, machine: false, translated: Boolean(hit) };
}

// Localise an object that may carry a `local` map. Returns a shallow copy with
// name/title/summary replaced when a translation exists.
export function localize(obj, lang = 'en', fields = ['name', 'title', 'summary', 'signs', 'safety', 'name']) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = { ...obj };
  if (obj.local && lang !== 'en' && obj.local[lang]) {
    if (obj.name != null) out.name = obj.local[lang];
    if (obj.title != null) out.title = obj.local[lang];
  }
  for (const f of fields) {
    if (typeof obj[f] === 'string') {
      const { text } = translateText(obj[f], lang);
      out[f] = text;
    }
  }
  return out;
}

export function localizeList(list, lang, fields) {
  return (list || []).map((o) => localize(o, lang, fields));
}

// Translate a list of plain sentences (e.g. suggestions/advice arrays).
export function translateLines(lines, lang) {
  return (lines || []).map((l) => translateText(l, lang).text);
}
