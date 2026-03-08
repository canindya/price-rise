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

/* ── Professional diverging color palette ─────────────────────────── */

const COLOR_RANGES = [
  { min: -Infinity, max: 0, color: '#2563eb', label: 'Deflation' },
  { min: 0, max: 10, color: '#93c5fd', label: 'Low' },
  { min: 10, max: 25, color: '#fde68a', label: 'Moderate' },
  { min: 25, max: 50, color: '#fdba74', label: 'High' },
  { min: 50, max: 100, color: '#f87171', label: 'Very High' },
  { min: 100, max: Infinity, color: '#991b1b', label: 'Extreme' },
] as const;

const NO_DATA_COLOR = '#e2e8f0';

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

/* ── ISO‑3 extraction (checks common GeoJSON property variants) ─── */

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

/* ── Legend component ─────────────────────────────────────────────── */

function MapLegend() {
  return (
    <div className="pointer-events-auto absolute bottom-6 left-1/2 z-[1000] -translate-x-1/2">
      <div className="rounded-lg border border-slate-200 bg-white/95 px-4 py-2.5 shadow-md backdrop-blur-sm">
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
              style={{ backgroundColor: NO_DATA_COLOR }}
            />
          </div>
        </div>
        <div className="mt-1 flex items-center text-[10px] font-medium text-slate-500">
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

/* ── Helper to configure the Leaflet map after mount ─────────────── */

function MapConfigurator() {
  const map = useMap();

  useEffect(() => {
    // Disable scroll‑wheel zoom; users can still use +/- buttons
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

/* ── Main component ──────────────────────────────────────────────── */

export default function WorldMap({
  countryChanges,
  onCountrySelect,
  selectedCountry,
}: WorldMapProps) {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  /* ── Load GeoJSON ───────────────────────────────────────────────── */

  useEffect(() => {
    fetch('/data/world.geojson')
      .then((res) => res.json())
      .then((data: GeoJsonObject) => setGeoData(data))
      .catch((err) => console.error('Failed to load GeoJSON:', err));
  }, []);

  /* ── Re‑style layers when selection / data change ───────────────── */

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

  /* ── Style helpers ──────────────────────────────────────────────── */

  const buildStyle = useCallback(
    (change: number | undefined, isSelected: boolean): PathOptions => ({
      fillColor: getColor(change),
      fillOpacity: isSelected ? 0.9 : 0.8,
      color: isSelected ? '#1e293b' : '#ffffff',
      weight: isSelected ? 3 : 1,
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

  /* ── Interaction handlers ───────────────────────────────────────── */

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

      // Styled tooltip
      layer.bindTooltip(
        `<div style="display:flex;align-items:center;gap:6px;font-family:system-ui,sans-serif">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${dotColor};flex-shrink:0"></span>
          <span>
            <strong style="font-size:13px;color:#0f172a">${name}</strong><br/>
            <span style="font-size:12px;color:#475569">${changeText}</span>
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
            weight: iso3 === selectedCountry ? 3 : 2,
            color: iso3 === selectedCountry ? '#1e293b' : '#94a3b8',
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

  /* ── Loading state ──────────────────────────────────────────────── */

  if (!geoData) {
    return (
      <div className="flex h-[450px] items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
        <svg
          className="mr-2 h-5 w-5 animate-spin text-slate-300"
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

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 shadow-sm">
      {/* Inject tooltip & selected‑country styles */}
      <style>{`
        .world-map-tooltip {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
          padding: 8px 12px !important;
          color: #0f172a !important;
          font-size: 13px !important;
          line-height: 1.4 !important;
        }
        .world-map-tooltip::before {
          border-top-color: #ffffff !important;
        }
        .country-selected {
          filter: drop-shadow(0 0 4px rgba(30,41,59,0.35));
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
          opacity: 0.5;
          background: rgba(255,255,255,0.6) !important;
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
        style={{ background: '#f8fafc' }}
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
