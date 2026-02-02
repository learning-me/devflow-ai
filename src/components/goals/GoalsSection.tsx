import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { Plus, Target } from 'lucide-react';
import { Goal } from '@/types';
import { GoalCard } from './GoalCard';
import { GoalFormDialog } from './GoalFormDialog';

export const GoalsSection: React.FC = () => {
  const { state, addGoal, updateGoal, deleteGoal } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const handleSubmit = async (data: {
    title: string;
    type: 'weekly' | 'monthly';
    targetCount: number;
    startDate: string;
    endDate: string;
  }) => {
    if (editingGoal) {
      await updateGoal({
        ...editingGoal,
        title: data.title,
        type: data.type,
        targetCount: data.targetCount,
        startDate: data.startDate,
        endDate: data.endDate,
      });
    } else {
      await addGoal({
        title: data.title,
        type: data.type,
        targetCount: data.targetCount,
        linkedTopics: [],
        startDate: data.startDate,
        endDate: data.endDate,
      });
    }
    setEditingGoal(null);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormOpen(true);
  };

  const incrementGoal = async (goal: Goal) => {
    const newCount = Math.min(goal.currentCount + 1, goal.targetCount);
    await updateGoal({
      ...goal,
      currentCount: newCount,
      completed: newCount >= goal.targetCount,
    });
  };

  const activeGoals = state.goals.filter((g) => !g.completed);
  const completedGoals = state.goals.filter((g) => g.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Goals</h2>
          <p className="text-muted-foreground">Track your weekly and monthly targets</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditingGoal(null);
            setFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4" />
          New Goal
        </Button>
      </div>

      <GoalFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingGoal(null);
        }}
        onSubmit={handleSubmit}
        editingGoal={editingGoal}
      />

      {state.goals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No goals set</h3>
            <p className="text-muted-foreground">
              Create weekly or monthly goals to stay consistent with your learning.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Active Goals</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onIncrement={incrementGoal}
                    onEdit={handleEdit}
                    onDelete={deleteGoal}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {completedGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onIncrement={incrementGoal}
                    onEdit={handleEdit}
                    onDelete={deleteGoal}
                    isCompleted
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
