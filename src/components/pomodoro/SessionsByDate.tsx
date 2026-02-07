import React, { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarDays, Clock, Timer } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/storage';

export const SessionsByDate: React.FC = () => {
  const { state } = useApp();

  const groupedSessions = useMemo(() => {
    const sessions = [...(state.pomodoroSessions || [])].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    const groups: Record<string, typeof sessions> = {};
    for (const session of sessions) {
      const dateKey = format(parseISO(session.completedAt), 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(session);
    }
    return groups;
  }, [state.pomodoroSessions]);

  const dateKeys = Object.keys(groupedSessions);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          Sessions by Date
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-6 pb-6">
          {dateKeys.length === 0 ? (
            <div className="text-center py-8">
              <Timer className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                No sessions yet. Start your first pomodoro!
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {dateKeys.map((dateKey) => {
                const sessions = groupedSessions[dateKey];
                const workSessions = sessions.filter((s) => s.type === 'work');
                const totalMinutes = workSessions.reduce((acc, s) => acc + s.duration, 0);

                return (
                  <div key={dateKey}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold">
                        {format(parseISO(dateKey), 'EEEE, MMM d')}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{workSessions.length} sessions</span>
                        <span className="text-muted-foreground/50">|</span>
                        <span>{formatTime(totalMinutes)}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/40"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={cn(
                                'w-7 h-7 rounded-md flex items-center justify-center',
                                session.type === 'work' ? 'bg-primary/10' : 'bg-success/10'
                              )}
                            >
                              <Clock
                                className={cn(
                                  'w-3.5 h-3.5',
                                  session.type === 'work' ? 'text-primary' : 'text-success'
                                )}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {session.type === 'work' ? 'Focus' : 'Break'} — {session.duration}min
                              </p>
                              {session.taskName && (
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {session.taskName}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(parseISO(session.completedAt), 'h:mm a')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
