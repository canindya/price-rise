import { useEffect, useRef, useState } from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import type { Layer, PathOptions } from 'leaflet';
import type { GeoJsonObject, Feature, Geometry } from 'geojson';
import 'leaflet/dist/leaflet.css';

interface WorldMapProps {
  countryChanges: Record<string, number>;
  onCountrySelect: (code: string) => void;
  selectedCountry?: string | null;
}

function getColor(pctChange: number | undefined): string {
  if (pctChange === undefined) return '#d1d5db'; // gray for no data
  if (pctChange < 0) return '#3b82f6';
  if (pctChange <= 20) return '#86efac';
  if (pctChange <= 50) return '#fbbf24';
  if (pctChange <= 100) return '#f97316';
  return '#ef4444';
}

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

export default function WorldMap({
  countryChanges,
  onCountrySelect,
  selectedCountry,
}: WorldMapProps) {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    fetch('/data/world.geojson')
      .then((res) => res.json())
      .then((data: GeoJsonObject) => setGeoData(data))
      .catch((err) => console.error('Failed to load GeoJSON:', err));
  }, []);

  // Update styles when selection or data changes
  useEffect(() => {
    if (!geoJsonRef.current) return;
    geoJsonRef.current.eachLayer((layer) => {
      const geoLayer = layer as L.GeoJSON & { feature?: Feature<Geometry> };
      if (!geoLayer.feature) return;
      const iso3 = getIso3(geoLayer.feature);
      const change = iso3 ? countryChanges[iso3] : undefined;
      const isSelected = iso3 === selectedCountry;

      (layer as L.Path).setStyle({
        fillColor: getColor(change),
        fillOpacity: 0.75,
        color: isSelected ? '#1e3a5f' : '#ffffff',
        weight: isSelected ? 3 : 0.5,
      });
    });
  }, [countryChanges, selectedCountry]);

  if (!geoData) {
    return (
      <div className="flex h-[450px] items-center justify-center text-gray-400">
        Loading map...
      </div>
    );
  }

  function style(feature: Feature<Geometry> | undefined): PathOptions {
    if (!feature) return {};
    const iso3 = getIso3(feature);
    const change = iso3 ? countryChanges[iso3] : undefined;
    const isSelected = iso3 === selectedCountry;

    return {
      fillColor: getColor(change),
      fillOpacity: 0.75,
      color: isSelected ? '#1e3a5f' : '#ffffff',
      weight: isSelected ? 3 : 0.5,
    };
  }

  function onEachFeature(feature: Feature<Geometry>, layer: Layer) {
    const iso3 = getIso3(feature);
    const name = feature.properties?.NAME ?? feature.properties?.name ?? iso3 ?? 'Unknown';
    const change = iso3 ? countryChanges[iso3] : undefined;
    const changeText =
      change !== undefined ? `${change >= 0 ? '+' : ''}${change.toFixed(1)}%` : 'No data';

    layer.bindTooltip(`<strong>${name}</strong><br/>${changeText}`, {
      sticky: true,
    });

    layer.on({
      click: () => {
        if (iso3) onCountrySelect(iso3);
      },
      mouseover: (e) => {
        const target = e.target as L.Path;
        target.setStyle({ weight: 2, color: '#334155' });
      },
      mouseout: (e) => {
        const target = e.target as L.Path;
        const isSelected = iso3 === selectedCountry;
        target.setStyle({
          weight: isSelected ? 3 : 0.5,
          color: isSelected ? '#1e3a5f' : '#ffffff',
        });
      },
    });
  }

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={2}
      scrollWheelZoom
      className="h-[450px] w-full rounded-lg"
      style={{ background: '#f0f4f8' }}
    >
      <GeoJSON
        ref={geoJsonRef}
        data={geoData}
        style={style}
        onEachFeature={onEachFeature}
      />
    </MapContainer>
  );
}
