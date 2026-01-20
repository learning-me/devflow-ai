import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { Tag, DailyLog } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

const availableTags: { value: Tag; label: string }[] = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'dsa', label: 'DSA' },
  { value: 'devops', label: 'DevOps' },
  { value: 'system-design', label: 'System Design' },
  { value: 'other', label: 'Other' },
];

interface DailyLogFormProps {
  editLog?: DailyLog;
  onClose?: () => void;
}

export const DailyLogForm: React.FC<DailyLogFormProps> = ({ editLog, onClose }) => {
  const { addDailyLog, updateDailyLog } = useApp();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(editLog?.date || new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState(editLog?.tasks || '');
  const [notes, setNotes] = useState(editLog?.notes || '');
  const [timeSpent, setTimeSpent] = useState(editLog?.timeSpent?.toString() || '60');
  const [selectedTags, setSelectedTags] = useState<Tag[]>(editLog?.tags || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editLog) {
      updateDailyLog({
        ...editLog,
        date,
        tasks,
        notes,
        timeSpent: parseInt(timeSpent) || 0,
        tags: selectedTags,
      });
    } else {
      addDailyLog({
        date,
        tasks,
        notes,
        timeSpent: parseInt(timeSpent) || 0,
        tags: selectedTags,
      });
    }

    setDate(new Date().toISOString().split('T')[0]);
    setTasks('');
    setNotes('');
    setTimeSpent('60');
    setSelectedTags([]);
    setOpen(false);
    onClose?.();
  };

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Time Spent (minutes)</Label>
          <Input
            id="time"
            type="number"
            min="1"
            value={timeSpent}
            onChange={(e) => setTimeSpent(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tasks">Tasks Worked On</Label>
        <Input
          id="tasks"
          placeholder="What did you work on today?"
          value={tasks}
          onChange={(e) => setTasks(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Markdown supported)</Label>
        <Textarea
          id="notes"
          placeholder="Add any notes, learnings, or blockers..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag.value}
              type="button"
              onClick={() => toggleTag(tag.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                selectedTags.includes(tag.value)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setOpen(false);
            onClose?.();
          }}
        >
          Cancel
        </Button>
        <Button type="submit">
          {editLog ? 'Update Entry' : 'Add Entry'}
        </Button>
      </div>
    </form>
  );

  if (editLog) {
    return formContent;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Entry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Daily Log</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};
