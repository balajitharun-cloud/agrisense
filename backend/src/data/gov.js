// ---------------------------------------------------------------------------
// Government agriculture announcements / advisories.
// Plug-in point: set GOV_FEED_URL in .env to ingest a live RSS/JSON feed
// (PIB, State Dept. of Agriculture, IMD agro-advisory). Mock feed otherwise.
// Titles/summaries carry `local` translations where available.
// ---------------------------------------------------------------------------

export const GOV_ANNOUNCEMENTS = [
  {
    id: 'gov-2026-1024-01',
    date: '2026-10-24',
    ministry: 'Department of Agriculture & Farmers Welfare',
    level: 'central',
    region: 'All India',
    category: 'Subsidy',
    urgency: 'normal',
    title: 'PM-KISAN 19th instalment released',
    local: { kn: 'ಪಿಎಂ-ಕಿಸಾನ್ 19ನೇ ಕಂತು ಬಿಡುಗಡೆ', hi: 'पीएम-किसान की 19वीं किस्त जारी' },
    summary: '₹2,000 credited to eligible farmer accounts. Check beneficiary status on the PM-KISAN portal or your bank passbook.',
    link: 'https://pmkisan.gov.in'
  },
  {
    id: 'gov-2026-1023-02',
    date: '2026-10-23',
    ministry: 'Karnataka Dept. of Agriculture',
    level: 'state',
    region: 'Karnataka',
    category: 'Advisory',
    urgency: 'high',
    title: 'Fall Armyworm alert for Kharif maize in North Karnataka',
    local: { kn: 'ಉತ್ತರ ಕರ್ನಾಟಕದ ಮೆಕ್ಕೆಜೋಳಕ್ಕೆ ಸೈನ್ಯ ಹುಳು ಎಚ್ಚರಿಕೆ' },
    summary: 'Scouting reports confirm FAW incidence in Dharwad, Belagavi and Haveri. Farmers advised to scout twice weekly and follow IPM; avoid calendar spraying.',
    link: 'https://raitamitra.karnataka.gov.in'
  },
  {
    id: 'gov-2026-1022-03',
    date: '2026-10-22',
    ministry: 'India Meteorological Department (IMD)',
    level: 'central',
    region: 'South Interior Karnataka',
    category: 'Weather Advisory',
    urgency: 'medium',
    title: 'Above-normal October rainfall likely over South Interior Karnataka',
    local: { kn: 'ದಕ್ಷಿಣ ಒಳನಾಡ ಕರ್ನಾಟಕದಲ್ಲಿ ಅಕ್ಟೋಬರ್ ಮಳೆ ಸಾಮಾನ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚು' },
    summary: 'IMD forecasts 10-15% above-normal rainfall. Delay harvesting of mature crops and ensure field drainage in low-lying areas.',
    link: 'https://mausam.imd.gov.in'
  },
  {
    id: 'gov-2026-1021-04',
    date: '2026-10-21',
    ministry: 'Karnataka Raitha Samparka Kendra',
    level: 'state',
    region: 'Karnataka',
    category: 'Market',
    urgency: 'normal',
    title: 'Onion procurement centres open in Hubballi and Bagalkot',
    local: { kn: 'ಹುಬ್ಬಳ್ಳಿ ಮತ್ತು ಬಾಗಲಕೋಟೆಯಲ್ಲಿ ಈರುಳ್ಳಿ ಖರೀದಿ ಕೇಂದ್ರ' },
    summary: 'NAFED procurement at ₹2,410/quintal with immediate payment. Registration open at local APMC offices.',
    link: 'https://karnataka.gov.in'
  },
  {
    id: 'gov-2026-1020-05',
    date: '2026-10-20',
    ministry: 'Ministry of Agriculture (PPQS)',
    level: 'central',
    region: 'All India',
    category: 'Regulation',
    urgency: 'normal',
    title: 'Revised label claims for 3 neonicotinoid formulations',
    local: { kn: '3 ನಿಯೋನಿಕೋಟಿನಾಯ್ಡ್ ಸೂತ್ರೀಕರಣಗಳ ಪರಿಷ್ಕೃತ ಲೇಬಲ್' },
    summary: 'CIB&RC has restricted certain uses. Verify the latest approved label before purchase; non-compliant stock should not be sold.',
    link: 'https://ppqs.gov.in'
  },
  {
    id: 'gov-2026-1019-06',
    date: '2026-10-19',
    ministry: 'Karnataka Horticulture Department',
    level: 'state',
    region: 'Karnataka',
    category: 'Scheme',
    urgency: 'normal',
    title: 'Drip irrigation subsidy window extended to 30 November',
    local: { kn: 'ಹನಿ ನೀರಾವರಿ ಸಬ್ಸಿಡಿ ಅವಧಿ ನವೆಂಬರ್ 30ರವರೆಗೆ ವಿಸ್ತರಣೆ' },
    summary: 'Up to 55% subsidy for small and marginal farmers. Apply through the FRUITS portal with land records and bank details.',
    link: 'https://horticulture.karnataka.gov.in'
  },
  {
    id: 'gov-2026-1018-07',
    date: '2026-10-18',
    ministry: 'Coffee Board of India',
    level: 'central',
    region: 'Kodagu, Chikkamagaluru, Hassan',
    category: 'Advisory',
    urgency: 'medium',
    title: 'Coffee Berry Borer management advisory for post-monsoon',
    local: { kn: 'ಮಳೆಯ ನಂತರ ಕಾಫಿ ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು ನಿರ್ವಹಣೆ ಸಲಹೆ' },
    summary: 'Collect and destroy fallen berries, maintain shade, and adopt Beauveria-based biocontrol. Chemical use only on threshold breach.',
    link: 'https://indiacoffee.org'
  },
  {
    id: 'gov-2026-1017-08',
    date: '2026-10-17',
    ministry: 'Karnataka Agricultural Marketing Board',
    level: 'state',
    region: 'Karnataka',
    category: 'Market',
    urgency: 'normal',
    title: 'Unified market fee waived for direct farmer sales',
    local: { kn: 'ರೈತರ ನೇರ ಮಾರಾಟಕ್ಕೆ ಏಕೀಕೃತ ಮಾರುಕಟ್ಟೆ ಶುಲ್ಕ ರದ್ದು' },
    summary: 'Farmers selling directly to registered traders will not pay the unified market fee. Applicable across all Karnataka APMCs.',
    link: 'https://krama.karnataka.gov.in'
  }
];
