export type Sender = 'user' | 'client';

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: string;
  nonVerbalCue?: string;
}

export interface Settings {
  field: string;
  case: string;
  skill: string;
  learningGoal?: string;
}

export type View =
  | 'welcome'
  | 'dashboard'
  | 'onderdeel1'
  | 'onderdeel2'
  | 'onderdeel3'
  | 'teacher_settings'
  | 'instructions'
  | 'training_chat'
  | 'training_ended'
  | 'hulpvraag_chat'
  | 'hulpvraag_report'
  | 'about';


export interface Progress {
    count: number;
    feedback: string;
}

export type SkillAssessmentLevel = "Onvoldoende" | "Voldoende" | "Goed";

export interface TechniqueFeedback {
    assessment: SkillAssessmentLevel;
    feedback: string;
}

export interface TrainingLevel {
    skill: string;
    goal: number;
    description: string;
}

export interface LSDResponse {
    l: string;
    s: string;
    d: string;
}

export interface MiniCaseTestAnswer {
    clientStatement: string;
    nonVerbalCue: string;
    studentResponse: string;
}


export interface TestResultDetail {
    skill: string;
    clientStatement: string;
    studentResponse: string;
    feedback: string;
    assessment: SkillAssessmentLevel;
    justification: string;
}

export interface LSDTrainingStep {
    step: number;
    type: 'guided' | 'independent' | 'test';
    skill: 'L' | 'S' | 'D' | 'independent' | 'test';
    title: string;
    description: string;
}

export interface Report {
  id: string;
  moduleKey: string;
  title: string;
  date: string;
  score?: number;
  total?: number;
  data: TestResultDetail[] | string;
}