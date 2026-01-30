import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { DailyLog, LearningTopic, Interview, Goal, StreakData, PomodoroSession, Tag } from '@/types';
import { toast } from 'sonner';

export function useSupabaseData() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [learningTopics, setLearningTopics] = useState<LearningTopic[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    dailyActivity: {},
  });
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [logsRes, topicsRes, interviewsRes, goalsRes, streakRes, pomodoroRes] = await Promise.all([
        supabase.from('daily_logs').select('*').order('date', { ascending: false }),
        supabase.from('learning_topics').select('*').order('created_at', { ascending: false }),
        supabase.from('interviews').select('*').order('applied_date', { ascending: false }),
        supabase.from('goals').select('*').order('created_at', { ascending: false }),
        supabase.from('streak_data').select('*').single(),
        supabase.from('pomodoro_sessions').select('*').order('completed_at', { ascending: false }),
      ]);

      if (logsRes.data) {
        setDailyLogs(logsRes.data.map(mapDailyLog));
      }
      if (topicsRes.data) {
        setLearningTopics(topicsRes.data.map(mapLearningTopic));
      }
      if (interviewsRes.data) {
        setInterviews(interviewsRes.data.map(mapInterview));
      }
      if (goalsRes.data) {
        setGoals(goalsRes.data.map(mapGoal));
      }
      if (streakRes.data) {
        setStreakData(mapStreakData(streakRes.data));
      } else {
        // Create streak data if it doesn't exist
        const { data: newStreak } = await supabase.from('streak_data').insert({
          user_id: user.id,
          current_streak: 0,
          longest_streak: 0,
          daily_activity: {},
        }).select().single();
        if (newStreak) {
          setStreakData(mapStreakData(newStreak));
        }
      }
      if (pomodoroRes.data) {
        setPomodoroSessions(pomodoroRes.data.map(mapPomodoroSession));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Daily Logs
  const addDailyLog = async (log: Omit<DailyLog, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    const { data, error } = await supabase.from('daily_logs').insert({
      user_id: user.id,
      date: log.date,
      tasks: log.tasks,
      notes: log.notes,
      time_spent: log.timeSpent,
      tags: log.tags,
    }).select().single();

    if (error) {
      toast.error('Failed to add log');
      return;
    }

    if (data) {
      setDailyLogs(prev => [mapDailyLog(data), ...prev]);
      await updateStreak(log.date);
    }
  };

  const updateDailyLog = async (log: DailyLog) => {
    const { error } = await supabase.from('daily_logs').update({
      date: log.date,
      tasks: log.tasks,
      notes: log.notes,
      time_spent: log.timeSpent,
      tags: log.tags,
    }).eq('id', log.id);

    if (error) {
      toast.error('Failed to update log');
      return;
    }

    setDailyLogs(prev => prev.map(l => l.id === log.id ? log : l));
  };

  const deleteDailyLog = async (id: string) => {
    const { error } = await supabase.from('daily_logs').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete log');
      return;
    }
    setDailyLogs(prev => prev.filter(l => l.id !== id));
  };

  // Learning Topics
  const addLearningTopic = async (topic: Omit<LearningTopic, 'id' | 'createdAt' | 'status'>) => {
    if (!user) return;

    const { data, error } = await supabase.from('learning_topics').insert({
      user_id: user.id,
      title: topic.title,
      description: topic.description,
      tags: topic.tags,
      revision_days: topic.revisionDays || [1, 3, 7],
    }).select().single();

    if (error) {
      toast.error('Failed to add topic');
      return;
    }

    if (data) {
      setLearningTopics(prev => [mapLearningTopic(data), ...prev]);
    }
  };

  const updateLearningTopic = async (topic: LearningTopic) => {
    const { error } = await supabase.from('learning_topics').update({
      title: topic.title,
      description: topic.description,
      status: topic.status,
      completed_at: topic.completedAt,
      tags: topic.tags,
      revision_days: topic.revisionDays,
      revised_on: topic.revisedOn,
    }).eq('id', topic.id);

    if (error) {
      toast.error('Failed to update topic');
      return;
    }

    setLearningTopics(prev => prev.map(t => t.id === topic.id ? topic : t));
  };

  const deleteLearningTopic = async (id: string) => {
    const { error } = await supabase.from('learning_topics').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete topic');
      return;
    }
    setLearningTopics(prev => prev.filter(t => t.id !== id));
  };

  const completeLearning = async (topicId: string) => {
    const topic = learningTopics.find(t => t.id === topicId);
    if (!topic) return;

    const today = new Date().toISOString().split('T')[0];
    const updatedTopic: LearningTopic = {
      ...topic,
      status: 'completed',
      completedAt: today,
      revisionDays: [1, 3, 7],
      revisedOn: [],
    };

    await updateLearningTopic(updatedTopic);
    await updateStreak(today);
  };

  // Interviews
  const addInterview = async (interview: Omit<Interview, 'id' | 'timeline'>) => {
    if (!user) return;

    const { data, error } = await supabase.from('interviews').insert({
      user_id: user.id,
      company: interview.company,
      role: interview.role,
      status: interview.status,
      notes: interview.notes,
      applied_date: interview.appliedDate,
      timeline: [],
    }).select().single();

    if (error) {
      toast.error('Failed to add interview');
      return;
    }

    if (data) {
      setInterviews(prev => [mapInterview(data), ...prev]);
    }
  };

  const updateInterview = async (interview: Interview) => {
    const { error } = await supabase.from('interviews').update({
      company: interview.company,
      role: interview.role,
      status: interview.status,
      notes: interview.notes,
      timeline: JSON.parse(JSON.stringify(interview.timeline)),
      last_updated: new Date().toISOString(),
    }).eq('id', interview.id);

    if (error) {
      toast.error('Failed to update interview');
      return;
    }

    setInterviews(prev => prev.map(i => i.id === interview.id ? interview : i));
  };

  const deleteInterview = async (id: string) => {
    const { error } = await supabase.from('interviews').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete interview');
      return;
    }
    setInterviews(prev => prev.filter(i => i.id !== id));
  };

  // Goals
  const addGoal = async (goal: Omit<Goal, 'id' | 'currentCount' | 'completed'>) => {
    if (!user) return;

    const { data, error } = await supabase.from('goals').insert({
      user_id: user.id,
      title: goal.title,
      type: goal.type,
      target_count: goal.targetCount,
      linked_topics: goal.linkedTopics,
      start_date: goal.startDate,
      end_date: goal.endDate,
    }).select().single();

    if (error) {
      toast.error('Failed to add goal');
      return;
    }

    if (data) {
      setGoals(prev => [mapGoal(data), ...prev]);
    }
  };

  const updateGoal = async (goal: Goal) => {
    const { error } = await supabase.from('goals').update({
      title: goal.title,
      type: goal.type,
      target_count: goal.targetCount,
      current_count: goal.currentCount,
      linked_topics: goal.linkedTopics,
      start_date: goal.startDate,
      end_date: goal.endDate,
      completed: goal.completed,
    }).eq('id', goal.id);

    if (error) {
      toast.error('Failed to update goal');
      return;
    }

    setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete goal');
      return;
    }
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Pomodoro Sessions
  const addPomodoroSession = async (session: Omit<PomodoroSession, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase.from('pomodoro_sessions').insert({
      user_id: user.id,
      task_id: session.taskId,
      task_name: session.taskName,
      duration: session.duration,
      type: session.type,
      completed_at: session.completedAt,
    }).select().single();

    if (error) {
      toast.error('Failed to save session');
      return;
    }

    if (data) {
      setPomodoroSessions(prev => [mapPomodoroSession(data), ...prev]);
    }
  };

  // Streak Management
  const updateStreak = async (completedDate: string) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let newStreak = streakData.currentStreak;
    let newLongest = streakData.longestStreak;

    if (streakData.lastCompletedDate === today) {
      // Already completed today
      const newActivity = { ...streakData.dailyActivity };
      newActivity[completedDate] = (newActivity[completedDate] || 0) + 1;
      
      const { error } = await supabase.from('streak_data').update({
        daily_activity: newActivity,
      }).eq('user_id', user.id);

      if (!error) {
        setStreakData(prev => ({ ...prev, dailyActivity: newActivity }));
      }
      return;
    }

    if (streakData.lastCompletedDate === yesterday || streakData.lastCompletedDate === null) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    newLongest = Math.max(newLongest, newStreak);

    const newActivity = { ...streakData.dailyActivity };
    newActivity[completedDate] = (newActivity[completedDate] || 0) + 1;

    const { error } = await supabase.from('streak_data').update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_completed_date: completedDate,
      daily_activity: newActivity,
    }).eq('user_id', user.id);

    if (!error) {
      setStreakData({
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastCompletedDate: completedDate,
        dailyActivity: newActivity,
      });
    }
  };

  return {
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
    refetch: fetchData,
  };
}

// Mappers
function mapDailyLog(row: any): DailyLog {
  return {
    id: row.id,
    date: row.date,
    tasks: row.tasks,
    notes: row.notes || '',
    timeSpent: row.time_spent,
    tags: (row.tags || []) as Tag[],
    createdAt: row.created_at,
  };
}

function mapLearningTopic(row: any): LearningTopic {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    tags: (row.tags || []) as Tag[],
    revisionDays: row.revision_days || [1, 3, 7],
    revisedOn: row.revised_on || [],
  };
}

function mapInterview(row: any): Interview {
  return {
    id: row.id,
    company: row.company,
    role: row.role,
    status: row.status,
    notes: row.notes || '',
    appliedDate: row.applied_date,
    lastUpdated: row.last_updated,
    timeline: row.timeline || [],
  };
}

function mapGoal(row: any): Goal {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    targetCount: row.target_count,
    currentCount: row.current_count,
    linkedTopics: row.linked_topics || [],
    startDate: row.start_date,
    endDate: row.end_date,
    completed: row.completed,
  };
}

function mapStreakData(row: any): StreakData {
  return {
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastCompletedDate: row.last_completed_date,
    dailyActivity: row.daily_activity || {},
  };
}

function mapPomodoroSession(row: any): PomodoroSession {
  return {
    id: row.id,
    taskId: row.task_id,
    taskName: row.task_name,
    duration: row.duration,
    completedAt: row.completed_at,
    type: row.type,
  };
}