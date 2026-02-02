import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, addDays, endOfWeek, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { Goal } from '@/types';

interface GoalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    title: string;
    type: 'weekly' | 'monthly';
    targetCount: number;
    startDate: string;
    endDate: string;
  }) => void;
  editingGoal?: Goal | null;
}

export const GoalFormDialog: React.FC<GoalFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  editingGoal,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'weekly' | 'monthly'>('weekly');
  const [targetCount, setTargetCount] = useState('5');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(endOfWeek(new Date()));

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setType(editingGoal.type);
      setTargetCount(editingGoal.targetCount.toString());
      setStartDate(new Date(editingGoal.startDate));
      setEndDate(new Date(editingGoal.endDate));
    } else {
      resetForm();
    }
  }, [editingGoal, open]);

  const resetForm = () => {
    setTitle('');
    setType('weekly');
    setTargetCount('5');
    setStartDate(new Date());
    setEndDate(endOfWeek(new Date()));
  };

  const handleTypeChange = (newType: 'weekly' | 'monthly') => {
    setType(newType);
    if (newType === 'weekly') {
      setEndDate(endOfWeek(startDate));
    } else {
      setEndDate(endOfMonth(startDate));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      title: title.trim(),
      type,
      targetCount: parseInt(targetCount) || 1,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create Goal'}</DialogTitle>
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
              <Select value={type} onValueChange={handleTypeChange}>
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
                max="100"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'MMM d, yyyy') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'MMM d, yyyy') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    disabled={(date) => date < startDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingGoal ? 'Save Changes' : 'Create Goal'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
