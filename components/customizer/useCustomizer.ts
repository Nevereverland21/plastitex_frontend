'use client';
// ─── components/customizer/useCustomizer.ts ──────────────────────────────────

import { useState, useRef, useCallback, useEffect } from 'react';
import type { CustomizationData, LogoPosition, PrintZone } from '@/types/customizer';
import { DEFAULT_LOGO_POSITION } from '@/types/customizer';

export const CANVAS_W = 520;
export const CANVAS_H = 620;

export const PRINT_ZONES: Record<PrintZone, { cx: number; cy: number; w: number; h: number; label: string }> = {
  'frente':   { cx: 260, cy: 310, w: 140, h: 170, label: 'Frente' },
  'lado-izq': { cx: 200, cy: 310, w:  90, h: 140, label: 'Lado izq.' },
  'lado-der': { cx: 320, cy: 310, w:  90, h: 140, label: 'Lado der.' },
};

interface UseCustomizerOptions {
  productImageUrl: string | null;
  productName: string;
  initialData?: CustomizationData;
}

export function useCustomizer({ productImageUrl, productName, initialData }: UseCustomizerOptions) {
  // Usamos un ref interno + callback ref para detectar cada vez que el canvas se monta
  const canvasRef     = useRef<HTMLCanvasElement | null>(null);
  const productImgRef = useRef<HTMLImageElement | null>(null);
  const logoImgRef    = useRef<HTMLImageElement | null>(null);

  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(initialData?.logoDataUrl ?? null);
  const [position, setPosition]       = useState<LogoPosition>(initialData?.logoPosition ?? { ...DEFAULT_LOGO_POSITION });
  const [notes, setNotes]             = useState(initialData?.customizationNotes ?? '');
  const [activeZone, setActiveZone]   = useState<PrintZone>(initialData?.logoPosition?.zone ?? 'frente');
  const [zoom, setZoom]               = useState(1);
  const [removingBg, setRemovingBg]   = useState(false);
  const [bgRemoved, setBgRemoved]     = useState(false);
  const [outOfBounds, setOutOfBounds] = useState(false);

  const dragging    = useRef(false);
  const dragOffset  = useRef({ x: 0, y: 0 });
  const resizing    = useRef(false);
  const resizeStart = useRef({ x: 0, y: 0, size: 80 });

  // Guardamos refs de los valores actuales para usarlos en callbacks sin re-crearlos
  const positionRef   = useRef(position);
  const activeZoneRef = useRef(activeZone);
  useEffect(() => { positionRef.current = position; }, [position]);
  useEffect(() => { activeZoneRef.current = activeZone; }, [activeZone]);

  // ── Comprobar si el logo está fuera de la zona ────────────────────────────
  const checkBounds = useCallback((pos: LogoPosition, zone: PrintZone) => {
    const z = PRINT_ZONES[zone];
    const out =
      pos.x - pos.size / 2 < z.cx - z.w / 2 - 10 ||
      pos.x + pos.size / 2 > z.cx + z.w / 2 + 10 ||
      pos.y - pos.size / 2 < z.cy - z.h / 2 - 10 ||
      pos.y + pos.size / 2 > z.cy + z.h / 2 + 10;
    setOutOfBounds(out);
  }, []);

  // ── Redibujar ─────────────────────────────────────────────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos  = positionRef.current;
    const zone = activeZoneRef.current;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#f5f5f3';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Producto
    if (productImgRef.current) {
      const img   = productImgRef.current;
      const scale = Math.min(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight) * 0.85;
      const dw    = img.naturalWidth  * scale;
      const dh    = img.naturalHeight * scale;
      ctx.drawImage(img, (CANVAS_W - dw) / 2, (CANVAS_H - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = '#e5e7eb';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(140, 60, 240, 500, 20);
      else ctx.rect(140, 60, 240, 500);
      ctx.fill();
      ctx.fillStyle = '#9ca3af';
      ctx.font = '13px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(productName, CANVAS_W / 2, CANVAS_H / 2);
    }

    // Zona de impresión
    const z = PRINT_ZONES[zone];
    ctx.save();
    ctx.strokeStyle = 'rgba(232,84,23,0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(z.cx - z.w / 2, z.cy - z.h / 2, z.w, z.h);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(232,84,23,0.06)';
    ctx.fillRect(z.cx - z.w / 2, z.cy - z.h / 2, z.w, z.h);
    ctx.fillStyle = 'rgba(232,84,23,0.6)';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('zona de impresión', z.cx, z.cy + z.h / 2 + 14);
    ctx.restore();

    // Logo
    if (logoImgRef.current) {
      const { x, y, size, opacity } = pos;
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.drawImage(logoImgRef.current, x - size / 2, y - size / 2, size, size);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(232,84,23,0.85)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(x - size / 2 - 4, y - size / 2 - 4, size + 8, size + 8);
      ctx.setLineDash([]);
      const hx = x + size / 2 + 4;
      const hy = y + size / 2 + 4;
      ctx.fillStyle = '#E85417';
      ctx.beginPath();
      ctx.arc(hx, hy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  }, [productName]); // ← NO depende de position/activeZone (los lee por ref)

  // Redibujar cuando cambia position o zone
  useEffect(() => { redraw(); }, [position, activeZone, redraw]);

  // ── Callback ref — se llama CADA VEZ que el canvas aparece en el DOM ──────
  // Esto soluciona que al reabrir el modal el canvas quedaba vacío
  const setCanvasRef = useCallback((node: HTMLCanvasElement | null) => {
    canvasRef.current = node;
    if (node) {
      // Microtask para asegurar que el layout está completo
      Promise.resolve().then(() => redraw());
    }
  }, [redraw]);

  // ── Cargar imagen del producto ────────────────────────────────────────────
  useEffect(() => {
    if (!productImageUrl) { productImgRef.current = null; redraw(); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => { productImgRef.current = img; redraw(); };
    img.onerror = () => { productImgRef.current = null; redraw(); };
    img.src = productImageUrl;
  }, [productImageUrl, redraw]);

  // ── Cargar logo ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!logoDataUrl) { logoImgRef.current = null; redraw(); return; }
    const img = new Image();
    img.onload = () => { logoImgRef.current = img; redraw(); };
    img.src = logoDataUrl;
  }, [logoDataUrl, redraw]);

  // ── Cambiar zona ──────────────────────────────────────────────────────────
  const handleZoneChange = useCallback((zone: PrintZone) => {
    setActiveZone(zone);
    const z = PRINT_ZONES[zone];
    setPosition((prev) => {
      const next = { ...prev, x: z.cx, y: z.cy, zone };
      checkBounds(next, zone);
      return next;
    });
  }, [checkBounds]);

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleLogoUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setLogoDataUrl(dataUrl);
      setBgRemoved(false);
      const z = PRINT_ZONES[activeZoneRef.current];
      setPosition((prev) => ({ ...prev, x: z.cx, y: z.cy, size: 100 }));
    };
    reader.readAsDataURL(file);
  }, []);

  // ── Remove BG ─────────────────────────────────────────────────────────────
  const handleRemoveBg = useCallback(async () => {
    if (!logoDataUrl || removingBg) return;
    setRemovingBg(true);
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const res        = await fetch(logoDataUrl);
      const blob       = await res.blob();
      const resultBlob = await removeBackground(blob);
      const url        = URL.createObjectURL(resultBlob);
      const canvas2    = document.createElement('canvas');
      const img        = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => {
          canvas2.width = img.width; canvas2.height = img.height;
          canvas2.getContext('2d')!.drawImage(img, 0, 0);
          resolve();
        };
        img.src = url;
      });
      setLogoDataUrl(canvas2.toDataURL('image/png'));
      setBgRemoved(true);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Remove BG error:', err);
    } finally {
      setRemovingBg(false);
    }
  }, [logoDataUrl, removingBg]);

  // ── Canvas point helper ───────────────────────────────────────────────────
  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const isOnLogo = (px: number, py: number) => {
    if (!logoImgRef.current) return false;
    const { x, y, size } = positionRef.current;
    return px >= x - size / 2 - 8 && px <= x + size / 2 + 8
        && py >= y - size / 2 - 8 && py <= y + size / 2 + 8;
  };

  const isOnResizeHandle = (px: number, py: number) => {
    if (!logoImgRef.current) return false;
    const { x, y, size } = positionRef.current;
    return Math.hypot(px - (x + size / 2 + 4), py - (y + size / 2 + 4)) < 12;
  };

  const onPointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !logoImgRef.current) return;
    const pt = getCanvasPoint(e, canvas);
    if (isOnResizeHandle(pt.x, pt.y)) {
      resizing.current   = true;
      resizeStart.current = { x: pt.x, y: pt.y, size: positionRef.current.size };
      return;
    }
    if (isOnLogo(pt.x, pt.y)) {
      dragging.current   = true;
      dragOffset.current = { x: pt.x - positionRef.current.x, y: pt.y - positionRef.current.y };
    }
  }, []);

  const onPointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pt = getCanvasPoint(e, canvas);
    if (resizing.current) {
      const dx      = pt.x - resizeStart.current.x;
      const newSize = Math.max(30, Math.min(280, resizeStart.current.size + dx * 1.5));
      setPosition((prev) => {
        const next = { ...prev, size: Math.round(newSize) };
        checkBounds(next, activeZoneRef.current);
        return next;
      });
      return;
    }
    if (dragging.current) {
      setPosition((prev) => {
        const next = {
          ...prev,
          x: Math.round(pt.x - dragOffset.current.x),
          y: Math.round(pt.y - dragOffset.current.y),
        };
        checkBounds(next, activeZoneRef.current);
        return next;
      });
    }
  }, [checkBounds]);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
    resizing.current = false;
  }, []);

  const centerLogo = useCallback(() => {
    const z = PRINT_ZONES[activeZoneRef.current];
    setPosition((prev) => {
      const next = { ...prev, x: z.cx, y: z.cy };
      checkBounds(next, activeZoneRef.current);
      return next;
    });
  }, [checkBounds]);

  const removeLogo = useCallback(() => {
    setLogoDataUrl(null);
    setBgRemoved(false);
    setOutOfBounds(false);
  }, []);

  const handleZoomIn    = useCallback(() => setZoom((z) => Math.min(2,   Math.round((z + 0.25) * 100) / 100)), []);
  const handleZoomOut   = useCallback(() => setZoom((z) => Math.max(0.5, Math.round((z - 0.25) * 100) / 100)), []);
  const handleZoomReset = useCallback(() => setZoom(1), []);

  // ── Export ────────────────────────────────────────────────────────────────
  const exportPreview = useCallback((): string | null => {
    if (!productImgRef.current && !logoImgRef.current) return null;
    const off = document.createElement('canvas');
    off.width = CANVAS_W; off.height = CANVAS_H;
    const ctx = off.getContext('2d')!;
    ctx.fillStyle = '#f5f5f3';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    if (productImgRef.current) {
      const img   = productImgRef.current;
      const scale = Math.min(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight) * 0.85;
      const dw    = img.naturalWidth  * scale;
      const dh    = img.naturalHeight * scale;
      ctx.drawImage(img, (CANVAS_W - dw) / 2, (CANVAS_H - dh) / 2, dw, dh);
    }
    if (logoImgRef.current) {
      const { x, y, size, opacity } = positionRef.current;
      ctx.globalAlpha = opacity;
      ctx.drawImage(logoImgRef.current, x - size / 2, y - size / 2, size, size);
      ctx.globalAlpha = 1;
    }
    return off.toDataURL('image/png');
  }, []);

  const buildResult = useCallback((): CustomizationData => ({
    logoDataUrl,
    logoPreviewUrl: exportPreview(),
    logoPosition:   logoDataUrl ? positionRef.current : null,
    customizationNotes: notes,
    hasCustomization:   !!logoDataUrl || notes.trim().length > 0,
  }), [logoDataUrl, notes, exportPreview]);

  return {
    setCanvasRef,
    logoDataUrl, position, setPosition,
    notes, setNotes,
    activeZone, zoom,
    removingBg, bgRemoved, outOfBounds,
    handleLogoUpload, handleRemoveBg,
    handleZoneChange, centerLogo, removeLogo,
    handleZoomIn, handleZoomOut, handleZoomReset,
    onPointerDown, onPointerMove, onPointerUp,
    buildResult,
  };
}