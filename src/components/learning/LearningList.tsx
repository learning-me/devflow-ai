import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { formatDisplayDate } from '@/lib/storage';
import { TagBadge } from '@/components/ui/TagBadge';
import { QuizModal } from './QuizModal';
import { Trash2, Play, CheckCircle, XCircle, Clock, BookOpen } from 'lucide-react';
import { LearningTopic } from '@/types';
import { cn } from '@/lib/utils';

export const LearningList: React.FC = () => {
  const { state, deleteLearningTopic, updateLearningTopic } = useApp();
  const [quizTopic, setQuizTopic] = useState<LearningTopic | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

  const filteredTopics = state.learningTopics.filter((topic) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return topic.status === 'pending' || topic.status === 'in-progress';
    return topic.status === filter;
  });

  const handleStartQuiz = (topic: LearningTopic) => {
    updateLearningTopic({ ...topic, status: 'in-progress' });
    setQuizTopic(topic);
  };

  const handleRetry = (topic: LearningTopic) => {
    updateLearningTopic({ ...topic, status: 'pending', questions: undefined, answers: undefined });
  };

  if (state.learningTopics.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No learning topics yet</h3>
        <p className="text-muted-foreground">
          Add topics you want to learn and validate your knowledge with AI-powered quizzes.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['all', 'pending', 'completed', 'failed'] as const).map((f) => (
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
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <span className="ml-2 text-xs opacity-70">
                (
                {
                  state.learningTopics.filter((t) =>
                    f === 'pending'
                      ? t.status === 'pending' || t.status === 'in-progress'
                      : t.status === f
                  ).length
                }
                )
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredTopics.map((topic) => (
          <Card key={topic.id} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {topic.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    ) : topic.status === 'failed' ? (
                      <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
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
                    <Button size="sm" onClick={() => handleStartQuiz(topic)} className="gap-1.5">
                      <Play className="w-3.5 h-3.5" />
                      Validate
                    </Button>
                  ) : topic.status === 'failed' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRetry(topic)}
                      className="gap-1.5"
                    >
                      Retry
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteLearningTopic(topic.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {quizTopic && (
        <QuizModal
          topic={quizTopic}
          open={!!quizTopic}
          onClose={() => setQuizTopic(null)}
        />
      )}
    </>
  );
};
