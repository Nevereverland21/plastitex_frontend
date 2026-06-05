'use client';
// ─── components/customizer/CustomizerModal.tsx ────────────────────────────────

import { useRef, useEffect, useCallback } from 'react';
import {
  X, Upload, Wand2, Move, RotateCcw, RotateCw,
  Trash2, CheckCircle, Loader2, AlertTriangle,
  ChevronRight, Sparkles, ImageIcon, Lock, Unlock,
  ZoomIn, ZoomOut, Maximize2, MoveHorizontal, MoveVertical,
} from 'lucide-react';
import type { CustomizationData, PrintZone } from '@/types/customizer';
import { useCustomizer, CANVAS_W, CANVAS_H, PRINT_ZONES } from './useCustomizer';

interface CustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CustomizationData) => void;
  productName: string;
  productImageUrl: string | null;
  initialData?: CustomizationData;
}

export default function CustomizerModal({
  isOpen, onClose, onSave,
  productName, productImageUrl, initialData,
}: CustomizerModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    setCanvasRef,
    logoDataUrl, position,
    notes, setNotes,
    activeZone, zoom,
    removingBg, bgRemoved, outOfBounds,
    handleLogoUpload, handleRemoveBg, handleZoneChange,
    setWidth, setHeight, setRotation, setOpacity, toggleLockRatio,
    centerLogo, resetTransform, removeLogo,
    handleZoomIn, handleZoomOut, handleZoomReset,
    onPointerDown, onPointerMove, onPointerUp,
    buildResult,
  } = useCustomizer({ productImageUrl, productName, initialData });

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  const handleSave = useCallback(() => {
    onSave(buildResult());
    onClose();
  }, [buildResult, onSave, onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleLogoUpload(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleLogoUpload(file);
  };

  if (!isOpen) return null;
  const hasLogo = !!logoDataUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="
        relative w-full sm:w-auto sm:min-w-[980px] sm:max-w-[1080px]
        h-[100dvh] sm:h-auto sm:max-h-[94vh]
        bg-[#f5f5f3] rounded-t-3xl sm:rounded-3xl
        flex flex-col overflow-hidden shadow-2xl
        animate-in fade-in slide-in-from-bottom-4 duration-300
      ">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-orange/10 flex items-center justify-center">
              <Sparkles size={18} className="text-brand-orange" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-navy">Personaliza tu producto</h2>
              <p className="text-xs text-gray-400 mt-0.5">{productName}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400
                       hover:bg-gray-100 hover:text-gray-700 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">

          {/* ══ CANVAS PANEL ══ */}
          <div className="flex flex-col bg-white lg:border-r border-gray-100 flex-shrink-0 lg:w-[540px] p-5 gap-3 overflow-hidden">

            {/* Canvas — se ajusta al alto disponible, sin scroll a 100% */}
            <div className="relative flex-1 min-h-0 rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center"
                 style={{ background: '#f5f5f3' }}>
              {/* Wrapper que aplica zoom; overflow auto solo activo si zoom>1 */}
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ overflow: zoom > 1 ? 'auto' : 'hidden' }}
              >
                <div
                  style={{
                    width:  `${zoom * 100}%`,
                    aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
                    flexShrink: 0,
                    maxWidth: zoom > 1 ? 'none' : '100%',
                    maxHeight: zoom > 1 ? 'none' : '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <canvas
                    ref={setCanvasRef}
                    width={CANVAS_W}
                    height={CANVAS_H}
                    className="block"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      cursor: hasLogo ? 'grab' : 'default',
                      touchAction: 'none',
                    }}
                    onMouseDown={onPointerDown as React.MouseEventHandler<HTMLCanvasElement>}
                    onMouseMove={onPointerMove as React.MouseEventHandler<HTMLCanvasElement>}
                    onMouseUp={onPointerUp}
                    onMouseLeave={onPointerUp}
                    onTouchStart={onPointerDown as React.TouchEventHandler<HTMLCanvasElement>}
                    onTouchMove={onPointerMove as React.TouchEventHandler<HTMLCanvasElement>}
                    onTouchEnd={onPointerUp}
                  />
                </div>
              </div>

              {/* Hint flotante */}
              {hasLogo && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2
                               bg-black/55 text-white text-[10px] px-3 py-1.5 rounded-full
                               flex items-center gap-1.5 pointer-events-none whitespace-nowrap">
                  <Move size={10} />
                  {zoom > 1 ? 'Desplázate para ver el área completa' : 'Arrastra el logo · usa las esquinas para escalar y rotar'}
                </div>
              )}

              {/* Zoom flotante arriba-derecha */}
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm p-1">
                <button onClick={handleZoomOut} disabled={zoom <= 1}
                  className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-30 transition-all">
                  <ZoomOut size={13} />
                </button>
                <span className="text-[11px] font-bold text-brand-navy w-9 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={handleZoomIn} disabled={zoom >= 2.5}
                  className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-30 transition-all">
                  <ZoomIn size={13} />
                </button>
                {zoom !== 1 && (
                  <button onClick={handleZoomReset}
                    className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-all">
                    <Maximize2 size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Selector de zona */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">Zona</span>
              <div className="flex gap-1.5 flex-1">
                {(Object.keys(PRINT_ZONES) as PrintZone[]).map((zone) => (
                  <button key={zone} onClick={() => handleZoneChange(zone)}
                    className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition-all border
                      ${activeZone === zone
                        ? 'bg-brand-orange text-white border-brand-orange'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-brand-orange/40 hover:text-brand-orange'}`}>
                    {PRINT_ZONES[zone].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aviso */}
            {hasLogo ? (
              <div className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-[11px] leading-snug flex-shrink-0 transition-all
                ${outOfBounds ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                <AlertTriangle size={13} className={`flex-shrink-0 mt-0.5 ${outOfBounds ? 'text-amber-500' : 'text-blue-400'}`} />
                <span>
                  {outOfBounds
                    ? <><strong>Fuera de la zona recomendada.</strong> La parte que sale puede verse curvada o cortada en el producto físico.</>
                    : <>Referencia de posicionamiento. Por la curvatura del envase, los bordes pueden verse ligeramente distintos al imprimir.</>}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[11px] text-gray-500 flex-shrink-0">
                <Sparkles size={12} className="text-gray-400" />
                Sube tu logo para verlo sobre el producto y ajustarlo.
              </div>
            )}
          </div>

          {/* ══ CONTROLS PANEL ══ */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 min-w-0">

            {/* ── 1. Subir ── */}
            <section>
              <SectionTitle number={1} title="Sube tu logo o arte" />
              {!hasLogo ? (
                <div
                  className="mt-3 border-2 border-dashed border-gray-200 rounded-2xl
                             hover:border-brand-orange/50 hover:bg-brand-orange/3 transition-all cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                  <div className="flex flex-col items-center justify-center py-8 px-4 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-brand-orange/8 flex items-center justify-center group-hover:bg-brand-orange/15 transition-colors">
                      <Upload size={24} className="text-brand-orange" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-brand-navy">Haz clic o arrastra tu archivo</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG · Máx 5 MB</p>
                      <p className="text-xs text-brand-orange font-medium mt-1.5">✦ PNG sin fondo recomendado</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100">
                    <div className="w-14 h-14 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center"
                         style={{ background: 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 0 0 / 10px 10px' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoDataUrl!} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-brand-navy">Logo cargado</p>
                      <p className="text-xs text-gray-400">{bgRemoved ? '✓ Fondo eliminado' : 'Original'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => fileInputRef.current?.click()}
                        className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-brand-navy hover:text-white transition-all" title="Cambiar">
                        <ImageIcon size={14} />
                      </button>
                      <button onClick={removeLogo}
                        className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-red-500 hover:text-white transition-all" title="Quitar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {!bgRemoved ? (
                    <button onClick={handleRemoveBg} disabled={removingBg}
                      className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl
                                 border-2 border-dashed border-brand-orange/40 text-brand-orange font-semibold text-sm
                                 hover:border-brand-orange hover:bg-brand-orange/5
                                 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                      {removingBg
                        ? <><Loader2 size={16} className="animate-spin" /> Procesando con IA...</>
                        : <><Wand2 size={16} /> Quitar fondo automáticamente (IA)</>}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-2xl">
                      <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                      <p className="text-sm font-semibold text-green-700">Fondo eliminado correctamente</p>
                    </div>
                  )}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </section>

            {/* ── 2. Transformar ── */}
            {hasLogo && (
              <section>
                <SectionTitle number={2} title="Ajusta tu logo" />
                <div className="mt-3 space-y-4 bg-white rounded-2xl border border-gray-100 p-4">

                  {/* Lock ratio toggle */}
                  <button onClick={toggleLockRatio}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all
                      ${position.lockRatio
                        ? 'border-brand-navy/20 bg-brand-navy/5 text-brand-navy'
                        : 'border-gray-200 bg-white text-gray-500'}`}>
                    <span className="flex items-center gap-2">
                      {position.lockRatio ? <Lock size={13} /> : <Unlock size={13} />}
                      Mantener proporción
                    </span>
                    <span className={`w-9 h-5 rounded-full relative transition-all ${position.lockRatio ? 'bg-brand-navy' : 'bg-gray-300'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${position.lockRatio ? 'left-[18px]' : 'left-0.5'}`} />
                    </span>
                  </button>

                  <Slider label="Ancho" icon={<MoveHorizontal size={14} />} value={position.width}
                    min={24} max={320} unit="px" onChange={setWidth} />
                  <Slider label="Alto" icon={<MoveVertical size={14} />} value={position.height}
                    min={24} max={320} unit="px" onChange={setHeight} />
                  <Slider label="Rotación" icon={<RotateCw size={14} />} value={position.rotation}
                    min={-180} max={180} unit="°" onChange={setRotation} />
                  <Slider label="Opacidad" icon={<Move size={14} />} value={Math.round(position.opacity * 100)}
                    min={20} max={100} unit="%" onChange={(v) => setOpacity(v / 100)} />

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button onClick={centerLogo}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-50 hover:bg-brand-navy/5 border border-gray-100 hover:border-brand-navy/20 text-xs font-semibold text-gray-600 hover:text-brand-navy transition-all">
                      <Maximize2 size={13} /> Centrar
                    </button>
                    <button onClick={resetTransform}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-50 hover:bg-brand-navy/5 border border-gray-100 hover:border-brand-navy/20 text-xs font-semibold text-gray-600 hover:text-brand-navy transition-all">
                      <RotateCcw size={13} /> Restablecer
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* ── 3. Notas ── */}
            <section>
              <SectionTitle number={hasLogo ? 3 : 2} title="Color, tapa y detalles" subtitle="Opcional" />
              <div className="mt-3">
                <div className="flex items-start gap-2 mb-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Describe el <strong>color del envase</strong> y el <strong>tipo de tapa</strong>. Un asesor lo confirmará contigo.
                  </p>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                  placeholder={`Ej: "Tomatodo azul marino con tapa push-pull negra. Logo centrado en el frente."`}
                  rows={4}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 resize-none
                             focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/15 transition-all leading-relaxed" />
                <p className="text-xs text-gray-400 mt-1.5 text-right">{notes.length}/500</p>
              </div>
            </section>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-white border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose}
            className="px-5 py-3 rounded-2xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!hasLogo && notes.trim().length === 0}
            className="flex items-center gap-2.5 px-7 py-3 rounded-2xl font-bold text-sm text-white
                       bg-brand-orange hover:bg-brand-navy
                       disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
                       transition-all duration-300 shadow-lg shadow-brand-orange/20 hover:shadow-brand-navy/20 hover:scale-[1.02] active:scale-[0.98]">
            <CheckCircle size={16} /> Guardar personalización <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function SectionTitle({ number, title, subtitle }: { number: number; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{number}</span>
      <span className="text-sm font-bold text-brand-navy">{title}</span>
      {subtitle && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{subtitle}</span>}
    </div>
  );
}

function Slider({ label, icon, value, min, max, unit, onChange }: {
  label: string; icon: React.ReactNode; value: number; min: number; max: number; unit: string; onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">{icon}{label}</div>
        <span className="text-xs font-bold text-brand-navy tabular-nums">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} step={1}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-gray-200 accent-brand-orange" />
    </div>
  );
}