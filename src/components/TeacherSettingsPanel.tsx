import React, { useState, useCallback } from 'react';
import { getFrameworks, saveFrameworks } from '../services/reportService';
import { useAppContext } from '../AppContext';

const TEACHER_CONFIGURABLE_SKILLS = [
    // Onderdeel 1
    "Open vragen stellen",
    "Parafraseren",
    "Gevoelsreflectie",
    "Samenvatten",
    // Onderdeel 2 (LSD)
    "Luister-signaal",
    "Doorvragen",
    "Actief luisteren", // Meta-skill gebruikt in eindtoetsen
    // Onderdeel 3
    "Hulpvraag Verhelderen",
];

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
        <p