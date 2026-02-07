import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { formatTime } from '@/lib/storage';
import { Timer, BookOpen, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isToday, parseISO, isThisWeek } from 'date-fns';

export const FocusSummary: React.FC = () => {
  const { state } = useApp();

  const todaySessions = state.pomodoroSessions.filter(
    (s) => isToday(parseISO(s.completedAt)) && s.type === 'work'
  );
  const weekSessions = state.pomodoroSessions.filter(
    (s) => isThisWeek(parseISO(s.completedAt)) && s.type === 'work'
  );
  const totalFocusTime = weekSessions.reduce((acc, s) => acc + s.duration, 0);

  const completedTopics = state.learningTopics.filter((t) => t.status === 'completed');
  const pendingTopics = state.learningTopics.filter(
    (t) => t.status === 'pending' || t.status === 'in-progress'
  );
  const activeGoals = state.goals.filter((g) => !g.completed);

  const stats = [
    {
      icon: Timer,
      label: 'Focus Today',
      value: `${todaySessions.length} sessions`,
      subtext: formatTime(todaySessions.reduce((acc, s) => acc + s.duration, 0)),
      link: '/pomodoro',
    },
    {
      icon: BookOpen,
      label: 'Learning',
      value: `${completedTopics.length} completed`,
      subtext: `${pendingTopics.length} in progress`,
      link: '/learning',
    },
    {
      icon: TrendingUp,
      label: 'This Week',
      value: `${weekSessions.length} sessions`,
      subtext: formatTime(totalFocusTime),
      link: '/pomodoro',
    },
    {
      icon: Target,
      label: 'Goals',
      value: `${activeGoals.length} active`,
      subtext: `${state.goals.filter((g) => g.completed).length} completed`,
      link: '/goals',
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Weekly Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              to={stat.link}
              className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary border border-transparent hover:border-border transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <div className="text-sm font-semibold">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.subtext}</div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
