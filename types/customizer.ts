// ─── types/customizer.ts ─────────────────────────────────────────────────────

export type PrintZone = 'frente' | 'lado-izq' | 'lado-der';

export interface LogoPosition {
  x: number;          // centro X en coords del canvas
  y: number;          // centro Y en coords del canvas
  width: number;      // ancho del logo en px
  height: number;     // alto del logo en px
  rotation: number;   // grados (-180 a 180)
  opacity: number;    // 0–1
  lockRatio: boolean; // mantener proporción al redimensionar
  zone: PrintZone;
}

export interface CustomizationData {
  logoDataUrl: string | null;        // base64 del logo (con o sin fondo)
  logoPreviewUrl: string | null;     // data URL del canvas exportado (producto + logo)
  logoPosition: LogoPosition | null;
  customizationNotes: string;        // notas libres (color, tapa, etc.)
  hasCustomization: boolean;
}

export const DEFAULT_LOGO_POSITION: LogoPosition = {
  x: 260,
  y: 310,
  width: 120,
  height: 120,
  rotation: 0,
  opacity: 1,
  lockRatio: true,
  zone: 'frente',
};

export const EMPTY_CUSTOMIZATION: CustomizationData = {
  logoDataUrl: null,
  logoPreviewUrl: null,
  logoPosition: null,
  customizationNotes: '',
  hasCustomization: false,
};