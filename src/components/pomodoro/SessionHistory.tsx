import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, History, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { PomodoroSession } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const SessionHistory: React.FC = () => {
  const { state } = useApp();
  const [deleteSession, setDeleteSession] = useState<PomodoroSession | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sessions = state.pomodoroSessions || [];

  const handleDelete = async () => {
    if (!deleteSession) return;

    setDeletingId(deleteSession.id);
    try {
      const { error } = await supabase
        .from('pomodoro_sessions')
        .delete()
        .eq('id', deleteSession.id);

      if (error) throw error;

      toast({
        title: 'Session deleted',
        description: 'The session has been removed from history.',
      });

      // Trigger refetch by reloading (the hook will handle this)
      window.location.reload();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete session. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
      setDeleteSession(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Session History
            {sessions.length > 0 && (
              <span className="text-xs text-muted-foreground font-normal">
                ({sessions.length} sessions)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[350px] px-6 pb-6">
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No sessions yet. Start your first pomodoro!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg bg-secondary/50 group transition-colors hover:bg-secondary/70',
                      deletingId === session.id && 'opacity-50'
                    )}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                          session.type === 'work' ? 'bg-primary/10' : 'bg-green-500/10'
                        )}
                      >
                        <Clock
                          className={cn(
                            'w-4 h-4',
                            session.type === 'work' ? 'text-primary' : 'text-green-500'
                          )}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {session.type === 'work' ? 'Focus Session' : 'Break'} • {session.duration}min
                        </p>
                        {session.taskName && (
                          <p className="text-xs text-muted-foreground truncate">{session.taskName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">
                          {format(parseISO(session.completedAt), 'h:mm a')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(session.completedAt), 'MMM d')}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteSession(session)}
                        disabled={deletingId === session.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={!!deleteSession}
        onOpenChange={(open) => !open && setDeleteSession(null)}
        onConfirm={handleDelete}
        title="Delete Session"
        description="Are you sure you want to delete this session from your history? This action cannot be undone."
      />
    </>
  );
};
