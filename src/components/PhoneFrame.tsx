import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  return (
    <div className="w-full max-w-sm mx-auto bg-warm-gray-900 border-8 border-warm-gray-800 rounded-3xl shadow-2xl h-[85vh] max-h-[700px]">
      <div className="relative w-full h-full overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-warm-gray-900 rounded-b-xl z-20"></div>
        {children}
      </div>
    </div>
  );
};