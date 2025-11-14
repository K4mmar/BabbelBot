import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TRAINING_PROGRAM, SKILL_INSTRUCTIONS, TEST_RUBRIC } from '../constants';
import { getChallengeBatch, getTechniqueFeedback, getBulkTechniqueFeedback, getCoachingTip, getAIResponseForTest, getPersonalizedTestSequence, getInitialMessage } from '../services/geminiService';
import { saveReport } from '../services/storageService';
import type { TechniqueFeedback, TrainingLevel, TestResultDetail, SkillAssessmentLevel, Settings, Message } from '../types';
import { 
    LockClosedIcon, 
    ClipboardCheckIcon, 
    ChevronDownIcon,
    SendIcon,
    QuestionMarkCircleIcon,
    LightBulbIcon,
    CheckCircleIcon,
    AcademicCapIcon,
    EyeIcon
} from './IconComponents';
import { PhoneFrame } from './PhoneFrame';
import { DynamicCoachingPanel } from './DynamicCoachingPanel';
import { useAppContext } from '../AppContext';

const TEST_SKILL_SEQUENCE = ['Open vragen stellen', 'Parafraseren', 'Gevoelsreflectie', 'Samenvatten'];

type TrainerStep = 'practice' | 'level_complete';

const assessmentStyles: { [key in SkillAssessmentLevel]: { container: string; text: string; icon: string } } = {
    "Goed": { container: 'bg-primary-green-light border-primary-green', text: 'text-primary-green-dark', icon: 'text-primary-green' },
    "Voldoende": { container: 'bg-amber-50 border-amber-400', text: 'text-amber-800', icon: 'text-amber-500' },
    "Onvoldoende": { container: 'bg-red-50 border-red-400', text: 'text-red-800', icon: 'text-red-800' }
};

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
                className="flex items-center justify-between w-full py-2 font-semibold text-left text-warm-gray-700 hover:text-warm-gray-900 transition-colors"
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


export const TechniqueDrill: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { userRole, userName, clientName, userKey, activeTechniqueLevel: initialStartLevel } = state;
    
    const onComplete = () => dispatch({ type: 'NAVIGATE', payload: 'onderdeel1' });

    const [programProgress, setProgramProgress] = useState<number>(0);
    const [currentStep, setCurrentStep] = useState<TrainerStep | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<TrainingLevel | null>(null);
    
    const [practiceStarted, setPracticeStarted] = useState(false);
    const [isInstructionsVisible, setIsInstructionsVisible] = useState(true);
    const [challenge, setChallenge] = useState<string>('');
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [feedback, setFeedback] = useState<TechniqueFeedback | null>(null);
    const [successfulAttempts, setSuccessfulAttempts] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const [coachAdvice, setCoachAdvice] = useState<string | null>(null);
    const [coachUsed, setCoachUsed] = useState<boolean>(false);
    
    const [isTestInstructions, setIsTestInstructions] = useState(false);
    const [testConversation, setTestConversation] = useState<Message[]>([]);
    const [currentTestSkillIndex, setCurrentTestSkillIndex] = useState(0);
    const [testAnswers, setTestAnswers] = useState<{ skill: string; clientStatement: string; studentResponse: string; }[]>([]);
    const [personalizedTestSequence, setPersonalizedTestSequence] = useState<string[]>(TEST_SKILL_SEQUENCE);


    const [challengeBatch, setChallengeBatch] = useState<string[]>([]);
    const [challengeIndex, setChallengeIndex] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const storageKey = `techniqueDrillProgress_${userName}_${userRole}`;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, testConversation, isLoading]);


    useEffect(() => {
        const savedProgress = localStorage.getItem(storageKey);
        if (savedProgress) {
            setProgramProgress(JSON.parse(savedProgress));
        }
    }, [storageKey]);

    const saveProgress = useCallback((newProgress: number) => {
        setProgramProgress(newProgress);
        localStorage.setItem(storageKey, JSON.stringify(newProgress));
    }, [storageKey]);
    
    const startLevel = useCallback(async (level: TrainingLevel) => {
        setSelectedLevel(level);
        setSuccessfulAttempts(0);
        setInputText('');
        setMessages([]);
        setTestConversation([]);
        setFeedback(null);
        setCoachAdvice(null);
        setCoachUsed(false);
        setChallengeBatch([]);
        setChallengeIndex(0);
        setPracticeStarted(false);
        setIsInstructionsVisible(true);
        setIsTyping(false);

        if (level.skill === 'Eindtoets') {
            setCurrentStep('practice');
            setIsTestInstructions(true);
            setTestAnswers([]);
            setPersonalizedTestSequence(TEST_SKILL_SEQUENCE);
        } else {
            setCurrentStep('practice');
        }
    }, []);

    const startActualTest = useCallback(async () => {
        setIsTestInstructions(false);
        setPracticeStarted(true);
        setIsLoading(true);
        try {
            const sequence = await getPersonalizedTestSequence(userKey);
            setPersonalizedTestSequence(sequence);
            
            const testSettings: Settings = {
                field: "Jeugdzorg",
                case: "Een jongere die moeite heeft met motivatie voor school.",
                skill: "Open vragen stellen",
                learningGoal: "Start een kennismakingsgesprek."
            };
            const initialText = await getInitialMessage(testSettings);
            const correctedText = initialText.replace(/\[naam\]/gi, clientName);
            const initialMessage: Message = {
                id: Date.now().toString(),
                sender: 'client',
                text: correctedText,
                timestamp: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
            };
            setTestConversation([initialMessage]);
            setCurrentTestSkillIndex(0);
        } catch (error) {
            console.error("Error starting final test conversation:", error);
            setPersonalizedTestSequence(TEST_SKILL_SEQUENCE);
            setSelectedLevel(null);
            setCurrentStep(null);
        } finally {
            setIsLoading(false);
        }
    }, [userKey, clientName]);

    useEffect(() => {
        if (initialStartLevel) {
            startLevel(initialStartLevel);
        } else {
            setCurrentStep(null);
            setSelectedLevel(null);
        }
    }, [initialStartLevel, startLevel]);


    const startPractice = useCallback(async () => {
        if (!selectedLevel) return;
        setPracticeStarted(true);
        setIsInstructionsVisible(false);
        setIsLoading(true);
        try {
            const batch = await getChallengeBatch(selectedLevel.skill, selectedLevel.goal);
            if (!batch || batch.length === 0 || batch.some(c => !c)) {
                throw new Error("Failed to generate valid practice challenges.");
            }
            setChallengeBatch(batch);
            setChallengeIndex(0);
            setChallenge(batch[0]);
            setMessages([{
                id: Date.now().toString(),
                sender: 'client',
                text: batch[0],
                timestamp: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
            }]);
        } catch(error) {
            console.error("Error starting practice:", error);
            setSelectedLevel(null);
            setCurrentStep(null);
        } finally {
            setIsLoading(false);
        }
    }, [selectedLevel]);

    const handleCoachRequest = async () => {
        if (!selectedLevel || !challenge) return;
        setIsLoading(true);
        setCoachUsed(true);
        const skillToCoach = selectedLevel.skill;
        const tip = await getCoachingTip(skillToCoach, challenge);
        setCoachAdvice(tip);
        setIsLoading(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setInputText(text);
        setIsTyping(text.length > 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !selectedLevel) return;

        setIsTyping(false);
        
        if (selectedLevel.skill === 'Eindtoets') {
            setIsLoading(true);
            const currentSkill = personalizedTestSequence[currentTestSkillIndex];
            
            const userMessage: Message = {
                id: Date.now().toString(),
                sender: 'user',
                text: inputText,
                timestamp: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
            };
            
            const updatedConversation = [...testConversation, userMessage];
            setTestConversation(updatedConversation);
            
            const lastClientMessage = testConversation[testConversation.length - 1];
            const newAnswer = {
                skill: currentSkill,
                clientStatement: lastClientMessage.text,
                studentResponse: inputText,
            };
            const updatedAnswers = [...testAnswers, newAnswer];
            setTestAnswers(updatedAnswers);
            setInputText('');

            const nextSkillIndex = currentTestSkillIndex + 1;

            if (nextSkillIndex >= personalizedTestSequence.length) {
                const results = await getBulkTechniqueFeedback(updatedAnswers);
                const correctCount = results.filter(r => r.assessment === 'Voldoende' || r.assessment === 'Goed').length;
                
                const reportTitle = 'Eindtoets Basistechnieken';
                saveReport(
                    userKey,
                    'onderdeel1_eindtoets',
                    reportTitle,
                    results,
                    correctCount,
                    personalizedTestSequence.length
                );
                
                const currentLevelIndex = TRAINING_PROGRAM.findIndex(l => l.skill === selectedLevel.skill);
                if (programProgress <= currentLevelIndex) {
                    saveProgress(currentLevelIndex + 1);
                }
                
                dispatch({
                    type: 'SET_STRUCTURED_REPORT',
                    payload: {
                        title: reportTitle,
                        results,
                        score: correctCount,
                        total: personalizedTestSequence.length,
                        sourceView: 'onderdeel1'
                    }
                });
                return;

            } else {
                const nextSkill = personalizedTestSequence[nextSkillIndex];
                
                const aiResponse = await getAIResponseForTest(updatedConversation, nextSkill);

                const aiMessage: Message = {
                    id: Date.now().toString() + 'ai',
                    sender: 'client',
                    text: aiResponse.responseText,
                    nonVerbalCue: aiResponse.nonVerbalCue,
                    timestamp: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
                };
                setTestConversation(prev => [...prev, aiMessage]);
                
                setCurrentTestSkillIndex(nextSkillIndex);
                setIsLoading(false);
            }
        } else {
            const userMessage = { 
                id: Date.now().toString(),
                sender: 'user' as const,
                text: inputText,
                timestamp: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, userMessage]);
            setIsLoading(true);
            const feedbackResult = await getTechniqueFeedback(selectedLevel.skill, challenge, inputText);
            setInputText('');
            setFeedback(feedbackResult);
            const isCorrect = feedbackResult.assessment === 'Voldoende' || feedbackResult.assessment === 'Goed';
            
            if (isCorrect && !coachUsed) {
                const newCount = successfulAttempts + 1;
                setSuccessfulAttempts(newCount);
            }
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        if (currentStep === 'level_complete' && selectedLevel) {
            const currentLevelIndex = TRAINING_PROGRAM.findIndex(l => l.skill === selectedLevel.skill);
            if (programProgress <= currentLevelIndex) {
                 saveProgress(currentLevelIndex + 1);
            }
        }
    }, [currentStep, selectedLevel, programProgress, saveProgress]);

    const handleNextChallenge = () => {
        setFeedback(null);
        setCoachAdvice(null);
        setCoachUsed(false);
        const nextIndex = challengeIndex + 1;
        if(nextIndex < challengeBatch.length) {
            const nextChallengeText = challengeBatch[nextIndex] as string;
            setChallengeIndex(nextIndex);
            setChallenge(nextChallengeText);
            setMessages([{
                id: Date.now().toString(),
                sender: 'client',
                text: nextChallengeText,
                timestamp: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
            }]);
        } else {
            setCurrentStep('level_complete');
        }
    };

    const renderPractice = () => {
        if (!selectedLevel) return null;

        const isTest = selectedLevel.skill === 'Eindtoets';

        if (isTest && isTestInstructions) {
            return (
                <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in bg-white p-8 rounded-2xl shadow-xl">
                    <div className="text-center">
                        <AcademicCapIcon className="w-16 h-16 text-primary-green mx-auto" />
                        <h1 className="text-3xl font-bold text-warm-gray-800 mt-4">Instructies Eindtoets</h1>
                        <p className="text-warm-gray-600 mt-2">Je gaat nu een doorlopend gesprek voeren met de cliënt. De AI heeft op basis van jouw eerdere resultaten een persoonlijke toets samengesteld. Pas de volgende 4 vaardigheden in de juiste volgorde toe. Let goed op de opdrachten in het rechterpaneel.</p>
                    </div>
                    <div className="bg-primary-green-light border-l-4 border-primary-green p-4 rounded-r-lg">
                        <h2 className="text-lg font-semibold text-primary-green-dark mb-2">Jouw persoonlijke toetsvolgorde:</h2>
                        {isLoading ? (
                             <div className="flex justify-center items-center h-20">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-green"></div>
                            </div>
                        ) : (
                            <ol className="list-decimal list-inside space-y-1 text-warm-gray-700 font-medium">
                                {personalizedTestSequence.map(skill => <li key={skill}>{skill}</li>)}
                            </ol>
                        )}
                    </div>
                    <button onClick={startActualTest} className="w-full p-4 bg-primary-green text-white font-bold rounded-xl hover:bg-primary-green-dark transition-transform transform hover:scale-105">
                        Start Toets
                    </button>
                </div>
            );
        }

        const isLevelComplete = currentStep === 'level_complete';
        
        const instruction = isTest ? null : SKILL_INSTRUCTIONS[selectedLevel.skill];
        
        const panelTitle = isLevelComplete 
            ? (isTest ? 'Toets behaald!' : 'Vaardigheid behaald!') 
            : (isTest ? `Eindtoets` : selectedLevel.skill);
            
        const panelProgress = isLevelComplete ? <ClipboardCheckIcon className="w-10 h-10 text-primary-green" /> : (
            <>
                <p className="font-semibold text-warm-gray-500 text-sm">{isTest ? "Vraag" : "Voortgang"}</p>
                <p className="text-2xl font-bold text-primary-green">
                    {isTest ? currentTestSkillIndex + 1 : successfulAttempts} / {isTest ? personalizedTestSequence.length : selectedLevel.goal}
                </p>
            </>
        );
        
        const panelContent = (() => {
            if (isTest) {
                if (isLevelComplete) {
                    return (
                        <div className="space-y-4 text-center p-6">
                            <h1 className="text-xl font-bold text-warm-gray-800">Uitstekend!</h1>
                            <p className="text-warm-gray-600">Je hebt de eindtoets voltooid en je rapport is beschikbaar.</p>
                            <button onClick={onComplete} className="w-full mt-4 p-3 bg-primary-green text-white font-bold rounded-xl hover:bg-primary-green-dark transition-colors">
                                Afronden
                            </button>
                        </div>
                    );
                }
                return (
                    <div className="space-y-4 text-center">
                        <h2 className="text-lg font-bold text-amber-800 bg-amber-100 p-4 rounded-xl shadow-inner">Opdracht</h2>
                        <p className="text-xl font-semibold text-warm-gray-700">
                            Pas de volgende techniek toe:
                        </p>
                        <p className="text-2xl font-bold text-primary-green animate-pulse">
                            {personalizedTestSequence[currentTestSkillIndex]}
                        </p>
                    </div>
                );
            }
            if (isLevelComplete) {
                return (
                     <div className="space-y-4 text-center p-6">
                        <h1 className="text-xl font-bold text-warm-gray-800">Goed gedaan!</h1>
                        <p className="text-warm-gray-600">Je hebt de vaardigheid "{selectedLevel.skill}" succesvol geoefend.</p>
                        <button onClick={onComplete} className="w-full mt-4 p-3 bg-primary-green text-white font-bold rounded-xl hover:bg-primary-green-dark transition-colors">
                            Afronden
                        </button>
                    </div>
                )
            }
            if (!practiceStarted) {
                return (
                     <div className="space-y-4">
                        {instruction && (
                            <Accordion title="Instructies" isOpen={isInstructionsVisible} onToggle={() => setIsInstructionsVisible(!isInstructionsVisible)}>
                                <div className="space-y-3">
                                    <p className="text-warm-gray-700">{instruction.description}</p>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-warm-gray-700 bg-primary-green-light p-3 rounded-md">
                                        {instruction.tips.map((tip, index) => <li key={index}>{tip}</li>)}
                                    </ul>
                                </div>
                            </Accordion>
                        )}
                        <button onClick={startPractice} className="w-full p-4 bg-primary-green text-white font-bold rounded-xl hover:bg-primary-green-dark transition-transform transform hover:scale-105" disabled={isLoading}>
                            {isLoading ? "Laden..." : "Start Oefening"}
                        </button>
                    </div>
                )
            }
            if (feedback) {
                const isLevelNowComplete = successfulAttempts >= selectedLevel.goal;
                return (
                     <div className="space-y-4">
                        <h2 className="font-semibold text-warm-gray-700">Directe Feedback</h2>
                        {isLoading ? (
                             <div className="flex justify-center items-center h-24">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green"></div>
                            </div>
                        ) : (
                             <div className={`p-4 rounded-xl border-l-4 text-sm animate-fade-in ${assessmentStyles[feedback.assessment].container}`}>
                                <div className="flex items-center">
                                    <CheckCircleIcon className={`w-6 h-6 mr-2 ${assessmentStyles[feedback.assessment].icon}`} />
                                    <h3 className={`text-lg font-bold ${assessmentStyles[feedback.assessment].text}`}>{feedback.assessment}</h3>
                                </div>
                                <p className="text-warm-gray-700 mt-2 pl-8">{feedback.feedback}</p>
                            </div>
                        )}
                         <button 
                            onClick={isLevelNowComplete ? () => setCurrentStep('level_complete') : handleNextChallenge} 
                            className="w-full p-3 bg-primary-green text-white font-bold rounded-xl hover:bg-primary-green-dark transition-colors"
                         >
                            {isLevelNowComplete ? 'Oefening afronden' : 'Volgende uitdaging →'}
                        </button>
                    </div>
                );
            }
            return (
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <h2 className="font-semibold text-warm-gray-700">Jouw Opdracht</h2>
                        <p className="text-warm-gray-600 text-sm">Pas de vaardigheid <span className="font-semibold text-primary-green-dark">"{selectedLevel.skill}"</span> toe op de laatste uitspraak van de cliënt in het chatscherm.</p>
                    </div>
                     {instruction && (
                        <Accordion title="Instructies" isOpen={isInstructionsVisible} onToggle={() => setIsInstructionsVisible(!isInstructionsVisible)}>
                            <div className="space-y-3">
                                <p className="text-warm-gray-700">{instruction.description}</p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-warm-gray-700 bg-primary-green-light p-3 rounded-md">
                                    {instruction.tips.map((tip, index) => <li key={index}>{tip}</li>)}
                                </ul>
                            </div>
                        </Accordion>
                    )}
                     {coachAdvice && (
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg flex items-start space-x-3 animate-fade-in shadow-sm">
                            <LightBulbIcon className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-amber-800">Tip van de coach:</h3>
                                <p className="text-amber-700">{coachAdvice}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleCoachRequest}
                        disabled={isLoading || coachUsed || !challenge}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 disabled:bg-warm-gray-400 transition-colors"
                    >
                        <QuestionMarkCircleIcon className="w-5 h-5"/> Vraag de coach om een tip
                    </button>
                </div>
            )
        })();

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fade-in">
                <div className="w-full flex justify-center lg:justify-end">
                    <PhoneFrame>
                        <div className="bg-cover bg-[url('https://picsum.photos/800/1200?blur=1')] h-full flex flex-col">
                            <header className="bg-primary-green text-white p-3 flex items-center shadow-md z-10 flex-shrink-0">
                                <div className="w-10 h-10 bg-warm-gray-300 rounded-full mr-3 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/40?u=${clientName}`} alt="avatar" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h2 className="font-semibold text-lg">{clientName}</h2>
                                    <p className="text-xs text-primary-green-light">{isLoading ? 'typt...' : 'online'}</p>
                                </div>
                            </header>
                            <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-black bg-opacity-10 backdrop-blur-sm">
                                {isLoading && (isTest ? testConversation : messages).length === 0 && <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div></div>}
                                {(isTest ? testConversation : messages).map((msg, index) => (
                                    <div key={index} className={`flex flex-col animate-fade-in-fast ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                        {msg.nonVerbalCue && msg.sender === 'client' && (
                                            <div className="mb-2 px-3 py-2 text-sm text-warm-gray-700 bg-warm-gray-100 border border-warm-gray-200 rounded-xl max-w-xs md:max-w-md lg:max-w-lg flex items-start space-x-2 shadow-sm">
                                                <EyeIcon className="w-5 h-5 text-warm-gray-500 flex-shrink-0 mt-0.5" />
                                                <span>{msg.nonVerbalCue}</span>
                                            </div>
                                        )}
                                        <div className={`max-w-xs md:max-w-md px-3 py-2 rounded-xl shadow-sm ${msg.sender === 'user' ? 'bg-primary-green-light rounded-br-none' : 'bg-white rounded-bl-none'}`}>
                                            <p className="text-sm text-warm-gray-800 break-words">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && !feedback && (isTest ? testConversation : messages).length > 0 && (
                                    <div className="flex justify-start">
                                        <div className="max-w-xs px-3 py-2 rounded-xl shadow-sm bg-white rounded-bl-none">
                                            <div className="flex items-center space-x-1">
                                                <span className="w-2 h-2 bg-warm-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                <span className="w-2 h-2 bg-warm-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                <span className="w-2 h-2 bg-warm-gray-400 rounded-full animate-bounce"></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </main>
                            {practiceStarted && (
                                <footer className="p-2 bg-warm-gray-100 border-t border-warm-gray-200 flex-shrink-0">
                                    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={inputText}
                                            onChange={handleInputChange}
                                            placeholder={isLevelComplete ? "Oefening voltooid" : (isTest ? "Jouw reactie op de cliënt..." : "Jouw reactie...")}
                                            className="flex-1 p-3 rounded-full bg-warm-gray-800 text-white placeholder-warm-gray-400 border-0 focus:outline-none focus:ring-2 focus:ring-accent-lime transition"
                                            disabled={isLoading || !!feedback || (isTest ? testConversation.length === 0 : !challenge) || isLevelComplete}
                                        />
                                        <button
                                            type="submit"
                                            className="bg-primary-green text-white p-3 rounded-full hover:bg-primary-green-dark disabled:bg-warm-gray-400 transition-colors"
                                            disabled={isLoading || !inputText.trim() || !!feedback || (isTest ? testConversation.length === 0 : !challenge) || isLevelComplete}
                                            aria-label="Verstuur"
                                        >
                                            <SendIcon className="w-6 h-6" />
                                        </button>
                                    </form>
                                </footer>
                            )}
                        </div>
                    </PhoneFrame>
                </div>
                <div className="w-full">
                   <DynamicCoachingPanel title={panelTitle} progress={panelProgress}>
                       {panelContent}
                   </DynamicCoachingPanel>
                </div>
            </div>
        );
    };

    if (!currentStep || !selectedLevel) {
        return <div className="text-center p-8"><p>Selecteer een oefening om te beginnen.</p></div>;
    }

    switch (currentStep) {
        case 'practice':
        case 'level_complete':
            return renderPractice();
        default:
            return null;
    }
};
