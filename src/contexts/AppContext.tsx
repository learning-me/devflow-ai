import React, { createContext, useContext, ReactNode } from 'react';
import { AppState, DailyLog, LearningTopic, Interview, Goal, PomodoroSession } from '@/types';
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface AppContextType {
  state: AppState;
  loading: boolean;
  addDailyLog: (log: Omit<DailyLog, 'id' | 'createdAt'>) => Promise<void>;
  updateDailyLog: (log: DailyLog) => Promise<void>;
  deleteDailyLog: (id: string) => Promise<void>;
  addLearningTopic: (topic: Omit<LearningTopic, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateLearningTopic: (topic: LearningTopic) => Promise<void>;
  deleteLearningTopic: (id: string) => Promise<void>;
  completeLearning: (topicId: string) => Promise<void>;
  addInterview: (interview: Omit<Interview, 'id' | 'timeline'>) => Promise<void>;
  updateInterview: (interview: Interview) => Promise<void>;
  deleteInterview: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'currentCount' | 'completed'>) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addPomodoroSession: (session: Omit<PomodoroSession, 'id'>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    loading,
    dailyLogs,
    learningTopics,
    interviews,
    goals,
    streakData,
    pomodoroSessions,
    addDailyLog,
    updateDailyLog,
    deleteDailyLog,
    addLearningTopic,
    updateLearningTopic,
    deleteLearningTopic,
    completeLearning,
    addInterview,
    updateInterview,
    deleteInterview,
    addGoal,
    updateGoal,
    deleteGoal,
    addPomodoroSession,
  } = useSupabaseData();

  const state: AppState = {
    dailyLogs,
    learningTopics,
    interviews,
    goals,
    streakData,
    pomodoroSessions,
  };

  return (
    <AppContext.Provider
      value={{
        state,
        loading,
        addDailyLog,
        updateDailyLog,
        deleteDailyLog,
        addLearningTopic,
        updateLearningTopic,
        deleteLearningTopic,
        completeLearning,
        addInterview,
        updateInterview,
        deleteInterview,
        addGoal,
        updateGoal,
        deleteGoal,
        addPomodoroSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};