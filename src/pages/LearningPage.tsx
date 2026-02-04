import React from 'react';
import { LearningForm } from '@/components/learning/LearningForm';
import { LearningList } from '@/components/learning/LearningList';
import { Card, CardContent } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { Flame, CheckCircle, Clock, RotateCcw, Timer } from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { formatTime } from '@/lib/storage';

const LearningPage: React.FC = () => {
  const { state } = useApp();

  const completed = state.learningTopics.filter((t) => t.status === 'completed').length;
  const pending = state.learningTopics.filter(
    (t) => t.status === 'pending' || t.status === 'in-progress'
  ).length;

  // Total time spent on all topics
  const totalTimeSpent = state.learningTopics.reduce(
    (acc, t) => acc + (t.timeSpent || 0),
    0
  );

  // Count topics due for revision
  const revisionDue = state.learningTopics.filter((topic) => {
    if (topic.status !== 'completed' || !topic.completedAt) return false;
    
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
          return true;
        }
      }
    }
    return false;
  }).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Learning Tracker</h1>
          <p className="text-muted-foreground">
            Add topics with subtopics, track time, and use spaced repetition (1, 3, 7 days) to retain knowledge.
          </p>
        </div>
        <LearningForm />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{state.streakData.currentStreak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold">{completed}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold">{pending}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <div className="text-2xl font-bold">{revisionDue}</div>
              <div className="text-xs text-muted-foreground">Due Revision</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Timer className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{formatTime(totalTimeSpent)}</div>
              <div className="text-xs text-muted-foreground">Total Time</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic List */}
      <LearningList />
    </div>
  );
};

export default LearningPage;
