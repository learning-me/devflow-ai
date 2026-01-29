import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, DailyLog, LearningTopic, Interview, Goal, StreakData } from '@/types';
import { loadState, saveState, generateId, formatDate, calculateStreak } from '@/lib/storage';

type Action =
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'ADD_DAILY_LOG'; payload: DailyLog }
  | { type: 'UPDATE_DAILY_LOG'; payload: DailyLog }
  | { type: 'DELETE_DAILY_LOG'; payload: string }
  | { type: 'ADD_LEARNING_TOPIC'; payload: LearningTopic }
  | { type: 'UPDATE_LEARNING_TOPIC'; payload: LearningTopic }
  | { type: 'DELETE_LEARNING_TOPIC'; payload: string }
  | { type: 'COMPLETE_LEARNING'; payload: { topicId: string; success: boolean } }
  | { type: 'ADD_INTERVIEW'; payload: Interview }
  | { type: 'UPDATE_INTERVIEW'; payload: Interview }
  | { type: 'DELETE_INTERVIEW'; payload: string }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string };

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'ADD_DAILY_LOG':
      return { ...state, dailyLogs: [action.payload, ...state.dailyLogs] };

    case 'UPDATE_DAILY_LOG':
      return {
        ...state,
        dailyLogs: state.dailyLogs.map((log) =>
          log.id === action.payload.id ? action.payload : log
        ),
      };

    case 'DELETE_DAILY_LOG':
      return {
        ...state,
        dailyLogs: state.dailyLogs.filter((log) => log.id !== action.payload),
      };

    case 'ADD_LEARNING_TOPIC':
      return {
        ...state,
        learningTopics: [action.payload, ...state.learningTopics],
      };

    case 'UPDATE_LEARNING_TOPIC':
      return {
        ...state,
        learningTopics: state.learningTopics.map((topic) =>
          topic.id === action.payload.id ? action.payload : topic
        ),
      };

    case 'DELETE_LEARNING_TOPIC':
      return {
        ...state,
        learningTopics: state.learningTopics.filter(
          (topic) => topic.id !== action.payload
        ),
      };

    case 'COMPLETE_LEARNING': {
      const topic = state.learningTopics.find((t) => t.id === action.payload.topicId);
      if (!topic) return state;

      const today = formatDate(new Date());
      const updatedTopic: LearningTopic = {
        ...topic,
        status: 'completed',
        completedAt: today,
        revisionDays: [1, 3, 7],
        revisedOn: [],
      };

      const newStreakData = calculateStreak(state.streakData, today);

      return {
        ...state,
        learningTopics: state.learningTopics.map((t) =>
          t.id === action.payload.topicId ? updatedTopic : t
        ),
        streakData: newStreakData,
      };
    }

    case 'ADD_INTERVIEW':
      return { ...state, interviews: [action.payload, ...state.interviews] };

    case 'UPDATE_INTERVIEW':
      return {
        ...state,
        interviews: state.interviews.map((interview) =>
          interview.id === action.payload.id ? action.payload : interview
        ),
      };

    case 'DELETE_INTERVIEW':
      return {
        ...state,
        interviews: state.interviews.filter(
          (interview) => interview.id !== action.payload
        ),
      };

    case 'ADD_GOAL':
      return { ...state, goals: [action.payload, ...state.goals] };

    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map((goal) =>
          goal.id === action.payload.id ? action.payload : goal
        ),
      };

    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter((goal) => goal.id !== action.payload),
      };

    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addDailyLog: (log: Omit<DailyLog, 'id' | 'createdAt'>) => void;
  updateDailyLog: (log: DailyLog) => void;
  deleteDailyLog: (id: string) => void;
  addLearningTopic: (topic: Omit<LearningTopic, 'id' | 'createdAt' | 'status'>) => void;
  updateLearningTopic: (topic: LearningTopic) => void;
  deleteLearningTopic: (id: string) => void;
  completeLearning: (topicId: string, success: boolean) => void;
  addInterview: (interview: Omit<Interview, 'id' | 'timeline'>) => void;
  updateInterview: (interview: Interview) => void;
  deleteInterview: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'currentCount' | 'completed'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const savedState = loadState();
    dispatch({ type: 'LOAD_STATE', payload: savedState });
  }, []);

  const addDailyLog = (log: Omit<DailyLog, 'id' | 'createdAt'>) => {
    const newLog: DailyLog = {
      ...log,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_DAILY_LOG', payload: newLog });
  };

  const updateDailyLog = (log: DailyLog) => {
    dispatch({ type: 'UPDATE_DAILY_LOG', payload: log });
  };

  const deleteDailyLog = (id: string) => {
    dispatch({ type: 'DELETE_DAILY_LOG', payload: id });
  };

  const addLearningTopic = (
    topic: Omit<LearningTopic, 'id' | 'createdAt' | 'status'>
  ) => {
    const newTopic: LearningTopic = {
      ...topic,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_LEARNING_TOPIC', payload: newTopic });
  };

  const updateLearningTopic = (topic: LearningTopic) => {
    dispatch({ type: 'UPDATE_LEARNING_TOPIC', payload: topic });
  };

  const deleteLearningTopic = (id: string) => {
    dispatch({ type: 'DELETE_LEARNING_TOPIC', payload: id });
  };

  const completeLearning = (topicId: string, success: boolean) => {
    dispatch({ type: 'COMPLETE_LEARNING', payload: { topicId, success } });
  };

  const addInterview = (interview: Omit<Interview, 'id' | 'timeline'>) => {
    const newInterview: Interview = {
      ...interview,
      id: generateId(),
      timeline: [],
    };
    dispatch({ type: 'ADD_INTERVIEW', payload: newInterview });
  };

  const updateInterview = (interview: Interview) => {
    dispatch({ type: 'UPDATE_INTERVIEW', payload: interview });
  };

  const deleteInterview = (id: string) => {
    dispatch({ type: 'DELETE_INTERVIEW', payload: id });
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'currentCount' | 'completed'>) => {
    const newGoal: Goal = {
      ...goal,
      id: generateId(),
      currentCount: 0,
      completed: false,
    };
    dispatch({ type: 'ADD_GOAL', payload: newGoal });
  };

  const updateGoal = (goal: Goal) => {
    dispatch({ type: 'UPDATE_GOAL', payload: goal });
  };

  const deleteGoal = (id: string) => {
    dispatch({ type: 'DELETE_GOAL', payload: id });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
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
