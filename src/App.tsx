import React, { useCallback, useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatScreen } from './components/ChatScreen';
import { InstructionsPanel } from './components/InstructionsPanel';
import { DynamicCoachingPanel } from './components/DynamicCoachingPanel';
import { EndScreen } from './components/EndScreen';
import { TechniqueDrill } from './components/TechniqueDrill';
import { TeacherSettingsPanel } from './components/TeacherSettingsPanel';
import { LoginScreen } from './components/LoginScreen';
import { MiniCaseScreen } from './components/MiniCaseScreen';
import { getAIResponseStream, getInitialMessageStream, getConcludingMessageStream, getTechniqueFeedback, getHulpvraagFeedback } from './services/geminiService';
import { saveReport } from './services/storageService';
import type { Message, Settings, TrainingLevel, View, LSDTrainingStep, TechniqueFeedback, SkillAssessmentLevel } from './types';
import { TechniqueTrainerOverview, LSDMethodOverview, FullConversationStarter } from './components/ModuleOverviews';
import { PhoneFrame } from './components/PhoneFrame';
import { CheckCircleIcon, ChevronDownIcon } from './components/IconComponents';
import { ModuleContainer } from './components/ModuleContainer';
import { Dashboard } from './components/Dashboard';
import { AboutScreen } from './components/AboutScreen';
import { SKILL_INSTRUCTIONS } from './constants';
import { MobileWarning } from './components/MobileWarning';
import { useAppContext } from './AppContext';
import { TestReportScreen } from './components/TestReportScreen';

// Simple unique ID generator
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

interface UserProfile {
  name: string;
  role: 'student' | 'docent';
}

const Accordion: React.FC<{
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}> = ({ title, children, isOpen, onToggle }) => (
    <div className="border border-warm-gray-200 rounded-xl bg-white shadow-sm">
        <h2>
            <button
                type="button"
                className="flex items-center justify-between w-full p-4 font-semibold text-left text-warm-gray-800 bg-warm-gray-50 hover:bg-warm-gray-100 rounded-t-xl transition-colors"
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <span>{title}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-green' : 'text-warm-gray-400'}`} />
            </button>
        </h2>
        {isOpen && (
             <div className="p-4 bg-white rounded-b-xl animate-fade-in-fast">
                {children}
            </div>
        )}
    </div>
);

const assessmentStyles: { [key in SkillAssessmentLevel]: { container: string; text: string; icon: string } } = {
    "Goed": { container: 'bg-primary-green-light border-primary-green', text: 'text-primary-green-dark', icon: 'text-primary-green' },
    "Voldoende": { container: 'bg-amber-50 border-amber-400', text: 'text-amber-800', icon: 'text-amber-500' },
    "Onvoldoende": { container: 'bg-red-50 border-red-400', text: 'text-red-800', icon: 'text-red-800' }
};

const TrainingChatContent: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { settings, messages, isTyping, instantFeedback, isCoachLoading } = state;
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
    
    if (!settings) return null;
    const instruction = SKILL_INSTRUCTIONS[settings.skill];
    const lastClientMessage = messages.filter(m => m.sender === 'client').slice(-1)[0];

    const renderBriefing = () => (
        <div className="space-y-4">
            <div className="space-y-2">
                <h2 className="font-semibold text-warm-gray-700">Jouw Opdracht</h2>
                <p className="text-warm-gray-600 text-sm">Reageer op de volgende uitspraak van de cliënt:</p>
                <blockquote className="border-l-4 border-warm-gray-200 pl-4 italic text-warm-gray-800 bg-warm-gray-50 py-2 rounded-r-md">
                    "{lastClientMessage?.text || 'Wachten op cliënt...'}"
                </blockquote>
            </div>
            {instruction && (
                <Accordion title="Bekijk instructies" isOpen={isInstructionsOpen} onToggle={() => setIsInstructionsOpen(!isInstructionsOpen)}>
                    <p className="text-warm-gray-700">{instruction.description}</p>
                </Accordion>
            )}
        </div>
    );

    const renderChecklist = () => (
        <div className="space-y-3 animate-fade-in-fast">
            <h2 className="font-semibold text-warm-gray-700">Live Checklist: <span className="text-primary-green">{instruction?.title}</span></h2>
            {instruction && (
                <ul className="list-disc list-inside space-y-1.5 text-sm text-warm-gray-700">
                    {instruction.tips.map((tip, index) => <li key={index}>{tip}</li>)}
                </ul>
            )}
        </div>
    );

    const renderFeedback = () => (
        <div className="space-y-4">
            <h2 className="font-semibold text-warm-gray-700">Directe Feedback</h2>
            {isCoachLoading ? (
                <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green"></div>
                    <p className="ml-4 text-warm-gray-600">Coach analyseert je reactie...</p>
                </div>
            ) : instantFeedback ? (
                <div className={`p-4 mt-2 rounded-xl border-l-4 text-sm animate-fade-in ${assessmentStyles[instantFeedback.assessment].container}`}>
                    <div className="flex items-center">
                        <CheckCircleIcon className={`w-6 h-6 mr-2 ${assessmentStyles[instantFeedback.assessment].icon}`} />
                        <h3 className={`text-lg font-bold ${assessmentStyles[instantFeedback.assessment].text}`}>{instantFeedback.assessment}</h3>
                    </div>
                    <p className="text-warm-gray-700 mt-2 pl-8">{instantFeedback.feedback}</p>
                </div>
            ) : null}
        </div>
    );

    if (instantFeedback || isCoachLoading) return renderFeedback();
    if (isTyping) return renderChecklist();
    return renderBriefing();
};


const App: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { currentView, settings, messages, turnCount, progressCount, goalTotal, userKey, finalReport, isConcludingPhase } = state;
  const [isMobile, setIsMobile] = useState(false);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
 
  useEffect(() => {
    const checkIsMobile = () => {
        setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleWelcomeStart = useCallback((name: string, role: 'student' | 'docent') => {
    const savedProfiles = localStorage.getItem('userProfiles');
    const profiles: UserProfile[] = savedProfiles ? JSON.parse(savedProfiles) : [];
    
    const userExists = profiles.some(p => p.name.toLowerCase() === name.toLowerCase() && p.role === role);
    if (!userExists) {
        profiles.push({ name, role });
        localStorage.setItem('userProfiles', JSON.stringify(profiles));
    }

    dispatch({ type: 'LOGIN', payload: { name, role } });
  }, [dispatch]);

  const startChat = useCallback(async (learningGoal: string) => {
    if (!settings) return;

    const finalSettings = { ...settings, learningGoal };
    const total = parseInt(learningGoal.match(/\d+/)?.[0] ?? '1', 10);
    const view = settings.skill === "Hulpvraag Verhelderen" ? 'hulpvraag_chat' : 'training_chat';
    
    dispatch({ type: 'START_CHAT', payload: { settings: finalSettings, goal: total, view } });

    const initialMessage: Message = {
      id: generateId(),
      sender: 'client',
      text: '', // Start with an empty message for streaming
      timestamp: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: initialMessage });
    
    const stream = getInitialMessageStream(finalSettings);
    for await (const chunk of stream) {
        dispatch({ type: 'UPDATE_LAST_MESSAGE_TEXT', payload: chunk });
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
  }, [settings, dispatch]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!settings) return;

    const userMessage: Message = {
        id: generateId(),
        sender: 'user',
        text: text,
        timestamp: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
    };

    if (settings.skill === "Hulpvraag Verhelderen") {
        // This is the final, concluding message. Generate report and end.
        if (isConcludingPhase) {
            dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
            dispatch({ type: 'SET_LOADING', payload: true });
            const finalMessages = [...messages, userMessage];
            const report = await getHulpvraagFeedback(finalMessages, settings);
            saveReport(userKey, 'onderdeel3', `Gesprek: ${settings.case}`, report);
            dispatch({ type: 'SET_FINAL_REPORT', payload: report });
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
        }

        // This is a normal turn in the conversation.
        dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
        dispatch({ type: 'SET_USER_TYPING', payload: false });
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const newTurnCount = turnCount + 1;
        dispatch({ type: 'SET_TURN_COUNT', payload: newTurnCount });

        const messagesWithUser = [...messages, userMessage];

        const aiMessage: Message = {
            id: generateId(),
            sender: 'client',
            text: '', // Empty placeholder for streaming
            timestamp: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
        };
        dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });

        const stream = getAIResponseStream(messagesWithUser, settings);
        for await (const chunk of stream) {
            dispatch({ type: 'UPDATE_LAST_MESSAGE_TEXT', payload: chunk });
        }
        
        // After AI responds to the 10th message, start the concluding phase.
        if (newTurnCount >= 10) {
            dispatch({ type: 'START_CONCLUDING_PHASE' });
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
    }

    // --- Original training chat logic ---
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_USER_TYPING', payload: false });
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_COACH_LOADING', payload: true });
    
    const lastClientMsg = messages.filter(m => m.sender === 'client').slice(-1)[0];
    const feedback = await getTechniqueFeedback(settings.skill, lastClientMsg.text, text);
    dispatch({ type: 'SET_INSTANT_FEEDBACK', payload: feedback });
    dispatch({ type: 'SET_COACH_LOADING', payload: false });

    const isCorrect = feedback.assessment === 'Voldoende' || feedback.assessment === 'Goed';
    const newProgressCount = progressCount + (isCorrect ? 1 : 0);
    if (isCorrect) {
        dispatch({ type: 'SET_PROGRESS', payload: newProgressCount });
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (newProgressCount >= goalTotal) {
        const finalMessage: Message = {
            id: generateId(),
            sender: 'client',
            text: '', // Empty placeholder for streaming
            timestamp: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
        };
        dispatch({ type: 'ADD_MESSAGE', payload: finalMessage });

        const stream = getConcludingMessageStream(settings);
        for await (const chunk of stream) {
            dispatch({ type: 'UPDATE_LAST_MESSAGE_TEXT', payload: chunk });
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'NAVIGATE', payload: 'training_ended' });
        return;
    }

    try {
        const aiMessage: Message = {
            id: generateId(),
            sender: 'client',
            text: '', // Empty placeholder for streaming
            timestamp: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
        };
        dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });

        const stream = getAIResponseStream([...messages, userMessage], settings);
        for await (const chunk of stream) {
            dispatch({ type: 'UPDATE_LAST_MESSAGE_TEXT', payload: chunk });
        }
    } catch (error) {
        console.error("Failed to get AI response:", error);
        const errorMessage: Message = {
            id: generateId(),
            sender: 'client',
            text: "Er ging iets mis. Probeer het later opnieuw.",
            timestamp: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
        };
        dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
    } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_INSTANT_FEEDBACK', payload: null });
    }
  }, [messages, settings, goalTotal, progressCount, turnCount, userKey, isConcludingPhase, dispatch]);
  
  const handleUserTyping = (isTyping: boolean) => {
    dispatch({ type: 'SET_USER_TYPING', payload: isTyping });
  };

  const renderContent = () => {
    switch (currentView) {
        case 'welcome':
            return <div className="flex-grow flex items-center justify-center p-4"><LoginScreen onStart={handleWelcomeStart} onLogin={(name, role) => dispatch({ type: 'LOGIN', payload: { name, role } })} /></div>;
        case 'dashboard':
            return <Dashboard />;
        case 'onderdeel1':
            return (
                <ModuleContainer
                    title="Onderdeel 1: De basistechnieken"
                    description="Oefen elke gespreksvaardigheid stapsgewijs."
                    onBack={state.activeTechniqueLevel ? () => dispatch({ type: 'NAVIGATE', payload: 'onderdeel1' }) : undefined}
                >
                    {state.activeTechniqueLevel ? <TechniqueDrill /> : <TechniqueTrainerOverview />}
                </ModuleContainer>
            );
        case 'onderdeel2':
             return (
                 <ModuleContainer
                    title="Onderdeel 2: De LSD-methode"
                    description={state.activeLSDStep ? `Oefening: ${state.activeLSDStep.title}` : "Pas de kern van actief luisteren toe in realistische scenario's."}
                    onBack={state.activeLSDStep ? () => dispatch({ type: 'NAVIGATE', payload: 'onderdeel2' }) : undefined}
                >
                    {state.activeLSDStep ? <MiniCaseScreen /> : <LSDMethodOverview />}
                </ModuleContainer>
            );
        case 'onderdeel3':
        case 'instructions':
             return (
                <ModuleContainer
                    title="Onderdeel 3: Voer het gesprek"
                    description="Stel je eigen scenario samen en voer een volledig gesprek met een AI-cliënt."
                    onBack={settings ? () => dispatch({ type: 'NAVIGATE', payload: 'onderdeel3' }) : undefined}
                >
                    {!settings ? (
                        <FullConversationStarter />
                    ) : (
                        <InstructionsPanel onStartChat={startChat} />
                    )}
                </ModuleContainer>
            );
        case 'teacher_settings':
            return <TeacherSettingsPanel />;
        
        case 'about':
            return <AboutScreen />;

        case 'training_chat':
             if (!settings) return null;
             return (
                 <div className="w-full max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div className="w-full flex justify-center lg:justify-end">
                            <PhoneFrame>
                                <ChatScreen 
                                    messages={state.messages}
                                    isLoading={state.isLoading}
                                    clientName={state.clientName}
                                    onSendMessage={handleSendMessage} 
                                    onUserTypingChange={handleUserTyping}
                                />
                            </PhoneFrame>
                        </div>
                        <DynamicCoachingPanel
                            title={settings.skill}
                            progress={
                                <>
                                    <p className="font-semibold text-warm-gray-500 text-sm">Voortgang</p>
                                    <p className="text-2xl font-bold text-primary-green">{progressCount} / {goalTotal}</p>
                                </>
                            }
                        >
                           <TrainingChatContent />
                        </DynamicCoachingPanel>
                    </div>
                </div>
            );
        case 'hulpvraag_chat':
            if (!settings) return null;
            return (
                <ModuleContainer
                    title="Onderdeel 3: Voer het gesprek"
                    description="Je voert nu het gesprek. Jouw missie: verhelder de hulpvraag."
                    contentMaxWidth="max-w-6xl"
                    onBack={() => dispatch({ type: 'NAVIGATE', payload: 'onderdeel3' })}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div className="w-full flex justify-center lg:justify-end">
                            <PhoneFrame>
                                <ChatScreen 
                                    messages={state.messages}
                                    isLoading={state.isLoading}
                                    clientName={state.clientName}
                                    onSendMessage={handleSendMessage}
                                    onUserTypingChange={handleUserTyping}
                                />
                            </PhoneFrame>
                        </div>
                        <DynamicCoachingPanel
                            title="Missie: Hulpvraag Verhelderen"
                            progress={
                                state.isConcludingPhase ? (
                                    <>
                                        <p className="font-semibold text-warm-gray-500 text-sm">Status</p>
                                        <p className="text-2xl font-bold text-primary-green">Afronding</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-semibold text-warm-gray-500 text-sm">Jouw beurt</p>
                                        <p className="text-2xl font-bold text-primary-green">{turnCount + 1} / 10</p>
                                    </>
                                )
                            }
                        >
                             {state.isConcludingPhase ? (
                                <div className="space-y-4 animate-fade-in">
                                    <h2 className="font-semibold text-warm-gray-700">Rond het gesprek af</h2>
                                    <p className="text-warm-gray-600">
                                        Het gesprek is ten einde. Formuleer nu een laatste, samenvattende reactie waarin je de verhelderde hulpvraag benoemt en checkt bij de cliënt. Dit is de laatste stap voordat je het volledige rapport ontvangt.
                                    </p>
                                    <div className="bg-primary-green-light border-l-4 border-primary-green p-4 rounded-r-lg">
                                        <h3 className="text-md font-semibold text-primary-green-dark mb-1">Waar let de AI op?</h3>
                                        <p className="text-sm text-warm-gray-700">De AI zal in het eindrapport specifiek beoordelen of jouw samenvatting de kern van het probleem en de (vermoedelijke) hulpvraag correct en volledig omvat.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h2 className="font-semibold text-warm-gray-700">Jouw Opdracht</h2>
                                    <p className="text-warm-gray-600">Jouw doel is om binnen 10 gespreksbeurten de kern van het probleem en de hulpvraag van de cliënt helder te krijgen. Pas de geleerde technieken toe om het gesprek te verdiepen.</p>
                                    <div className="pt-4">
                                        <button
                                            onClick={() => dispatch({ type: 'START_CONCLUDING_PHASE' })}
                                            className="w-full p-3 bg-accent-lime text-warm-gray-900 font-bold rounded-xl hover:bg-accent-yellow-green transition-transform transform hover:scale-105"
                                        >
                                            Hulpvraag is helder, start afronding
                                        </button>
                                    </div>
                                </div>
                            )}
                        </DynamicCoachingPanel>
                    </div>
                </ModuleContainer>
            );
        case 'hulpvraag_report':
            if (!settings) return null;
            return (
                 <ModuleContainer
                    title="Rapportage: Hulpvraag Verhelderen"
                    description="Hieronder volgt de analyse van jouw gesprek."
                    contentMaxWidth="max-w-6xl"
                    onBack={() => dispatch({ type: 'NAVIGATE', payload: 'onderdeel3' })}
                 >
                    <div className="space-y-8">
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border shadow-lg max-w-none">
                            {state.isLoading ? (
                                <div className="flex justify-center items-center h-48">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green"></div>
                                    <p className="ml-4 text-warm-gray-600">Rapport wordt gegenereerd...</p>
                                </div>
                            ) : (
                                <div className="report-content" dangerouslySetInnerHTML={{ __html: finalReport || '' }} />
                            )}
                        </div>
                        
                        <Accordion title="Bekijk het volledige gesprek" isOpen={isChatHistoryOpen} onToggle={() => setIsChatHistoryOpen(!isChatHistoryOpen)}>
                            <div className="mt-4">
                                <PhoneFrame>
                                    <ChatScreen 
                                        messages={state.messages}
                                        isLoading={false}
                                        clientName={state.clientName}
                                        onSendMessage={() => {}} 
                                        isReadOnly={true} 
                                    />
                                </PhoneFrame>
                            </div>
                        </Accordion>
            
                        <div className="text-center pt-4">
                            <button
                              onClick={() => dispatch({ type: 'NAVIGATE', payload: 'onderdeel3' })}
                              className="w-full max-w-xs mx-auto p-4 bg-primary-green text-white font-bold rounded-xl hover:bg-primary-green-dark transition-transform transform hover:scale-105"
                            >
                              Afronden
                            </button>
                        </div>
                    </div>
                </ModuleContainer>
            );
        case 'test_report':
            return (
                 <ModuleContainer
                    title="Rapportage"
                    description="Hieronder volgt de analyse van jouw toets."
                    contentMaxWidth="max-w-6xl"
                >
                    <TestReportScreen />
                 </ModuleContainer>
            );
        case 'training_ended':
            return <EndScreen />;
        default:
            // Fallback for deprecated views, redirect to their new parent view
            if (['training_technique', 'training_mini_case'].includes(currentView)) {
                dispatch({ type: 'NAVIGATE', payload: currentView === 'training_technique' ? 'onderdeel1' : 'onderdeel2' });
                return null;
            }
            return <div className="flex-grow flex items-center justify-center p-4"><LoginScreen onStart={handleWelcomeStart} onLogin={(name, role) => dispatch({ type: 'LOGIN', payload: { name, role } })} /></div>;
    }
  }

  const renderAppContent = () => {
    if (currentView === 'welcome') {
      return (
        <div className="min-h-screen w-full font-sans flex flex-col">
          {renderContent()}
        </div>
      );
    }

    return (
      <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full max-w-[1536px] h-[92vh] flex rounded-2xl shadow-2xl overflow-hidden border border-warm-gray-200">
            <Sidebar />
            <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto bg-white">
              {renderContent()}
            </main>
        </div>
      </div>
    );
  };

  return (
    <>
      {isMobile && <MobileWarning />}
      <div className={isMobile ? 'blur-sm pointer-events-none' : ''}>
        {renderAppContent()}
      </div>
    </>
  );
};

export default App;
