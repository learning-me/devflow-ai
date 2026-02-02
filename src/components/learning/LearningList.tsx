import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { formatDisplayDate } from '@/lib/storage';
import { TagBadge } from '@/components/ui/TagBadge';
import { Trash2, CheckCircle, Clock, BookOpen, RotateCcw } from 'lucide-react';
import { LearningTopic } from '@/types';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO, format } from 'date-fns';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';

export const LearningList: React.FC = () => {
  const { state, deleteLearningTopic, updateLearningTopic, completeLearning } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'revision'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);
  const [deletingTopicName, setDeletingTopicName] = useState<string>('');

  // Get topics that need revision today
  const getRevisionDue = (topic: LearningTopic): number | null => {
    if (topic.status !== 'completed' || !topic.completedAt) return null;
    
    const completedDate = parseISO(topic.completedAt);
    const today = new Date();
    const daysSinceCompletion = differenceInDays(today, completedDate);
    
    const revisionDays = topic.revisionDays || [1, 3, 7];
    const revisedOn = topic.revisedOn || [];
    
    for (const day of revisionDays) {
      if (daysSinceCompletion >= day) {
        // Check if already revised for this day
        const revisionDate = new Date(completedDate);
        revisionDate.setDate(revisionDate.getDate() + day);
        const revisionDateStr = format(revisionDate, 'yyyy-MM-dd');
        
        if (!revisedOn.includes(revisionDateStr)) {
          return day;
        }
      }
    }
    return null;
  };

  const filteredTopics = state.learningTopics.filter((topic) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return topic.status === 'pending' || topic.status === 'in-progress';
    if (filter === 'revision') return getRevisionDue(topic) !== null;
    return topic.status === filter;
  });

  const handleMarkComplete = (topic: LearningTopic) => {
    completeLearning(topic.id);
  };

  const handleRevise = (topic: LearningTopic, day: number) => {
    const completedDate = parseISO(topic.completedAt!);
    const revisionDate = new Date(completedDate);
    revisionDate.setDate(revisionDate.getDate() + day);
    const revisionDateStr = format(revisionDate, 'yyyy-MM-dd');
    
    const revisedOn = topic.revisedOn || [];
    updateLearningTopic({
      ...topic,
      revisedOn: [...revisedOn, revisionDateStr],
    });
  };

  const revisionCount = state.learningTopics.filter((t) => getRevisionDue(t) !== null).length;

  if (state.learningTopics.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No learning topics yet</h3>
        <p className="text-muted-foreground">
          Add topics you want to learn and track your progress with spaced repetition.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'pending', 'completed', 'revision'] as const).map((f) => (
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
            {f === 'revision' ? 'Due for Revision' : f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'revision' && revisionCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full">
                {revisionCount}
              </span>
            )}
            {f === 'pending' && (
              <span className="ml-2 text-xs opacity-70">
                ({state.learningTopics.filter((t) => t.status === 'pending' || t.status === 'in-progress').length})
              </span>
            )}
            {f === 'completed' && (
              <span className="ml-2 text-xs opacity-70">
                ({state.learningTopics.filter((t) => t.status === 'completed').length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredTopics.map((topic) => {
          const revisionDue = getRevisionDue(topic);
          
          return (
            <Card key={topic.id} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {topic.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                      ) : (
                        <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <h3 className="font-medium truncate">{topic.title}</h3>
                    </div>

                    {topic.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {topic.description}
                      </p>
                    )}

                    {/* Revision badges for completed topics */}
                    {topic.status === 'completed' && topic.completedAt && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {(topic.revisionDays || [1, 3, 7]).map((day) => {
                          const completedDate = parseISO(topic.completedAt!);
                          const revisionDate = new Date(completedDate);
                          revisionDate.setDate(revisionDate.getDate() + day);
                          const revisionDateStr = format(revisionDate, 'yyyy-MM-dd');
                          const isRevised = (topic.revisedOn || []).includes(revisionDateStr);
                          const isDue = revisionDue === day;
                          
                          return (
                            <span
                              key={day}
                              className={cn(
                                'text-xs px-2 py-1 rounded-full font-medium',
                                isRevised 
                                  ? 'bg-success/20 text-success'
                                  : isDue
                                  ? 'bg-destructive/20 text-destructive'
                                  : 'bg-muted text-muted-foreground'
                              )}
                            >
                              Day {day} {isRevised ? '✓' : isDue ? '!' : ''}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {topic.tags.map((tag) => (
                        <TagBadge key={tag} tag={tag} />
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Added {formatDisplayDate(topic.createdAt)}</span>
                      {topic.completedAt && (
                        <span className="text-success">
                          Completed {formatDisplayDate(topic.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {topic.status === 'pending' || topic.status === 'in-progress' ? (
                      <Button size="sm" onClick={() => handleMarkComplete(topic)} className="gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Complete
                      </Button>
                    ) : revisionDue !== null ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRevise(topic, revisionDue)}
                        className="gap-1.5 border-destructive text-destructive hover:bg-destructive/10"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Revise
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeletingTopicId(topic.id);
                        setDeletingTopicName(topic.title);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          if (deletingTopicId) {
            deleteLearningTopic(deletingTopicId);
            setDeletingTopicId(null);
            setDeletingTopicName('');
          }
          setDeleteDialogOpen(false);
        }}
        title="Delete Learning Topic"
        itemName={deletingTopicName}
      />
    </>
  );
};
