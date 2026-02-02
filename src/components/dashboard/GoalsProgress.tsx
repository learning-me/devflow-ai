import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { Target, Clock, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { differenceInDays, parseISO, format } from 'date-fns';
import { cn } from '@/lib/utils';

export const GoalsProgress: React.FC = () => {
  const { state } = useApp();

  const activeGoals = state.goals.filter((g) => !g.completed).slice(0, 3);

  const getCountdown = (endDate: string) => {
    const end = parseISO(endDate);
    const today = new Date();
    const days = differenceInDays(end, today);
    
    if (days < 0) return { text: 'Overdue', urgent: true };
    if (days === 0) return { text: 'Due today', urgent: true };
    if (days === 1) return { text: '1 day left', urgent: true };
    return { text: `${days} days left`, urgent: days <= 3 };
  };

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Active Goals
        </CardTitle>
        <Link to="/goals" className="text-sm text-accent hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeGoals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No active goals. Set some targets to track!
          </p>
        ) : (
          activeGoals.map((goal) => {
            const progress = (goal.currentCount / goal.targetCount) * 100;
            const countdown = getCountdown(goal.endDate);

            return (
              <div
                key={goal.id}
                className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{goal.title}</span>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        goal.type === 'weekly'
                          ? 'bg-accent/20 text-accent'
                          : 'bg-primary/20 text-primary'
                      )}
                    >
                      {goal.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock
                      className={cn(
                        'w-3 h-3',
                        countdown.urgent ? 'text-destructive' : 'text-muted-foreground'
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs',
                        countdown.urgent ? 'text-destructive font-medium' : 'text-muted-foreground'
                      )}
                    >
                      {countdown.text}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {goal.currentCount} / {goal.targetCount}
                    </span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
