'use client';
// ─── components/customizer/useCustomizer.ts ──────────────────────────────────

import { useState, useRef, useCallback, useEffect } from 'react';
import type { CustomizationData, LogoPosition, PrintZone } from '@/types/customizer';
import { DEFAULT_LOGO_POSITION } from '@/types/customizer';

export const CANVAS_W = 520;
export const CANVAS_H = 600;

export const PRINT_ZONES: Record<PrintZone, { cx: number; cy: number; w: number; h: number; label: string }> = {
  'frente':   { cx: 260, cy: 300, w: 150, h: 180, label: 'Frente' },
  'lado-izq': { cx: 195, cy: 300, w:  95, h: 150, label: 'Lado izq.' },
  'lado-der': { cx: 325, cy: 300, w:  95, h: 150, label: 'Lado der.' },
};

interface UseCustomizerOptions {
  productImageUrl: string | null;
  productName: string;
  initialData?: CustomizationData;
}

type Handle = 'nw' | 'ne' | 'sw' | 'se' | 'rot' | null;

export function useCustomizer({ productImageUrl, productName, initialData }: UseCustomizerOptions) {
  const canvasRef     = useRef<HTMLCanvasElement | null>(null);
  const productImgRef = useRef<HTMLImageElement | null>(null);
  const logoImgRef    = useRef<HTMLImageElement | null>(null);
  const logoNaturalRatio = useRef(1);

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
  const activeHandle = useRef<Handle>(null);
  const gestureStart = useRef({ x: 0, y: 0, w: 0, h: 0, cx: 0, cy: 0, rot: 0, ang: 0 });

  const positionRef   = useRef(position);
  const activeZoneRef = useRef(activeZone);
  useEffect(() => { positionRef.current = position; }, [position]);
  useEffect(() => { activeZoneRef.current = activeZone; }, [activeZone]);

  // ── Bounds check ──────────────────────────────────────────────────────────
  const checkBounds = useCallback((pos: LogoPosition, zone: PrintZone) => {
    const z = PRINT_ZONES[zone];
    const out =
      pos.x - pos.width / 2  < z.cx - z.w / 2 - 12 ||
      pos.x + pos.width / 2  > z.cx + z.w / 2 + 12 ||
      pos.y - pos.height / 2 < z.cy - z.h / 2 - 12 ||
      pos.y + pos.height / 2 > z.cy + z.h / 2 + 12;
    setOutOfBounds(out);
  }, []);

  // ── Redraw ────────────────────────────────────────────────────────────────
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
      const scale = Math.min(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight) * 0.88;
      const dw    = img.naturalWidth  * scale;
      const dh    = img.naturalHeight * scale;
      ctx.drawImage(img, (CANVAS_W - dw) / 2, (CANVAS_H - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = '#e5e7eb';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(160, 70, 200, 460, 20);
      else ctx.rect(160, 70, 200, 460);
      ctx.fill();
      ctx.fillStyle = '#9ca3af';
      ctx.font = '13px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(productName, CANVAS_W / 2, CANVAS_H / 2);
    }

    // Zona
    const z = PRINT_ZONES[zone];
    ctx.save();
    ctx.strokeStyle = 'rgba(232,84,23,0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(z.cx - z.w / 2, z.cy - z.h / 2, z.w, z.h);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(232,84,23,0.05)';
    ctx.fillRect(z.cx - z.w / 2, z.cy - z.h / 2, z.w, z.h);
    ctx.fillStyle = 'rgba(232,84,23,0.55)';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('zona de impresión', z.cx, z.cy + z.h / 2 + 14);
    ctx.restore();

    // Logo (con rotación)
    if (logoImgRef.current) {
      const { x, y, width, height, rotation, opacity } = pos;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.globalAlpha = opacity;
      ctx.drawImage(logoImgRef.current, -width / 2, -height / 2, width, height);
      ctx.globalAlpha = 1;

      // Marco
      ctx.strokeStyle = 'rgba(232,84,23,0.9)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(-width / 2 - 3, -height / 2 - 3, width + 6, height + 6);
      ctx.setLineDash([]);

      // Handles esquinas
      const corners: [number, number][] = [
        [-width / 2 - 3, -height / 2 - 3],
        [ width / 2 + 3, -height / 2 - 3],
        [-width / 2 - 3,  height / 2 + 3],
        [ width / 2 + 3,  height / 2 + 3],
      ];
      corners.forEach(([cx, cy]) => {
        ctx.fillStyle = '#E85417';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Handle de rotación (arriba)
      const rotY = -height / 2 - 26;
      ctx.beginPath();
      ctx.moveTo(0, -height / 2 - 3);
      ctx.lineTo(0, rotY);
      ctx.strokeStyle = 'rgba(232,84,23,0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#1B2B5E';
      ctx.beginPath();
      ctx.arc(0, rotY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    }
  }, [productName]);

  useEffect(() => { redraw(); }, [position, activeZone, redraw]);

  const setCanvasRef = useCallback((node: HTMLCanvasElement | null) => {
    canvasRef.current = node;
    if (node) Promise.resolve().then(() => redraw());
  }, [redraw]);

  // ── Cargar producto ───────────────────────────────────────────────────────
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
    img.onload = () => {
      logoImgRef.current = img;
      logoNaturalRatio.current = img.naturalWidth / img.naturalHeight || 1;
      redraw();
    };
    img.src = logoDataUrl;
  }, [logoDataUrl, redraw]);

  // ── Zona ──────────────────────────────────────────────────────────────────
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
      const probe = new Image();
      probe.onload = () => {
        const ratio = probe.naturalWidth / probe.naturalHeight || 1;
        const baseW = 130;
        const z = PRINT_ZONES[activeZoneRef.current];
        setLogoDataUrl(dataUrl);
        setBgRemoved(false);
        setPosition((prev) => ({
          ...prev,
          x: z.cx, y: z.cy,
          width: baseW,
          height: Math.round(baseW / ratio),
          rotation: 0,
        }));
      };
      probe.src = dataUrl;
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
      const c2         = document.createElement('canvas');
      const img        = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => {
          c2.width = img.width; c2.height = img.height;
          c2.getContext('2d')!.drawImage(img, 0, 0);
          resolve();
        };
        img.src = url;
      });
      setLogoDataUrl(c2.toDataURL('image/png'));
      setBgRemoved(true);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Remove BG error:', err);
    } finally {
      setRemovingBg(false);
    }
  }, [logoDataUrl, removingBg]);

  // ── Coords ────────────────────────────────────────────────────────────────
  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  // Transforma un punto del canvas al sistema local del logo (sin rotación)
  const toLocal = (px: number, py: number, pos: LogoPosition) => {
    const dx = px - pos.x;
    const dy = py - pos.y;
    const a  = (-pos.rotation * Math.PI) / 180;
    return {
      x: dx * Math.cos(a) - dy * Math.sin(a),
      y: dx * Math.sin(a) + dy * Math.cos(a),
    };
  };

  const hitHandle = (px: number, py: number, pos: LogoPosition): Handle => {
    const loc = toLocal(px, py, pos);
    const hw = pos.width / 2 + 3;
    const hh = pos.height / 2 + 3;
    const tol = 11;
    if (Math.hypot(loc.x - 0,   loc.y - (-hh - 23)) < tol) return 'rot';
    if (Math.hypot(loc.x - (-hw), loc.y - (-hh)) < tol) return 'nw';
    if (Math.hypot(loc.x -  hw,  loc.y - (-hh)) < tol) return 'ne';
    if (Math.hypot(loc.x - (-hw), loc.y -  hh)  < tol) return 'sw';
    if (Math.hypot(loc.x -  hw,  loc.y -  hh)  < tol) return 'se';
    return null;
  };

  const insideLogo = (px: number, py: number, pos: LogoPosition) => {
    const loc = toLocal(px, py, pos);
    return Math.abs(loc.x) <= pos.width / 2 + 6 && Math.abs(loc.y) <= pos.height / 2 + 6;
  };

  const onPointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !logoImgRef.current) return;
    const pt  = getCanvasPoint(e, canvas);
    const pos = positionRef.current;

    const h = hitHandle(pt.x, pt.y, pos);
    if (h) {
      activeHandle.current = h;
      const ang = Math.atan2(pt.y - pos.y, pt.x - pos.x);
      gestureStart.current = {
        x: pt.x, y: pt.y, w: pos.width, h: pos.height,
        cx: pos.x, cy: pos.y, rot: pos.rotation, ang: (ang * 180) / Math.PI - pos.rotation,
      };
      return;
    }
    if (insideLogo(pt.x, pt.y, pos)) {
      dragging.current = true;
      dragOffset.current = { x: pt.x - pos.x, y: pt.y - pos.y };
    }
  }, []);

  const onPointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pt = getCanvasPoint(e, canvas);

    // Rotación
    if (activeHandle.current === 'rot') {
      const ang = (Math.atan2(pt.y - gestureStart.current.cy, pt.x - gestureStart.current.cx) * 180) / Math.PI;
      let rot = Math.round(ang - gestureStart.current.ang + 90);
      if (rot > 180) rot -= 360;
      if (rot < -180) rot += 360;
      setPosition((prev) => ({ ...prev, rotation: rot }));
      return;
    }

    // Resize por esquina
    if (activeHandle.current) {
      const g = gestureStart.current;
      const loc = toLocal(pt.x, pt.y, { ...positionRef.current, rotation: g.rot });
      let newW = Math.max(24, Math.abs(loc.x) * 2);
      let newH = Math.max(24, Math.abs(loc.y) * 2);
      if (positionRef.current.lockRatio) {
        const ratio = logoNaturalRatio.current;
        // Usa la dimensión que más cambió
        if (Math.abs(newW / g.w - 1) > Math.abs(newH / g.h - 1)) {
          newH = newW / ratio;
        } else {
          newW = newH * ratio;
        }
      }
      setPosition((prev) => {
        const next = { ...prev, width: Math.round(newW), height: Math.round(newH) };
        checkBounds(next, activeZoneRef.current);
        return next;
      });
      return;
    }

    // Drag
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
    activeHandle.current = null;
  }, []);

  // ── Setters manuales (sliders / inputs) ───────────────────────────────────
  const setWidth = useCallback((w: number) => {
    setPosition((prev) => {
      const next = { ...prev, width: w, height: prev.lockRatio ? Math.round(w / logoNaturalRatio.current) : prev.height };
      checkBounds(next, activeZoneRef.current);
      return next;
    });
  }, [checkBounds]);

  const setHeight = useCallback((h: number) => {
    setPosition((prev) => {
      const next = { ...prev, height: h, width: prev.lockRatio ? Math.round(h * logoNaturalRatio.current) : prev.width };
      checkBounds(next, activeZoneRef.current);
      return next;
    });
  }, [checkBounds]);

  const setRotation = useCallback((r: number) => setPosition((p) => ({ ...p, rotation: r })), []);
  const setOpacity  = useCallback((o: number) => setPosition((p) => ({ ...p, opacity: o })), []);
  const toggleLockRatio = useCallback(() => setPosition((p) => ({ ...p, lockRatio: !p.lockRatio })), []);

  const centerLogo = useCallback(() => {
    const z = PRINT_ZONES[activeZoneRef.current];
    setPosition((prev) => {
      const next = { ...prev, x: z.cx, y: z.cy };
      checkBounds(next, activeZoneRef.current);
      return next;
    });
  }, [checkBounds]);

  const resetTransform = useCallback(() => {
    const z = PRINT_ZONES[activeZoneRef.current];
    const baseW = 130;
    setPosition((prev) => ({
      ...prev,
      x: z.cx, y: z.cy,
      width: baseW,
      height: Math.round(baseW / logoNaturalRatio.current),
      rotation: 0,
      opacity: 1,
    }));
    setOutOfBounds(false);
  }, []);

  const removeLogo = useCallback(() => {
    setLogoDataUrl(null);
    setBgRemoved(false);
    setOutOfBounds(false);
  }, []);

  const handleZoomIn    = useCallback(() => setZoom((z) => Math.min(2.5, Math.round((z + 0.25) * 100) / 100)), []);
  const handleZoomOut   = useCallback(() => setZoom((z) => Math.max(1,   Math.round((z - 0.25) * 100) / 100)), []);
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
      const scale = Math.min(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight) * 0.88;
      const dw    = img.naturalWidth  * scale;
      const dh    = img.naturalHeight * scale;
      ctx.drawImage(img, (CANVAS_W - dw) / 2, (CANVAS_H - dh) / 2, dw, dh);
    }
    if (logoImgRef.current) {
      const { x, y, width, height, rotation, opacity } = positionRef.current;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.globalAlpha = opacity;
      ctx.drawImage(logoImgRef.current, -width / 2, -height / 2, width, height);
      ctx.restore();
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
  };
}