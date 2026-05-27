// app/loading.tsx
// Next.js muestra este componente AUTOMÁTICAMENTE mientras carga cualquier página.
// Ahora usa el logo real (en vez del wordmark de texto) para mantener
// consistencia con el navbar.

export default function Loading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#1B2B5E', // brand-navy exacto (corregido del valor anterior)
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      {/* Patrón de fondo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.035,
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Contenido animado */}
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
        {/* Logo real con fondo blanco redondeado para que destaque sobre el navy */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '20px 32px',
            borderRadius: '16px',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-plastitex.png"
            alt="Plastitex"
            style={{
              height: '52px',
              width: 'auto',
              display: 'block',
            }}
          />
        </div>

        {/* Tagline */}
        <p
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-inter), sans-serif',
            margin: 0,
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
              backgroundColor: '#FF6B2B', // brand-orange exacto
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