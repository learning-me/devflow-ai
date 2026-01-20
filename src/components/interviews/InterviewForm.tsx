import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Interview } from '@/types';
import { useApp } from '@/contexts/AppContext';

interface InterviewFormProps {
  editInterview?: Interview;
  onClose?: () => void;
}

const statusOptions = [
  { value: 'applied', label: 'Applied' },
  { value: 'hr', label: 'HR Round' },
  { value: 'technical', label: 'Technical Round' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
];

export const InterviewForm: React.FC<InterviewFormProps> = ({ editInterview, onClose }) => {
  const { addInterview, updateInterview } = useApp();
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState(editInterview?.company || '');
  const [role, setRole] = useState(editInterview?.role || '');
  const [status, setStatus] = useState<Interview['status']>(editInterview?.status || 'applied');
  const [notes, setNotes] = useState(editInterview?.notes || '');
  const [appliedDate, setAppliedDate] = useState(
    editInterview?.appliedDate || new Date().toISOString().split('T')[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editInterview) {
      updateInterview({
        ...editInterview,
        company,
        role,
        status,
        notes,
        appliedDate,
        lastUpdated: new Date().toISOString(),
      });
    } else {
      addInterview({
        company,
        role,
        status,
        notes,
        appliedDate,
        lastUpdated: new Date().toISOString(),
      });
    }

    setCompany('');
    setRole('');
    setStatus('applied');
    setNotes('');
    setAppliedDate(new Date().toISOString().split('T')[0]);
    setOpen(false);
    onClose?.();
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            placeholder="Company name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            placeholder="Job title"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as Interview['status'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="appliedDate">Applied Date</Label>
          <Input
            id="appliedDate"
            type="date"
            value={appliedDate}
            onChange={(e) => setAppliedDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Preparation notes, feedback, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
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
        <Button type="submit">{editInterview ? 'Update' : 'Add Interview'}</Button>
      </div>
    </form>
  );

  if (editInterview) {
    return formContent;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Interview
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Interview</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};
