// ─── types/customizer.ts ─────────────────────────────────────────────────────

export interface LogoPosition {
  x: number;        // posición centro X en px (relativo al canvas 400x500)
  y: number;        // posición centro Y en px
  size: number;     // tamaño en px
  opacity: number;  // 0–1
  zone: PrintZone;
}

export type PrintZone = 'frente' | 'lado-izq' | 'lado-der';

export interface CustomizationData {
  logoDataUrl: string | null;        // base64 del logo original subido
  logoPreviewUrl: string | null;     // data URL del canvas exportado (tomatodo + logo)
  logoPosition: LogoPosition | null;
  customizationNotes: string;        // notas libres del usuario (color, tapa, etc.)
  hasCustomization: boolean;
}

export const DEFAULT_LOGO_POSITION: LogoPosition = {
  x: 200,
  y: 220,
  size: 80,
  opacity: 1,
  zone: 'frente',
};

export const EMPTY_CUSTOMIZATION: CustomizationData = {
  logoDataUrl: null,
  logoPreviewUrl: null,
  logoPosition: null,
  customizationNotes: '',
  hasCustomization: false,
};