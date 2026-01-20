import React from 'react';
import { BookOpen, CheckCircle, Clock, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';

export const StatsCards: React.FC = () => {
  const { state } = useApp();

  const completedTopics = state.learningTopics.filter(
    (t) => t.status === 'completed'
  ).length;
  const pendingTopics = state.learningTopics.filter(
    (t) => t.status === 'pending' || t.status === 'in-progress'
  ).length;
  const totalTimeToday = state.dailyLogs
    .filter((log) => log.date === new Date().toISOString().split('T')[0])
    .reduce((acc, log) => acc + log.timeSpent, 0);
  const activeInterviews = state.interviews.filter(
    (i) => i.status !== 'rejected' && i.status !== 'offer'
  ).length;

  const stats = [
    {
      label: 'Topics Completed',
      value: completedTopics,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Topics Pending',
      value: pendingTopics,
      icon: BookOpen,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Time Today',
      value: `${Math.floor(totalTimeToday / 60)}h ${totalTimeToday % 60}m`,
      icon: Clock,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Active Interviews',
      value: activeInterviews,
      icon: Briefcase,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
