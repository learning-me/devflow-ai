import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { getActivityLevel } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export const HeatmapCalendar: React.FC = () => {
  const { state } = useApp();
  const { dailyActivity } = state.streakData;

  // Generate last 12 weeks of dates
  const weeks: string[][] = [];
  const today = new Date();
  
  for (let w = 11; w >= 0; w--) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (w * 7 + (6 - d)));
      week.push(date.toISOString().split('T')[0]);
    }
    weeks.push(week);
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-2 text-xs text-muted-foreground">
            {days.map((day, i) => (
              <div key={day} className="h-3 flex items-center">
                {i % 2 === 1 && <span>{day}</span>}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((date) => {
                  const count = dailyActivity[date] || 0;
                  const level = getActivityLevel(count);
                  return (
                    <Tooltip key={date}>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'w-3 h-3 rounded-sm transition-colors cursor-pointer',
                            `heatmap-${level}`
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          {new Date(date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                          : {count} activities
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn('w-3 h-3 rounded-sm', `heatmap-${level}`)}
            />
          ))}
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
};
