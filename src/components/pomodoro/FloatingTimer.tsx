import React, { useState, useRef, useEffect } from 'react';
import { usePomodoro } from '@/contexts/PomodoroContext';
import { Button } from '@/components/ui/button';
import { Play, Pause, X, GripHorizontal, RotateCcw, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

export const FloatingTimer: React.FC = () => {
  const {
    timeLeft,
    isRunning,
    isBreak,
    isFloating,
    floatingPosition,
    setFloatingPosition,
    setIsFloating,
    toggleTimer,
    resetTimer,
    getSessionName,
    progress,
  } = usePomodoro();

  const navigate = useNavigate();
  const location = useLocation();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const timerRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (timerRef.current) {
      const rect = timerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (timerRef.current) {
      const rect = timerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - 200, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y));
        setFloatingPosition({ x: newX, y: newY });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        const touch = e.touches[0];
        const newX = Math.max(0, Math.min(window.innerWidth - 200, touch.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 100, touch.clientY - dragOffset.y));
        setFloatingPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => setIsDragging(false);
    const handleTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragOffset, setFloatingPosition]);

  // Auto-hide on pomodoro page
  const isOnPomodoroPage = location.pathname === '/pomodoro';
  
  if (!isFloating || isOnPomodoroPage) return null;

  const sessionName = getSessionName();

  return (
    <div
      ref={timerRef}
      className={cn(
        'fixed z-[100] bg-card border rounded-xl shadow-2xl p-3 select-none',
        isDragging && 'cursor-grabbing'
      )}
      style={{
        left: floatingPosition.x,
        top: floatingPosition.y,
        minWidth: '200px',
      }}
    >
      {/* Drag Handle */}
      <div
        className="flex items-center justify-between mb-2 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-muted-foreground" />
          <span className={cn('text-xs font-medium', isBreak ? 'text-success' : 'text-foreground')}>
            {isBreak ? 'Break' : 'Focus'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              setIsFloating(false);
              navigate('/pomodoro');
            }}
          >
            <Maximize2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsFloating(false)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Timer Display */}
      <div className="flex items-center gap-3">
        {/* Mini Progress Circle */}
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="4"
            />
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke={isBreak ? 'hsl(var(--success))' : 'hsl(var(--foreground))'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 24}`}
              strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-1">
          {sessionName && (
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
              {sessionName}
            </span>
          )}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={resetTimer}
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
            <Button
              size="icon"
              className={cn('h-7 w-7', isBreak && 'bg-success hover:bg-success/90')}
              onClick={toggleTimer}
            >
              {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
