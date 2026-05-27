'use client';

// components/catalog/PriceRangeSlider.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Slider de rango de precio dual con react-range.
//
// Features:
//   - Dos thumbs (mínimo y máximo) independientes
//   - Inputs sincronizados arriba para tipear valores exactos
//   - Debounce de 400ms para no saturar el backend al arrastrar
//   - Touch-friendly mobile
//
// Dependencia:
//   npm install react-range
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { Range, getTrackBackground } from 'react-range';

interface Props {
  min: number;
  max: number;
  step?: number;
  /** Valor actual: [minValue, maxValue]. Si es undefined, usa min/max. */
  value: [number | undefined, number | undefined];
  /** Se llama con valores DEBOUNCED (después de 400ms sin cambios) */
  onChange: (values: [number, number]) => void;
}

const DEBOUNCE_MS = 400;

export default function PriceRangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
}: Props) {
  // Estado local (lo que se ve mientras el usuario arrastra)
  const [localValues, setLocalValues] = useState<[number, number]>([
    value[0] ?? min,
    value[1] ?? max,
  ]);

  // Sincronizar si el valor externo cambia (ej. limpiar filtros)
  useEffect(() => {
    setLocalValues([value[0] ?? min, value[1] ?? max]);
  }, [value, min, max]);

  // Debounce de la propagación al padre
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const handleChange = (vals: number[]) => {
    const next: [number, number] = [vals[0], vals[1]];
    setLocalValues(next);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(next);
    }, DEBOUNCE_MS);
  };

  // Inputs manuales (sin debounce, se aplican al blur)
  const handleInputBlur = (idx: 0 | 1, raw: string) => {
    const num = Number(raw);
    if (isNaN(num)) {
      // restaurar valor previo
      setLocalValues([...localValues] as [number, number]);
      return;
    }
    const clamped = Math.min(Math.max(num, min), max);
    const next: [number, number] =
      idx === 0
        ? [Math.min(clamped, localValues[1]), localValues[1]]
        : [localValues[0], Math.max(clamped, localValues[0])];
    setLocalValues(next);
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {/* Inputs numéricos */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1 block">
            Desde
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">
              S/
            </span>
            <input
              type="number"
              value={localValues[0]}
              min={min}
              max={localValues[1]}
              onChange={(e) =>
                setLocalValues([Number(e.target.value), localValues[1]])
              }
              onBlur={(e) => handleInputBlur(0, e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange
                         transition-all"
            />
          </div>
        </div>

        <span className="text-gray-300 mt-5">—</span>

        <div className="flex-1">
          <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1 block">
            Hasta
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">
              S/
            </span>
            <input
              type="number"
              value={localValues[1]}
              min={localValues[0]}
              max={max}
              onChange={(e) =>
                setLocalValues([localValues[0], Number(e.target.value)])
              }
              onBlur={(e) => handleInputBlur(1, e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange
                         transition-all"
            />
          </div>
        </div>
      </div>

      {/* Slider visual */}
      <div className="px-1.5 py-3">
        <Range
          values={localValues}
          step={step}
          min={min}
          max={max}
          onChange={(vals) => handleChange(vals)}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              style={{
                ...props.style,
                height: '6px',
                width: '100%',
                borderRadius: '999px',
                background: getTrackBackground({
                  values: localValues,
                  colors: ['#E5E7EB', '#FF6B2B', '#E5E7EB'],
                  min,
                  max,
                }),
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props, isDragged }) => (
            <div
              {...props}
              key={props.key}
              style={{
                ...props.style,
                height: '20px',
                width: '20px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '2px solid #FF6B2B',
                boxShadow: isDragged
                  ? '0 0 0 6px rgba(255, 107, 43, 0.15)'
                  : '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'box-shadow 0.15s',
                cursor: 'grab',
              }}
            />
          )}
        />
      </div>

      {/* Rango actual */}
      <p className="text-xs text-gray-500 text-center">
        S/ {localValues[0]} — S/ {localValues[1]}
      </p>
    </div>
  );
}