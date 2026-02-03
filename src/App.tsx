import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { PomodoroProvider } from "@/contexts/PomodoroContext";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { FloatingTimer } from "@/components/pomodoro/FloatingTimer";
import Index from "./pages/Index";
import DailyLogPage from "./pages/DailyLogPage";
import LearningPage from "./pages/LearningPage";
import InterviewsPage from "./pages/InterviewsPage";
import GoalsPage from "./pages/GoalsPage";
import PomodoroPage from "./pages/PomodoroPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => (
  <>
    <FloatingTimer />
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Index />} />
        <Route path="/daily-log" element={<DailyLogPage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/interviews" element={<InterviewsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/pomodoro" element={<PomodoroPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PomodoroProvider>
            <AppContent />
          </PomodoroProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
