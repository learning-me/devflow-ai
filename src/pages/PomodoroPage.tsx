import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings, BookOpen, ExternalLink, Flame, Plus, CheckCircle, ArrowRight } from 'lucide-react';
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
import { Link } from 'react-router-dom';

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
    taskName,
    setTaskName,
  } = usePomodoro();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempWork, setTempWork] = useState(workMinutes);
  const [tempBreak, setTempBreak] = useState(breakMinutes);

  const todaySessions = (state.pomodoroSessions || []).filter(
    (session) => isToday(parseISO(session.completedAt)) && session.type === 'work'
  );
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.duration, 0);

  const activeTopics = state.learningTopics.filter(t => t.status !== 'completed');

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

  const displayName = getSessionName() || taskName || undefined;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pomodoro Timer</h1>
          <p className="text-muted-foreground">Stay focused with timed work sessions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/pomodoro/history">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowRight className="w-4 h-4" />
              History
            </Button>
          </Link>
          <Button variant="outline" size="icon" onClick={() => setIsFloating(true)} title="Pop out timer">
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timer */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-6">
              {/* Task Name Input */}
              <div className="w-full max-w-md space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-sm text-muted-foreground">Task Name</Label>
                  <Input
                    placeholder="What are you working on?"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    disabled={isRunning}
                    className="text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Link to Learning Topic (optional)
                  </Label>
                  <Select value={selectedTopicId} onValueChange={setSelectedTopicId} disabled={isRunning}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="none">No topic linked</SelectItem>
                      {activeTopics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.title.length > 40 ? topic.title.slice(0, 40) + '...' : topic.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Timer Circle */}
              <div className={cn(
                'text-center py-2',
                isBreak ? 'text-success' : ''
              )}>
                <p className="text-sm font-medium flex items-center justify-center gap-1.5 mb-4">
                  {isBreak ? <><Pause className="w-4 h-4" /> Break Time</> : <><Flame className="w-4 h-4" /> Focus Time</>}
                </p>
              </div>
              
              <div className="relative w-56 h-56 md:w-64 md:h-64">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
                  <circle cx="128" cy="128" r="120" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke={isBreak ? 'hsl(var(--success))' : 'hsl(var(--foreground))'}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 120}`}
                    strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl md:text-6xl font-bold">{formatTime(timeLeft)}</span>
                  <span className={cn('text-sm font-medium mt-2', isBreak ? 'text-success' : 'text-muted-foreground')}>
                    {isBreak ? `${breakMinutes} min break` : `${workMinutes} min session`}
                  </span>
                  {displayName && (
                    <span className="text-xs text-muted-foreground mt-1 max-w-[180px] truncate">
                      {displayName}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="outline" size="lg" onClick={resetTimer} className="h-14 w-14">
                  <RotateCcw className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  onClick={toggleTimer}
                  className={cn('h-16 w-32 text-lg gap-2', isBreak && 'bg-success hover:bg-success/90')}
                >
                  {isRunning ? <><Pause className="w-5 h-5" /> Pause</> : <><Play className="w-5 h-5" /> Start</>}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary">{todaySessions.length}</div>
              <div className="text-xs text-muted-foreground">Sessions Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold">{todayMinutes}</div>
              <div className="text-xs text-muted-foreground">Minutes Focused</div>
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
    </div>
  );
};

export default PomodoroPage;
