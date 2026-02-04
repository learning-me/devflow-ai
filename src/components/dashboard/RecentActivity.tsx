import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { formatDisplayDate, formatTime } from '@/lib/storage';
import { TagBadge } from '@/components/ui/TagBadge';
import { BookOpen, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecentActivity: React.FC = () => {
  const { state } = useApp();

  const recentTopics = state.learningTopics.slice(0, 3);
  const recentSessions = state.pomodoroSessions.slice(0, 5);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Recent Pomodoro Sessions */}
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            Recent Sessions
          </CardTitle>
          <Link
            to="/pomodoro"
            className="text-sm text-accent hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No sessions yet. Start a Pomodoro timer!
            </p>
          ) : (
            recentSessions.map((session) => (
              <div
                key={session.id}
                className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">
                    {session.taskName || 'Focus Session'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(session.duration)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    session.type === 'work' 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-success/20 text-success'
                  }`}>
                    {session.type === 'work' ? 'Work' : 'Break'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDisplayDate(session.completedAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Learning Topics */}
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" />
            Learning Progress
          </CardTitle>
          <Link
            to="/learning"
            className="text-sm text-accent hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No topics yet. Start learning!
            </p>
          ) : (
            recentTopics.map((topic) => (
              <div
                key={topic.id}
                className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{topic.title}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      topic.status === 'completed'
                        ? 'bg-success/20 text-success'
                        : 'bg-accent/20 text-accent'
                    }`}
                  >
                    {topic.status}
                  </span>
                </div>
                {topic.timeSpent && topic.timeSpent > 0 && (
                  <div className="text-xs text-muted-foreground mb-2">
                    Time spent: {formatTime(topic.timeSpent)}
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  {topic.tags.slice(0, 3).map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
