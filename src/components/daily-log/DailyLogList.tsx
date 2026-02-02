import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { formatDisplayDate, formatTime } from '@/lib/storage';
import { TagBadge } from '@/components/ui/TagBadge';
import { DailyLogForm } from './DailyLogForm';
import { Trash2, Edit, Clock } from 'lucide-react';
import { DailyLog } from '@/types';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';

export const DailyLogList: React.FC = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  const { state, deleteDailyLog } = useApp();
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);

  // Group logs by date
  const groupedLogs = state.dailyLogs.reduce((acc, log) => {
    const month = new Date(log.date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    if (!acc[month]) acc[month] = [];
    acc[month].push(log);
    return acc;
  }, {} as Record<string, DailyLog[]>);

  if (state.dailyLogs.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No entries yet</h3>
        <p className="text-muted-foreground">
          Start tracking your daily work to see your progress here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {Object.entries(groupedLogs).map(([month, logs]) => (
          <div key={month}>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              {month}
            </h3>
            <div className="space-y-3">
              {logs.map((log) => (
                <Card key={log.id} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium">
                            {formatDisplayDate(log.date)}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(log.timeSpent)}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{log.tasks}</p>
                        {log.notes && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {log.notes}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          {log.tags.map((tag) => (
                            <TagBadge key={tag} tag={tag} />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingLog(log)}
                          className="h-8 w-8"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingLogId(log.id);
                            setDeleteDialogOpen(true);
                          }}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editingLog} onOpenChange={() => setEditingLog(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Daily Log</DialogTitle>
          </DialogHeader>
          {editingLog && (
            <DailyLogForm
              editLog={editingLog}
              onClose={() => setEditingLog(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          if (deletingLogId) {
            deleteDailyLog(deletingLogId);
            setDeletingLogId(null);
          }
          setDeleteDialogOpen(false);
        }}
        title="Delete Daily Log"
        description="Are you sure you want to delete this log entry? This action cannot be undone."
      />
    </>
  );
};
