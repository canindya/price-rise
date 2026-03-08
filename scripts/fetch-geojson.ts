/**
 * Converts world-atlas 110m TopoJSON to GeoJSON for the map visualization.
 * Adds ISO_A3 and name properties to each feature.
 * Outputs to public/data/world.geojson
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import * as topojson from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";

const OUT_DIR = resolve(import.meta.dirname, "..", "public", "data");
const OUT_FILE = resolve(OUT_DIR, "world.geojson");

/**
 * Mapping from numeric country codes (used in world-atlas) to ISO-3 codes and names.
 * Based on ISO 3166-1 numeric standard.
 */
const NUMERIC_TO_ISO3: Record<string, { iso3: string; name: string }> = {
  "004": { iso3: "AFG", name: "Afghanistan" },
  "008": { iso3: "ALB", name: "Albania" },
  "012": { iso3: "DZA", name: "Algeria" },
  "020": { iso3: "AND", name: "Andorra" },
  "024": { iso3: "AGO", name: "Angola" },
  "032": { iso3: "ARG", name: "Argentina" },
  "036": { iso3: "AUS", name: "Australia" },
  "040": { iso3: "AUT", name: "Austria" },
  "031": { iso3: "AZE", name: "Azerbaijan" },
  "044": { iso3: "BHS", name: "Bahamas" },
  "048": { iso3: "BHR", name: "Bahrain" },
  "050": { iso3: "BGD", name: "Bangladesh" },
  "056": { iso3: "BEL", name: "Belgium" },
  "064": { iso3: "BTN", name: "Bhutan" },
  "068": { iso3: "BOL", name: "Bolivia" },
  "070": { iso3: "BIH", name: "Bosnia and Herzegovina" },
  "072": { iso3: "BWA", name: "Botswana" },
  "076": { iso3: "BRA", name: "Brazil" },
  "096": { iso3: "BRN", name: "Brunei" },
  "100": { iso3: "BGR", name: "Bulgaria" },
  "854": { iso3: "BFA", name: "Burkina Faso" },
  "108": { iso3: "BDI", name: "Burundi" },
  "116": { iso3: "KHM", name: "Cambodia" },
  "120": { iso3: "CMR", name: "Cameroon" },
  "124": { iso3: "CAN", name: "Canada" },
  "140": { iso3: "CAF", name: "Central African Republic" },
  "148": { iso3: "TCD", name: "Chad" },
  "152": { iso3: "CHL", name: "Chile" },
  "156": { iso3: "CHN", name: "China" },
  "170": { iso3: "COL", name: "Colombia" },
  "178": { iso3: "COG", name: "Congo" },
  "180": { iso3: "COD", name: "Dem. Rep. Congo" },
  "188": { iso3: "CRI", name: "Costa Rica" },
  "191": { iso3: "HRV", name: "Croatia" },
  "192": { iso3: "CUB", name: "Cuba" },
  "196": { iso3: "CYP", name: "Cyprus" },
  "203": { iso3: "CZE", name: "Czech Republic" },
  "384": { iso3: "CIV", name: "Ivory Coast" },
  "208": { iso3: "DNK", name: "Denmark" },
  "262": { iso3: "DJI", name: "Djibouti" },
  "214": { iso3: "DOM", name: "Dominican Republic" },
  "218": { iso3: "ECU", name: "Ecuador" },
  "818": { iso3: "EGY", name: "Egypt" },
  "222": { iso3: "SLV", name: "El Salvador" },
  "226": { iso3: "GNQ", name: "Equatorial Guinea" },
  "232": { iso3: "ERI", name: "Eritrea" },
  "233": { iso3: "EST", name: "Estonia" },
  "231": { iso3: "ETH", name: "Ethiopia" },
  "242": { iso3: "FJI", name: "Fiji" },
  "246": { iso3: "FIN", name: "Finland" },
  "250": { iso3: "FRA", name: "France" },
  "266": { iso3: "GAB", name: "Gabon" },
  "270": { iso3: "GMB", name: "Gambia" },
  "268": { iso3: "GEO", name: "Georgia" },
  "276": { iso3: "DEU", name: "Germany" },
  "288": { iso3: "GHA", name: "Ghana" },
  "300": { iso3: "GRC", name: "Greece" },
  "320": { iso3: "GTM", name: "Guatemala" },
  "324": { iso3: "GIN", name: "Guinea" },
  "624": { iso3: "GNB", name: "Guinea-Bissau" },
  "328": { iso3: "GUY", name: "Guyana" },
  "332": { iso3: "HTI", name: "Haiti" },
  "340": { iso3: "HND", name: "Honduras" },
  "348": { iso3: "HUN", name: "Hungary" },
  "352": { iso3: "ISL", name: "Iceland" },
  "356": { iso3: "IND", name: "India" },
  "360": { iso3: "IDN", name: "Indonesia" },
  "364": { iso3: "IRN", name: "Iran" },
  "368": { iso3: "IRQ", name: "Iraq" },
  "372": { iso3: "IRL", name: "Ireland" },
  "376": { iso3: "ISR", name: "Israel" },
  "380": { iso3: "ITA", name: "Italy" },
  "388": { iso3: "JAM", name: "Jamaica" },
  "392": { iso3: "JPN", name: "Japan" },
  "400": { iso3: "JOR", name: "Jordan" },
  "398": { iso3: "KAZ", name: "Kazakhstan" },
  "404": { iso3: "KEN", name: "Kenya" },
  "408": { iso3: "PRK", name: "North Korea" },
  "410": { iso3: "KOR", name: "South Korea" },
  "414": { iso3: "KWT", name: "Kuwait" },
  "417": { iso3: "KGZ", name: "Kyrgyzstan" },
  "418": { iso3: "LAO", name: "Laos" },
  "428": { iso3: "LVA", name: "Latvia" },
  "422": { iso3: "LBN", name: "Lebanon" },
  "426": { iso3: "LSO", name: "Lesotho" },
  "430": { iso3: "LBR", name: "Liberia" },
  "434": { iso3: "LBY", name: "Libya" },
  "440": { iso3: "LTU", name: "Lithuania" },
  "442": { iso3: "LUX", name: "Luxembourg" },
  "807": { iso3: "MKD", name: "North Macedonia" },
  "450": { iso3: "MDG", name: "Madagascar" },
  "454": { iso3: "MWI", name: "Malawi" },
  "458": { iso3: "MYS", name: "Malaysia" },
  "466": { iso3: "MLI", name: "Mali" },
  "478": { iso3: "MRT", name: "Mauritania" },
  "484": { iso3: "MEX", name: "Mexico" },
  "498": { iso3: "MDA", name: "Moldova" },
  "496": { iso3: "MNG", name: "Mongolia" },
  "499": { iso3: "MNE", name: "Montenegro" },
  "504": { iso3: "MAR", name: "Morocco" },
  "508": { iso3: "MOZ", name: "Mozambique" },
  "104": { iso3: "MMR", name: "Myanmar" },
  "516": { iso3: "NAM", name: "Namibia" },
  "524": { iso3: "NPL", name: "Nepal" },
  "528": { iso3: "NLD", name: "Netherlands" },
  "554": { iso3: "NZL", name: "New Zealand" },
  "558": { iso3: "NIC", name: "Nicaragua" },
  "562": { iso3: "NER", name: "Niger" },
  "566": { iso3: "NGA", name: "Nigeria" },
  "578": { iso3: "NOR", name: "Norway" },
  "512": { iso3: "OMN", name: "Oman" },
  "586": { iso3: "PAK", name: "Pakistan" },
  "591": { iso3: "PAN", name: "Panama" },
  "598": { iso3: "PNG", name: "Papua New Guinea" },
  "600": { iso3: "PRY", name: "Paraguay" },
  "604": { iso3: "PER", name: "Peru" },
  "608": { iso3: "PHL", name: "Philippines" },
  "616": { iso3: "POL", name: "Poland" },
  "620": { iso3: "PRT", name: "Portugal" },
  "634": { iso3: "QAT", name: "Qatar" },
  "642": { iso3: "ROU", name: "Romania" },
  "643": { iso3: "RUS", name: "Russia" },
  "646": { iso3: "RWA", name: "Rwanda" },
  "682": { iso3: "SAU", name: "Saudi Arabia" },
  "686": { iso3: "SEN", name: "Senegal" },
  "688": { iso3: "SRB", name: "Serbia" },
  "694": { iso3: "SLE", name: "Sierra Leone" },
  "702": { iso3: "SGP", name: "Singapore" },
  "703": { iso3: "SVK", name: "Slovakia" },
  "705": { iso3: "SVN", name: "Slovenia" },
  "706": { iso3: "SOM", name: "Somalia" },
  "710": { iso3: "ZAF", name: "South Africa" },
  "728": { iso3: "SSD", name: "South Sudan" },
  "724": { iso3: "ESP", name: "Spain" },
  "144": { iso3: "LKA", name: "Sri Lanka" },
  "729": { iso3: "SDN", name: "Sudan" },
  "740": { iso3: "SUR", name: "Suriname" },
  "748": { iso3: "SWZ", name: "Eswatini" },
  "752": { iso3: "SWE", name: "Sweden" },
  "756": { iso3: "CHE", name: "Switzerland" },
  "760": { iso3: "SYR", name: "Syria" },
  "158": { iso3: "TWN", name: "Taiwan" },
  "762": { iso3: "TJK", name: "Tajikistan" },
  "834": { iso3: "TZA", name: "Tanzania" },
  "764": { iso3: "THA", name: "Thailand" },
  "768": { iso3: "TGO", name: "Togo" },
  "780": { iso3: "TTO", name: "Trinidad and Tobago" },
  "788": { iso3: "TUN", name: "Tunisia" },
  "792": { iso3: "TUR", name: "Turkey" },
  "795": { iso3: "TKM", name: "Turkmenistan" },
  "800": { iso3: "UGA", name: "Uganda" },
  "804": { iso3: "UKR", name: "Ukraine" },
  "784": { iso3: "ARE", name: "United Arab Emirates" },
  "826": { iso3: "GBR", name: "United Kingdom" },
  "840": { iso3: "USA", name: "United States" },
  "858": { iso3: "URY", name: "Uruguay" },
  "860": { iso3: "UZB", name: "Uzbekistan" },
  "548": { iso3: "VUT", name: "Vanuatu" },
  "862": { iso3: "VEN", name: "Venezuela" },
  "704": { iso3: "VNM", name: "Vietnam" },
  "887": { iso3: "YEM", name: "Yemen" },
  "894": { iso3: "ZMB", name: "Zambia" },
  "716": { iso3: "ZWE", name: "Zimbabwe" },
  // Kosovo (not standard ISO numeric but used in world-atlas)
  "-99": { iso3: "XKX", name: "Kosovo" },
};

export async function fetchGeoJSON(): Promise<void> {
  console.log("[GeoJSON] Converting world-atlas TopoJSON to GeoJSON...");

  try {
    // Read the world-atlas 110m countries TopoJSON
    const topoPath = resolve(
      import.meta.dirname,
      "..",
      "node_modules",
      "world-atlas",
      "countries-110m.json"
    );

    const topoStr = readFileSync(topoPath, "utf-8");
    const topo = JSON.parse(topoStr) as Topology;

    // The object key is "countries"
    const objectKey = Object.keys(topo.objects)[0]; // usually "countries"
    const geometries = topo.objects[objectKey] as GeometryCollection;

    // Convert to GeoJSON
    const geojson = topojson.feature(topo, geometries);

    // Add ISO_A3 and name properties to each feature
    let matched = 0;
    for (const feature of (geojson as GeoJSON.FeatureCollection).features) {
      const numericId = String(feature.id).padStart(3, "0");
      const lookup = NUMERIC_TO_ISO3[numericId];

      if (lookup) {
        feature.properties = {
          ...feature.properties,
          ISO_A3: lookup.iso3,
          name: lookup.name,
        };
        matched++;
      } else {
        feature.properties = {
          ...feature.properties,
          ISO_A3: "UNK",
          name: feature.properties?.name || "Unknown",
        };
      }
    }

    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(OUT_FILE, JSON.stringify(geojson));
    console.log(
      `  Wrote ${(geojson as GeoJSON.FeatureCollection).features.length} features (${matched} matched) to ${OUT_FILE}`
    );
  } catch (err) {
    console.error("[GeoJSON] ERROR:", (err as Error).message);

    // Fallback: try downloading from CDN
    console.log("  Trying CDN fallback...");
    try {
      const url =
        "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
      const resp = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const topo = (await resp.json()) as Topology;
      const objectKey = Object.keys(topo.objects)[0];
      const geometries = topo.objects[objectKey] as GeometryCollection;
      const geojson = topojson.feature(topo, geometries);

      for (const feature of (geojson as GeoJSON.FeatureCollection).features) {
        const numericId = String(feature.id).padStart(3, "0");
        const lookup = NUMERIC_TO_ISO3[numericId];
        if (lookup) {
          feature.properties = {
            ...feature.properties,
            ISO_A3: lookup.iso3,
            name: lookup.name,
          };
        }
      }

      mkdirSync(OUT_DIR, { recursive: true });
      writeFileSync(OUT_FILE, JSON.stringify(geojson));
      console.log(`  Wrote GeoJSON from CDN fallback to ${OUT_FILE}`);
    } catch (err2) {
      console.error("[GeoJSON] CDN fallback also failed:", (err2 as Error).message);
    }
  }
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}`) {
  fetchGeoJSON();
}
