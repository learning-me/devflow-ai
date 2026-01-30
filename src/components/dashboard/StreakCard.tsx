import React from 'react';
import { Flame, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

export const StreakCard: React.FC = () => {
  const { state } = useApp();
  const { currentStreak, longestStreak, lastCompletedDate } = state.streakData;

  const isActiveToday = lastCompletedDate === new Date().toISOString().split('T')[0];

  return (
    <Card className="card-hover overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 pointer-events-none" />
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Learning Streak
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-primary">{currentStreak}</span>
              <span className="text-lg text-muted-foreground">days</span>
            </div>
          </div>
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              isActiveToday ? 'bg-primary animate-pulse-glow' : 'bg-primary/20'
            }`}
          >
            <Flame
              className={`w-8 h-8 ${
                isActiveToday ? 'text-primary-foreground' : 'text-primary'
              }`}
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Longest</p>
              <p className="font-semibold">{longestStreak} days</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Calendar className="w-4 h-4 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Today</p>
              <p className={cn("font-semibold", isActiveToday ? "text-success" : "text-muted-foreground")}>
                {isActiveToday ? '✓ Done' : 'Not yet'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
