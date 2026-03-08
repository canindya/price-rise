/**
 * Expanded list of ~190 countries with ISO-2, ISO-3, name, region,
 * and FAOSTAT numeric area code.
 */

export interface CountryEntry {
  iso2: string;
  iso3: string;
  name: string;
  region: string;
  faoCode: number;
}

export const COUNTRIES: CountryEntry[] = [
  // North America
  { iso2: "US", iso3: "USA", name: "United States", region: "North America", faoCode: 231 },
  { iso2: "CA", iso3: "CAN", name: "Canada", region: "North America", faoCode: 33 },
  { iso2: "MX", iso3: "MEX", name: "Mexico", region: "North America", faoCode: 138 },

  // Central America
  { iso2: "GT", iso3: "GTM", name: "Guatemala", region: "Central America", faoCode: 89 },
  { iso2: "BZ", iso3: "BLZ", name: "Belize", region: "Central America", faoCode: 23 },
  { iso2: "HN", iso3: "HND", name: "Honduras", region: "Central America", faoCode: 95 },
  { iso2: "SV", iso3: "SLV", name: "El Salvador", region: "Central America", faoCode: 60 },
  { iso2: "NI", iso3: "NIC", name: "Nicaragua", region: "Central America", faoCode: 157 },
  { iso2: "CR", iso3: "CRI", name: "Costa Rica", region: "Central America", faoCode: 48 },
  { iso2: "PA", iso3: "PAN", name: "Panama", region: "Central America", faoCode: 166 },

  // Caribbean
  { iso2: "CU", iso3: "CUB", name: "Cuba", region: "Caribbean", faoCode: 49 },
  { iso2: "JM", iso3: "JAM", name: "Jamaica", region: "Caribbean", faoCode: 109 },
  { iso2: "HT", iso3: "HTI", name: "Haiti", region: "Caribbean", faoCode: 93 },
  { iso2: "DO", iso3: "DOM", name: "Dominican Republic", region: "Caribbean", faoCode: 56 },
  { iso2: "TT", iso3: "TTO", name: "Trinidad and Tobago", region: "Caribbean", faoCode: 220 },
  { iso2: "BS", iso3: "BHS", name: "Bahamas", region: "Caribbean", faoCode: 12 },
  { iso2: "BB", iso3: "BRB", name: "Barbados", region: "Caribbean", faoCode: 14 },
  { iso2: "LC", iso3: "LCA", name: "Saint Lucia", region: "Caribbean", faoCode: 188 },
  { iso2: "GD", iso3: "GRD", name: "Grenada", region: "Caribbean", faoCode: 86 },
  { iso2: "VC", iso3: "VCT", name: "Saint Vincent and the Grenadines", region: "Caribbean", faoCode: 191 },
  { iso2: "AG", iso3: "ATG", name: "Antigua and Barbuda", region: "Caribbean", faoCode: 8 },
  { iso2: "DM", iso3: "DMA", name: "Dominica", region: "Caribbean", faoCode: 55 },
  { iso2: "KN", iso3: "KNA", name: "Saint Kitts and Nevis", region: "Caribbean", faoCode: 187 },
  { iso2: "GY", iso3: "GUY", name: "Guyana", region: "Caribbean", faoCode: 91 },
  { iso2: "SR", iso3: "SUR", name: "Suriname", region: "Caribbean", faoCode: 207 },

  // South America
  { iso2: "BR", iso3: "BRA", name: "Brazil", region: "South America", faoCode: 21 },
  { iso2: "AR", iso3: "ARG", name: "Argentina", region: "South America", faoCode: 9 },
  { iso2: "CO", iso3: "COL", name: "Colombia", region: "South America", faoCode: 44 },
  { iso2: "CL", iso3: "CHL", name: "Chile", region: "South America", faoCode: 40 },
  { iso2: "PE", iso3: "PER", name: "Peru", region: "South America", faoCode: 170 },
  { iso2: "VE", iso3: "VEN", name: "Venezuela", region: "South America", faoCode: 236 },
  { iso2: "EC", iso3: "ECU", name: "Ecuador", region: "South America", faoCode: 58 },
  { iso2: "UY", iso3: "URY", name: "Uruguay", region: "South America", faoCode: 234 },
  { iso2: "BO", iso3: "BOL", name: "Bolivia", region: "South America", faoCode: 19 },
  { iso2: "PY", iso3: "PRY", name: "Paraguay", region: "South America", faoCode: 169 },

  // Europe - Western
  { iso2: "GB", iso3: "GBR", name: "United Kingdom", region: "Europe", faoCode: 229 },
  { iso2: "DE", iso3: "DEU", name: "Germany", region: "Europe", faoCode: 79 },
  { iso2: "FR", iso3: "FRA", name: "France", region: "Europe", faoCode: 68 },
  { iso2: "IT", iso3: "ITA", name: "Italy", region: "Europe", faoCode: 106 },
  { iso2: "ES", iso3: "ESP", name: "Spain", region: "Europe", faoCode: 203 },
  { iso2: "NL", iso3: "NLD", name: "Netherlands", region: "Europe", faoCode: 150 },
  { iso2: "BE", iso3: "BEL", name: "Belgium", region: "Europe", faoCode: 15 },
  { iso2: "AT", iso3: "AUT", name: "Austria", region: "Europe", faoCode: 11 },
  { iso2: "CH", iso3: "CHE", name: "Switzerland", region: "Europe", faoCode: 211 },
  { iso2: "SE", iso3: "SWE", name: "Sweden", region: "Europe", faoCode: 210 },
  { iso2: "NO", iso3: "NOR", name: "Norway", region: "Europe", faoCode: 162 },
  { iso2: "DK", iso3: "DNK", name: "Denmark", region: "Europe", faoCode: 54 },
  { iso2: "FI", iso3: "FIN", name: "Finland", region: "Europe", faoCode: 67 },
  { iso2: "IE", iso3: "IRL", name: "Ireland", region: "Europe", faoCode: 104 },
  { iso2: "PT", iso3: "PRT", name: "Portugal", region: "Europe", faoCode: 174 },
  { iso2: "GR", iso3: "GRC", name: "Greece", region: "Europe", faoCode: 84 },
  { iso2: "LU", iso3: "LUX", name: "Luxembourg", region: "Europe", faoCode: 126 },
  { iso2: "IS", iso3: "ISL", name: "Iceland", region: "Europe", faoCode: 99 },
  { iso2: "MT", iso3: "MLT", name: "Malta", region: "Europe", faoCode: 134 },
  { iso2: "CY", iso3: "CYP", name: "Cyprus", region: "Europe", faoCode: 50 },

  // Europe - Central & Eastern
  { iso2: "PL", iso3: "POL", name: "Poland", region: "Europe", faoCode: 173 },
  { iso2: "CZ", iso3: "CZE", name: "Czech Republic", region: "Europe", faoCode: 167 },
  { iso2: "HU", iso3: "HUN", name: "Hungary", region: "Europe", faoCode: 97 },
  { iso2: "RO", iso3: "ROU", name: "Romania", region: "Europe", faoCode: 183 },
  { iso2: "BG", iso3: "BGR", name: "Bulgaria", region: "Europe", faoCode: 27 },
  { iso2: "SK", iso3: "SVK", name: "Slovakia", region: "Europe", faoCode: 199 },
  { iso2: "HR", iso3: "HRV", name: "Croatia", region: "Europe", faoCode: 98 },
  { iso2: "SI", iso3: "SVN", name: "Slovenia", region: "Europe", faoCode: 198 },
  { iso2: "LT", iso3: "LTU", name: "Lithuania", region: "Europe", faoCode: 125 },
  { iso2: "LV", iso3: "LVA", name: "Latvia", region: "Europe", faoCode: 119 },
  { iso2: "EE", iso3: "EST", name: "Estonia", region: "Europe", faoCode: 63 },
  { iso2: "RS", iso3: "SRB", name: "Serbia", region: "Europe", faoCode: 272 },
  { iso2: "BA", iso3: "BIH", name: "Bosnia and Herzegovina", region: "Europe", faoCode: 80 },
  { iso2: "ME", iso3: "MNE", name: "Montenegro", region: "Europe", faoCode: 273 },
  { iso2: "MK", iso3: "MKD", name: "North Macedonia", region: "Europe", faoCode: 154 },
  { iso2: "AL", iso3: "ALB", name: "Albania", region: "Europe", faoCode: 3 },
  { iso2: "XK", iso3: "XKX", name: "Kosovo", region: "Europe", faoCode: 274 },

  // Europe - Other
  { iso2: "RU", iso3: "RUS", name: "Russia", region: "Europe", faoCode: 185 },
  { iso2: "UA", iso3: "UKR", name: "Ukraine", region: "Europe", faoCode: 230 },
  { iso2: "TR", iso3: "TUR", name: "Turkey", region: "Europe", faoCode: 223 },
  { iso2: "BY", iso3: "BLR", name: "Belarus", region: "Europe", faoCode: 57 },
  { iso2: "MD", iso3: "MDA", name: "Moldova", region: "Europe", faoCode: 146 },
  { iso2: "GE", iso3: "GEO", name: "Georgia", region: "Europe", faoCode: 73 },
  { iso2: "AM", iso3: "ARM", name: "Armenia", region: "Europe", faoCode: 1 },
  { iso2: "AZ", iso3: "AZE", name: "Azerbaijan", region: "Europe", faoCode: 52 },

  // East Asia
  { iso2: "CN", iso3: "CHN", name: "China", region: "East Asia", faoCode: 41 },
  { iso2: "JP", iso3: "JPN", name: "Japan", region: "East Asia", faoCode: 110 },
  { iso2: "KR", iso3: "KOR", name: "South Korea", region: "East Asia", faoCode: 117 },
  { iso2: "TW", iso3: "TWN", name: "Taiwan", region: "East Asia", faoCode: 214 },
  { iso2: "MN", iso3: "MNG", name: "Mongolia", region: "East Asia", faoCode: 141 },
  { iso2: "KP", iso3: "PRK", name: "North Korea", region: "East Asia", faoCode: 116 },

  // Southeast Asia
  { iso2: "ID", iso3: "IDN", name: "Indonesia", region: "Southeast Asia", faoCode: 101 },
  { iso2: "TH", iso3: "THA", name: "Thailand", region: "Southeast Asia", faoCode: 216 },
  { iso2: "VN", iso3: "VNM", name: "Vietnam", region: "Southeast Asia", faoCode: 237 },
  { iso2: "PH", iso3: "PHL", name: "Philippines", region: "Southeast Asia", faoCode: 171 },
  { iso2: "MY", iso3: "MYS", name: "Malaysia", region: "Southeast Asia", faoCode: 131 },
  { iso2: "SG", iso3: "SGP", name: "Singapore", region: "Southeast Asia", faoCode: 196 },
  { iso2: "MM", iso3: "MMR", name: "Myanmar", region: "Southeast Asia", faoCode: 28 },
  { iso2: "KH", iso3: "KHM", name: "Cambodia", region: "Southeast Asia", faoCode: 115 },
  { iso2: "LA", iso3: "LAO", name: "Laos", region: "Southeast Asia", faoCode: 120 },
  { iso2: "BN", iso3: "BRN", name: "Brunei", region: "Southeast Asia", faoCode: 26 },
  { iso2: "TL", iso3: "TLS", name: "Timor-Leste", region: "Southeast Asia", faoCode: 176 },

  // South Asia
  { iso2: "IN", iso3: "IND", name: "India", region: "South Asia", faoCode: 100 },
  { iso2: "PK", iso3: "PAK", name: "Pakistan", region: "South Asia", faoCode: 165 },
  { iso2: "BD", iso3: "BGD", name: "Bangladesh", region: "South Asia", faoCode: 16 },
  { iso2: "LK", iso3: "LKA", name: "Sri Lanka", region: "South Asia", faoCode: 38 },
  { iso2: "NP", iso3: "NPL", name: "Nepal", region: "South Asia", faoCode: 149 },
  { iso2: "AF", iso3: "AFG", name: "Afghanistan", region: "South Asia", faoCode: 2 },
  { iso2: "BT", iso3: "BTN", name: "Bhutan", region: "South Asia", faoCode: 18 },
  { iso2: "MV", iso3: "MDV", name: "Maldives", region: "South Asia", faoCode: 132 },

  // Central Asia
  { iso2: "KZ", iso3: "KAZ", name: "Kazakhstan", region: "Central Asia", faoCode: 108 },
  { iso2: "UZ", iso3: "UZB", name: "Uzbekistan", region: "Central Asia", faoCode: 235 },
  { iso2: "TM", iso3: "TKM", name: "Turkmenistan", region: "Central Asia", faoCode: 213 },
  { iso2: "KG", iso3: "KGZ", name: "Kyrgyzstan", region: "Central Asia", faoCode: 113 },
  { iso2: "TJ", iso3: "TJK", name: "Tajikistan", region: "Central Asia", faoCode: 208 },

  // Middle East
  { iso2: "SA", iso3: "SAU", name: "Saudi Arabia", region: "Middle East", faoCode: 194 },
  { iso2: "AE", iso3: "ARE", name: "United Arab Emirates", region: "Middle East", faoCode: 225 },
  { iso2: "IL", iso3: "ISR", name: "Israel", region: "Middle East", faoCode: 105 },
  { iso2: "IR", iso3: "IRN", name: "Iran", region: "Middle East", faoCode: 102 },
  { iso2: "IQ", iso3: "IRQ", name: "Iraq", region: "Middle East", faoCode: 103 },
  { iso2: "EG", iso3: "EGY", name: "Egypt", region: "Middle East", faoCode: 59 },
  { iso2: "QA", iso3: "QAT", name: "Qatar", region: "Middle East", faoCode: 179 },
  { iso2: "KW", iso3: "KWT", name: "Kuwait", region: "Middle East", faoCode: 118 },
  { iso2: "JO", iso3: "JOR", name: "Jordan", region: "Middle East", faoCode: 112 },
  { iso2: "LB", iso3: "LBN", name: "Lebanon", region: "Middle East", faoCode: 121 },
  { iso2: "OM", iso3: "OMN", name: "Oman", region: "Middle East", faoCode: 221 },
  { iso2: "BH", iso3: "BHR", name: "Bahrain", region: "Middle East", faoCode: 13 },
  { iso2: "YE", iso3: "YEM", name: "Yemen", region: "Middle East", faoCode: 269 },
  { iso2: "SY", iso3: "SYR", name: "Syria", region: "Middle East", faoCode: 212 },
  { iso2: "PS", iso3: "PSE", name: "Palestine", region: "Middle East", faoCode: 299 },

  // North Africa
  { iso2: "MA", iso3: "MAR", name: "Morocco", region: "Africa", faoCode: 143 },
  { iso2: "DZ", iso3: "DZA", name: "Algeria", region: "Africa", faoCode: 4 },
  { iso2: "TN", iso3: "TUN", name: "Tunisia", region: "Africa", faoCode: 222 },
  { iso2: "LY", iso3: "LBY", name: "Libya", region: "Africa", faoCode: 124 },

  // West Africa
  { iso2: "NG", iso3: "NGA", name: "Nigeria", region: "Africa", faoCode: 159 },
  { iso2: "GH", iso3: "GHA", name: "Ghana", region: "Africa", faoCode: 81 },
  { iso2: "CI", iso3: "CIV", name: "Ivory Coast", region: "Africa", faoCode: 107 },
  { iso2: "SN", iso3: "SEN", name: "Senegal", region: "Africa", faoCode: 195 },
  { iso2: "ML", iso3: "MLI", name: "Mali", region: "Africa", faoCode: 133 },
  { iso2: "BF", iso3: "BFA", name: "Burkina Faso", region: "Africa", faoCode: 233 },
  { iso2: "NE", iso3: "NER", name: "Niger", region: "Africa", faoCode: 158 },
  { iso2: "GN", iso3: "GIN", name: "Guinea", region: "Africa", faoCode: 90 },
  { iso2: "SL", iso3: "SLE", name: "Sierra Leone", region: "Africa", faoCode: 197 },
  { iso2: "LR", iso3: "LBR", name: "Liberia", region: "Africa", faoCode: 123 },
  { iso2: "TG", iso3: "TGO", name: "Togo", region: "Africa", faoCode: 217 },
  { iso2: "BJ", iso3: "BEN", name: "Benin", region: "Africa", faoCode: 53 },
  { iso2: "MR", iso3: "MRT", name: "Mauritania", region: "Africa", faoCode: 136 },
  { iso2: "GM", iso3: "GMB", name: "Gambia", region: "Africa", faoCode: 75 },
  { iso2: "GW", iso3: "GNB", name: "Guinea-Bissau", region: "Africa", faoCode: 175 },
  { iso2: "CV", iso3: "CPV", name: "Cabo Verde", region: "Africa", faoCode: 35 },

  // East Africa
  { iso2: "KE", iso3: "KEN", name: "Kenya", region: "Africa", faoCode: 114 },
  { iso2: "ET", iso3: "ETH", name: "Ethiopia", region: "Africa", faoCode: 238 },
  { iso2: "TZ", iso3: "TZA", name: "Tanzania", region: "Africa", faoCode: 215 },
  { iso2: "UG", iso3: "UGA", name: "Uganda", region: "Africa", faoCode: 226 },
  { iso2: "RW", iso3: "RWA", name: "Rwanda", region: "Africa", faoCode: 184 },
  { iso2: "BI", iso3: "BDI", name: "Burundi", region: "Africa", faoCode: 29 },
  { iso2: "SO", iso3: "SOM", name: "Somalia", region: "Africa", faoCode: 201 },
  { iso2: "DJ", iso3: "DJI", name: "Djibouti", region: "Africa", faoCode: 72 },
  { iso2: "ER", iso3: "ERI", name: "Eritrea", region: "Africa", faoCode: 178 },
  { iso2: "SD", iso3: "SDN", name: "Sudan", region: "Africa", faoCode: 206 },
  { iso2: "SS", iso3: "SSD", name: "South Sudan", region: "Africa", faoCode: 277 },
  { iso2: "MG", iso3: "MDG", name: "Madagascar", region: "Africa", faoCode: 129 },
  { iso2: "MU", iso3: "MUS", name: "Mauritius", region: "Africa", faoCode: 137 },
  { iso2: "SC", iso3: "SYC", name: "Seychelles", region: "Africa", faoCode: 196 },
  { iso2: "KM", iso3: "COM", name: "Comoros", region: "Africa", faoCode: 45 },

  // Southern Africa
  { iso2: "ZA", iso3: "ZAF", name: "South Africa", region: "Africa", faoCode: 202 },
  { iso2: "MZ", iso3: "MOZ", name: "Mozambique", region: "Africa", faoCode: 144 },
  { iso2: "ZM", iso3: "ZMB", name: "Zambia", region: "Africa", faoCode: 251 },
  { iso2: "ZW", iso3: "ZWE", name: "Zimbabwe", region: "Africa", faoCode: 181 },
  { iso2: "BW", iso3: "BWA", name: "Botswana", region: "Africa", faoCode: 20 },
  { iso2: "NA", iso3: "NAM", name: "Namibia", region: "Africa", faoCode: 147 },
  { iso2: "MW", iso3: "MWI", name: "Malawi", region: "Africa", faoCode: 130 },
  { iso2: "LS", iso3: "LSO", name: "Lesotho", region: "Africa", faoCode: 122 },
  { iso2: "SZ", iso3: "SWZ", name: "Eswatini", region: "Africa", faoCode: 209 },
  { iso2: "AO", iso3: "AGO", name: "Angola", region: "Africa", faoCode: 7 },

  // Central Africa
  { iso2: "CD", iso3: "COD", name: "Democratic Republic of the Congo", region: "Africa", faoCode: 250 },
  { iso2: "CG", iso3: "COG", name: "Republic of the Congo", region: "Africa", faoCode: 46 },
  { iso2: "CM", iso3: "CMR", name: "Cameroon", region: "Africa", faoCode: 32 },
  { iso2: "GA", iso3: "GAB", name: "Gabon", region: "Africa", faoCode: 74 },
  { iso2: "GQ", iso3: "GNQ", name: "Equatorial Guinea", region: "Africa", faoCode: 61 },
  { iso2: "TD", iso3: "TCD", name: "Chad", region: "Africa", faoCode: 39 },
  { iso2: "CF", iso3: "CAF", name: "Central African Republic", region: "Africa", faoCode: 37 },
  { iso2: "ST", iso3: "STP", name: "Sao Tome and Principe", region: "Africa", faoCode: 193 },

  // Oceania
  { iso2: "AU", iso3: "AUS", name: "Australia", region: "Oceania", faoCode: 10 },
  { iso2: "NZ", iso3: "NZL", name: "New Zealand", region: "Oceania", faoCode: 156 },
  { iso2: "PG", iso3: "PNG", name: "Papua New Guinea", region: "Oceania", faoCode: 168 },
  { iso2: "FJ", iso3: "FJI", name: "Fiji", region: "Oceania", faoCode: 66 },
  { iso2: "SB", iso3: "SLB", name: "Solomon Islands", region: "Oceania", faoCode: 25 },
  { iso2: "VU", iso3: "VUT", name: "Vanuatu", region: "Oceania", faoCode: 155 },
  { iso2: "WS", iso3: "WSM", name: "Samoa", region: "Oceania", faoCode: 244 },
  { iso2: "TO", iso3: "TON", name: "Tonga", region: "Oceania", faoCode: 219 },
  { iso2: "KI", iso3: "KIR", name: "Kiribati", region: "Oceania", faoCode: 83 },
  { iso2: "FM", iso3: "FSM", name: "Micronesia", region: "Oceania", faoCode: 145 },
  { iso2: "MH", iso3: "MHL", name: "Marshall Islands", region: "Oceania", faoCode: 127 },
  { iso2: "PW", iso3: "PLW", name: "Palau", region: "Oceania", faoCode: 180 },
  { iso2: "NR", iso3: "NRU", name: "Nauru", region: "Oceania", faoCode: 148 },
  { iso2: "TV", iso3: "TUV", name: "Tuvalu", region: "Oceania", faoCode: 227 },
];

/** Lookup maps for quick access */
export const ISO2_MAP = new Map(COUNTRIES.map(c => [c.iso2, c]));
export const ISO3_MAP = new Map(COUNTRIES.map(c => [c.iso3, c]));
export const FAO_MAP = new Map(COUNTRIES.map(c => [c.faoCode, c]));

/** Set of valid ISO-3 codes */
export const VALID_ISO3 = new Set(COUNTRIES.map(c => c.iso3));
