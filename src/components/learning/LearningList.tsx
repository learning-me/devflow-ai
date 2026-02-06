import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { formatDisplayDate, formatTime } from '@/lib/storage';
import { TagBadge } from '@/components/ui/TagBadge';
import { Trash2, CheckCircle, Clock, BookOpen, RotateCcw, ChevronDown, ChevronUp, Plus, Timer, Undo2 } from 'lucide-react';
import { LearningTopic, Subtopic } from '@/types';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO, format, isToday } from 'date-fns';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const LearningList: React.FC = () => {
  const { state, deleteLearningTopic, updateLearningTopic, completeLearning } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'revision'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);
  const [deletingTopicName, setDeletingTopicName] = useState<string>('');
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [addingTimeToTopic, setAddingTimeToTopic] = useState<string | null>(null);
  const [timeToAdd, setTimeToAdd] = useState('');
  const [newSubtopicInputs, setNewSubtopicInputs] = useState<Record<string, string>>({});

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

  const handleUndoComplete = (topic: LearningTopic) => {
    // Only allow undo on the same day
    if (!topic.completedAt || !isToday(parseISO(topic.completedAt))) return;
    
    updateLearningTopic({
      ...topic,
      status: 'in-progress',
      completedAt: undefined,
      revisedOn: [],
    });
  };

  const canUndoComplete = (topic: LearningTopic): boolean => {
    return topic.status === 'completed' && topic.completedAt ? isToday(parseISO(topic.completedAt)) : false;
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

  const toggleSubtopic = (topic: LearningTopic, subtopicId: string) => {
    const updatedSubtopics = (topic.subtopics || []).map((st) =>
      st.id === subtopicId
        ? { ...st, completed: !st.completed, completedAt: !st.completed ? new Date().toISOString() : undefined }
        : st
    );
    
    updateLearningTopic({
      ...topic,
      subtopics: updatedSubtopics,
    });
  };

  const addSubtopicToTopic = (topic: LearningTopic) => {
    const newSubtopicTitle = newSubtopicInputs[topic.id]?.trim();
    if (!newSubtopicTitle) return;

    const newSubtopic: Subtopic = {
      id: generateId(),
      title: newSubtopicTitle,
      completed: false,
    };

    updateLearningTopic({
      ...topic,
      subtopics: [...(topic.subtopics || []), newSubtopic],
    });

    setNewSubtopicInputs((prev) => ({ ...prev, [topic.id]: '' }));
  };

  const removeSubtopicFromTopic = (topic: LearningTopic, subtopicId: string) => {
    updateLearningTopic({
      ...topic,
      subtopics: (topic.subtopics || []).filter((st) => st.id !== subtopicId),
    });
  };

  const addTimeToTopic = (topic: LearningTopic) => {
    const minutes = parseInt(timeToAdd);
    if (isNaN(minutes) || minutes <= 0) return;

    updateLearningTopic({
      ...topic,
      timeSpent: (topic.timeSpent || 0) + minutes,
    });

    setAddingTimeToTopic(null);
    setTimeToAdd('');
  };

  const toggleExpanded = (topicId: string) => {
    setExpandedTopics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
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
              'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              filter === f
                ? 'bg-foreground text-background'
                : 'bg-secondary text-foreground hover:bg-muted'
            )}
          >
            {f === 'revision' ? 'Due for Revision' : f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'revision' && revisionCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-destructive text-destructive-foreground rounded-full">
                {revisionCount}
              </span>
            )}
            {f === 'pending' && (
              <span className="ml-2 text-xs opacity-60">
                ({state.learningTopics.filter((t) => t.status === 'pending' || t.status === 'in-progress').length})
              </span>
            )}
            {f === 'completed' && (
              <span className="ml-2 text-xs opacity-60">
                ({state.learningTopics.filter((t) => t.status === 'completed').length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredTopics.map((topic) => {
          const revisionDue = getRevisionDue(topic);
          const isExpanded = expandedTopics.has(topic.id);
          const subtopics = topic.subtopics || [];
          const completedSubtopics = subtopics.filter((st) => st.completed).length;
          
          return (
            <Card key={topic.id} className="card-hover">
              <CardContent className="p-4">
                <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(topic.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {topic.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                        ) : (
                          <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <h3 className="font-medium truncate">{topic.title}</h3>
                        {subtopics.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({completedSubtopics}/{subtopics.length})
                          </span>
                        )}
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>

                      {topic.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {topic.description}
                        </p>
                      )}

                      {/* Time spent badge */}
                      {(topic.timeSpent || 0) > 0 && (
                        <div className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full mb-3">
                          <Timer className="w-3 h-3" />
                          {formatTime(topic.timeSpent || 0)}
                        </div>
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
                        <>
                          <Button size="sm" onClick={() => handleMarkComplete(topic)} className="gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Complete
                          </Button>
                          {/* Add time button - only for non-completed topics */}
                          {addingTimeToTopic === topic.id ? (
                            <div className="flex gap-1">
                              <Input
                                type="number"
                                min="1"
                                placeholder="min"
                                className="w-16 h-8 text-xs"
                                value={timeToAdd}
                                onChange={(e) => setTimeToAdd(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') addTimeToTopic(topic);
                                  if (e.key === 'Escape') {
                                    setAddingTimeToTopic(null);
                                    setTimeToAdd('');
                                  }
                                }}
                                autoFocus
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2"
                                onClick={() => addTimeToTopic(topic)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAddingTimeToTopic(topic.id)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Timer className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      ) : (
                        <>
                          {revisionDue !== null && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevise(topic, revisionDue)}
                              className="gap-1.5 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Revise
                            </Button>
                          )}
                          {canUndoComplete(topic) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUndoComplete(topic)}
                              className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                              Undo
                            </Button>
                          )}
                        </>
                      )}
                      
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

                  <CollapsibleContent>
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      <h4 className="text-sm font-medium">Subtopics</h4>
                      
                      {subtopics.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No subtopics added yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {subtopics.map((st) => (
                            <div
                              key={st.id}
                              className={cn(
                                'flex items-center gap-3 p-2 rounded-lg transition-colors',
                                st.completed ? 'bg-success/10' : 'bg-secondary/50'
                              )}
                            >
                              <Checkbox
                                checked={st.completed}
                                onCheckedChange={() => toggleSubtopic(topic, st.id)}
                              />
                              <span
                                className={cn(
                                  'flex-1 text-sm',
                                  st.completed && 'line-through text-muted-foreground'
                                )}
                              >
                                {st.title}
                              </span>
                              {st.completedAt && (
                                <span className="text-xs text-muted-foreground">
                                  {formatDisplayDate(st.completedAt)}
                                </span>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => removeSubtopicFromTopic(topic, st.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add new subtopic */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a subtopic..."
                          value={newSubtopicInputs[topic.id] || ''}
                          onChange={(e) =>
                            setNewSubtopicInputs((prev) => ({ ...prev, [topic.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSubtopicToTopic(topic);
                            }
                          }}
                          className="h-8 text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() => addSubtopicToTopic(topic)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
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
