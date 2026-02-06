import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Briefcase, 
  Target, 
  Flame,
  Menu,
  X,
  LogOut,
  Timer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Learning', href: '/learning', icon: BookOpen },
  { name: 'Pomodoro', href: '/pomodoro', icon: Timer },
  { name: 'Interviews', href: '/interviews', icon: Briefcase },
  { name: 'Goals', href: '/goals', icon: Target },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { state } = useApp();
  const { user, signOut } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border',
          'transition-transform duration-300 ease-out',
          'lg:translate-x-0 lg:static',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground">Neur</span>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Streak Badge */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center streak-glow">
                <Flame className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {state.streakData.currentStreak}
                </div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 active:scale-[0.98]'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2 rounded-lg bg-sidebar-accent/50">
                <div className="text-lg font-semibold text-sidebar-foreground">
                  {state.learningTopics.filter((t) => t.status === 'completed').length}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div className="p-2 rounded-lg bg-sidebar-accent/50">
                <div className="text-lg font-semibold text-sidebar-foreground">
                  {state.streakData.longestStreak}
                </div>
                <div className="text-xs text-muted-foreground">Best Streak</div>
              </div>
            </div>

            {/* User & Sign Out */}
            {user && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={signOut}
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className={cn(
          'fixed bottom-4 left-4 z-30 p-3 rounded-full bg-primary text-primary-foreground shadow-lg',
          'lg:hidden transition-all duration-300 hover:scale-105 active:scale-95',
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
};
