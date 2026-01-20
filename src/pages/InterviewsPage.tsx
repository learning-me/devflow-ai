import React from 'react';
import { InterviewForm } from '@/components/interviews/InterviewForm';
import { InterviewList } from '@/components/interviews/InterviewList';

const InterviewsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Interview Tracker</h1>
          <p className="text-muted-foreground">
            Track your job applications and interview progress.
          </p>
        </div>
        <InterviewForm />
      </div>

      {/* Interview List */}
      <InterviewList />
    </div>
  );
};

export default InterviewsPage;
