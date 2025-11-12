import React from 'react';

interface DynamicCoachingPanelProps {
  title: string;
  progress: React.ReactNode;
  children: React.ReactNode;
}

export const DynamicCoachingPanel: React.FC<DynamicCoachingPanelProps> = ({ title, progress, children }) => {
  return (
    <div className="w-full flex flex-col space-y-4 animate-fade-in">
      {/* Card 1: Header met Oefening & Voortgang */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex-shrink-0">
        <div className="flex justify-between items-center min-h-[40px]">
          <div>
            <p className="text-sm font-semibold text-warm-gray-500">Oefening</p>
            <h1 className="text-lg font-bold text-primary-green">{title}</h1>
          </div>
          <div className="text-right">
            {progress}
          </div>
        </div>
      </div>
      
      {/* Card 2: Dynamische Inhoud */}
      <div className="flex-grow bg-white p-6 rounded-xl border shadow-sm">
        {children}
      </div>
    </div>
  );
};