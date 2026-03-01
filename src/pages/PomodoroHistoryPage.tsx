import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Clock, Trash2, CalendarDays, ArrowLeft, Search } from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { PomodoroSession } from '@/types';
import { formatTime } from '@/lib/storage';
import { Link } from 'react-router-dom';

const PomodoroHistoryPage: React.FC = () => {
  const { state, deletePomodoroSession } = useApp();
  const [deleteSession, setDeleteSession] = useState<PomodoroSession | null>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const sessions = state.pomodoroSessions || [];

  const filteredSessions = useMemo(() => {
    let filtered = sessions.filter(s => s.type === 'work');

    if (dateFilter) {
      const filterDate = parseISO(dateFilter);
      filtered = filtered.filter(s => {
        const sessionDate = parseISO(s.completedAt);
        return isWithinInterval(sessionDate, {
          start: startOfDay(filterDate),
          end: endOfDay(filterDate),
        });
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        (s.taskName && s.taskName.toLowerCase().includes(q))
      );
    }

    return filtered.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [sessions, dateFilter, searchQuery]);

  // Group by date
  const groupedSessions = useMemo(() => {
    const groups: Record<string, typeof filteredSessions> = {};
    for (const session of filteredSessions) {
      const dateKey = format(parseISO(session.completedAt), 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(session);
    }
    return groups;
  }, [filteredSessions]);

  const dateKeys = Object.keys(groupedSessions);
  const totalMinutes = filteredSessions.reduce((acc, s) => acc + s.duration, 0);

  const handleDelete = async () => {
    if (!deleteSession) return;
    await deletePomodoroSession(deleteSession.id);
    setDeleteSession(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/pomodoro">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold mb-1">Session History</h1>
            <p className="text-muted-foreground">
              {filteredSessions.length} sessions — {formatTime(totalMinutes)} total focus
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by task name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-auto"
        />
        {(dateFilter || searchQuery) && (
          <Button variant="ghost" size="sm" onClick={() => { setDateFilter(''); setSearchQuery(''); }}>
            Clear
          </Button>
        )}
      </div>

      {/* Sessions grouped by date */}
      {dateKeys.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">
              {dateFilter || searchQuery ? 'No sessions match your filter.' : 'No sessions yet. Start your first pomodoro!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {dateKeys.map((dateKey) => {
            const daySessions = groupedSessions[dateKey];
            const dayMinutes = daySessions.reduce((acc, s) => acc + s.duration, 0);

            return (
              <Card key={dateKey}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-primary" />
                      {format(parseISO(dateKey), 'EEEE, MMM d, yyyy')}
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {daySessions.length} sessions — {formatTime(dayMinutes)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {daySessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 group hover:bg-secondary/60 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {session.taskName || 'Focus Session'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {session.duration} min — {format(parseISO(session.completedAt), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteSession(session)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleteSession}
        onOpenChange={(open) => !open && setDeleteSession(null)}
        onConfirm={handleDelete}
        title="Delete Session"
        description="Are you sure you want to delete this session? This cannot be undone."
      />
    </div>
  );
};

export default PomodoroHistoryPage;
