import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Goal } from '@/types';
import { cn } from '@/lib/utils';
import { Plus, Trash2, Edit, Clock, Flame, CheckCircle } from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';

interface GoalCardProps {
  goal: Goal;
  onIncrement: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  isCompleted?: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onIncrement,
  onEdit,
  onDelete,
  isCompleted = false,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const getCountdown = (endDate: string) => {
    const end = parseISO(endDate);
    const today = new Date();
    const days = differenceInDays(end, today);

    if (days < 0) return { text: 'Overdue', urgent: true, days };
    if (days === 0) return { text: 'Due today', urgent: true, days };
    if (days === 1) return { text: '1 day left', urgent: true, days };
    return { text: `${days} days left`, urgent: days <= 3, days };
  };

  const progress = (goal.currentCount / goal.targetCount) * 100;
  const countdown = getCountdown(goal.endDate);

  const handleDelete = () => {
    onDelete(goal.id);
    setDeleteDialogOpen(false);
  };

  if (isCompleted) {
    return (
      <>
        <Card className="opacity-75">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success" />
                <div>
                  <h4 className="font-medium">{goal.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {goal.targetCount} completed • Ended {format(parseISO(goal.endDate), 'MMM d')}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteDialogOpen(true)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          title="Delete Goal"
          itemName={goal.title}
        />
      </>
    );
  }

  return (
    <>
      <Card className="card-hover">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    goal.type === 'weekly'
                      ? 'bg-accent/10 text-accent'
                      : 'bg-primary/10 text-primary'
                  )}
                >
                  {goal.type}
                </span>
                <div className="flex items-center gap-1">
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
              <h4 className="font-medium">{goal.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {format(parseISO(goal.startDate), 'MMM d')} - {format(parseISO(goal.endDate), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(goal)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteDialogOpen(true)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {goal.currentCount} / {goal.targetCount}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
            onClick={() => onIncrement(goal)}
            disabled={goal.currentCount >= goal.targetCount}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Progress
          </Button>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Goal"
        itemName={goal.title}
      />
    </>
  );
};
