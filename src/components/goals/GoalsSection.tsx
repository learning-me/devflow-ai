import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { Plus, Target, Trash2, CheckCircle } from 'lucide-react';
import { Goal } from '@/types';
import { cn } from '@/lib/utils';

export const GoalsSection: React.FC = () => {
  const { state, addGoal, updateGoal, deleteGoal } = useApp();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'weekly' | 'monthly'>('weekly');
  const [targetCount, setTargetCount] = useState('5');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    let endDate: Date;

    if (type === 'weekly') {
      endDate = new Date(now);
      endDate.setDate(endDate.getDate() + (7 - endDate.getDay()));
    } else {
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    addGoal({
      title,
      type,
      targetCount: parseInt(targetCount),
      linkedTopics: [],
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
    });

    setTitle('');
    setType('weekly');
    setTargetCount('5');
    setOpen(false);
  };

  const incrementGoal = (goal: Goal) => {
    const newCount = Math.min(goal.currentCount + 1, goal.targetCount);
    updateGoal({
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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goalTitle">Goal Title</Label>
                <Input
                  id="goalTitle"
                  placeholder="e.g., Complete 5 DSA topics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as 'weekly' | 'monthly')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Target Count</Label>
                  <Input
                    id="target"
                    type="number"
                    min="1"
                    value={targetCount}
                    onChange={(e) => setTargetCount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Goal</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                {activeGoals.map((goal) => {
                  const progress = (goal.currentCount / goal.targetCount) * 100;
                  return (
                    <Card key={goal.id} className="card-hover">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
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
                            </div>
                            <h4 className="font-medium">{goal.title}</h4>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteGoal(goal.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
                          onClick={() => incrementGoal(goal)}
                          disabled={goal.currentCount >= goal.targetCount}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Progress
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {completedGoals.map((goal) => (
                  <Card key={goal.id} className="opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-success" />
                          <div>
                            <h4 className="font-medium">{goal.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {goal.targetCount} completed
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteGoal(goal.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
