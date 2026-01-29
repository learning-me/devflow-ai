import React from 'react';
import { StreakCard } from '@/components/dashboard/StreakCard';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { HeatmapCalendar } from '@/components/dashboard/HeatmapCalendar';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your progress, maintain streaks, and keep growing as a developer.
        </p>
      </div>

      {/* Top Section: Streak + Pomodoro + Heatmap */}
      <div className="grid lg:grid-cols-3 gap-6">
        <StreakCard />
        <PomodoroTimer />
        <HeatmapCalendar />
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
};

export default Dashboard;
