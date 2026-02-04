import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings, BookOpen, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { usePomodoro } from '@/contexts/PomodoroContext';
import { isToday, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SessionHistory } from '@/components/pomodoro/SessionHistory';

const PomodoroPage: React.FC = () => {
  const { state } = useApp();
  const {
    timeLeft,
    isRunning,
    isBreak,
    workMinutes,
    breakMinutes,
    soundEnabled,
    selectedTopicId,
    setWorkMinutes,
    setBreakMinutes,
    setSoundEnabled,
    setSelectedTopicId,
    toggleTimer,
    resetTimer,
    setIsFloating,
    getSessionName,
    progress,
  } = usePomodoro();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempWork, setTempWork] = useState(workMinutes);
  const [tempBreak, setTempBreak] = useState(breakMinutes);

  // Get today's sessions
  const todaySessions = (state.pomodoroSessions || []).filter(
    (session) => isToday(parseISO(session.completedAt)) && session.type === 'work'
  );

  // Get learning topics for selection
  const activeTopics = state.learningTopics.filter(
    (t) => t.status === 'pending' || t.status === 'in-progress'
  );

  const handleSaveSettings = () => {
    setWorkMinutes(tempWork);
    setBreakMinutes(tempBreak);
    setSettingsOpen(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePopOut = () => {
    setIsFloating(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pomodoro Timer</h1>
          <p className="text-muted-foreground">Stay focused with timed work sessions and breaks.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePopOut} title="Pop out timer">
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Timer Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="work-time">Work Duration (minutes)</Label>
                  <Input
                    id="work-time"
                    type="number"
                    min="1"
                    max="120"
                    value={tempWork}
                    onChange={(e) => setTempWork(Math.max(1, Math.min(120, parseInt(e.target.value) || 1)))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="break-time">Break Duration (minutes)</Label>
                  <Input
                    id="break-time"
                    type="number"
                    min="1"
                    max="60"
                    value={tempBreak}
                    onChange={(e) => setTempBreak(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
                  />
                </div>
                <Button onClick={handleSaveSettings} className="w-full">
                  Save Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Timer */}
        <div className="space-y-6">
          {/* Link to Topic */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Label htmlFor="topic-select" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Link to Learning Topic
                </Label>
                <Select value={selectedTopicId} onValueChange={setSelectedTopicId}>
                  <SelectTrigger id="topic-select">
                    <SelectValue placeholder="Select a topic to focus on" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No topic linked</SelectItem>
                    {activeTopics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.title.slice(0, 40)}
                        {topic.title.length > 40 ? '...' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Main Timer */}
          <Card>
            <CardHeader className="text-center pb-2">
              <CardTitle className={cn('text-lg font-semibold', isBreak ? 'text-green-500' : 'text-primary')}>
                {isBreak ? '☕ Break Time' : '🔥 Focus Time'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6">
                {/* Timer Circle */}
                <div className="relative w-64 h-64">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="128" cy="128" r="120" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      fill="none"
                      stroke={isBreak ? 'hsl(var(--success))' : 'hsl(var(--primary))'}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 120}`}
                      strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-bold">{formatTime(timeLeft)}</span>
                    <span className={cn('text-sm font-medium mt-2', isBreak ? 'text-green-500' : 'text-primary')}>
                      {isBreak ? `${breakMinutes} min break` : `${workMinutes} min session`}
                    </span>
                    {getSessionName() && (
                      <span className="text-xs text-muted-foreground mt-1 max-w-[180px] truncate">
                        {getSessionName()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="lg" onClick={resetTimer} className="h-14 w-14">
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    onClick={toggleTimer}
                    className={cn('h-16 w-32 text-lg gap-2', isBreak && 'bg-green-500 hover:bg-green-600')}
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-5 h-5" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Start
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{todaySessions.length}</div>
                <div className="text-xs text-muted-foreground">Sessions Today</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold">{workMinutes}</div>
                <div className="text-xs text-muted-foreground">Work (min)</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold">{breakMinutes}</div>
                <div className="text-xs text-muted-foreground">Break (min)</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - History & Tips */}
        <div className="space-y-6">
          {/* Session History */}
          <SessionHistory />

          {/* Tips */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">💡 Pomodoro Technique</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Work in focused 25-minute sessions</li>
                <li>• Take 5-minute breaks between sessions</li>
                <li>• After 4 sessions, take a longer break (15-30 min)</li>
                <li>• Link your sessions to topics for better tracking</li>
                <li>• Use the pop-out timer to stay focused while browsing</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PomodoroPage;
