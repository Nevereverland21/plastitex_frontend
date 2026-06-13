'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, LocateFixed, Loader2, Search } from 'lucide-react';

export interface AddressValue {
  address: string;
  reference: string;
  latitude: number | null;
  longitude: number | null;
}

interface AddressMapPickerProps {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
}

// Centro por defecto: Lima.
const DEFAULT_CENTER: [number, number] = [-12.0464, -77.0428];

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const ICON = {
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41] as [number, number],
  iconAnchor: [12, 41] as [number, number],
  popupAnchor: [1, -34] as [number, number],
  shadowSize: [41, 41] as [number, number],
};

function ensureLeafletCss() {
  if (typeof document === 'undefined' || document.getElementById('leaflet-css')) return;
  const link = document.createElement('link');
  link.id = 'leaflet-css';
  link.rel = 'stylesheet';
  link.href = LEAFLET_CSS;
  document.head.appendChild(link);
}

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=es`,
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.display_name === 'string' ? data.display_name : null;
  } catch {
    return null;
  }
}

/**
 * Selector de dirección con mapa (Leaflet + OpenStreetMap, sin API key).
 * El cliente arrastra el pin / usa su ubicación / busca su calle; guardamos
 * lat/lng (lo que importa para que el repartidor lo ubique) + el texto de la
 * dirección (autocompletado por geocodificación inversa, editable) + una
 * referencia. Si el mapa no carga, degrada a los campos de texto.
 */
export default function AddressMapPicker({ value, onChange }: AddressMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  // Refs para que los callbacks de Leaflet siempre vean el valor/onChange actual
  // sin re-crear el mapa.
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  onChangeRef.current = onChange;
  valueRef.current = value;

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [geoBusy, setGeoBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);

  function applyPoint(lat: number, lng: number, geocode: boolean) {
    const rlat = Number(lat.toFixed(7));
    const rlng = Number(lng.toFixed(7));
    if (markerRef.current) markerRef.current.setLatLng([rlat, rlng]);
    onChangeRef.current({ ...valueRef.current, latitude: rlat, longitude: rlng });
    if (geocode) {
      reverseGeocode(rlat, rlng).then((addr) => {
        if (addr) onChangeRef.current({ ...valueRef.current, latitude: rlat, longitude: rlng, address: addr });
      });
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        ensureLeafletCss();
        const mod = await import('leaflet');
        const L: any = (mod as any).default ?? mod;
        if (cancelled || !containerRef.current || mapRef.current) return;

        const hasPoint = valueRef.current.latitude != null && valueRef.current.longitude != null;
        const start: [number, number] = hasPoint
          ? [valueRef.current.latitude as number, valueRef.current.longitude as number]
          : DEFAULT_CENTER;

        const map = L.map(containerRef.current).setView(start, hasPoint ? 16 : 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);

        const marker = L.marker(start, { draggable: true, icon: L.icon(ICON) }).addTo(map);
        marker.on('dragend', () => {
          const ll = marker.getLatLng();
          applyPoint(ll.lat, ll.lng, true);
        });
        map.on('click', (e: any) => applyPoint(e.latlng.lat, e.latlng.lng, true));

        mapRef.current = map;
        markerRef.current = marker;
        setStatus('ready');
        // El contenedor a veces se mide mal al montar dentro de un panel.
        setTimeout(() => map.invalidateSize(), 200);
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function useMyLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    setGeoBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapRef.current) mapRef.current.setView([latitude, longitude], 17);
        applyPoint(latitude, longitude, true);
        setGeoBusy(false);
      },
      () => setGeoBusy(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=pe&limit=1&accept-language=es&q=${encodeURIComponent(q)}`,
        { headers: { Accept: 'application/json' } },
      );
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        if (mapRef.current) mapRef.current.setView([lat, lng], 17);
        applyPoint(lat, lng, false);
        if (typeof data[0].display_name === 'string') {
          onChangeRef.current({
            ...valueRef.current,
            latitude: Number(lat.toFixed(7)),
            longitude: Number(lng.toFixed(7)),
            address: data[0].display_name,
          });
        }
      }
    } catch {
      /* búsqueda fallida: el cliente puede arrastrar el pin igual */
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Buscador */}
      <form onSubmit={runSearch} className="relative">
        <Search size={15} className="absolute left-3.5 top-3 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Busca tu calle y distrito (ej. Av. Arequipa 123, Miraflores)"
          className="w-full pl-10 pr-20 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-navy/15 focus:border-brand-navy"
        />
        <button
          type="submit"
          disabled={searching}
          className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                     bg-brand-navy text-white hover:bg-brand-orange disabled:opacity-50"
        >
          {searching ? '...' : 'Buscar'}
        </button>
      </form>

      {/* Mapa */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200">
        <div ref={containerRef} className="h-56 w-full bg-gray-100" />
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        )}
        {status === 'ready' && (
          <button
            type="button"
            onClick={useMyLocation}
            disabled={geoBusy}
            className="absolute z-[1000] bottom-3 right-3 flex items-center gap-1.5 px-3 py-2 rounded-xl
                       bg-white shadow-md text-xs font-semibold text-brand-navy hover:bg-gray-50 disabled:opacity-60"
          >
            {geoBusy ? <Loader2 size={13} className="animate-spin" /> : <LocateFixed size={13} />}
            Mi ubicación
          </button>
        )}
      </div>

      {status === 'ready' && (
        <p className="text-[11px] text-gray-400 flex items-center gap-1">
          <MapPin size={11} /> Arrastra el pin al punto exacto de entrega, o usa &ldquo;Mi ubicación&rdquo;.
        </p>
      )}
      {status === 'error' && (
        <p className="text-[11px] text-amber-600">
          No se pudo cargar el mapa. Escribe tu dirección abajo y la coordinamos por WhatsApp.
        </p>
      )}

      {/* Dirección (autocompletada, editable) */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Dirección de entrega</label>
        <textarea
          value={value.address}
          onChange={(e) => onChangeRef.current({ ...valueRef.current, address: e.target.value })}
          placeholder="Av. ejemplo 123, distrito, Lima"
          rows={2}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-navy/15 focus:border-brand-navy resize-none"
        />
      </div>

      {/* Referencia */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
          Referencia <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <input
          value={value.reference}
          onChange={(e) => onChangeRef.current({ ...valueRef.current, reference: e.target.value })}
          placeholder="Ej. portón negro, 2do piso, frente al parque"
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand-navy/15 focus:border-brand-navy"
        />
      </div>
    </div>
  );
}
