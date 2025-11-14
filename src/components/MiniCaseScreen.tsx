import React, { useState, useEffect, useCallback } from 'react';
import { PhoneFrame } from './PhoneFrame';
import { ChatScreen } from './ChatScreen';
import { CoachingPanel } from './CoachingPanel';
import { getDynamicClientResponse, getBulkMiniCaseFeedback, getChallengeBatch, getLSDComponentFeedback, getCoachingTip, getAIResponseForLSDTest, getInitialMessage } from '../services/geminiService';
import { saveReport } from '../services/reportService';
import type { Message, TechniqueFeedback, TestResultDetail, SkillAssessmentLevel, MiniCaseTestAnswer, LSDTrainingStep, Settings } from '../types';
import { MINI_CASE_SCENARIOS, MINI_CASE_RUBRIC, LSD_TRAINING_PROGRAM } from '../constants';
import { LightBulbIcon, ClipboardCheckIcon, AcademicCapIcon, LockClosedIcon, LockOpenIcon } from './IconComponents';
import { useAppContext } from '../AppContext';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

type TrainerPhase = 'intro' | 'action' | 'feedback' | 'completion';
type MiniCaseMode = 'guided' | 'independent' | 'test';

const GUIDED_TRAINING_PROGRAM = [
    { skill: 'L', title: 'Luister-signaal Geven', description: 'Oefen met het geven van korte, bevestigende signalen.', goal: 3 },
    { skill: 'S', title: 'Samenvatten', description: 'Oefen met de kern van de boodschap teruggeven.', goal: 3 },
    { skill: 'D', title: 'Doorvragen', description: 'Oefen met het stellen van open vragen die verdiepen.', goal: 3 },
];

type GuidedLevel = (typeof GUIDED_TRAINING_PROGRAM)[0];

export const MiniCaseScreen: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { userName, userRole, userKey, clientName, activeLSDStep: startStep } = state;

  const [mode, setMode] = useState<MiniCaseMode | null>(null);
  const [phase, setPhase] = useState<TrainerPhase>('intro');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [scenario, setScenario] = useState(MINI_CASE_SCENARIOS[0]);
  
  const [testAnswers, setTestAnswers] = useState<MiniCaseTestAnswer[]>([]);

  const [coachAdvice, setCoachAdvice] = useState<string | null>(null);
  const [coachUsed, setCoachUsed] = useState<boolean>(false);
  
  const [lsdProgress, setLsdProgress] = useState(0);
  const [selectedGuidedLevel, setSelectedGuidedLevel] = useState<GuidedLevel | null>(null);
  const [guidedAttempts, setGuidedAttempts] = useState(0);
  const [guidedFeedback, setGuidedFeedback] = useState<TechniqueFeedback | null>(null);
  const [completionData, setCompletionData] = useState<{title: string; description: string} | null>(null);

  const [challengeBatch, setChallengeBatch] = useState<string[]>([]);
  const [challengeIndex, setChallengeIndex] = useState(0);
  
  const [isTestInstructionsVisible, setIsTestInstructionsVisible] = useState(false);

  const storageKey = `lsdMethodProgress_${userName}_${userRole}`;

  const onComplete = () => dispatch({ type: 'NAVIGATE', payload: 'onderdeel2' });

  useEffect(() => {
    const savedProgress = localStorage.getItem(storageKey);
    if (savedProgress) {
        setLsdProgress(JSON.parse(savedProgress));
    }
  }, [storageKey]);

  const saveLsdProgress = useCallback((newProgress: number) => {
      setLsdProgress(newProgress);
      localStorage.setItem(storageKey, JSON.stringify(newProgress));
  }, [storageKey]);

  const addMessage = useCallback((sender: 'client' | 'user', text: string, nonVerbalCue?: string) => {
    const newMessage: Message = {
      id: generateId(),
      sender,
      text,
      timestamp: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
      nonVerbalCue: sender === 'client' ? nonVerbalCue : undefined,
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);
  
  const startMode = useCallback((step: LSDTrainingStep) => {
    const { type, skill } = step;

    setMessages([]);
    setTestAnswers([]);
    setCompletionData(null);
    setCoachAdvice(null);
    setCoachUsed(false);
    
    if (type === 'guided') {
      const levelToStart = GUIDED_TRAINING_PROGRAM.find(l => l.skill === skill);
      if (levelToStart) {
        setMode('guided');
        setSelectedGuidedLevel(levelToStart);
        setGuidedAttempts(0);
        setGuidedFeedback(null);
        setPhase('intro');
      }
    } else if (type === 'independent') {
      const randomScenario = MINI_CASE_SCENARIOS[Math.floor(Math.random() * MINI_CASE_SCENARIOS.length)];
      setScenario(randomScenario);
      setCurrentStepIndex(0);
      setMode('independent');
      setPhase('intro');
    } else if (type === 'test') {
      setMode('test');
      setIsTestInstructionsVisible(true); // Show instructions first
      setPhase('intro');
    }
  }, []);
  
  useEffect(() => {
    if(startStep) {
        startMode(startStep);
    } else {
        setMode(null);
    }
  }, [startStep, startMode]);

  const handleStartActualTest = useCallback(async () => {
    setIsTestInstructionsVisible(false);
    setIsLoading(true);
    setMessages([]);
    setTestAnswers([]);
    const testSettings: Settings = {
        field: "Algemeen Maatschappelijk Werk",
        case: "Een cliënt die zich zorgen maakt over de toekomst.",
        skill: "Actief luisteren",
        learningGoal: "Een verkennend gesprek voeren."
    };
    const initialText = await getInitialMessage(testSettings);
    addMessage('client', initialText, "Kijkt wat onzeker om zich heen.");
    setIsLoading(false);
    setPhase('action');
  }, [addMessage]);
  
  const handleStartPractice = useCallback(async () => {
      setMessages([]);
      setCoachAdvice(null);
      setCoachUsed(false);
      
      if (mode === 'guided' && selectedGuidedLevel) {
          setIsLoading(true);
          const skillForPrompt = selectedGuidedLevel.skill === 'S' ? "Samenvatten" : "Actief luisteren";
          const batch = await getChallengeBatch(skillForPrompt, selectedGuidedLevel.goal + 3);
          setChallengeBatch(batch);
          setChallengeIndex(0);
          if (batch.length > 0) {
              addMessage('client', batch[0]);
          }
          setIsLoading(false);
      } else if (mode === 'independent') {
          const firstStep = scenario.steps[0];
          addMessage('client', firstStep.clientStatement, firstStep.nonVerbalCue);
          setCurrentStepIndex(0);
      }
      setPhase('action');
  }, [addMessage, mode, selectedGuidedLevel, scenario]);

  const handleSendMessage = async (response: string) => {
    addMessage('user', response);
    
    setIsLoading(true);

    const lastClientMessage = messages[messages.length - 1];
    const currentAnswer: MiniCaseTestAnswer = {
        clientStatement: lastClientMessage.text,
        nonVerbalCue: lastClientMessage.nonVerbalCue || '',
        studentResponse: response,
    };
    const updatedAnswers = [...testAnswers, currentAnswer];
    setTestAnswers(updatedAnswers);

    const isTestMode = mode === 'test';
    let endConversation = false;

    if (isTestMode) {
        if (updatedAnswers.length >= 6) {
            endConversation = true;
        }
    } else { // independent mode
        if (currentStepIndex + 1 >= scenario.steps.length) {
            endConversation = true;
        }
    }

    if (endConversation) {
        const results = await getBulkMiniCaseFeedback(updatedAnswers);
        const score = results.filter(r => r.assessment === 'Voldoende' || r.assessment === 'Goed').length;

        const moduleKey = mode === 'test' ? 'onderdeel2_eindtoets' : 'onderdeel2_zelfstandig';
        const title = mode === 'test' ? 'Eindtoets LSD-methode' : `Zelfstandige Oefening: ${scenario.title}`;
        const total = mode === 'test' ? 6 : scenario.steps.length;
        
        saveReport(userKey, moduleKey, title, results, score, total);
        
        const levelInfo = LSD_TRAINING_PROGRAM.find(l => l.type === mode);
        if (levelInfo && lsdProgress < levelInfo.step) {
            saveLsdProgress(levelInfo.step);
        }
        
        dispatch({
            type: 'SET_STRUCTURED_REPORT',
            payload: { title, results, score, total, sourceView: 'onderdeel2' }
        });

    } else {
        const conversationHistory = [...messages, {id: 'temp', sender: 'user', text: response, timestamp: ''} as Message];
        
        let dynamicResponse: { responseText: string, nonVerbalCue: string };

        if (isTestMode) {
            dynamicResponse = await getAIResponseForLSDTest(conversationHistory);
        } else {
             const nextStepIndex = currentStepIndex + 1;
             dynamicResponse = await getDynamicClientResponse(conversationHistory, scenario, nextStepIndex, response);
             setCurrentStepIndex(nextStepIndex);
        }

        addMessage('client', dynamicResponse.responseText, dynamicResponse.nonVerbalCue);
    }
    
    setIsLoading(false);
  };

  const handleCoachRequest = async () => {
    const lastClientMessage = [...messages].reverse().find(m => m.sender === 'client');
    if (!lastClientMessage || isLoading || mode !== 'guided' || !selectedGuidedLevel) return;

    setIsLoading(true);
    setCoachUsed(true);

    const skillMap = {
        'L': 'Actief luisteren',
        'S': 'Parafraseren',
        'D': 'Open vragen stellen'
    };
    const skillToCoach = skillMap[selectedGuidedLevel.skill as 'L'|'S'|'D'];

    const tip = await getCoachingTip(skillToCoach, lastClientMessage.text);
    setCoachAdvice(tip);
    setIsLoading(false);
  };
    
  const handleGuidedSubmit = async (responseText: string) => {
    if (!selectedGuidedLevel) return;

    const lastClientMessage = [...messages].reverse().find(m => m.sender === 'client');
    if (!lastClientMessage) return; 

    addMessage('user', responseText);

    setIsLoading(true);
    const feedbackResult = await getLSDComponentFeedback(selectedGuidedLevel.skill as 'L' | 'S' | 'D', lastClientMessage.text, responseText);
    setGuidedFeedback(feedbackResult);

    const isCorrect = feedbackResult.assessment === 'Voldoende' || feedbackResult.assessment === 'Goed';
    if (isCorrect) {
        setGuidedAttempts(prev => prev + 1);
    }
    setIsLoading(false);
  };

  const handleNextGuidedChallenge = useCallback(async () => {
    setGuidedFeedback(null);
    setCoachAdvice(null);
    setCoachUsed(false);

    if (selectedGuidedLevel && guidedAttempts >= selectedGuidedLevel.goal) {
        const levelInfo = LSD_TRAINING_PROGRAM.find(l => l.skill === selectedGuidedLevel.skill);
        if (levelInfo && lsdProgress < levelInfo.step) {
            saveLsdProgress(levelInfo.step);
        }
        setCompletionData({
            title: `Vaardigheid behaald!`,
            description: `Goed gedaan! Je hebt de vaardigheid "${selectedGuidedLevel.title}" succesvol geoefend.`,
        });
        setPhase('completion');
        return;
    }
    
    const nextIndex = challengeIndex + 1;
    if (nextIndex < challengeBatch.length) {
        setChallengeIndex(nextIndex);
        setMessages([]); // Clear messages for new challenge
        addMessage('client', challengeBatch[nextIndex]);
    } else {
        // Fallback in case we run out of challenges
        console.warn("Ran out of pre-fetched challenges, using a generic one.");
        setMessages([]);
        addMessage('client', "Oké, en wat gebeurde er toen?");
    }
  }, [guidedAttempts, selectedGuidedLevel, lsdProgress, challengeIndex, challengeBatch, addMessage, saveLsdProgress]);

  if (mode === 'test' && isTestInstructionsVisible) {
      return (
            <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <AcademicCapIcon className="w-16 h-16 text-primary-green mx-auto" />
                    <h1 className="text-3xl font-bold text-gray-800 mt-4">Instructies Eindtoets LSD-methode</h1>
                    <p className="text-gray-600 mt-2">Je gaat nu een doorlopend gesprek van 6 beurten voeren. In elke reactie pas je de volledige LSD-techniek (Luisteren, Samenvatten, Doorvragen) toe. Het doel is om het gesprek gaande te houden en de cliënt te helpen zijn verhaal te doen.</p>
                </div>
                <div className="bg-primary-green-light border-l-4 border-primary-green p-4 rounded-r-lg">
                    <h2 className="text-lg font-semibold text-primary-green-dark mb-2">Jouw opdracht:</h2>
                    <p className="text-gray-700">Reageer op elke uitspraak van de cliënt met één bericht dat de volgende drie elementen bevat:</p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-700 font-medium mt-2">
                        <li>Een kort **Luister**-signaal.</li>
                        <li>Een beknopte **Samenvatting** van de kernboodschap.</li>
                        <li>Een open, verdiepende **Doorvraag**.</li>
                    </ol>
                </div>
                <button onClick={handleStartActualTest} className="w-full p-4 bg-primary-green text-white font-bold rounded-lg hover:bg-primary-green-dark transition-transform transform hover:scale-105">
                    Start Toets
                </button>
            </div>
      );
  }

  const renderPracticeScreen = () => {
      const coachingPanelScenario = (phase === 'completion' && completionData)
      ? { ...scenario, completion: completionData }
      : scenario;
      
    const lastClientMessage = [...messages].reverse().find(m => m.sender === 'client');

    const getGuidedPlaceholder = () => {
      if (!selectedGuidedLevel) return "Wacht op de coach...";
      const info = {
          'L': 'Geef een kort luister-signaal...',
          'S': 'Vat de kern samen...',
          'D': 'Stel een open vraag...',
      }[selectedGuidedLevel.skill];
      return info || "Typ je reactie...";
    };
    
      return (
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fade-in">
          <div className="w-full flex justify-center lg:justify-end">
              <PhoneFrame>
                  <ChatScreen
                      messages={messages}
                      isLoading={isLoading}
                      clientName={clientName}
                      onSendMessage={mode === 'guided' ? handleGuidedSubmit : handleSendMessage}
                      isReadOnly={phase === 'completion'}
                      isInputHidden={phase !== 'action'}
                      isInputDisabled={isLoading || (mode === 'guided' && !!guidedFeedback)}
                      inputPlaceholder={mode === 'guided' ? getGuidedPlaceholder() : "Typ je L-S-D reactie..."}
                  />
              </PhoneFrame>
          </div>
          <div className="w-full">
              <CoachingPanel
                  phase={phase}
                  feedback={null}
                  isLoading={isLoading}
                  scenario={coachingPanelScenario}
                  currentStepIndex={currentStepIndex}
                  onStart={handleStartPractice}
                  onSendMessage={handleSendMessage}
                  onBack={onComplete}
                  mode={mode!}
                  progress={
                    mode === 'independent' ? { current: currentStepIndex + 1, total: scenario.steps.length } :
                    mode === 'test' ? { current: testAnswers.length + 1, total: 6 } :
                    undefined
                  }
                  onCoachRequest={handleCoachRequest}
                  coachAdvice={coachAdvice}
                  coachUsed={coachUsed}
                  guidedSubSkill={selectedGuidedLevel?.skill as 'L' | 'S' | 'D' | undefined}
                  guidedAttempts={guidedAttempts}
                  guidedFeedback={guidedFeedback}
                  onGuidedSubmit={handleGuidedSubmit}
                  onNextChallenge={handleNextGuidedChallenge}
                  lastClientStatement={lastClientMessage?.text}
              />
          </div>
      </div>
  )};

  if (!mode || !startStep) {
    return <div className="text-center p-8"><p>Selecteer een oefening om te beginnen.</p></div>;
  }

  return renderPracticeScreen();
};