import React from 'react';
import { Flame, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

export const StreakCard: React.FC = () => {
  const { state } = useApp();
  const { currentStreak, longestStreak, lastCompletedDate } = state.streakData;

  const isActiveToday = lastCompletedDate === new Date().toISOString().split('T')[0];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Learning Streak</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-bold">{currentStreak}</span>
              <span className="text-muted-foreground">days</span>
            </div>
          </div>
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
              isActiveToday ? 'bg-success text-success-foreground' : 'bg-muted'
            )}
          >
            <Flame className="w-6 h-6" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Best</p>
              <p className="font-medium">{longestStreak} days</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Today</p>
              <p className={cn('font-medium flex items-center gap-1', isActiveToday ? 'text-success' : 'text-muted-foreground')}>
                {isActiveToday ? <><CheckCircle className="w-3 h-3" /> Done</> : 'Pending'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
