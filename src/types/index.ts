export type Tag = 'frontend' | 'backend' | 'dsa' | 'devops' | 'system-design' | 'other';

export interface Subtopic {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface LearningTopic {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: string;
  createdAt: string;
  tags: Tag[];
  revisionDays?: number[]; // [1, 3, 7] - days to revise after completion
  revisedOn?: string[]; // dates when revision was done
  subtopics?: Subtopic[];
  timeSpent?: number; // in minutes
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

export interface PomodoroSession {
  id: string;
  taskId?: string; // optional link to a learning topic
  taskName?: string;
  duration: number; // in minutes
  completedAt: string;
  type: 'work' | 'break';
}

export interface AppState {
  learningTopics: LearningTopic[];
  interviews: Interview[];
  goals: Goal[];
  streakData: StreakData;
  pomodoroSessions: PomodoroSession[];
}
