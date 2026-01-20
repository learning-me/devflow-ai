import React from 'react';
import { DailyLogForm } from '@/components/daily-log/DailyLogForm';
import { DailyLogList } from '@/components/daily-log/DailyLogList';

const DailyLogPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Daily Log</h1>
          <p className="text-muted-foreground">
            Track your daily work, tasks, and time spent coding.
          </p>
        </div>
        <DailyLogForm />
      </div>

      {/* Log List */}
      <DailyLogList />
    </div>
  );
};

export default DailyLogPage;
