export type Tag = 'frontend' | 'backend' | 'dsa' | 'devops' | 'system-design' | 'other';

export interface DailyLog {
  id: string;
  date: string;
  tasks: string;
  notes: string;
  timeSpent: number; // in minutes
  tags: Tag[];
  createdAt: string;
}

export interface LearningTopic {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  questions?: Question[];
  answers?: Answer[];
  completedAt?: string;
  createdAt: string;
  tags: Tag[];
}

export interface Question {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Answer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  feedback: string;
}

export interface Interview {
  id: string;
  company: string;
  role: string;
  status: 'applied' | 'hr' | 'technical' | 'offer' | 'rejected';
  notes: string;
  appliedDate: string;
  lastUpdated: string;
  timeline: InterviewEvent[];
}

export interface InterviewEvent {
  id: string;
  date: string;
  type: string;
  notes: string;
}

export interface Goal {
  id: string;
  title: string;
  type: 'weekly' | 'monthly';
  targetCount: number;
  currentCount: number;
  linkedTopics: string[];
  startDate: string;
  endDate: string;
  completed: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  dailyActivity: Record<string, number>; // date -> activity count
}

export interface AppState {
  dailyLogs: DailyLog[];
  learningTopics: LearningTopic[];
  interviews: Interview[];
  goals: Goal[];
  streakData: StreakData;
}
