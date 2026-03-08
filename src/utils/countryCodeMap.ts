import type { CountryMeta } from '../types/index';

/**
 * Expanded list of ~190 countries with ISO-2 code, ISO-3 code, name, and region.
 */
export const COUNTRIES: CountryMeta[] = [
  // North America
  { code: 'US', iso3: 'USA', name: 'United States', region: 'North America' },
  { code: 'CA', iso3: 'CAN', name: 'Canada', region: 'North America' },
  { code: 'MX', iso3: 'MEX', name: 'Mexico', region: 'North America' },

  // Central America
  { code: 'GT', iso3: 'GTM', name: 'Guatemala', region: 'Central America' },
  { code: 'BZ', iso3: 'BLZ', name: 'Belize', region: 'Central America' },
  { code: 'HN', iso3: 'HND', name: 'Honduras', region: 'Central America' },
  { code: 'SV', iso3: 'SLV', name: 'El Salvador', region: 'Central America' },
  { code: 'NI', iso3: 'NIC', name: 'Nicaragua', region: 'Central America' },
  { code: 'CR', iso3: 'CRI', name: 'Costa Rica', region: 'Central America' },
  { code: 'PA', iso3: 'PAN', name: 'Panama', region: 'Central America' },

  // Caribbean
  { code: 'CU', iso3: 'CUB', name: 'Cuba', region: 'Caribbean' },
  { code: 'JM', iso3: 'JAM', name: 'Jamaica', region: 'Caribbean' },
  { code: 'HT', iso3: 'HTI', name: 'Haiti', region: 'Caribbean' },
  { code: 'DO', iso3: 'DOM', name: 'Dominican Republic', region: 'Caribbean' },
  { code: 'TT', iso3: 'TTO', name: 'Trinidad and Tobago', region: 'Caribbean' },
  { code: 'BS', iso3: 'BHS', name: 'Bahamas', region: 'Caribbean' },
  { code: 'BB', iso3: 'BRB', name: 'Barbados', region: 'Caribbean' },
  { code: 'LC', iso3: 'LCA', name: 'Saint Lucia', region: 'Caribbean' },
  { code: 'GD', iso3: 'GRD', name: 'Grenada', region: 'Caribbean' },
  { code: 'VC', iso3: 'VCT', name: 'Saint Vincent and the Grenadines', region: 'Caribbean' },
  { code: 'AG', iso3: 'ATG', name: 'Antigua and Barbuda', region: 'Caribbean' },
  { code: 'DM', iso3: 'DMA', name: 'Dominica', region: 'Caribbean' },
  { code: 'KN', iso3: 'KNA', name: 'Saint Kitts and Nevis', region: 'Caribbean' },
  { code: 'GY', iso3: 'GUY', name: 'Guyana', region: 'Caribbean' },
  { code: 'SR', iso3: 'SUR', name: 'Suriname', region: 'Caribbean' },

  // South America
  { code: 'BR', iso3: 'BRA', name: 'Brazil', region: 'South America' },
  { code: 'AR', iso3: 'ARG', name: 'Argentina', region: 'South America' },
  { code: 'CL', iso3: 'CHL', name: 'Chile', region: 'South America' },
  { code: 'CO', iso3: 'COL', name: 'Colombia', region: 'South America' },
  { code: 'PE', iso3: 'PER', name: 'Peru', region: 'South America' },
  { code: 'VE', iso3: 'VEN', name: 'Venezuela', region: 'South America' },
  { code: 'EC', iso3: 'ECU', name: 'Ecuador', region: 'South America' },
  { code: 'UY', iso3: 'URY', name: 'Uruguay', region: 'South America' },
  { code: 'BO', iso3: 'BOL', name: 'Bolivia', region: 'South America' },
  { code: 'PY', iso3: 'PRY', name: 'Paraguay', region: 'South America' },

  // Europe - Western
  { code: 'GB', iso3: 'GBR', name: 'United Kingdom', region: 'Europe' },
  { code: 'DE', iso3: 'DEU', name: 'Germany', region: 'Europe' },
  { code: 'FR', iso3: 'FRA', name: 'France', region: 'Europe' },
  { code: 'IT', iso3: 'ITA', name: 'Italy', region: 'Europe' },
  { code: 'ES', iso3: 'ESP', name: 'Spain', region: 'Europe' },
  { code: 'NL', iso3: 'NLD', name: 'Netherlands', region: 'Europe' },
  { code: 'BE', iso3: 'BEL', name: 'Belgium', region: 'Europe' },
  { code: 'CH', iso3: 'CHE', name: 'Switzerland', region: 'Europe' },
  { code: 'AT', iso3: 'AUT', name: 'Austria', region: 'Europe' },
  { code: 'SE', iso3: 'SWE', name: 'Sweden', region: 'Europe' },
  { code: 'NO', iso3: 'NOR', name: 'Norway', region: 'Europe' },
  { code: 'DK', iso3: 'DNK', name: 'Denmark', region: 'Europe' },
  { code: 'FI', iso3: 'FIN', name: 'Finland', region: 'Europe' },
  { code: 'PT', iso3: 'PRT', name: 'Portugal', region: 'Europe' },
  { code: 'IE', iso3: 'IRL', name: 'Ireland', region: 'Europe' },
  { code: 'GR', iso3: 'GRC', name: 'Greece', region: 'Europe' },
  { code: 'LU', iso3: 'LUX', name: 'Luxembourg', region: 'Europe' },
  { code: 'IS', iso3: 'ISL', name: 'Iceland', region: 'Europe' },
  { code: 'MT', iso3: 'MLT', name: 'Malta', region: 'Europe' },
  { code: 'CY', iso3: 'CYP', name: 'Cyprus', region: 'Europe' },

  // Europe - Central & Eastern
  { code: 'PL', iso3: 'POL', name: 'Poland', region: 'Europe' },
  { code: 'CZ', iso3: 'CZE', name: 'Czech Republic', region: 'Europe' },
  { code: 'RO', iso3: 'ROU', name: 'Romania', region: 'Europe' },
  { code: 'HU', iso3: 'HUN', name: 'Hungary', region: 'Europe' },
  { code: 'BG', iso3: 'BGR', name: 'Bulgaria', region: 'Europe' },
  { code: 'SK', iso3: 'SVK', name: 'Slovakia', region: 'Europe' },
  { code: 'HR', iso3: 'HRV', name: 'Croatia', region: 'Europe' },
  { code: 'SI', iso3: 'SVN', name: 'Slovenia', region: 'Europe' },
  { code: 'LT', iso3: 'LTU', name: 'Lithuania', region: 'Europe' },
  { code: 'LV', iso3: 'LVA', name: 'Latvia', region: 'Europe' },
  { code: 'EE', iso3: 'EST', name: 'Estonia', region: 'Europe' },
  { code: 'RS', iso3: 'SRB', name: 'Serbia', region: 'Europe' },
  { code: 'BA', iso3: 'BIH', name: 'Bosnia and Herzegovina', region: 'Europe' },
  { code: 'ME', iso3: 'MNE', name: 'Montenegro', region: 'Europe' },
  { code: 'MK', iso3: 'MKD', name: 'North Macedonia', region: 'Europe' },
  { code: 'AL', iso3: 'ALB', name: 'Albania', region: 'Europe' },
  { code: 'XK', iso3: 'XKX', name: 'Kosovo', region: 'Europe' },

  // Europe - Other
  { code: 'UA', iso3: 'UKR', name: 'Ukraine', region: 'Europe' },
  { code: 'RU', iso3: 'RUS', name: 'Russia', region: 'Europe' },
  { code: 'TR', iso3: 'TUR', name: 'Turkey', region: 'Europe' },
  { code: 'BY', iso3: 'BLR', name: 'Belarus', region: 'Europe' },
  { code: 'MD', iso3: 'MDA', name: 'Moldova', region: 'Europe' },
  { code: 'GE', iso3: 'GEO', name: 'Georgia', region: 'Europe' },
  { code: 'AM', iso3: 'ARM', name: 'Armenia', region: 'Europe' },
  { code: 'AZ', iso3: 'AZE', name: 'Azerbaijan', region: 'Europe' },

  // East Asia
  { code: 'CN', iso3: 'CHN', name: 'China', region: 'Asia' },
  { code: 'JP', iso3: 'JPN', name: 'Japan', region: 'Asia' },
  { code: 'IN', iso3: 'IND', name: 'India', region: 'Asia' },
  { code: 'KR', iso3: 'KOR', name: 'South Korea', region: 'Asia' },
  { code: 'TW', iso3: 'TWN', name: 'Taiwan', region: 'Asia' },
  { code: 'MN', iso3: 'MNG', name: 'Mongolia', region: 'Asia' },
  { code: 'KP', iso3: 'PRK', name: 'North Korea', region: 'Asia' },

  // Southeast Asia
  { code: 'ID', iso3: 'IDN', name: 'Indonesia', region: 'Asia' },
  { code: 'TH', iso3: 'THA', name: 'Thailand', region: 'Asia' },
  { code: 'VN', iso3: 'VNM', name: 'Vietnam', region: 'Asia' },
  { code: 'MY', iso3: 'MYS', name: 'Malaysia', region: 'Asia' },
  { code: 'PH', iso3: 'PHL', name: 'Philippines', region: 'Asia' },
  { code: 'SG', iso3: 'SGP', name: 'Singapore', region: 'Asia' },
  { code: 'BD', iso3: 'BGD', name: 'Bangladesh', region: 'Asia' },
  { code: 'PK', iso3: 'PAK', name: 'Pakistan', region: 'Asia' },
  { code: 'LK', iso3: 'LKA', name: 'Sri Lanka', region: 'Asia' },
  { code: 'MM', iso3: 'MMR', name: 'Myanmar', region: 'Asia' },
  { code: 'KH', iso3: 'KHM', name: 'Cambodia', region: 'Asia' },
  { code: 'LA', iso3: 'LAO', name: 'Laos', region: 'Asia' },
  { code: 'BN', iso3: 'BRN', name: 'Brunei', region: 'Asia' },
  { code: 'TL', iso3: 'TLS', name: 'Timor-Leste', region: 'Asia' },

  // South Asia
  { code: 'NP', iso3: 'NPL', name: 'Nepal', region: 'Asia' },
  { code: 'AF', iso3: 'AFG', name: 'Afghanistan', region: 'Asia' },
  { code: 'BT', iso3: 'BTN', name: 'Bhutan', region: 'Asia' },
  { code: 'MV', iso3: 'MDV', name: 'Maldives', region: 'Asia' },

  // Central Asia
  { code: 'KZ', iso3: 'KAZ', name: 'Kazakhstan', region: 'Asia' },
  { code: 'UZ', iso3: 'UZB', name: 'Uzbekistan', region: 'Asia' },
  { code: 'TM', iso3: 'TKM', name: 'Turkmenistan', region: 'Asia' },
  { code: 'KG', iso3: 'KGZ', name: 'Kyrgyzstan', region: 'Asia' },
  { code: 'TJ', iso3: 'TJK', name: 'Tajikistan', region: 'Asia' },

  // Middle East
  { code: 'SA', iso3: 'SAU', name: 'Saudi Arabia', region: 'Middle East' },
  { code: 'AE', iso3: 'ARE', name: 'United Arab Emirates', region: 'Middle East' },
  { code: 'IL', iso3: 'ISR', name: 'Israel', region: 'Middle East' },
  { code: 'IR', iso3: 'IRN', name: 'Iran', region: 'Middle East' },
  { code: 'IQ', iso3: 'IRQ', name: 'Iraq', region: 'Middle East' },
  { code: 'QA', iso3: 'QAT', name: 'Qatar', region: 'Middle East' },
  { code: 'KW', iso3: 'KWT', name: 'Kuwait', region: 'Middle East' },
  { code: 'JO', iso3: 'JOR', name: 'Jordan', region: 'Middle East' },
  { code: 'LB', iso3: 'LBN', name: 'Lebanon', region: 'Middle East' },
  { code: 'OM', iso3: 'OMN', name: 'Oman', region: 'Middle East' },
  { code: 'BH', iso3: 'BHR', name: 'Bahrain', region: 'Middle East' },
  { code: 'YE', iso3: 'YEM', name: 'Yemen', region: 'Middle East' },
  { code: 'SY', iso3: 'SYR', name: 'Syria', region: 'Middle East' },
  { code: 'PS', iso3: 'PSE', name: 'Palestine', region: 'Middle East' },

  // Africa
  { code: 'ZA', iso3: 'ZAF', name: 'South Africa', region: 'Africa' },
  { code: 'NG', iso3: 'NGA', name: 'Nigeria', region: 'Africa' },
  { code: 'EG', iso3: 'EGY', name: 'Egypt', region: 'Africa' },
  { code: 'KE', iso3: 'KEN', name: 'Kenya', region: 'Africa' },
  { code: 'GH', iso3: 'GHA', name: 'Ghana', region: 'Africa' },
  { code: 'ET', iso3: 'ETH', name: 'Ethiopia', region: 'Africa' },
  { code: 'TZ', iso3: 'TZA', name: 'Tanzania', region: 'Africa' },
  { code: 'MA', iso3: 'MAR', name: 'Morocco', region: 'Africa' },
  { code: 'TN', iso3: 'TUN', name: 'Tunisia', region: 'Africa' },
  { code: 'DZ', iso3: 'DZA', name: 'Algeria', region: 'Africa' },
  { code: 'LY', iso3: 'LBY', name: 'Libya', region: 'Africa' },
  { code: 'CI', iso3: 'CIV', name: "Cote d'Ivoire", region: 'Africa' },
  { code: 'SN', iso3: 'SEN', name: 'Senegal', region: 'Africa' },
  { code: 'ML', iso3: 'MLI', name: 'Mali', region: 'Africa' },
  { code: 'BF', iso3: 'BFA', name: 'Burkina Faso', region: 'Africa' },
  { code: 'NE', iso3: 'NER', name: 'Niger', region: 'Africa' },
  { code: 'GN', iso3: 'GIN', name: 'Guinea', region: 'Africa' },
  { code: 'SL', iso3: 'SLE', name: 'Sierra Leone', region: 'Africa' },
  { code: 'LR', iso3: 'LBR', name: 'Liberia', region: 'Africa' },
  { code: 'TG', iso3: 'TGO', name: 'Togo', region: 'Africa' },
  { code: 'BJ', iso3: 'BEN', name: 'Benin', region: 'Africa' },
  { code: 'MR', iso3: 'MRT', name: 'Mauritania', region: 'Africa' },
  { code: 'GM', iso3: 'GMB', name: 'Gambia', region: 'Africa' },
  { code: 'GW', iso3: 'GNB', name: 'Guinea-Bissau', region: 'Africa' },
  { code: 'CV', iso3: 'CPV', name: 'Cabo Verde', region: 'Africa' },
  { code: 'UG', iso3: 'UGA', name: 'Uganda', region: 'Africa' },
  { code: 'RW', iso3: 'RWA', name: 'Rwanda', region: 'Africa' },
  { code: 'BI', iso3: 'BDI', name: 'Burundi', region: 'Africa' },
  { code: 'SO', iso3: 'SOM', name: 'Somalia', region: 'Africa' },
  { code: 'DJ', iso3: 'DJI', name: 'Djibouti', region: 'Africa' },
  { code: 'ER', iso3: 'ERI', name: 'Eritrea', region: 'Africa' },
  { code: 'SD', iso3: 'SDN', name: 'Sudan', region: 'Africa' },
  { code: 'SS', iso3: 'SSD', name: 'South Sudan', region: 'Africa' },
  { code: 'MG', iso3: 'MDG', name: 'Madagascar', region: 'Africa' },
  { code: 'MU', iso3: 'MUS', name: 'Mauritius', region: 'Africa' },
  { code: 'SC', iso3: 'SYC', name: 'Seychelles', region: 'Africa' },
  { code: 'KM', iso3: 'COM', name: 'Comoros', region: 'Africa' },
  { code: 'MZ', iso3: 'MOZ', name: 'Mozambique', region: 'Africa' },
  { code: 'ZM', iso3: 'ZMB', name: 'Zambia', region: 'Africa' },
  { code: 'ZW', iso3: 'ZWE', name: 'Zimbabwe', region: 'Africa' },
  { code: 'BW', iso3: 'BWA', name: 'Botswana', region: 'Africa' },
  { code: 'NA', iso3: 'NAM', name: 'Namibia', region: 'Africa' },
  { code: 'MW', iso3: 'MWI', name: 'Malawi', region: 'Africa' },
  { code: 'LS', iso3: 'LSO', name: 'Lesotho', region: 'Africa' },
  { code: 'SZ', iso3: 'SWZ', name: 'Eswatini', region: 'Africa' },
  { code: 'AO', iso3: 'AGO', name: 'Angola', region: 'Africa' },
  { code: 'CD', iso3: 'COD', name: 'Democratic Republic of the Congo', region: 'Africa' },
  { code: 'CG', iso3: 'COG', name: 'Republic of the Congo', region: 'Africa' },
  { code: 'CM', iso3: 'CMR', name: 'Cameroon', region: 'Africa' },
  { code: 'GA', iso3: 'GAB', name: 'Gabon', region: 'Africa' },
  { code: 'GQ', iso3: 'GNQ', name: 'Equatorial Guinea', region: 'Africa' },
  { code: 'TD', iso3: 'TCD', name: 'Chad', region: 'Africa' },
  { code: 'CF', iso3: 'CAF', name: 'Central African Republic', region: 'Africa' },
  { code: 'ST', iso3: 'STP', name: 'Sao Tome and Principe', region: 'Africa' },

  // Oceania
  { code: 'AU', iso3: 'AUS', name: 'Australia', region: 'Oceania' },
  { code: 'NZ', iso3: 'NZL', name: 'New Zealand', region: 'Oceania' },
  { code: 'PG', iso3: 'PNG', name: 'Papua New Guinea', region: 'Oceania' },
  { code: 'FJ', iso3: 'FJI', name: 'Fiji', region: 'Oceania' },
  { code: 'SB', iso3: 'SLB', name: 'Solomon Islands', region: 'Oceania' },
  { code: 'VU', iso3: 'VUT', name: 'Vanuatu', region: 'Oceania' },
  { code: 'WS', iso3: 'WSM', name: 'Samoa', region: 'Oceania' },
  { code: 'TO', iso3: 'TON', name: 'Tonga', region: 'Oceania' },
  { code: 'KI', iso3: 'KIR', name: 'Kiribati', region: 'Oceania' },
  { code: 'FM', iso3: 'FSM', name: 'Micronesia', region: 'Oceania' },
  { code: 'MH', iso3: 'MHL', name: 'Marshall Islands', region: 'Oceania' },
  { code: 'PW', iso3: 'PLW', name: 'Palau', region: 'Oceania' },
  { code: 'NR', iso3: 'NRU', name: 'Nauru', region: 'Oceania' },
  { code: 'TV', iso3: 'TUV', name: 'Tuvalu', region: 'Oceania' },
];

/**
 * Look up a country by its ISO-2 code (case-insensitive).
 */
export function getCountryByCode(code: string): CountryMeta | undefined {
  const upper = code.toUpperCase();
  return COUNTRIES.find((c) => c.code === upper);
}

/**
 * Look up a country by its ISO-3 code (case-insensitive).
 */
export function getCountryByIso3(iso3: string): CountryMeta | undefined {
  const upper = iso3.toUpperCase();
  return COUNTRIES.find((c) => c.iso3 === upper);
}

/**
 * Fuzzy search countries by name. Matches if the query appears as a
 * substring of the country name (case-insensitive). Results are sorted
 * so that names starting with the query appear first.
 */
export function searchCountries(query: string): CountryMeta[] {
  if (!query.trim()) {
    return [];
  }
  const lower = query.toLowerCase();
  const matches = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(lower),
  );
  // Sort: names starting with the query first, then alphabetically
  return matches.sort((a, b) => {
    const aStarts = a.name.toLowerCase().startsWith(lower) ? 0 : 1;
    const bStarts = b.name.toLowerCase().startsWith(lower) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Returns a copy of the full COUNTRIES array.
 */
export function getAllCountries(): CountryMeta[] {
  return [...COUNTRIES];
}
