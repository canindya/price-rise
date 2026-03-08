import { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import type { Layer, PathOptions, Map as LeafletMap } from 'leaflet';
import type { GeoJsonObject, Feature, Geometry } from 'geojson';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface WorldMapProps {
  countryChanges: Record<string, number>;
  onCountrySelect: (code: string) => void;
  selectedCountry?: string | null;
}

/* -- Dark editorial choropleth palette ------------------------------------ */

const COLOR_RANGES = [
  { min: -Infinity, max: 0, color: '#3b82f6', label: 'Deflation' },
  { min: 0, max: 10, color: '#22d3ee', label: 'Low' },
  { min: 10, max: 25, color: '#fbbf24', label: 'Moderate' },
  { min: 25, max: 50, color: '#f97316', label: 'High' },
  { min: 50, max: 100, color: '#ef4444', label: 'Very High' },
  { min: 100, max: Infinity, color: '#dc2626', label: 'Extreme' },
] as const;

const NO_DATA_COLOR = 'var(--color-bg-elevated)';

function getColor(pctChange: number | undefined): string {
  if (pctChange === undefined) return NO_DATA_COLOR;
  for (const range of COLOR_RANGES) {
    if (pctChange >= range.min && pctChange < range.max) return range.color;
  }
  // Fallback for exactly 0 or edge cases
  return COLOR_RANGES[1].color;
}

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/* -- ISO-3 extraction (checks common GeoJSON property variants) ----------- */

function getIso3(feature: Feature<Geometry>): string | undefined {
  const props = feature.properties;
  if (!props) return undefined;
  return (
    props.ISO_A3 ??
    props.iso_a3 ??
    props.ADM0_A3 ??
    props.adm0_a3 ??
    undefined
  ) as string | undefined;
}

function getCountryName(feature: Feature<Geometry>): string {
  const props = feature.properties;
  return props?.NAME ?? props?.name ?? props?.ADMIN ?? getIso3(feature) ?? 'Unknown';
}

/* -- Legend component ----------------------------------------------------- */

function MapLegend() {
  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 z-[1000] -translate-x-1/2">
      <div
        className="rounded-lg px-4 py-2.5 backdrop-blur-sm"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 4px 24px var(--color-shadow-lg)',
        }}
      >
        <div className="flex items-center gap-0">
          {COLOR_RANGES.map((range, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className="h-2.5 w-12"
                style={{
                  backgroundColor: range.color,
                  borderRadius:
                    i === 0
                      ? '4px 0 0 4px'
                      : i === COLOR_RANGES.length - 1
                        ? '0 4px 4px 0'
                        : undefined,
                }}
              />
            </div>
          ))}
          <div className="ml-2 flex flex-col items-center">
            <div
              className="h-2.5 w-8 rounded"
              style={{ backgroundColor: NO_DATA_COLOR, border: '1px solid var(--color-border-hover)' }}
            />
          </div>
        </div>
        <div className="mt-1 flex items-center text-[10px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          <span className="w-12 text-center">{'< 0%'}</span>
          <span className="w-12 text-center">Low</span>
          <span className="w-12 text-center">Med</span>
          <span className="w-12 text-center">High</span>
          <span className="w-12 text-center">V.High</span>
          <span className="w-12 text-center">{'> 100%'}</span>
          <span className="ml-2 w-8 text-center">N/A</span>
        </div>
      </div>
    </div>
  );
}

/* -- Helper to configure the Leaflet map after mount ---------------------- */

function MapConfigurator() {
  const map = useMap();

  useEffect(() => {
    // Disable scroll-wheel zoom; users can still use +/- buttons
    map.scrollWheelZoom.disable();

    // Constrain panning so the user cannot scroll away from the world
    const bounds = L.latLngBounds(L.latLng(-60, -180), L.latLng(85, 180));
    map.setMaxBounds(bounds);
    map.on('drag', () => map.panInsideBounds(bounds, { animate: false }));

    // Minimise Leaflet attribution
    const attrControl = map.attributionControl;
    if (attrControl) {
      attrControl.setPrefix(
        '<a href="https://leafletjs.com" target="_blank" rel="noopener" style="opacity:0.45;font-size:10px">Leaflet</a>',
      );
    }
  }, [map]);

  return null;
}

/* -- Main component ------------------------------------------------------- */

export default function WorldMap({
  countryChanges,
  onCountrySelect,
  selectedCountry,
}: WorldMapProps) {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  /* -- Load GeoJSON ------------------------------------------------------- */

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/world.geojson`)
      .then((res) => res.json())
      .then((data: GeoJsonObject) => setGeoData(data))
      .catch((err) => console.error('Failed to load GeoJSON:', err));
  }, []);

  /* -- Re-style layers when selection / data change ----------------------- */

  useEffect(() => {
    if (!geoJsonRef.current) return;
    geoJsonRef.current.eachLayer((layer) => {
      const geoLayer = layer as L.GeoJSON & { feature?: Feature<Geometry> };
      if (!geoLayer.feature) return;
      const iso3 = getIso3(geoLayer.feature);
      const change = iso3 ? countryChanges[iso3] : undefined;
      const isSelected = iso3 === selectedCountry;

      (layer as L.Path).setStyle(buildStyle(change, isSelected));
    });
  }, [countryChanges, selectedCountry]);

  /* -- Style helpers ------------------------------------------------------ */

  const buildStyle = useCallback(
    (change: number | undefined, isSelected: boolean): PathOptions => ({
      fillColor: getColor(change),
      fillOpacity: isSelected ? 0.95 : 0.8,
      color: isSelected ? '#ffffff' : 'var(--color-border)',
      weight: isSelected ? 2.5 : 0.5,
      ...(isSelected ? { className: 'country-selected' } : {}),
    }),
    [],
  );

  const styleFn = useCallback(
    (feature: Feature<Geometry> | undefined): PathOptions => {
      if (!feature) return {};
      const iso3 = getIso3(feature);
      const change = iso3 ? countryChanges[iso3] : undefined;
      const isSelected = iso3 === selectedCountry;
      return buildStyle(change, isSelected);
    },
    [countryChanges, selectedCountry, buildStyle],
  );

  /* -- Interaction handlers ----------------------------------------------- */

  const onEachFeature = useCallback(
    (feature: Feature<Geometry>, layer: Layer) => {
      const iso3 = getIso3(feature);
      const name = getCountryName(feature);
      const change = iso3 ? countryChanges[iso3] : undefined;
      const changeText =
        change !== undefined
          ? `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
          : 'No data';
      const dotColor = getColor(change);

      // Styled tooltip — dark theme
      layer.bindTooltip(
        `<div style="display:flex;align-items:center;gap:6px;font-family:system-ui,sans-serif">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${dotColor};flex-shrink:0"></span>
          <span>
            <strong style="font-size:13px;color:var(--color-text)">${name}</strong><br/>
            <span style="font-size:12px;color:var(--color-text-secondary);font-family:'JetBrains Mono',monospace">${changeText}</span>
          </span>
        </div>`,
        {
          sticky: true,
          direction: 'top',
          offset: [0, -8],
          className: 'world-map-tooltip',
        },
      );

      layer.on({
        click: () => {
          if (iso3) onCountrySelect(iso3);
        },
        mouseover: (e) => {
          const target = e.target as L.Path;
          const currentFill = getColor(change);
          target.setStyle({
            fillColor: lightenColor(currentFill, 30),
            weight: iso3 === selectedCountry ? 2.5 : 1.5,
            color: iso3 === selectedCountry ? '#ffffff' : 'var(--color-map-hover-border)',
          });
          target.bringToFront();
        },
        mouseout: (e) => {
          const target = e.target as L.Path;
          const isSelected = iso3 === selectedCountry;
          target.setStyle(buildStyle(change, isSelected));
          // Keep selected country on top
          if (!isSelected && geoJsonRef.current) {
            geoJsonRef.current.eachLayer((l) => {
              const gl = l as L.GeoJSON & { feature?: Feature<Geometry> };
              if (gl.feature && getIso3(gl.feature) === selectedCountry) {
                (l as L.Path).bringToFront();
              }
            });
          }
        },
      });
    },
    [countryChanges, selectedCountry, onCountrySelect, buildStyle],
  );

  /* -- Loading state ------------------------------------------------------ */

  if (!geoData) {
    return (
      <div
        className="flex h-[450px] items-center justify-center rounded-xl text-sm"
        style={{ backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-secondary)' }}
      >
        <svg
          className="mr-2 h-5 w-5 animate-spin"
          style={{ color: 'var(--color-text-muted)' }}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        Loading map&hellip;
      </div>
    );
  }

  /* -- Render ------------------------------------------------------------- */

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{ border: '1px solid var(--color-border)' }}
    >
      {/* Inject tooltip & selected-country styles */}
      <style>{`
        .world-map-tooltip {
          background: var(--color-bg-elevated) !important;
          border: 1px solid var(--color-border-hover) !important;
          border-radius: 8px !important;
          box-shadow: 0 8px 32px var(--color-shadow-xl) !important;
          padding: 8px 12px !important;
          color: var(--color-text) !important;
          font-size: 13px !important;
          line-height: 1.4 !important;
        }
        .world-map-tooltip::before {
          border-top-color: var(--color-bg-elevated) !important;
        }
        .country-selected {
          filter: drop-shadow(0 0 6px var(--color-selected-glow));
        }
        .leaflet-container {
          cursor: grab;
        }
        .leaflet-container:active {
          cursor: grabbing;
        }
        .leaflet-interactive {
          cursor: pointer !important;
          transition: fill-opacity 0.15s ease;
        }
        .leaflet-control-attribution {
          font-size: 10px !important;
          opacity: 0.4;
          background: var(--color-bg-card) !important;
          color: var(--color-text-muted) !important;
        }
        .leaflet-control-attribution a {
          color: var(--color-text-secondary) !important;
        }
        .leaflet-control-zoom a {
          background: var(--color-bg-elevated) !important;
          color: var(--color-text) !important;
          border-color: var(--color-border-hover) !important;
        }
        .leaflet-control-zoom a:hover {
          background: var(--color-zoom-hover) !important;
        }
      `}</style>

      <MapContainer
        ref={mapRef}
        center={[25, 10]}
        zoom={2}
        minZoom={2}
        maxZoom={6}
        scrollWheelZoom={false}
        zoomControl={true}
        className="h-[450px] w-full"
        style={{ background: 'var(--color-bg)' }}
      >
        <MapConfigurator />
        <GeoJSON
          ref={geoJsonRef}
          data={geoData}
          style={styleFn}
          onEachFeature={onEachFeature}
        />
      </MapContainer>

      {/* Color legend overlay */}
      <MapLegend />
    </div>
  );
}
