import { Suspense } from 'react';
import CatalogoContent from './CatalogoContent';

export default function Catalogo() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-light flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-navy rounded-full animate-spin" />
      </div>
    }>
      <CatalogoContent />
    </Suspense>
  );
}