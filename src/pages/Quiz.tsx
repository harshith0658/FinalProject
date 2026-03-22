import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, XCircle, Coins, Star, Award, Sparkles, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  funFact: string;
}

const Quiz = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFunFact, setShowFunFact] = useState(false);

  // Lesson data mapping
  const lessonData: Record<string, { title: string; description: string }> = {
    "intro-geography": {
      title: "Introduction to Geography",
      description: "Learn the basics of world geography and map reading"
    },
    "continents-oceans": {
      title: "Continents and Oceans",
      description: "Explore the seven continents and five oceans"
    },
    "climate-zones": {
      title: "Climate Zones",
      description: "Understanding different climate regions"
    },
    "landmarks": {
      title: "World Landmarks",
      description: "Famous landmarks and monuments worldwide"
    },
    "natural-wonders": {
      title: "Natural Wonders",
      description: "Explore Earth's most amazing natural formations"
    },
    "asia": {
      title: "Asia",
      description: "Discover the largest continent with diverse cultures and landscapes"
    },
    "america": {
      title: "America",
      description: "Explore North and South America from pole to pole"
    },
    "europe": {
      title: "Europe",
      description: "Journey through Europe's rich history and geography"
    },
    "africa": {
      title: "Africa",
      description: "Experience Africa's diverse wildlife and natural beauty"
    }
  };

  useEffect(() => {
    fetchQuizQuestions();
  }, [lessonId]);

  const fetchQuizQuestions = async () => {
    try {
      const lesson = lessonData[lessonId || "intro-geography"];
      
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: {
          lessonTitle: lesson.title,
          lessonDescription: lesson.description
        }
      });

      if (error) {
        console.error("Error fetching quiz:", error);
        toast({
          title: "Error",
          description: "Failed to load quiz. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (data && data.questions) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#FFD700', '#FF69B4', '#00FF00', '#FF4500', '#1E90FF'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (answered) return;
    
    setSelectedAnswer(answerIndex);
    setAnswered(true);
    const correct = answerIndex === questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 1);
      fireConfetti();
      setShowFunFact(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setIsCorrect(false);
      setShowFunFact(false);
    } else {
      setShowResult(true);
      fireConfetti();
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswered(false);
    setIsCorrect(false);
    setShowFunFact(false);
    fetchQuizQuestions();
  };

  const handleCompleteQuiz = async () => {
    setCompleting(true);
    
    try {
      const quizId = lessonId || "general-quiz";
      const { data, error } = await supabase.rpc('complete_quiz', {
        p_quiz_id: quizId,
        p_score: score
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      const result = data as { success: boolean; message: string; coins_earned?: number; xp_earned?: number; total_coins?: number; total_xp?: number; total_badges?: number };

      if (result.success) {
        toast({
          title: "🎉 Quiz Completed!",
          description: `${result.message}`
        });
        setTimeout(() => navigate("/lessons"), 2000);
      } else {
        toast({
          title: "Info",
          description: result.message
        });
      }
    } catch (error) {
      console.error('Error completing quiz:', error);
      toast({
        title: "Error",
        description: "Failed to complete quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCompleting(false);
    }
  };

  const encouragingMessages = [
    "You're a Geography Star! ⭐",
    "Amazing Explorer! 🌍",
    "Fantastic Work! 🎉",
    "Geography Genius! 🧠",
    "World Traveler in Training! ✈️",
    "You're Crushing It! 💪",
    "Super Smart! 🌟"
  ];

  const getEncouragingMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return "Perfect Score! You're a Geography Master! 🏆";
    if (percentage >= 80) return encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
    if (percentage >= 60) return "Great Job! Keep Learning! 📚";
    return "Nice Try! Practice Makes Perfect! 💫";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Creating your fun quiz...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b-4 border-primary px-6 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/lessons")}
            className="hover:scale-110 transition-transform rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {lessonData[lessonId || "intro-geography"]?.title} Quiz
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {!showResult ? (
          <Card className="animate-slide-up shadow-2xl border-4 border-white/50 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-purple-500/10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-primary">
                  Question {currentQuestion + 1} of {questions.length}
                </CardTitle>
                <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-md">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-lg font-bold">
                    {score}/{questions.length}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <h2 className="text-2xl font-bold mb-6 text-center leading-relaxed">
                {questions[currentQuestion].question}
              </h2>

              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectAnswer = index === questions[currentQuestion].correctAnswer;
                  const showCorrect = answered && isCorrectAnswer;
                  const showWrong = answered && isSelected && !isCorrectAnswer;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={answered}
                      className={`w-full p-5 text-left rounded-2xl border-3 transition-all duration-300 transform hover:scale-102 ${
                        showCorrect
                          ? "border-green-500 bg-green-100 animate-pulse"
                          : showWrong
                          ? "border-red-500 bg-red-100 animate-shake"
                          : isSelected
                          ? "border-primary bg-primary/10 scale-105"
                          : "border-gray-300 hover:border-primary/50 bg-white hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-lg">{option}</span>
                        {showCorrect && (
                          <CheckCircle className="w-6 h-6 text-green-600 animate-bounce" />
                        )}
                        {showWrong && (
                          <XCircle className="w-6 h-6 text-red-600 animate-bounce" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {showFunFact && (
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-xl border-2 border-yellow-400 animate-slide-up">
                  <p className="text-sm font-semibold text-yellow-900">
                    🌟 Fun Fact: {questions[currentQuestion].funFact}
                  </p>
                </div>
              )}

              {answered && (
                <Button
                  onClick={handleNextQuestion}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white text-lg py-6 rounded-xl shadow-lg transform hover:scale-105 transition-all"
                >
                  {currentQuestion + 1 === questions.length ? "See Results! 🎉" : "Next Question ➡️"}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="animate-scale-in shadow-2xl border-4 border-white/50 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/20 to-purple-500/20 pb-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  {score === questions.length ? (
                    <Award className="w-24 h-24 text-yellow-500 animate-bounce" />
                  ) : score >= questions.length * 0.7 ? (
                    <Star className="w-24 h-24 text-purple-500 animate-pulse" />
                  ) : (
                    <Sparkles className="w-24 h-24 text-blue-500 animate-pulse" />
                  )}
                </div>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Quiz Complete!
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="text-center space-y-4">
                <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-6 rounded-2xl">
                  <p className="text-5xl font-bold mb-2">
                    {score}/{questions.length}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {getEncouragingMessage()}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-100 to-amber-100 px-6 py-5 rounded-2xl border-3 border-yellow-400 shadow-lg transform hover:scale-105 transition-all">
                  <Coins className="w-8 h-8 text-yellow-600" />
                  <span className="text-2xl font-bold text-yellow-700">+{score * 20} Coins</span>
                </div>
                <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-100 to-blue-100 px-6 py-5 rounded-2xl border-3 border-purple-400 shadow-lg transform hover:scale-105 transition-all">
                  <Star className="w-8 h-8 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-700">+{score * 20} XP</span>
                </div>
                <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-100 to-emerald-100 px-6 py-5 rounded-2xl border-3 border-green-400 shadow-lg transform hover:scale-105 transition-all">
                  <Award className="w-8 h-8 text-green-600" />
                  <span className="text-2xl font-bold text-green-700">+1 Badge</span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => navigate("/lessons")}
                  variant="outline"
                  className="flex-1 py-6 text-lg rounded-xl border-2 hover:scale-105 transition-all"
                >
                  Back to Lessons
                </Button>
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="flex-1 py-6 text-lg rounded-xl border-2 border-primary text-primary hover:bg-primary/10 hover:scale-105 transition-all"
                >
                  Try Again 🔄
                </Button>
              </div>
              
              <Button
                onClick={handleCompleteQuiz}
                disabled={completing}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xl py-7 rounded-xl shadow-xl transform hover:scale-105 transition-all"
              >
                {completing ? "Claiming..." : "Claim Rewards! 🎁"}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Quiz;
