import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { formatDisplayDate, formatTime } from '@/lib/storage';
import { TagBadge } from '@/components/ui/TagBadge';
import { Clock, BookOpen, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecentActivity: React.FC = () => {
  const { state } = useApp();

  const recentLogs = state.dailyLogs.slice(0, 3);
  const recentTopics = state.learningTopics.slice(0, 3);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Recent Daily Logs */}
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent Work
          </CardTitle>
          <Link
            to="/daily-log"
            className="text-sm text-accent hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No entries yet. Start logging your work!
            </p>
          ) : (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {formatDisplayDate(log.date)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(log.timeSpent)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {log.tasks}
                </p>
                <div className="flex flex-wrap gap-1">
                  {log.tags.slice(0, 3).map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
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
