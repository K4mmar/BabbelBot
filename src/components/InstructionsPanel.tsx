import React, { useState, useEffect } from 'react';
import type { Settings } from '../types';
import { SKILL_INSTRUCTIONS, LEARNING_GOALS } from '../constants';
import { useAppContext } from '../AppContext';

interface InstructionsPanelProps {
  onStartChat: (learningGoal: string) => void;
}

export const InstructionsPanel: React.FC<InstructionsPanelProps> = ({ onStartChat }) => {
  const { state } = useAppContext();
  const { settings } = state;
  const [selectedGoal, setSelectedGoal] = useState('');
  
  // This check is important because settings can be null during state transitions
  if (!settings) return null;

  const instruction = SKILL_INSTRUCTIONS[settings.skill];
  const goals = LEARNING_GOALS[settings.skill] || [];

  useEffect(() => {
    // Pre-select the first goal if available
    if (goals.length > 0) {
      setSelectedGoal(goals[0]);
    }
  }, [settings.skill]);

  if (settings.skill === "Hulpvraag Verhelderen") {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in text-center">
        <div>
          <h1 className="text-3xl font-bold text-warm-gray-800">Missie: Hulpvraag Verhelderen</h1>
          <p className="text-warm-gray-600 mt-2">Je staat op het punt een gesprek te beginnen met een nieuwe cliënt.</p>
        </div>
        
        <div className="bg-primary-green-light border-l-4 border-primary-green p-6 rounded-r-xl text-left">
          <h2 className="text-lg font-semibold text-primary-green-dark mb-2">Jouw Opdracht:</h2>
          <p className="text-warm-gray-700">
            De cliënt heeft een probleem, maar kan dit nog niet helder verwoorden. Jouw taak is om binnen <strong>10 gespreksbeurten van jou</strong> de kern van de hulpvraag te achterhalen. Gebruik de gesprekstechnieken die je hebt geleerd om het gesprek te sturen en te verdiepen.
          </p>
          <p className="text-warm-gray-700 mt-2">
            Na 10 beurten van jou stopt het gesprek automatisch en ontvang je een eindbeoordeling.
          </p>
        </div>

        <button
          onClick={() => onStartChat("Verhelder de hulpvraag binnen 10 beurten.")}
          className="w-full max-w-xs mx-auto p-4 bg-primary-green text-white font-bold rounded-xl hover:bg-primary-green-dark transition-transform transform hover:scale-105"
        >
          Start Gesprek
        </button>
      </div>
    );
  }

  if (!instruction) {
    return (
      <div className="w-full max-w-lg mx-auto text-center">
        <h1 className="text-2xl font-bold text-red-600">Fout</h1>
        <p className="text-warm-gray-600 mt-2">Instructies voor "{settings.skill}" konden niet worden gevonden.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-warm-gray-800">{instruction.title}</h1>
        <p className="text-warm-gray-600 mt-2">{instruction.description}</p>
      </div>
      
      <div className="bg-primary-green-light border-l-4 border-primary-green p-4 rounded-r-lg">
        <h2 className="text-lg font-semibold text-primary-green-dark mb-2">Tips voor toepassing:</h2>
        <ul className="list-disc list-inside space-y-1 text-warm-gray-700">
          {instruction.tips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <label htmlFor="learning-goal" className="block text-sm font-medium text-warm-gray-700">Kies je leerdoel voor dit gesprek:</label>
        <select
          id="learning-goal"
          value={selectedGoal}
          onChange={(e) => setSelectedGoal(e.target.value)}
          className="w-full p-3 bg-white border border-warm-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-lime transition text-warm-gray-900"
        >
          {goals.map(goal => (
            <option key={goal} value={goal}>{goal}</option>
          ))}
        </select>
      </div>

      <button
        onClick={() => onStartChat(selectedGoal)}
        disabled={!selectedGoal}
        className="w-full p-4 bg-primary-green text-white font-bold rounded-xl hover:bg-primary-green-dark disabled:bg-warm-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
      >
        Start Gesprek
      </button>
    </div>
  );
};