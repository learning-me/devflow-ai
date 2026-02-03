import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useApp } from './AppContext';

interface PomodoroContextType {
  timeLeft: number;
  isRunning: boolean;
  isBreak: boolean;
  workMinutes: number;
  breakMinutes: number;
  soundEnabled: boolean;
  selectedTopicId: string;
  selectedTaskId: string;
  linkType: 'task' | 'topic';
  isFloating: boolean;
  floatingPosition: { x: number; y: number };
  setWorkMinutes: (mins: number) => void;
  setBreakMinutes: (mins: number) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSelectedTopicId: (id: string) => void;
  setSelectedTaskId: (id: string) => void;
  setLinkType: (type: 'task' | 'topic') => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  setIsFloating: (floating: boolean) => void;
  setFloatingPosition: (pos: { x: number; y: number }) => void;
  getSessionName: () => string | undefined;
  progress: number;
  totalTime: number;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const PomodoroProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { state, addPomodoroSession } = useApp();

  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('none');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('none');
  const [linkType, setLinkType] = useState<'task' | 'topic'>('topic');
  const [isFloating, setIsFloating] = useState(false);
  const [floatingPosition, setFloatingPosition] = useState({ x: 20, y: 20 });

  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const activeTopics = state.learningTopics.filter(
    (t) => t.status === 'pending' || t.status === 'in-progress'
  );
  const recentTasks = state.dailyLogs.slice(0, 10);

  const playAlarm = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      for (let i = 0; i < 3; i++) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
        const startTime = ctx.currentTime + i * 0.3;
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.2);
      }
    } catch {
      // Audio not supported
    }
  }, [soundEnabled]);

  const getSessionName = useCallback(() => {
    if (linkType === 'topic' && selectedTopicId !== 'none') {
      const topic = activeTopics.find((t) => t.id === selectedTopicId);
      return topic?.title?.slice(0, 50);
    } else if (linkType === 'task' && selectedTaskId !== 'none') {
      const task = recentTasks.find((t) => t.id === selectedTaskId);
      return task?.tasks?.split('\n')[0]?.slice(0, 50);
    }
    return undefined;
  }, [linkType, selectedTopicId, selectedTaskId, activeTopics, recentTasks]);

  const recordSession = useCallback(
    (type: 'work' | 'break', duration: number) => {
      const taskId = linkType === 'task' && selectedTaskId !== 'none' ? selectedTaskId : undefined;
      const topicId = linkType === 'topic' && selectedTopicId !== 'none' ? selectedTopicId : undefined;

      addPomodoroSession({
        taskId: taskId || topicId,
        taskName: getSessionName(),
        duration,
        completedAt: new Date().toISOString(),
        type,
      });
    },
    [addPomodoroSession, linkType, selectedTaskId, selectedTopicId, getSessionName]
  );

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playAlarm();
            setIsRunning(false);
            if (isBreak) {
              recordSession('break', breakMinutes);
              setIsBreak(false);
              return workMinutes * 60;
            } else {
              recordSession('work', workMinutes);
              setIsBreak(true);
              return breakMinutes * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isBreak, workMinutes, breakMinutes, playAlarm, recordSession]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workMinutes * 60);
  };

  const totalTime = isBreak ? breakMinutes * 60 : workMinutes * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <PomodoroContext.Provider
      value={{
        timeLeft,
        isRunning,
        isBreak,
        workMinutes,
        breakMinutes,
        soundEnabled,
        selectedTopicId,
        selectedTaskId,
        linkType,
        isFloating,
        floatingPosition,
        setWorkMinutes,
        setBreakMinutes,
        setSoundEnabled,
        setSelectedTopicId,
        setSelectedTaskId,
        setLinkType,
        toggleTimer,
        resetTimer,
        setIsFloating,
        setFloatingPosition,
        getSessionName,
        progress,
        totalTime,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = (): PomodoroContextType => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};
