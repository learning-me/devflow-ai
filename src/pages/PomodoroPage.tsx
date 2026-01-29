import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const PomodoroPage: React.FC = () => {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempWork, setTempWork] = useState(workMinutes);
  const [tempBreak, setTempBreak] = useState(breakMinutes);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const playTick = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio not supported
    }
  }, [soundEnabled]);

  const playAlarm = useCallback(() => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      
      for (let i = 0; i < 3; i++) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
        
        const startTime = ctx.currentTime + i * 0.3;
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.2);
      }
    } catch {
      // Audio not supported
    }
  }, [soundEnabled]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playAlarm();
            setIsRunning(false);
            if (isBreak) {
              setIsBreak(false);
              return workMinutes * 60;
            } else {
              setSessionsCompleted((s) => s + 1);
              setIsBreak(true);
              return breakMinutes * 60;
            }
          }
          if (prev % 60 === 0) {
            playTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isBreak, workMinutes, breakMinutes, playTick, playAlarm]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workMinutes * 60);
  };

  const handleSaveSettings = () => {
    setWorkMinutes(tempWork);
    setBreakMinutes(tempBreak);
    if (!isRunning) {
      setTimeLeft(tempWork * 60);
      setIsBreak(false);
    }
    setSettingsOpen(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = isBreak ? breakMinutes * 60 : workMinutes * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Pomodoro Timer</h1>
          <p className="text-muted-foreground">
            Stay focused with timed work sessions and breaks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
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

      {/* Main Timer */}
      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <CardTitle className={cn(
              "text-lg font-semibold",
              isBreak ? "text-success" : "text-primary"
            )}>
              {isBreak ? '☕ Break Time' : '🔥 Focus Time'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6">
              {/* Timer Circle */}
              <div className="relative w-64 h-64">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="12"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke={isBreak ? "hsl(var(--success))" : "hsl(var(--primary))"}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 120}`}
                    strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-bold">{formatTime(timeLeft)}</span>
                  <span className={cn(
                    "text-sm font-medium mt-2",
                    isBreak ? "text-success" : "text-primary"
                  )}>
                    {isBreak ? `${breakMinutes} min break` : `${workMinutes} min session`}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={resetTimer}
                  className="h-14 w-14"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  onClick={toggleTimer}
                  className={cn(
                    "h-16 w-32 text-lg gap-2",
                    isBreak && "bg-success hover:bg-success/90"
                  )}
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{sessionsCompleted}</div>
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

      {/* Tips */}
      <Card className="max-w-md mx-auto">
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">💡 Pomodoro Technique</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Work for {workMinutes} minutes with full focus</li>
            <li>• Take a {breakMinutes}-minute break</li>
            <li>• After 4 sessions, take a longer 15-30 min break</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PomodoroPage;
