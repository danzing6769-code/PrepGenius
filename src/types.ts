export type ExamType = 'NEET' | 'IAT';
export type Subject = 'Physics' | 'Chemistry' | 'Biology' | 'Mathematics';
export type Difficulty = 'Foundational' | 'Adaptive' | 'Intense';
export type InstituteStyle = 'None' | 'Allen' | 'Aakash' | 'Physics Wallah' | 'Motion' | 'Fiitjee' | 'Arihant';
export type TestStatus = 'IDLE' | 'GENERATING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Question {
  id: string;
  subject: Subject;
  chapter?: string;
  type?: 'Objective' | 'Subjective';
  text: string;
  options?: string[];
  correctAnswerIndex?: number;
  correctAnswerText?: string;
  explanation: string;
}

export interface ChapterSelection {
  name: string;
  weightage: number; // Percentage
  subtopics: string[];
}

export interface TestConfig {
  mode?: 'Exam' | 'Practice';
  examType: ExamType;
  subjects: Subject[];
  difficulty: Difficulty;
  numberOfQuestions: number;
  includePYQ?: boolean;
  onlyPYQ?: boolean;
  includeSubjective?: boolean;
  instituteStyle?: InstituteStyle;
  chapters?: Partial<Record<Subject, ChapterSelection[]>>;
}

export interface TestResponse {
  questions: Question[];
}

export interface AttemptRecord {
  id: string;
  userId: string;
  examType: ExamType;
  score: number;
  totalQuestions: number;
  accuracy: number;
  subjects: Subject[];
  chapters?: Partial<Record<Subject, string[]>>;
  difficulty: Difficulty;
  createdAt: any; // Firestore Timestamp
  date?: string; // Formatted date for UI
}
