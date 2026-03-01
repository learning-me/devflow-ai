import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { formatDisplayDate, formatTime } from '@/lib/storage';
import { TagBadge } from '@/components/ui/TagBadge';
import { Trash2, CheckCircle, Clock, BookOpen, RotateCcw, ChevronDown, ChevronUp, Plus, Timer, Undo2, FolderOpen } from 'lucide-react';
import { LearningTopic, Subtopic } from '@/types';
import { cn } from '@/lib/utils';
import { differenceInDays, parseISO, format, isToday } from 'date-fns';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getRevisionDue = (topic: LearningTopic): number | null => {
  if (topic.status !== 'completed' || !topic.completedAt) return null;
  const completedDate = parseISO(topic.completedAt);
  const daysSinceCompletion = differenceInDays(new Date(), completedDate);
  const revisionDays = topic.revisionDays || [1, 3, 7];
  const revisedOn = topic.revisedOn || [];
  let dueCount = 0;
  for (const day of revisionDays) {
    if (daysSinceCompletion >= day) dueCount++;
  }
  if (revisedOn.length < dueCount) {
    const nextIndex = revisedOn.length;
    if (nextIndex < revisionDays.length) return revisionDays[nextIndex];
  }
  return null;
};

export const LearningList: React.FC = () => {
  const { state } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'revision'>('all');
  const [groupByCategory, setGroupByCategory] = useState(true);

  const filteredTopics = state.learningTopics.filter((topic) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return topic.status === 'pending' || topic.status === 'in-progress';
    if (filter === 'revision') return getRevisionDue(topic) !== null;
    return topic.status === filter;
  });

  const revisionCount = state.learningTopics.filter((t) => getRevisionDue(t) !== null).length;

  const grouped = useMemo(() => {
    const groups: Record<string, LearningTopic[]> = {};
    for (const topic of filteredTopics) {
      const cat = topic.category || 'Uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(topic);
    }
    const keys = Object.keys(groups).sort((a, b) => {
      if (a === 'Uncategorized') return 1;
      if (b === 'Uncategorized') return -1;
      return a.localeCompare(b);
    });
    return keys.map(k => ({ category: k, topics: groups[k] }));
  }, [filteredTopics]);

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

      {/* Group toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">{filteredTopics.length} topics</span>
        <Button
          variant={groupByCategory ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setGroupByCategory(!groupByCategory)}
          className="gap-1.5 text-xs"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Group by Category
        </Button>
      </div>

      {groupByCategory ? (
        <div className="space-y-6">
          {grouped.map(({ category, topics: catTopics }) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <FolderOpen className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">{category}</h3>
                <span className="text-xs text-muted-foreground">({catTopics.length})</span>
              </div>
              <div className="space-y-3 pl-1">
                {catTopics.map((topic) => (
                  <TopicCard key={topic.id} topic={topic} />
                ))}
              </div>
            </div>
          ))}
          {filteredTopics.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No topics match this filter.</div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTopics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No topics match this filter.</div>
          ) : (
            filteredTopics.map((topic) => <TopicCard key={topic.id} topic={topic} />)
          )}
        </div>
      )}
    </>
  );
};

const TopicCard: React.FC<{ topic: LearningTopic }> = ({ topic }) => {
  const { deleteLearningTopic, updateLearningTopic, completeLearning } = useApp();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [addingTime, setAddingTime] = useState(false);
  const [timeToAdd, setTimeToAdd] = useState('');
  const [newSubtopicInput, setNewSubtopicInput] = useState('');

  const revisionDue = getRevisionDue(topic);
  const subtopics = topic.subtopics || [];
  const completedSubtopics = subtopics.filter(st => st.completed).length;
  const canUndo = topic.status === 'completed' && topic.completedAt ? isToday(parseISO(topic.completedAt)) : false;

  const handleRevise = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const revisedOn = topic.revisedOn || [];
    if (revisedOn.includes(today)) return;
    updateLearningTopic({ ...topic, revisedOn: [...revisedOn, today] });
  };

  const handleUndoComplete = () => {
    if (!canUndo) return;
    updateLearningTopic({ ...topic, status: 'in-progress', completedAt: undefined, revisedOn: [] });
  };

  const toggleSubtopic = (subtopicId: string) => {
    const updated = subtopics.map(st =>
      st.id === subtopicId ? { ...st, completed: !st.completed, completedAt: !st.completed ? new Date().toISOString() : undefined } : st
    );
    updateLearningTopic({ ...topic, subtopics: updated });
  };

  const addSubtopic = () => {
    const title = newSubtopicInput.trim();
    if (!title) return;
    updateLearningTopic({ ...topic, subtopics: [...subtopics, { id: generateId(), title, completed: false }] });
    setNewSubtopicInput('');
  };

  const removeSubtopic = (id: string) => {
    updateLearningTopic({ ...topic, subtopics: subtopics.filter(st => st.id !== id) });
  };

  const addTime = () => {
    const minutes = parseInt(timeToAdd);
    if (isNaN(minutes) || minutes <= 0) return;
    updateLearningTopic({ ...topic, timeSpent: (topic.timeSpent || 0) + minutes });
    setAddingTime(false);
    setTimeToAdd('');
  };

  return (
    <>
      <Card className="card-hover">
        <CardContent className="p-4">
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
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
                    <span className="text-xs text-muted-foreground">({completedSubtopics}/{subtopics.length})</span>
                  )}
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>

                {topic.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{topic.description}</p>
                )}

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {topic.category && (
                    <span className="inline-flex items-center gap-1 text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                      <FolderOpen className="w-3 h-3" />
                      {topic.category}
                    </span>
                  )}
                  {(topic.timeSpent || 0) > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      <Timer className="w-3 h-3" />
                      {formatTime(topic.timeSpent || 0)}
                    </span>
                  )}
                </div>

                {topic.status === 'completed' && topic.completedAt && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(topic.revisionDays || [1, 3, 7]).map((day, index) => {
                      const completedDate = parseISO(topic.completedAt!);
                      const daysSinceCompletion = differenceInDays(new Date(), completedDate);
                      const revisedOn = topic.revisedOn || [];
                      const isRevised = index < revisedOn.length;
                      const isMilestoneDue = daysSinceCompletion >= day;
                      const isDue = isMilestoneDue && !isRevised;
                      return (
                        <span key={day} className={cn('text-xs px-2 py-1 rounded-full font-medium',
                          isRevised ? 'bg-success/20 text-success' : isDue ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'
                        )}>
                          Day {day} {isRevised ? '✓' : isDue ? '!' : ''}
                        </span>
                      );
                    })}
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {topic.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Added {formatDisplayDate(topic.createdAt)}</span>
                  {topic.completedAt && <span className="text-success">Completed {formatDisplayDate(topic.completedAt)}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {topic.status === 'pending' || topic.status === 'in-progress' ? (
                  <>
                    <Button size="sm" onClick={() => completeLearning(topic.id)} className="gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />Complete
                    </Button>
                    {addingTime ? (
                      <div className="flex gap-1">
                        <Input type="number" min="1" placeholder="min" className="w-16 h-8 text-xs" value={timeToAdd}
                          onChange={e => setTimeToAdd(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') addTime(); if (e.key === 'Escape') { setAddingTime(false); setTimeToAdd(''); } }}
                          autoFocus />
                        <Button size="sm" variant="outline" className="h-8 px-2" onClick={addTime}><Plus className="w-3 h-3" /></Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => setAddingTime(true)} className="text-muted-foreground hover:text-foreground">
                        <Timer className="w-4 h-4" />
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    {revisionDue !== null && (
                      <Button size="sm" variant="outline" onClick={handleRevise}
                        className="gap-1.5 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive">
                        <RotateCcw className="w-3.5 h-3.5" />Revise
                      </Button>
                    )}
                    {canUndo && (
                      <Button size="sm" variant="ghost" onClick={handleUndoComplete}
                        className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary">
                        <Undo2 className="w-3.5 h-3.5" />Undo
                      </Button>
                    )}
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={() => setDeleteDialogOpen(true)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
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
                    {subtopics.map(st => (
                      <div key={st.id} className={cn('flex items-center gap-3 p-2 rounded-lg transition-colors', st.completed ? 'bg-success/10' : 'bg-secondary/50')}>
                        <Checkbox checked={st.completed} onCheckedChange={() => toggleSubtopic(st.id)} />
                        <span className={cn('text-sm flex-1', st.completed && 'line-through text-muted-foreground')}>{st.title}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeSubtopic(st.id)} className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {topic.status !== 'completed' && (
                  <div className="flex gap-2">
                    <Input placeholder="Add subtopic..." value={newSubtopicInput} onChange={e => setNewSubtopicInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubtopic(); } }} className="text-sm" />
                    <Button variant="outline" size="sm" onClick={addSubtopic}><Plus className="w-4 h-4" /></Button>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <DeleteConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}
        onConfirm={() => { deleteLearningTopic(topic.id); setDeleteDialogOpen(false); }}
        title="Delete Topic" description={`Are you sure you want to delete "${topic.title}"? This cannot be undone.`} />
    </>
  );
};
