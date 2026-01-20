import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '@/contexts/AppContext';
import { formatDisplayDate } from '@/lib/storage';
import { InterviewForm } from './InterviewForm';
import { Trash2, Edit, Briefcase, Building2 } from 'lucide-react';
import { Interview } from '@/types';
import { cn } from '@/lib/utils';

const statusConfig: Record<
  Interview['status'],
  { label: string; color: string; bgColor: string }
> = {
  applied: { label: 'Applied', color: 'text-accent', bgColor: 'bg-accent/10' },
  hr: { label: 'HR Round', color: 'text-primary', bgColor: 'bg-primary/10' },
  technical: { label: 'Technical', color: 'text-warning', bgColor: 'bg-warning/10' },
  offer: { label: 'Offer', color: 'text-success', bgColor: 'bg-success/10' },
  rejected: { label: 'Rejected', color: 'text-destructive', bgColor: 'bg-destructive/10' },
};

export const InterviewList: React.FC = () => {
  const { state, deleteInterview } = useApp();
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [filter, setFilter] = useState<Interview['status'] | 'all'>('all');

  const filteredInterviews = state.interviews.filter((interview) => {
    if (filter === 'all') return true;
    return interview.status === filter;
  });

  // Group by status for pipeline view
  const pipelineGroups = {
    applied: state.interviews.filter((i) => i.status === 'applied'),
    hr: state.interviews.filter((i) => i.status === 'hr'),
    technical: state.interviews.filter((i) => i.status === 'technical'),
    offer: state.interviews.filter((i) => i.status === 'offer'),
    rejected: state.interviews.filter((i) => i.status === 'rejected'),
  };

  if (state.interviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No interviews tracked yet</h3>
        <p className="text-muted-foreground">
          Start tracking your job applications and interview progress.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Pipeline Overview */}
      <div className="grid grid-cols-5 gap-2 mb-8">
        {Object.entries(pipelineGroups).map(([status, interviews]) => {
          const config = statusConfig[status as Interview['status']];
          return (
            <div
              key={status}
              className={cn('p-3 rounded-lg text-center', config.bgColor)}
            >
              <div className={cn('text-2xl font-bold', config.color)}>
                {interviews.length}
              </div>
              <div className="text-xs text-muted-foreground">{config.label}</div>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'applied', 'hr', 'technical', 'offer', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {f === 'all' ? 'All' : statusConfig[f].label}
          </button>
        ))}
      </div>

      {/* Interview Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredInterviews.map((interview) => {
          const config = statusConfig[interview.status];
          return (
            <Card key={interview.id} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <h3 className="font-semibold truncate">{interview.company}</h3>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">{interview.role}</p>

                    <div className="flex items-center gap-3 mb-3">
                      <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', config.bgColor, config.color)}>
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Applied {formatDisplayDate(interview.appliedDate)}
                      </span>
                    </div>

                    {interview.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {interview.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingInterview(interview)}
                      className="h-8 w-8"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteInterview(interview.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!editingInterview} onOpenChange={() => setEditingInterview(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Interview</DialogTitle>
          </DialogHeader>
          {editingInterview && (
            <InterviewForm
              editInterview={editingInterview}
              onClose={() => setEditingInterview(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
