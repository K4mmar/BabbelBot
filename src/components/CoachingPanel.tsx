import React, { useState } from 'react';
import type { TechniqueFeedback, SkillAssessmentLevel } from '../types';
import { ClipboardCheckIcon, LightBulbIcon, AcademicCapIcon, QuestionMarkCircleIcon, ChevronDownIcon } from './IconComponents';
import { SKILL_INSTRUCTIONS } from '../constants';
import { DynamicCoachingPanel } from './DynamicCoachingPanel';

type TrainerPhase = 'intro' | 'action' | 'feedback' | 'completion';
type MiniCaseMode = 'selection' | 'guided' | 'independent' | 'test' | 'report';

const assessmentDisplayStyles: { [key in SkillAssessmentLevel]: { container: string; text: string } } = {
    "Goed": { container: 'bg-emerald-50 border-emerald-400', text: 'text-emerald-800' },
    "Voldoende": { container: 'bg-amber-50 border-amber-400', text: 'text-amber-800' },
    "Onvoldoende": { container: 'bg-red-50 border-red-400', text: 'text-red-800' }
};

interface CoachingPanelProps {
  phase: TrainerPhase;
  feedback: TechniqueFeedback | null;
  isLoading: boolean;
  scenario: any; // Type for MINI_CASE_SCENARIO
  currentStepIndex: number;
  onStart: () => void;
  onSendMessage: (response: string) => void;
  onBack: () => void;
  mode: MiniCaseMode;
  progress?: { current: number; total: number };
  onCoachRequest?: () => void;
  coachAdvice?: string | null;
  coachUsed?: boolean;
  guidedSubSkill?: 'L' | 'S' | 'D';
  guidedAttempts?: number;
  guidedFeedback?: TechniqueFeedback | null;
  onGuidedSubmit?: (responseText: string) => void;
  onNextChallenge?: () => void;
  lastClientStatement?: string;
}

const Accordion: React.FC<{
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}> = ({ title, children, isOpen, onToggle }) => (
    <div>
        <h2>
            <button
                type="button"
                className="flex items-center justify-between w-full py-2 font-semibold text-left text-gray-700 hover:text-gray-900 transition-colors"
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <span>{title}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
        </h2>
        {isOpen && (
             <div className="pt-2 pb-4 animate-fade-in-fast">
                {children}
            </div>
        )}
    </div>
);


// Internal component for Guided Practice UI
const GuidedPracticeView: React.FC<{
    subSkill: 'L' | 'S' | 'D';
    feedback: TechniqueFeedback | null;
    isLoading: boolean;
    onNext: () => void;
    onCoachRequest: () => void;
    coachAdvice: string | null;
    coachUsed: boolean;
    lastClientStatement?: string;
}> = ({ subSkill, feedback, isLoading, onNext, onCoachRequest, coachAdvice, coachUsed, lastClientStatement }) => {
    const [isInstructionsVisible, setIsInstructionsVisible] = useState(false);

    const subSkillInfo = {
        'L': { title: 'Luister-signaal', description: "Jouw taak is om een kort luister-signaal te geven. De AI beoordeelt je reactie op: 1. Is het een kort signaal (bv. 'Oké', 'Hmm-hmm')? 2. Is het puur een erkenning, zonder eigen mening, advies of vraag?" },
        'S': { title: 'Samenvatten', description: "Jouw taak is om de kern van de boodschap van de cliënt samen te vatten. De AI beoordeelt je samenvatting op: 1. Is de samenvatting beknopt en in eigen woorden? 2. Is de samenvatting neutraal en vrij van oordeel of interpretatie? 3. Dekt het de essentie van wat de cliënt zei?" },
        'D': { title: 'Doorvragen', description: "Jouw taak is om een verdiepende, open vraag te stellen. De AI beoordeelt je vraag op: 1. Is de vraag open (begint met Wat, Hoe, Welke, etc.)? 2. Nodigt de vraag uit tot exploratie en is deze niet sturend? 3. Vloeit de vraag logisch voort uit de boodschap van de cliënt?" }
    };
    const currentSkillInfo = subSkillInfo[subSkill];
    
    const getGuidedInstructionText = (skill: 'L' | 'S' | 'D') => {
        switch (skill) {
            case 'L':
                return 'Geef een kort, bevestigend luister-signaal om te tonen dat je luistert.';
            case 'S':
                return 'Vat de kern van de boodschap van de cliënt kort en in eigen woorden samen.';
            case 'D':
                return 'Stel een open vraag die aansluit bij wat de cliënt zojuist heeft verteld.';
        }
    };


    return (
        <div className="space-y-4">
            {lastClientStatement && !feedback && (
                <div className="space-y-2">
                    <h2 className="font-semibold text-gray-700">Jouw Opdracht</h2>
                    <p className="text-gray-600 text-sm">{getGuidedInstructionText(subSkill)}</p>
                </div>
            )}

            <Accordion title="Instructies" isOpen={isInstructionsVisible} onToggle={() => setIsInstructionsVisible(!isInstructionsVisible)}>
                <p className="text-gray-600">{currentSkillInfo.description}</p>
            </Accordion>
            
            {feedback ? (
                <div className="space-y-4">
                    <div className={`p-4 rounded-lg border-l-4 animate-fade-in ${assessmentDisplayStyles[feedback.assessment].container}`}>
                        <h3 className={`text-lg font-semibold ${assessmentDisplayStyles[feedback.assessment].text}`}>{feedback.assessment}</h3>
                        <p className="text-gray-700 mt-1">{feedback.feedback}</p>
                    </div>
                    <button 
                        onClick={onNext} 
                        disabled={isLoading}
                        className="w-full p-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400"
                    >
                        {isLoading ? 'Laden...' : 'Volgende uitdaging →'}
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {coachAdvice && (
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg flex items-start space-x-3 animate-fade-in">
                            <LightBulbIcon className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-amber-800">Tip van de coach:</h3>
                                <p className="text-amber-700">{coachAdvice}</p>
                            </div>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={onCoachRequest}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 disabled:bg-gray-400 transition-colors"
                        disabled={isLoading || coachUsed}
                    >
                        <QuestionMarkCircleIcon className="w-5 h-5"/> Vraag de coach om een tip
                    </button>
                </div>
            )}
        </div>
    );
};


export const CoachingPanel: React.FC<CoachingPanelProps> = ({
  phase,
  isLoading,
  scenario,
  currentStepIndex,
  onStart,
  onSendMessage,
  onBack,
  mode,
  progress,
  onCoachRequest,
  coachAdvice,
  coachUsed,
  guidedSubSkill,
  guidedAttempts,
  guidedFeedback,
  onNextChallenge,
  lastClientStatement,
}) => {
    const [isInstructionsVisible, setIsInstructionsVisible] = useState(true);
    
  let title = "LSD Oefening";
  let progressNode: React.ReactNode = null;
  let contentNode: React.ReactNode = null;

  const subSkillInfo = {
    'L': { title: 'Luister-signaal', description: "Jouw taak is om een kort luister-signaal te geven. De AI beoordeelt je reactie op: 1. Is het een kort signaal (bv. 'Oké', 'Hmm-hmm')? 2. Is het puur een erkenning, zonder eigen mening, advies of vraag?" },
    'S': { title: 'Samenvatten', description: "Jouw taak is om de kern van de boodschap van de cliënt samen te vatten. De AI beoordeelt je samenvatting op: 1. Is de samenvatting beknopt en in eigen woorden? 2. Is de samenvatting neutraal en vrij van oordeel of interpretatie? 3. Dekt het de essentie van wat de cliënt zei?" },
    'D': { title: 'Doorvragen', description: "Jouw taak is om een verdiepende, open vraag te stellen. De AI beoordeelt je vraag op: 1. Is de vraag open (begint met Wat, Hoe, Welke, etc.)? 2. Nodigt de vraag uit tot exploratie en is deze niet sturend? 3. Vloeit de vraag logisch voort uit de boodschap van de cliënt?" }
  };

  if (phase === 'intro') {
      if (mode === 'guided' && guidedSubSkill) {
          title = subSkillInfo[guidedSubSkill].title;
          const currentSkillInfo = subSkillInfo[guidedSubSkill];
          contentNode = (
              <div className="space-y-4">
                  <Accordion title="Instructies" isOpen={isInstructionsVisible} onToggle={() => setIsInstructionsVisible(!isInstructionsVisible)}>
                      <p className="text-gray-600">{currentSkillInfo.description}</p>
                  </Accordion>
                  <div className="pt-2 space-y-3">
                      <button 
                          onClick={onStart} 
                          className="w-full p-4 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-transform transform hover:scale-105"
                      >
                          Start Oefening
                      </button>
                  </div>
              </div>
          );
      } else if (mode !== 'test') { // Do not show for test mode intro, as that's a separate screen
        title = scenario.introduction.title;
        const instruction = SKILL_INSTRUCTIONS["Actief luisteren"]; // LSD instruction
        contentNode = (
            <div className="space-y-4">
                <p className="text-gray-600">{scenario.introduction.description}</p>
                {instruction && (
                    <Accordion title="Bekijk instructies" isOpen={isInstructionsVisible} onToggle={() => setIsInstructionsVisible(!isInstructionsVisible)}>
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-800 pt-2">Tips voor de LSD-methode:</h3>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 bg-emerald-50 p-3 rounded-md">
                                {instruction.tips.map((tip, index) => <li key={index}>{tip}</li>)}
                            </ul>
                        </div>
                    </Accordion>
                )}
                <div className="pt-2 space-y-3">
                    <button 
                        onClick={onStart} 
                        className="w-full p-4 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-transform transform hover:scale-105"
                    >
                        Start Oefening
                    </button>
                </div>
            </div>
        );
      }
  } else if (phase === 'completion') {
      title = scenario.completion.title;
      progressNode = <ClipboardCheckIcon className="w-10 h-10 text-emerald-500" />;
      contentNode = (
         <div className="text-center space-y-4">
            <p className="text-gray-600 max-w-xl mx-auto">{scenario.completion.description}</p>
             <button onClick={onBack} className="w-full max-w-xs p-4 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors mt-4">
                Afronden
            </button>
        </div>
      );
  } else if (phase === 'action') {
      if (mode === 'guided' && guidedSubSkill && onNextChallenge && onCoachRequest && guidedAttempts !== undefined) {
          title = subSkillInfo[guidedSubSkill].title;
          progressNode = (
              <>
                <p className="font-semibold text-gray-500 text-sm">Voortgang</p>
                <p className="text-2xl font-bold text-emerald-600">{guidedAttempts} / 3</p>
              </>
          );
          contentNode = (
            <GuidedPracticeView
                subSkill={guidedSubSkill}
                feedback={guidedFeedback}
                isLoading={isLoading}
                onNext={onNextChallenge}
                onCoachRequest={onCoachRequest}
                coachAdvice={coachAdvice}
                coachUsed={coachUsed!}
                lastClientStatement={lastClientStatement}
            />
          );
      } else if (mode === 'independent' && progress) {
          title = 'Zelfstandige Oefening';
          progressNode = (
             <>
                <p className="font-semibold text-gray-500 text-sm">Stap</p>
                <p className="text-2xl font-bold text-emerald-600">{progress.current} / {progress.total}</p>
              </>
          );
          const instruction = SKILL_INSTRUCTIONS["Actief luisteren"];
          contentNode = (
            <div className="space-y-4">
                 {lastClientStatement && (
                    <div className="space-y-2">
                        <h2 className="font-semibold text-gray-700">Jouw Opdracht</h2>
                        <p className="text-gray-600 text-sm">Pas de LSD-methode toe: geef een Luister-signaal, vat Samen en Vraag door in één enkele reactie.</p>
                    </div>
                )}
                {instruction && (
                    <Accordion title="Instructies" isOpen={isInstructionsVisible} onToggle={() => setIsInstructionsVisible(!isInstructionsVisible)}>
                        <div className="space-y-3">
                            <p className="text-gray-700">{instruction.description}</p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 bg-emerald-50 p-3 rounded-md">
                                {instruction.tips.map((tip, index) => <li key={index}>{tip}</li>)}
                            </ul>
                        </div>
                    </Accordion>
                )}
            </div>
          );
      } else if (mode === 'test' && progress) {
          title = 'Eindtoets';
          progressNode = (
             <>
                <p className="font-semibold text-gray-500 text-sm">Vraag</p>
                <p className="text-2xl font-bold text-emerald-600">{progress.current} / {progress.total}</p>
              </>
          );
          contentNode = (
            <div className="space-y-4 text-center">
                <h2 className="text-lg font-bold text-amber-600 bg-amber-100 p-4 rounded-lg shadow-inner">Opdracht</h2>
                <p className="text-xl font-semibold text-gray-700">
                    Pas de LSD-methode toe:
                </p>
                <p className="text-2xl font-bold text-emerald-700 animate-pulse">
                    Luisteren, Samenvatten, Doorvragen
                </p>
            </div>
          );
      }
  }

  return (
      <DynamicCoachingPanel title={title} progress={progressNode}>
          {contentNode}
      </DynamicCoachingPanel>
  );
};