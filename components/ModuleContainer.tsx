import React from 'react';

interface ModuleContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onBack?: () => void;
  contentMaxWidth?: 'max-w-4xl' | 'max-w-6xl';
}

export const ModuleContainer: React.FC<ModuleContainerProps> = ({ title, description, children, onBack, contentMaxWidth = 'max-w-4xl' }) => {
  return (
    <div className="w-full animate-fade-in">
      {/* Header section is full-width relative to the padded main area */}
      <div className="text-center border-b border-warm-gray-200 pb-6 mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-warm-gray-800 tracking-tight">{title}</h1>
        <p className="text-warm-gray-600 mt-2 text-md sm:text-lg">{description}</p>
      </div>

      {/* Content area is centered */}
      <div className={`${contentMaxWidth} mx-auto`}>
        {onBack && (
          <div className="mb-6">
            <button 
              onClick={onBack} 
              className="text-sm text-primary-green hover:text-primary-green-dark font-semibold flex items-center gap-1 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Terug naar overzicht</span>
            </button>
          </div>
        )}
        <div className="min-h-[400px]">
          {children}
        </div>
      </div>
    </div>
  );
};