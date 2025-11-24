import React, { useState, useEffect } from 'react';
import { getCustomApiKey, saveCustomApiKey, removeCustomApiKey } from '../services/storageService';
import { LockClosedIcon, CheckCircleIcon, XCircleIcon } from './IconComponents';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const storedKey = getCustomApiKey();
            if (storedKey) {
                setApiKey(storedKey);
                setIsSaved(true);
            } else {
                setApiKey('');
                setIsSaved(false);
            }
        }
    }, [isOpen]);

    const handleSave = () => {
        if (apiKey.trim()) {
            saveCustomApiKey(apiKey.trim());
            setIsSaved(true);
            setTimeout(onClose, 1000);
        }
    };

    const handleRemove = () => {
        removeCustomApiKey();
        setApiKey('');
        setIsSaved(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6 animate-slide-in-up">
                <div className="flex items-center space-x-3 border-b border-warm-gray-200 pb-4">
                    <div className="bg-primary-green-light p-2 rounded-full">
                        <LockClosedIcon className="w-6 h-6 text-primary-green-dark" />
                    </div>
                    <h2 className="text-xl font-bold text-warm-gray-800">Persoonlijke API Sleutel</h2>
                </div>

                <div className="space-y-4">
                    <p className="text-warm-gray-600 text-sm">
                        Als je vaak de melding "Server druk bezet" krijgt, kun je je eigen gratis Google Gemini API key invoeren. Hiermee omzeil je de wachtrij.
                    </p>
                    
                    <div className="bg-warm-gray-50 p-4 rounded-lg text-xs text-warm-gray-600 border border-warm-gray-200">
                        <strong>Hoe kom ik aan een sleutel?</strong>
                        <ol className="list-decimal ml-4 mt-1 space-y-1">
                            <li>Ga naar <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-green font-bold underline">Google AI Studio</a>.</li>
                            <li>Log in met een Google-account.</li>
                            <li>Klik op "Create API key".</li>
                            <li>Kopieer de sleutel en plak hem hieronder.</li>
                        </ol>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-warm-gray-700 mb-1">API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Plak je key hier..."
                            className="w-full p-3 border border-warm-gray-300 rounded-xl focus:ring-2 focus:ring-primary-green focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex space-x-3 pt-2">
                    {isSaved ? (
                        <button
                            onClick={handleRemove}
                            className="flex-1 py-3 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <XCircleIcon className="w-5 h-5"/> Verwijder Sleutel
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-warm-gray-200 text-warm-gray-700 font-bold rounded-xl hover:bg-warm-gray-300 transition-colors"
                        >
                            Annuleren
                        </button>
                    )}
                    
                    <button
                        onClick={handleSave}
                        disabled={!apiKey.trim() || (isSaved && apiKey === getCustomApiKey())}
                        className="flex-1 py-3 bg-primary-green text-white font-bold rounded-xl hover:bg-primary-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                       {isSaved ? <><CheckCircleIcon className="w-5 h-5"/> Opgeslagen</> : 'Opslaan'}
                    </button>
                </div>
            </div>
        </div>
    );
};