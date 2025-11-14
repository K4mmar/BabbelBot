import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import type { View, Settings, Message, TechniqueFeedback, TrainingLevel, LSDTrainingStep, StructuredReportData } from './types';

// 1. STATE SHAPE
export interface AppState {
  currentView: View;
  userName: string;
  userRole: 'student' | 'docent' | null;
  userKey: string;
  settings: Settings | null;
  messages: Message[];
  isLoading: boolean;
  clientName: string;
  progressCount: number;
  goalTotal: number;
  turnCount: number;
  finalReport: string | null;
  isTyping: boolean;
  isCoachLoading: boolean;
  instantFeedback: TechniqueFeedback | null;
  activeTechniqueLevel: TrainingLevel | null;
  activeLSDStep: LSDTrainingStep | null;
  structuredReportData: StructuredReportData | null;
  isConcludingPhase: boolean;
}

// 2. ACTIONS
export type Action =
  | { type: 'LOGIN'; payload: { name: string; role: 'student' | 'docent' } }
  | { type: 'LOGOUT' }
  | { type: 'NAVIGATE'; payload: View }
  | { type: 'START_TECHNIQUE_LEVEL'; payload: TrainingLevel }
  | { type: 'START_LSD_STEP'; payload: LSDTrainingStep }
  | { type: 'PROCEED_TO_INSTRUCTIONS'; payload: Settings }
  | { type: 'START_CHAT'; payload: { settings: Settings; goal: number; view: View } }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_LAST_MESSAGE_TEXT'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_COACH_LOADING'; payload: boolean }
  | { type: 'SET_INSTANT_FEEDBACK'; payload: TechniqueFeedback | null }
  | { type: 'SET_USER_TYPING'; payload: boolean }
  | { type: 'SET_PROGRESS'; payload: number }
  | { type: 'SET_TURN_COUNT'; payload: number }
  | { type: 'SET_FINAL_REPORT'; payload: string | null }
  | { type: 'SET_STRUCTURED_REPORT'; payload: StructuredReportData }
  | { type: 'START_CONCLUDING_PHASE' };

// 3. INITIAL STATE
const initialState: AppState = {
  currentView: 'welcome',
  userName: '',
  userRole: null,
  userKey: '',
  settings: null,
  messages: [],
  isLoading: false,
  clientName: 'Cliënt',
  progressCount: 0,
  goalTotal: 1,
  turnCount: 0,
  finalReport: null,
  isTyping: false,
  isCoachLoading: false,
  instantFeedback: null,
  activeTechniqueLevel: null,
  activeLSDStep: null,
  structuredReportData: null,
  isConcludingPhase: false,
};

const clientNames = ["Alex", "Sam", "Chris", "Jamie", "Robin"];
const getRandomClientName = () => clientNames[Math.floor(Math.random() * clientNames.length)];

// 4. REDUCER
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        userName: action.payload.name,
        userRole: action.payload.role,
        userKey: `${action.payload.name}_${action.payload.role}`,
        currentView: 'dashboard',
      };
    case 'LOGOUT':
      return {
        ...initialState,
        currentView: 'welcome',
      };
    case 'NAVIGATE':
      return {
        ...state,
        currentView: action.payload,
        activeTechniqueLevel: null,
        activeLSDStep: null,
        settings: null,
        structuredReportData: null,
      };
    case 'START_TECHNIQUE_LEVEL':
        return { ...state, activeTechniqueLevel: action.payload, clientName: getRandomClientName() };
    case 'START_LSD_STEP':
        return { ...state, activeLSDStep: action.payload, clientName: getRandomClientName() };
    case 'PROCEED_TO_INSTRUCTIONS':
        return { ...state, settings: action.payload, currentView: 'instructions' };
    case 'START_CHAT':
        return {
            ...state,
            settings: action.payload.settings,
            goalTotal: action.payload.goal,
            currentView: action.payload.view,
            progressCount: 0,
            messages: [],
            instantFeedback: null,
            isTyping: false,
            isCoachLoading: false,
            turnCount: 0,
            finalReport: null,
            isLoading: true,
            clientName: getRandomClientName(),
            isConcludingPhase: false,
        };
    case 'SET_MESSAGES':
        return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
        return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_LAST_MESSAGE_TEXT':
        if (state.messages.length === 0) return state;
        const newMessages = [...state.messages];
        const lastMessage = { ...newMessages[newMessages.length - 1] };
        lastMessage.text += action.payload;
        newMessages[newMessages.length - 1] = lastMessage;
        return { ...state, messages: newMessages };
    case 'SET_LOADING':
        return { ...state, isLoading: action.payload };
    case 'SET_COACH_LOADING':
        return { ...state, isCoachLoading: action.payload };
    case 'SET_INSTANT_FEEDBACK':
        return { ...state, instantFeedback: action.payload };
    case 'SET_USER_TYPING':
        return { ...state, isTyping: action.payload };
    case 'SET_PROGRESS':
        return { ...state, progressCount: action.payload };
    case 'SET_TURN_COUNT':
        return { ...state, turnCount: action.payload };
    case 'SET_FINAL_REPORT':
        return { ...state, finalReport: action.payload, currentView: 'hulpvraag_report' };
    case 'SET_STRUCTURED_REPORT':
        return { ...state, structuredReportData: action.payload, currentView: 'test_report' };
    case 'START_CONCLUDING_PHASE':
        return { ...state, isConcludingPhase: true };
    default:
      return state;
  }
};

// 5. CONTEXT & PROVIDER
const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// 6. CUSTOM HOOK
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};