import { useState, useEffect } from 'react';
import { getCountryByCode } from '../utils/countryCodeMap';

const SESSION_KEY = 'detected_country_iso2';

interface UseUserLocationReturn {
  detectedCountry: string | null;
  isDetecting: boolean;
}

/**
 * Detects the user's country via IP geolocation (ipapi.co).
 * Returns the ISO-3 code if the country is in our map, null otherwise.
 * Caches the result in sessionStorage so it only runs once per session.
 */
export function useUserLocation(): UseUserLocationReturn {
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached) {
      const meta = getCountryByCode(cached);
      setDetectedCountry(meta?.iso3 ?? null);
      setIsDetecting(false);
      return;
    }

    let cancelled = false;

    async function detect() {
      try {
        const res = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) throw new Error('IP API failed');
        const json = (await res.json()) as { country_code?: string };
        const iso2 = json.country_code ?? '';

        if (!cancelled && iso2) {
          sessionStorage.setItem(SESSION_KEY, iso2);
          const meta = getCountryByCode(iso2);
          setDetectedCountry(meta?.iso3 ?? null);
        }
      } catch {
        // Silently fail — detectedCountry stays null
      } finally {
        if (!cancelled) {
          setIsDetecting(false);
        }
      }
    }

    void detect();

    return () => {
      cancelled = true;
    };
  }, []);

  return { detectedCountry, isDetecting };
}
