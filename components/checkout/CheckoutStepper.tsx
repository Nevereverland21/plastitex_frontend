'use client';

import { Truck, User, CheckCircle } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  { id: 1, label: 'Entrega',    icon: <Truck size={14} strokeWidth={2.5} /> },
  { id: 2, label: 'Tus datos',  icon: <User size={14} strokeWidth={2.5} /> },
  { id: 3, label: 'Confirmar',  icon: <CheckCircle size={14} strokeWidth={2.5} /> },
];

interface CheckoutStepperProps {
  currentStep: number;
}

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, i) => {
        const isDone   = step.id < currentStep;
        const isActive = step.id === currentStep;

        return (
          <div key={step.id} className="flex items-center">
            {/* Círculo del paso */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center
                            font-bold text-sm transition-all duration-300
                            ${isDone   ? 'bg-brand-navy text-white shadow-md shadow-brand-navy/20'
                            : isActive ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/25 scale-110'
                            :            'bg-gray-100 text-gray-400'}`}
              >
                {isDone ? <CheckCircle size={16} strokeWidth={2.5} /> : step.icon}
              </div>
              <span
                className={`text-[10px] font-semibold whitespace-nowrap transition-colors
                            ${isActive ? 'text-brand-orange' : isDone ? 'text-brand-navy' : 'text-gray-400'}`}
              >
                {step.label}
              </span>
            </div>

            {/* Línea conectora */}
            {i < STEPS.length - 1 && (
              <div className="w-16 sm:w-24 h-px mx-2 mb-5 transition-colors duration-300
                              ${step.id < currentStep ? 'bg-brand-navy' : 'bg-gray-200'}"
                style={{ backgroundColor: step.id < currentStep ? '#1B2B5E' : '#e5e7eb' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}