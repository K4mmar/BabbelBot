
import React, { useState, useEffect } from 'react';
import { LightBulbIcon, ChatBubbleLeftRightIcon, AcademicCapIcon, LockClosedIcon, ClipboardCheckIcon, UserGroupIcon } from './IconComponents';
import { TRAINING_PROGRAM, LSD_TRAINING_PROGRAM, FIELDS_OF_WORK, CASE_STUDIES, CONVERSATIONAL_SKILLS } from '../constants';
import type { TrainingLevel, Settings, LSDTrainingStep } from '../types';
import { useAppContext } from '../AppContext';

// Copied from SettingsPanel to integrate and modify
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


// Part 1: Basistechnieken
export const TechniqueTrainerOverview: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { userRole, userName } = state;
    const onStartLevel = (level: TrainingLevel) => dispatch({ type: 'START_TECHNIQUE_LEVEL', payload: level });

    const [programProgress, setProgramProgress] = useState<number>(0);
    const storageKey = `techniqueTrainerProgress_${userName}_${userRole}`;

    useEffect(() => {
        const savedProgress = localStorage.getItem(storageKey);
        if (savedProgress) {
            setProgramProgress(JSON.parse(savedProgress));
        }
    }, [storageKey]);

    const handleToggleProgress = (e: React.MouseEvent, index: number) => {
        e.stopPropagation(); // Prevent starting the level from the parent button
        if (userRole !== 'docent') return;

        const isCompleted = index < programProgress;
        const newProgress = isCompleted ? index : index + 1;

        setProgramProgress(newProgress);
        localStorage.setItem(storageKey, JSON.stringify(newProgress));
    };

    return (
         <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="space-y-3">
                {TRAINING_PROGRAM.map((level, index) => {
                    const isUnlocked = index <= programProgress;
                    const isCompleted = index < programProgress;
                    return (
                        <div
                            key={level.skill}
                            role="button"
                            tabIndex={isUnlocked ? 0 : -1}
                            onClick={() => { if(isUnlocked) onStartLevel(level) }}
                            onKeyDown={(e) => { if (e.key === 'Enter' && isUnlocked) onStartLevel(level) }}
                            className={`w-full flex items-center justify-between p-4 text-left rounded-xl border-2 transition-all duration-200 transform ${
                                isUnlocked 
                                ? 'bg-white hover:bg-accent-yellow-green-light hover:border-accent-lime cursor-pointer hover:-translate-y-1'
                                : 'bg-warm-gray-100 text-warm-gray-500 cursor-not-allowed'
                            } ${isCompleted ? 'border-primary-green' : 'border-warm-gray-200'}`}
                        >
                            <div>
                                <h3 className="text-lg font-semibold">{index + 1}. {level.skill}</h3>
                                <p className="text-sm text-warm-gray-600">{level.description}</p>
                            </div>
                            <div className="flex-shrink-0">
                                {isCompleted ? (
                                    <button
                                        onClick={(e) => handleToggleProgress(e, index)}
                                        disabled={userRole !== 'docent'}
                                        className={userRole === 'docent' ? 'p-1 rounded-full hover:bg-red-100' : ''}
                                        aria-label="Markeer als onvoltooid"
                                    >
                                        <ClipboardCheckIcon className="w-7 h-7 text-primary-green" />
                                    </button>
                                ) : !isUnlocked ? (
                                    <button
                                        onClick={(e) => handleToggleProgress(e, index)}
                                        disabled={userRole !== 'docent'}
                                        className={userRole === 'docent' ? 'p-1 rounded-full hover:bg-primary-green-light' : ''}
                                        aria-label="Markeer als voltooid"
                                    >
                                        <LockClosedIcon className="w-6 h-6 text-warm-gray-400" />
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Part 2: LSD-methode
export const LSDMethodOverview: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { userRole, userName } = state;
    const onStartStep = (step: LSDTrainingStep) => dispatch({ type: 'START_LSD_STEP', payload: step });

    const [progress, setProgress] = useState<number>(0);
    const storageKey = `lsdMethodProgress_${userName}_${userRole}`;

    useEffect(() => {
        const savedProgress = localStorage.getItem(storageKey);
        if (savedProgress) {
            setProgress(JSON.parse(savedProgress));
        }
    }, [storageKey]);

    const handleToggleProgress = (e: React.MouseEvent, index: number) => {
        e.stopPropagation(); // Prevent starting the level from the parent button
        if (userRole !== 'docent') return;

        const isCompleted = index < progress;
        const newProgress = isCompleted ? index : index + 1;

        setProgress(newProgress);
        localStorage.setItem(storageKey, JSON.stringify(newProgress));
    };

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="space-y-3">
                {LSD_TRAINING_PROGRAM.map((level, index) => {
                    const isUnlocked = index <= progress;
                    const isCompleted = index < progress;
                    return (
                        <div
                            key={level.title}
                            role="button"
                            tabIndex={isUnlocked ? 0 : -1}
                            onClick={() => { if (isUnlocked) onStartStep(level); }}
                            onKeyDown={(e) => { if (e.key === 'Enter' && isUnlocked) onStartStep(level); }}
                            className={`w-full flex items-center justify-between p-4 text-left rounded-xl border-2 transition-all duration-200 transform ${
                                isUnlocked 
                                ? 'bg-white hover:bg-accent-yellow-green-light hover:border-accent-lime cursor-pointer hover:-translate-y-1'
                                : 'bg-warm-gray-100 text-warm-gray-500 cursor-not-allowed'
                            } ${isCompleted ? 'border-primary-green' : 'border-warm-gray-200'}`}
                        >
                            <div>
                                <h3 className="text-lg font-semibold">{level.step}. {level.title}</h3>
                                <p className="text-sm text-warm-gray-600">{level.description}</p>
                            </div>
                            <div className="flex-shrink-0">
                                {isCompleted ? (
                                    <button
                                        onClick={(e) => handleToggleProgress(e, index)}
                                        disabled={userRole !== 'docent'}
                                        className={userRole === 'docent' ? 'p-1 rounded-full hover:bg-red-100' : ''}
                                        aria-label="Markeer als onvoltooid"
                                    >
                                        <ClipboardCheckIcon className="w-7 h-7 text-primary-green" />
                                    </button>
                                ) : !isUnlocked ? (
                                    <button
                                        onClick={(e) => handleToggleProgress(e, index)}
                                        disabled={userRole !== 'docent'}
                                        className={userRole === 'docent' ? 'p-1 rounded-full hover:bg-primary-green-light' : ''}
                                        aria-label="Markeer als voltooid"
                                    >
                                        <LockClosedIcon className="w-6 h-6 text-warm-gray-400" />
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Part 3: Voer het gesprek
export const FullConversationStarter: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const onStart = (settings: Omit<Settings, 'skill'>) => {
      const fullSettings = { ...settings, skill: "Hulpvraag Verhelderen" };
      dispatch({ type: 'PROCEED_TO_INSTRUCTIONS', payload: fullSettings });
    };

    const [field, setField] = useState(FIELDS_OF_WORK[0]);
    const [caseOptions, setCaseOptions] = useState<string[]>([]);
    const [selectedCase, setSelectedCase] = useState('');

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
        if (field && selectedCase) {
            onStart({ field, case: selectedCase });
        }
    };

    const isFormValid = field && selectedCase;

    return (
        <div className="w-full max-w-lg mx-auto space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-warm-gray-800">Gesprekspartner</h1>
                <p className="text-warm-gray-600 mt-2">Kies een doelgroep en casus om de eindopdracht te starten.</p>
            </div>
            
            <div className="space-y-4">
                <SelectInput 
                    label="Doelgroep (Werkveld)"
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
            </div>

            <button
                onClick={handleStart}
                disabled={!isFormValid}
                className="w-full p-4 bg-primary-green text-white font-bold rounded-xl hover:bg-primary-green-dark disabled:bg-warm-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
            >
                Start Eindopdracht
            </button>
        </div>
    );
};
