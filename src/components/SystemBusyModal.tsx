
import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { saveCustomApiKey } from '../services/storageService';

export const SystemBusyModal: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState('');

  if (!state.isSystemBusy) return null;

  const handleSaveKey = () => {
      if (apiKey.trim()) {
          saveCustomApiKey(apiKey.trim());
          dispatch({ type: 'SET_SYSTEM_BUSY', payload: false });
          // Ideally trigger a retry here, but closing allows user to just click 'send' again which works nicely
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-warm-gray-900 bg-opacity-80 p-4 animate-fade-in backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center border-4 border-amber-400 animate-slide-in-up">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-amber-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-warm-gray-800 mb-2">Het is erg druk...</h2>
        <p className="text-warm-gray-600 mb-6">
          De gratis capaciteit van de AI-coach wordt momenteel overschreden door het aantal gebruikers.
        </p>

        {!showKeyInput ? (
            <div className="space-y-3">
                <button
                  onClick={() => dispatch({ type: 'SET_SYSTEM_BUSY', payload: false })}
                  className="w-full py-3 px-6 bg-warm-gray-200 text-warm-gray-800 font-bold rounded-xl hover:bg-warm-gray-300 transition-colors"
                >
                  Ik probeer het zo opnieuw
                </button>
                <button 
                    onClick={() => setShowKeyInput(true)}
                    className="text-primary-green font-semibold text-sm hover:underline"
                >
                    Ik wil niet wachten (gebruik eigen sleutel)
                </button>
            </div>
        ) : (
            <div className="space-y-4 text-left bg-warm-gray-50 p-4 rounded-xl">
                <p className="text-xs text-warm-gray-600">
                    Voer je eigen gratis Google Gemini API key in om de wachtrij te omzeilen.
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-green underline ml-1">Haal hem hier op.</a>
                </p>
                <input
                    type="text" // Not password here for easier copy-paste visibility in emergency
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Plak je API key hier..."
                    className="w-full p-3 border border-warm-gray-300 rounded-xl focus:ring-2 focus:ring-primary-green focus:outline-none"
                />
                <button
                  onClick={handleSaveKey}
                  disabled={!apiKey.trim()}
                  className="w-full py-3 px-6 bg-primary-green text-white font-bold rounded-xl hover:bg-primary-green-dark transition-colors disabled:opacity-50"
                >
                  Opslaan en Doorgaan
                </button>
                 <button 
                    onClick={() => setShowKeyInput(false)}
                    className="w-full text-center text-warm-gray-500 text-xs hover:text-warm-gray-800"
                >
                    Annuleren
                </button>
            </div>
        )}
      </div>
    </div>
  );
};