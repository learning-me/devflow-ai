import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { formatTime } from '@/lib/storage';
import { BookOpen, Timer, CheckCircle, Target, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isToday, parseISO, isThisWeek, format } from 'date-fns';

export const RecentActivity: React.FC = () => {
  const { state } = useApp();

  // Calculate stats
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

  // Get recent completed topics (last 5)
  const recentCompletedTopics = [...completedTopics]
    .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
    .slice(0, 5);

  // Get recent pomodoro sessions (last 5)
  const recentSessions = [...state.pomodoroSessions]
    .filter(s => s.type === 'work')
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 5);

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
      icon: CheckCircle,
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
    <div className="space-y-6">
      {/* Stats Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Quick Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

      {/* Recent Activity Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSessions.length === 0 && recentCompletedTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No recent activity. Start a Pomodoro session or complete a topic!
            </p>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {session.taskName || 'Focus session'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.duration} min • {format(parseISO(session.completedAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
