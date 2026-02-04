import { AppState, LearningTopic, Interview, Goal, StreakData } from '@/types';

const STORAGE_KEY = 'devtracker_data';

const defaultStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDate: null,
  dailyActivity: {},
};

const defaultState: AppState = {
  learningTopics: [],
  interviews: [],
  goals: [],
  streakData: defaultStreakData,
  pomodoroSessions: [],
};

export const loadState = (): AppState => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return { ...defaultState, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
  return defaultState;
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export const formatDisplayDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const calculateStreak = (
  currentStreak: StreakData,
  completedDate: string
): StreakData => {
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));

  let newStreak = currentStreak.currentStreak;
  let newLongest = currentStreak.longestStreak;

  if (currentStreak.lastCompletedDate === today) {
    // Already completed today, don't increase
    return currentStreak;
  }

  if (
    currentStreak.lastCompletedDate === yesterday ||
    currentStreak.lastCompletedDate === null
  ) {
    newStreak += 1;
  } else if (currentStreak.lastCompletedDate !== today) {
    // Streak broken
    newStreak = 1;
  }

  newLongest = Math.max(newLongest, newStreak);

  const newActivity = { ...currentStreak.dailyActivity };
  newActivity[completedDate] = (newActivity[completedDate] || 0) + 1;

  return {
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastCompletedDate: completedDate,
    dailyActivity: newActivity,
  };
};

export const getActivityLevel = (count: number): number => {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
};
