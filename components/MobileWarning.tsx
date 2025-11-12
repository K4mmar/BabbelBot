
import React from 'react';
import { ComputerDesktopIcon } from './IconComponents';

export const MobileWarning: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-warm-gray-900 bg-opacity-95 p-4 text-white text-center animate-fade-in">
      <div className="w-full max-w-md space-y-6">
        <ComputerDesktopIcon className="w-20 h-20 mx-auto text-primary-green" />
        <h1 className="text-3xl font-bold font-serif">Niet geschikt voor mobiel</h1>
        <p className="text-lg text-warm-gray-200">
          BabbelBot is ontworpen voor een groter scherm. Gebruik alstublieft een tablet, laptop of desktopcomputer voor de beste ervaring.
        </p>
      </div>
    </div>
  );
};
