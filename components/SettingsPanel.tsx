import React, { useState, useEffect } from 'react';
import type { Settings } from '../types';
import { FIELDS_OF_WORK, CASE_STUDIES, CONVERSATIONAL_SKILLS } from '../constants';

interface SettingsPanelProps {
  onStart: (settings: Settings) => void;
}

const SelectInput: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  disabled?: boolean;
}> = ({ label, value, onChange, options, disabled = false }) => (
    <div className="w-full">
        <label htmlFor={label} className="block text-sm font-medium text-warm-gray-700 mb-1">{label}</label>
        <select
            id={label}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full p-3 bg-white border border-warm-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-lime transition text-warm-gray-900"
        >
            <option value="" disabled>{disabled ? '...' : `Kies een ${label.toLowerCase()}`}</option>
            {options.map(option => (
                <option key={option} value={option}>{option}</option>
            ))}
        </select>
    </div>
);

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onStart }) => {
  const [field, setField] = useState(FIELDS_OF_WORK[0]);
  const [caseOptions, setCaseOptions] = useState<string[]>([]);
  const [selectedCase, setSelectedCase] = useState('');
  const [skill, setSkill] = useState(CONVERSATIONAL_SKILLS[0]);

  useEffect(() => {
    if (field) {
      const newCaseOptions = CASE_STUDIES[field] || [];
      setCaseOptions(newCaseOptions);
      setSelectedCase(newCaseOptions[0] || '');
    } else {
      setCaseOptions([]);
      setSelectedCase('');
    }
  }, [field]);
  
  const handleStart = () => {
    if (field && selectedCase && skill) {
      onStart({ field, case: selectedCase, skill });
    }
  };

  const isFormValid = field && selectedCase && skill;

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-warm-gray-800">Gesprekspartner</h1>
        <p className="text-warm-gray-600 mt-2">Stel je oefenscenario in om te beginnen.</p>
      </div>
      
      <div className="space-y-4">
        <SelectInput 
            label="Werkveld"
            value={field}
            onChange={(e) => setField(e.target.value)}
            options={FIELDS_OF_WORK}
        />
        <SelectInput 
            label="Casus"
            value={selectedCase}
            onChange={(e) => setSelectedCase(e.target.value)}
            options={caseOptions}
            disabled={!field}
        />
        <SelectInput 
            label="Gespreksvaardigheid"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            options={CONVERSATIONAL_SKILLS}
        />
      </div>

      <button
        onClick={handleStart}
        disabled={!isFormValid}
        className="w-full p-4 bg-primary-green text-white font-bold rounded-xl hover:bg-primary-green-dark disabled:bg-warm-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
      >
        Start Oefening
      </button>
    </div>
  );
};