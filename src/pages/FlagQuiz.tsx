import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trophy, Star, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { useToast } from "@/hooks/use-toast";

interface FlagQuestion {
  country: string;
  flag: string;
  options: string[];
  correctAnswer: string;
}

const FlagQuiz = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [questions, setQuestions] = useState<FlagQuestion[]>([]);

  const allFlags: FlagQuestion[] = [
    { country: "USA", flag: "🇺🇸", options: ["USA", "UK", "France", "Canada"], correctAnswer: "USA" },
    { country: "UK", flag: "🇬🇧", options: ["USA", "UK", "Australia", "New Zealand"], correctAnswer: "UK" },
    { country: "France", flag: "🇫🇷", options: ["Netherlands", "France", "Italy", "Russia"], correctAnswer: "France" },
    { country: "Germany", flag: "🇩🇪", options: ["Belgium", "Germany", "Austria", "Switzerland"], correctAnswer: "Germany" },
    { country: "Italy", flag: "🇮🇹", options: ["Italy", "Mexico", "Ireland", "Hungary"], correctAnswer: "Italy" },
    { country: "Spain", flag: "🇪🇸", options: ["Portugal", "Spain", "Colombia", "Venezuela"], correctAnswer: "Spain" },
    { country: "Japan", flag: "🇯🇵", options: ["Japan", "South Korea", "China", "Bangladesh"], correctAnswer: "Japan" },
    { country: "China", flag: "🇨🇳", options: ["Vietnam", "China", "Morocco", "Turkey"], correctAnswer: "China" },
    { country: "India", flag: "🇮🇳", options: ["India", "Ireland", "Italy", "Niger"], correctAnswer: "India" },
    { country: "Brazil", flag: "🇧🇷", options: ["Brazil", "Portugal", "Argentina", "Jamaica"], correctAnswer: "Brazil" },
    { country: "Canada", flag: "🇨🇦", options: ["Canada", "USA", "Peru", "Austria"], correctAnswer: "Canada" },
    { country: "Mexico", flag: "🇲🇽", options: ["Italy", "Mexico", "Hungary", "Bulgaria"], correctAnswer: "Mexico" },
    { country: "Australia", flag: "🇦🇺", options: ["New Zealand", "Australia", "UK", "Fiji"], correctAnswer: "Australia" },
    { country: "South Korea", flag: "🇰🇷", options: ["Japan", "South Korea", "North Korea", "Taiwan"], correctAnswer: "South Korea" },
    { country: "Russia", flag: "🇷🇺", options: ["France", "Netherlands", "Russia", "Serbia"], correctAnswer: "Russia" },
  ];

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    // Shuffle and select 10 random questions
    const shuffled = [...allFlags].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuestions(shuffled);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const fireConfetti = () => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      confetti({
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 0,
        particleCount: 50,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: Math.random() - 0.2,
        },
        colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A"],
      });
    }, 250);
  };

  const handleAnswerClick = (answer: string) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    const correct = answer === questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
      fireConfetti();
    }

    setTimeout(() => {
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const getButtonStyle = (option: string) => {
    if (selectedAnswer === null) {
      return "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transform hover:scale-105";
    }
    if (option === questions[currentQuestion].correctAnswer) {
      return "bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse";
    }
    if (option === selectedAnswer && !isCorrect) {
      return "bg-gradient-to-r from-red-500 to-pink-500 animate-shake";
    }
    return "bg-gray-400 opacity-50";
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 relative overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-yellow-300/30 rounded-full blur-2xl animate-float" />
      <div className="absolute bottom-32 right-20 w-32 h-32 bg-pink-300/30 rounded-full blur-2xl animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-blue-300/30 rounded-full blur-2xl animate-float" style={{ animationDelay: "2s" }} />

      {/* Header */}
      <header className="bg-white/20 backdrop-blur-md border-b-4 border-white/30 px-6 py-4 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/mini-games")}
            className="hover:scale-110 transition-transform bg-white/30 hover:bg-white/50 text-white rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl font-black text-white drop-shadow-lg">🎌 Flag Quiz 🎌</h1>
          <div className="flex items-center gap-2 bg-white/30 px-4 py-2 rounded-full">
            <Trophy className="w-6 h-6 text-yellow-300" />
            <span className="text-2xl font-bold text-white">{score}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {!showResult ? (
          <Card className="bg-white/95 backdrop-blur-sm border-4 border-white/50 shadow-2xl rounded-3xl overflow-hidden animate-slide-up">
            {/* Progress Bar */}
            <div className="bg-gradient-to-r from-pink-300 to-purple-300 h-3">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-500 ease-out"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>

            <CardContent className="p-12">
              {/* Question Number */}
              <div className="text-center mb-8">
                <span className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full text-xl font-bold shadow-lg">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
              </div>

              {/* Flag Display */}
              <div className="text-center mb-12">
                <div className="inline-block bg-gradient-to-br from-yellow-200 to-orange-200 p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform">
                  <div className="text-9xl mb-4 animate-bounce">
                    {questions[currentQuestion].flag}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Which country is this?
                  </h2>
                </div>
              </div>

              {/* Answer Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {questions[currentQuestion].options.map((option) => (
                  <Button
                    key={option}
                    onClick={() => handleAnswerClick(option)}
                    disabled={selectedAnswer !== null}
                    className={`${getButtonStyle(option)} text-white text-2xl font-bold py-8 rounded-2xl shadow-xl transition-all duration-300 border-4 border-white/50`}
                  >
                    {option}
                  </Button>
                ))}
              </div>

              {/* Feedback */}
              {selectedAnswer && (
                <div className="mt-8 text-center animate-slide-up">
                  {isCorrect ? (
                    <div className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-8 py-4 rounded-2xl text-2xl font-bold shadow-xl inline-block">
                      🎉 Awesome! That's correct! 🎉
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-red-400 to-pink-400 text-white px-8 py-4 rounded-2xl text-2xl font-bold shadow-xl inline-block">
                      😊 Oops! The correct answer is {questions[currentQuestion].correctAnswer}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/95 backdrop-blur-sm border-4 border-white/50 shadow-2xl rounded-3xl overflow-hidden animate-scale-in">
            <CardContent className="p-12 text-center">
              <div className="mb-8">
                <div className="text-8xl mb-6 animate-bounce">
                  {score >= 8 ? "🏆" : score >= 5 ? "⭐" : "🎯"}
                </div>
                <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {score >= 8 ? "Amazing!" : score >= 5 ? "Great Job!" : "Good Try!"}
                </h2>
                <p className="text-3xl font-bold text-gray-700 mb-8">
                  You got {score} out of {questions.length} correct!
                </p>
              </div>

              {/* Score Display */}
              <div className="mb-8 flex justify-center gap-4">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-400 px-8 py-6 rounded-2xl shadow-xl">
                  <Star className="w-10 h-10 text-white mx-auto mb-2" />
                  <div className="text-white font-bold text-xl">Score</div>
                  <div className="text-white font-black text-3xl">{score * 10}%</div>
                </div>
              </div>

              {/* Encouraging message */}
              <div className="mb-8 bg-gradient-to-r from-blue-100 to-purple-100 px-8 py-6 rounded-2xl">
                <p className="text-xl font-semibold text-gray-700">
                  {score >= 8 ? "You're a flag expert! 🌟" : score >= 5 ? "Keep learning about flags! 📚" : "Practice makes perfect! 💪"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={startNewGame}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-xl font-bold py-6 px-10 rounded-2xl shadow-xl transform hover:scale-105 transition-all"
                >
                  <RefreshCw className="w-6 h-6 mr-2" />
                  Play Again
                </Button>
                <Button
                  onClick={() => navigate("/mini-games")}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xl font-bold py-6 px-10 rounded-2xl shadow-xl transform hover:scale-105 transition-all"
                >
                  Back to Games
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default FlagQuiz;
