import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { TagBadge } from '@/components/ui/TagBadge';
import { RotateCcw, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { differenceInDays, parseISO, format } from 'date-fns';

export const DueRevisions: React.FC = () => {
  const { state, updateLearningTopic } = useApp();

  const getDueRevisions = () => {
    const today = new Date();
    
    return state.learningTopics.filter((topic) => {
      if (topic.status !== 'completed' || !topic.completedAt) return false;
      
      const completedDate = parseISO(topic.completedAt);
      const daysSinceCompletion = differenceInDays(today, completedDate);
      
      const revisionDays = topic.revisionDays || [1, 3, 7];
      const revisedOn = topic.revisedOn || [];
      
      // Count milestones that are due
      let dueCount = 0;
      for (const day of revisionDays) {
        if (daysSinceCompletion >= day) dueCount++;
      }
      
      return revisedOn.length < dueCount;
    }).map((topic) => {
      const revisionDays = topic.revisionDays || [1, 3, 7];
      const revisedOn = topic.revisedOn || [];
      const nextIndex = revisedOn.length;
      const currentDueDay = nextIndex < revisionDays.length ? revisionDays[nextIndex] : 0;
      
      return { ...topic, currentDueDay };
    });
  };

  const handleMarkRevised = (topicId: string) => {
    const topic = state.learningTopics.find((t) => t.id === topicId);
    if (!topic) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const revisedOn = topic.revisedOn || [];
    if (revisedOn.includes(today)) return;
    
    updateLearningTopic({
      ...topic,
      revisedOn: [...revisedOn, today],
    });
  };

  const dueTopics = getDueRevisions();

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-destructive" />
          Due for Revision
        </CardTitle>
        <Link
          to="/learning"
          className="text-sm text-accent hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {dueTopics.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No revisions due. Keep learning!
          </p>
        ) : (
          dueTopics.slice(0, 5).map((topic) => (
            <div
              key={topic.id}
              className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium line-clamp-1">{topic.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive whitespace-nowrap ml-2">
                  Day {topic.currentDueDay}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {topic.tags.slice(0, 2).map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs gap-1"
                  onClick={() => handleMarkRevised(topic.id)}
                >
                  <CheckCircle className="w-3 h-3" />
                  Revised
                </Button>
              </div>
            </div>
          ))
        )}
        {dueTopics.length > 5 && (
          <p className="text-xs text-muted-foreground text-center">
            +{dueTopics.length - 5} more topics due
          </p>
        )}
      </CardContent>
    </Card>
  );
};
