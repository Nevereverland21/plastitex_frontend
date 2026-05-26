// app/loading.tsx
// Next.js muestra este componente AUTOMÁTICAMENTE mientras carga cualquier página.
// Reemplaza el flash feo de pantalla vacía o contenido sin estilos.

export default function Loading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#1a2540', // brand-navy exacto
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      {/* Patrón de fondo igual al hero */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.035,
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Logo animado */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          animation: 'fadeIn 0.4s ease-out',
        }}
      >
        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
          <span
            style={{
              fontSize: '56px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-1px',
              fontFamily: 'var(--font-inter), sans-serif',
            }}
          >
            Plasti
          </span>
          <span
            style={{
              fontSize: '56px',
              fontWeight: 800,
              color: '#f97316', // brand-orange
              letterSpacing: '-1px',
              fontFamily: 'var(--font-inter), sans-serif',
            }}
          >
            tex
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-inter), sans-serif',
          }}
        >
          Transformamos ideas en Merchandising
        </p>

        {/* Barra de progreso animada */}
        <div
          style={{
            width: '160px',
            height: '2px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '99px',
            overflow: 'hidden',
            marginTop: '8px',
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: '#f97316',
              borderRadius: '99px',
              animation: 'loadBar 1.4s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes loadBar {
          0%   { width: 0%;   margin-left: 0; }
          50%  { width: 70%;  margin-left: 0; }
          100% { width: 0%;   margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}