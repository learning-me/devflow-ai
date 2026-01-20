import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LearningTopic, Question, Answer } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { CheckCircle, XCircle, Loader2, ArrowRight, Trophy, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface QuizModalProps {
  topic: LearningTopic;
  open: boolean;
  onClose: () => void;
}

// Mock question generation - will be replaced with Groq API
const generateMockQuestions = (topicTitle: string): Question[] => {
  return [
    {
      id: '1',
      text: `What is the basic concept of ${topicTitle}? Explain in your own words.`,
      difficulty: 'easy',
    },
    {
      id: '2',
      text: `How would you implement or apply ${topicTitle} in a real-world scenario? Give an example.`,
      difficulty: 'medium',
    },
    {
      id: '3',
      text: `What are the potential edge cases or limitations when using ${topicTitle}? How would you handle them?`,
      difficulty: 'hard',
    },
  ];
};

// Mock answer evaluation - will be replaced with Groq API
const evaluateMockAnswer = (question: string, answer: string): { isCorrect: boolean; feedback: string } => {
  // Simple mock evaluation based on answer length
  const isCorrect = answer.trim().length > 20;
  return {
    isCorrect,
    feedback: isCorrect
      ? 'Good explanation! You demonstrated understanding of the concept.'
      : 'Your answer needs more detail. Try to explain the concept more thoroughly.',
  };
};

export const QuizModal: React.FC<QuizModalProps> = ({ topic, open, onClose }) => {
  const { updateLearningTopic, completeLearning } = useApp();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<'loading' | 'quiz' | 'result'>('loading');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<{ isCorrect: boolean; feedback: string } | null>(null);

  useEffect(() => {
    if (open) {
      // Generate questions
      setCurrentStep('loading');
      setQuestions([]);
      setAnswers([]);
      setCurrentQuestionIndex(0);
      setCurrentAnswer('');
      setLastFeedback(null);

      // Simulate API call delay
      setTimeout(() => {
        const generatedQuestions = generateMockQuestions(topic.title);
        setQuestions(generatedQuestions);
        setCurrentStep('quiz');
      }, 1500);
    }
  }, [open, topic.title]);

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) return;

    setIsEvaluating(true);
    
    // Simulate API evaluation delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const evaluation = evaluateMockAnswer(
      questions[currentQuestionIndex].text,
      currentAnswer
    );
    
    const newAnswer: Answer = {
      questionId: questions[currentQuestionIndex].id,
      userAnswer: currentAnswer,
      isCorrect: evaluation.isCorrect,
      feedback: evaluation.feedback,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setLastFeedback(evaluation);
    setIsEvaluating(false);

    // Check if failed medium question (completion requirement)
    if (currentQuestionIndex === 1 && !evaluation.isCorrect) {
      // Failed medium question - cannot complete
      toast({
        title: "Keep Learning!",
        description: "You need to correctly answer the Medium question to complete this topic.",
        variant: "destructive",
      });
      
      setTimeout(() => {
        completeLearning(topic.id, false);
        setCurrentStep('result');
      }, 2000);
      return;
    }

    // Move to next question or finish
    if (currentQuestionIndex < 2) {
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        setCurrentAnswer('');
        setLastFeedback(null);
      }, 2000);
    } else {
      // Completed all questions - check if Easy + Medium passed
      const easyCorrect = updatedAnswers[0]?.isCorrect;
      const mediumCorrect = updatedAnswers[1]?.isCorrect;
      const success = easyCorrect && mediumCorrect;

      setTimeout(() => {
        completeLearning(topic.id, success);
        setCurrentStep('result');

        if (success) {
          toast({
            title: "🔥 Topic Completed!",
            description: "Your streak has increased! Keep up the great work.",
          });
        }
      }, 2000);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const easyCorrect = answers[0]?.isCorrect;
  const mediumCorrect = answers[1]?.isCorrect;
  const isComplete = easyCorrect && mediumCorrect;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Validate: {topic.title}
          </DialogTitle>
        </DialogHeader>

        {currentStep === 'loading' && (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Generating questions...</p>
          </div>
        )}

        {currentStep === 'quiz' && currentQuestion && (
          <div className="space-y-6">
            {/* Progress */}
            <div className="flex gap-2">
              {questions.map((q, i) => (
                <div
                  key={q.id}
                  className={cn(
                    'flex-1 h-2 rounded-full transition-colors',
                    i < currentQuestionIndex
                      ? answers[i]?.isCorrect
                        ? 'bg-success'
                        : 'bg-destructive'
                      : i === currentQuestionIndex
                      ? 'bg-primary'
                      : 'bg-muted'
                  )}
                />
              ))}
            </div>

            {/* Question */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium',
                    currentQuestion.difficulty === 'easy'
                      ? 'bg-success/20 text-success'
                      : currentQuestion.difficulty === 'medium'
                      ? 'bg-warning/20 text-warning'
                      : 'bg-destructive/20 text-destructive'
                  )}
                >
                  {currentQuestion.difficulty.charAt(0).toUpperCase() +
                    currentQuestion.difficulty.slice(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of 3
                </span>
              </div>

              <p className="text-lg font-medium">{currentQuestion.text}</p>

              <Textarea
                placeholder="Type your answer here..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                rows={4}
                disabled={isEvaluating || !!lastFeedback}
              />

              {lastFeedback && (
                <div
                  className={cn(
                    'p-4 rounded-lg flex items-start gap-3',
                    lastFeedback.isCorrect
                      ? 'bg-success/10 border border-success/20'
                      : 'bg-destructive/10 border border-destructive/20'
                  )}
                >
                  {lastFeedback.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm">{lastFeedback.feedback}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end">
              {!lastFeedback ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!currentAnswer.trim() || isEvaluating}
                  className="gap-2"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      Submit Answer
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {currentQuestionIndex < 2 ? 'Moving to next question...' : 'Completing...'}
                </p>
              )}
            </div>
          </div>
        )}

        {currentStep === 'result' && (
          <div className="py-8 text-center">
            {isComplete ? (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-4">
                  <Trophy className="w-10 h-10 text-success" />
                </div>
                <h3 className="text-xl font-bold mb-2">Topic Completed! 🎉</h3>
                <p className="text-muted-foreground mb-6">
                  You've successfully validated your knowledge. Your learning streak
                  has been updated!
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto rounded-full bg-destructive/20 flex items-center justify-center mb-4">
                  <RefreshCw className="w-10 h-10 text-destructive" />
                </div>
                <h3 className="text-xl font-bold mb-2">Keep Practicing</h3>
                <p className="text-muted-foreground mb-6">
                  You need to correctly answer both Easy and Medium questions to
                  complete this topic. Review the material and try again!
                </p>
              </>
            )}

            <div className="space-y-2">
              {answers.map((answer, i) => (
                <div
                  key={answer.questionId}
                  className="flex items-center gap-2 justify-center text-sm"
                >
                  {answer.isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                  <span>
                    {questions[i].difficulty.charAt(0).toUpperCase() +
                      questions[i].difficulty.slice(1)}
                    : {answer.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
              ))}
            </div>

            <Button onClick={onClose} className="mt-6">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
