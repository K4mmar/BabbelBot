
import React, { useState, useCallback } from 'react';
import { CONVERSATIONAL_SKILLS } from '../constants';
import { getFrameworks, saveFrameworks } from '../services/reportService';
import { useAppContext } from '../AppContext';

const TEACHER_CONFIGURABLE_SKILLS = [...CONVERSATIONAL_SKILLS, "Hulpvraag Verhelderen"];

export const TeacherSettingsPanel: React.FC = () => {
  const { dispatch } = useAppContext();
  const [selectedSkill, setSelectedSkill] = useState(TEACHER_CONFIGURABLE_SKILLS[0]);
  const [allFrameworks, setAllFrameworks] = useState<Record<string, string>>(() => getFrameworks());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [copyAllStatus, setCopyAllStatus] = useState<'idle' | 'copied'>('idle');

  const onBack = () => dispatch({ type: 'NAVIGATE', payload: 'dashboard' });

  const handleFrameworkTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setAllFrameworks(prev => ({ ...prev, [selectedSkill]: newText }));
  };
  
  const handleSave = useCallback(() => {
    setSaveStatus('saving');
    saveFrameworks(allFrameworks);
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  }, [allFrameworks]);

  const allFrameworksText = `// Dit bestand bevat de huidige, opgeslagen feedbackkaders.
// Kopieer de inhoud van dit bestand om de instellingen te back-uppen of over te zetten.

export const FEEDBACK_FRAMEWORKS: Record<string, string> = ${JSON.stringify(allFrameworks, null, 2)};`;

  const handleCopyAll = useCallback(() => {
    navigator.clipboard.writeText(allFrameworksText).then(() => {
        setCopyAllStatus('copied');
        setTimeout(() => setCopyAllStatus('idle'), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Kopiëren naar klembord is mislukt.');
    });
  }, [allFrameworksText]);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-warm-gray-800">Docentinstellingen</h1>
        <p className="text-warm-gray-600 mt-2">Pas de AI-feedbackkaders aan de leerdoelen van de opleiding aan. Wijzigingen worden lokaal opgeslagen in de browser.</p>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-warm-gray-700 border-b pb-2">Feedback Kader Bewerken</h2>
        <div>
          <label htmlFor="skill-select" className="block text-sm font-medium text-warm-gray-700 mb-1">
            Kies een vaardigheid om aan te passen
          </label>
          <select
            id="skill-select"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="w-full p-3 bg-white border border-warm-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-lime transition text-warm-gray-900"
          >
            {TEACHER_CONFIGURABLE_SKILLS.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="framework-text" className="block text-sm font-medium text-warm-gray-700 mb-1">
            Instructie voor de AI Coach
          </label>
          <textarea
            id="framework-text"
            rows={10}
            value={allFrameworks[selectedSkill] || ''}
            onChange={handleFrameworkTextChange}
            placeholder={`Beschrijf hier hoe de AI de toepassing van de vaardigheid moet beoordelen...`}
            className="w-full p-3 rounded-xl border border-warm-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-lime transition"
          />
          <p className="text-xs text-warm-gray-500 mt-1">
            Deze instructie stuurt de feedback die studenten ontvangen. Wees zo specifiek mogelijk.
          </p>
        </div>
        <div className="flex pt-2">
            <button
              onClick={handleSave}
              className="w-full p-3 bg-primary-green text-white font-bold rounded-xl hover:bg-primary-green-dark transition-all transform hover:scale-105 disabled:bg-warm-gray-400"
            >
              {saveStatus === 'saved' ? 'Opgeslagen!' : 'Wijzigingen Opslaan'}
            </button>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h2 className="text-xl font-semibold text-warm-gray-700">Instellingen Beheren</h2>
        <p className="text-sm text-warm-gray-600">
          Hieronder staat de code voor je <strong>huidige</strong>, opgeslagen instellingen. Kopieer deze code om een back-up te maken of om je configuratie te delen.
        </p>
        <div className="bg-warm-gray-800 text-white p-4 rounded-xl relative font-mono text-sm max-h-64 overflow-auto">
          <button
            onClick={handleCopyAll}
            className="absolute top-3 right-3 bg-warm-gray-600 hover:bg-warm-gray-500 text-white font-semibold py-1 px-3 rounded-md text-xs transition-colors z-10 sticky"
          >
            {copyAllStatus === 'copied' ? 'Gekopieerd!' : 'Kopieer Code'}
          </button>
          <pre><code>{allFrameworksText}</code></pre>
        </div>
      </div>

      <button onClick={onBack} className="w-full mt-6 p-3 bg-warm-gray-200 text-warm-gray-700 font-bold rounded-xl hover:bg-warm-gray-300 transition-colors">
        Terug naar Dashboard
      </button>
    </div>
  );
};
