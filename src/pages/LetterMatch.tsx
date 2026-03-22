import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Trophy, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

interface Letter {
  id: string;
  upper: string;
  lower: string;
  color: string;
}

const letters: Letter[] = [
  { id: "a", upper: "A", lower: "a", color: "bg-red-500" },
  { id: "b", upper: "B", lower: "b", color: "bg-blue-500" },
  { id: "c", upper: "C", lower: "c", color: "bg-green-500" },
  { id: "d", upper: "D", lower: "d", color: "bg-yellow-500" },
  { id: "e", upper: "E", lower: "e", color: "bg-purple-500" },
  { id: "f", upper: "F", lower: "f", color: "bg-pink-500" },
];

const encouragements = [
  "Great job! 🌟",
  "You're doing amazing! ⭐",
  "Perfect! 🎉",
  "Wonderful! 🎈",
  "Super work! 💫",
  "Excellent! 🏆"
];

const LetterMatch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [shuffledLetters, setShuffledLetters] = useState<Letter[]>([]);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    // Shuffle letters for the draggable items
    setShuffledLetters([...letters].sort(() => Math.random() - 0.5));
  }, []);

  const getRandomEncouragement = () => {
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  };

  const handleDragStart = (letterId: string) => {
    setDraggedItem(letterId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedItem) return;

    setAttempts(prev => prev + 1);

    if (draggedItem === targetId) {
      setMatched(prev => new Set([...prev, targetId]));
      setScore(prev => prev + 100);
      
      // Mini confetti for each correct match
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 }
      });

      toast({
        title: getRandomEncouragement(),
        description: `You matched the letters correctly!`,
      });

      // Check if game is complete
      if (matched.size + 1 === letters.length) {
        setGameComplete(true);
        // Big confetti celebration
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 }
        });
        
        setTimeout(() => {
          confetti({
            particleCount: 100,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
        }, 200);
        
        setTimeout(() => {
          confetti({
            particleCount: 100,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 400);
      }
    } else {
      toast({
        title: "Try again! 😊",
        description: "That's not quite right. You can do it!",
        variant: "destructive",
      });
    }

    setDraggedItem(null);
  };

  const handleReset = () => {
    setMatched(new Set());
    setScore(0);
    setAttempts(0);
    setGameComplete(false);
    setShuffledLetters([...letters].sort(() => Math.random() - 0.5));
  };

  const accuracy = attempts > 0 ? Math.round((matched.size / attempts) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-purple-900 to-pink-950">
      {/* Header */}
      <header className="bg-gray-950/80 backdrop-blur-sm border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/mini-games")}
              className="hover:scale-110 transition-transform hover:bg-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-yellow-400" />
              Match the Letters! 🔤
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-600/20 to-amber-600/20 px-4 py-2 rounded-full border border-yellow-600/50">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-lg font-bold text-yellow-400">{score}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {!gameComplete ? (
          <>
            <div className="mb-8 text-center animate-fade-in">
              <h2 className="text-4xl font-bold mb-3 text-white">Match Big and Small Letters!</h2>
              <p className="text-gray-200 text-xl">Drag the small letters to match with BIG letters</p>
              <div className="mt-4 flex items-center justify-center gap-4 text-base text-gray-300">
                <span className="bg-green-500/20 px-4 py-2 rounded-full border border-green-500/50">
                  Matched: {matched.size}/{letters.length}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Drop Zones - BIG Letters */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white mb-6 text-center bg-blue-500/20 py-3 rounded-xl border-2 border-blue-500">
                  BIG Letters 👆
                </h3>
                {letters.map((letter) => (
                  <Card
                    key={letter.id}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(letter.id)}
                    className={`p-8 border-4 border-dashed transition-all duration-300 ${
                      matched.has(letter.id)
                        ? `${letter.color} border-green-500 bg-green-950/50 scale-105`
                        : "bg-gray-800/50 border-white hover:border-blue-400 hover:bg-blue-900/30"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-6">
                      <div className="text-7xl font-bold text-white">
                        {letter.upper}
                      </div>
                      {matched.has(letter.id) && (
                        <div className="flex items-center gap-3">
                          <div className="text-7xl font-bold text-white">
                            {letter.lower}
                          </div>
                          <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Draggable Items - small letters */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white mb-6 text-center bg-purple-500/20 py-3 rounded-xl border-2 border-purple-500">
                  Drag From Here 👇
                </h3>
                {shuffledLetters.map((letter) => (
                  <Card
                    key={letter.id}
                    draggable={!matched.has(letter.id)}
                    onDragStart={() => handleDragStart(letter.id)}
                    className={`p-8 text-center transition-all duration-300 ${
                      matched.has(letter.id)
                        ? "opacity-30 cursor-not-allowed bg-gray-700"
                        : "cursor-grab active:cursor-grabbing hover:scale-110 bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-4 border-purple-400 hover:border-pink-400 hover:shadow-2xl hover:shadow-purple-500/50"
                    }`}
                  >
                    <div className="text-7xl font-bold text-white">
                      {letter.lower}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mt-10 text-center">
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="bg-gray-800/50 hover:bg-gray-700 text-white border-gray-600 text-lg px-8 py-6"
              >
                Start Over
              </Button>
            </div>
          </>
        ) : (
          <Card className="max-w-2xl mx-auto p-12 text-center bg-gradient-to-br from-yellow-600/20 via-pink-600/20 to-purple-600/20 border-4 border-yellow-500 animate-scale-in">
            <Trophy className="w-28 h-28 text-yellow-400 mx-auto mb-6 animate-bounce" />
            <h2 className="text-5xl font-bold text-white mb-4">🎉 You Did It! 🎉</h2>
            <p className="text-3xl text-gray-200 mb-8">You're a Letter Matching Star!</p>
            
            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="bg-gradient-to-br from-yellow-600/30 to-orange-600/30 p-6 rounded-2xl border-2 border-yellow-500">
                <div className="text-yellow-400 text-5xl font-bold mb-2">{score}</div>
                <div className="text-gray-200 text-lg">Points!</div>
              </div>
              <div className="bg-gradient-to-br from-green-600/30 to-emerald-600/30 p-6 rounded-2xl border-2 border-green-500">
                <div className="text-green-400 text-5xl font-bold mb-2">{accuracy}%</div>
                <div className="text-gray-200 text-lg">Super!</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
              <Button
                onClick={handleReset}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-8 text-xl font-bold rounded-2xl shadow-lg"
              >
                Play Again! 🎮
              </Button>
              <Button
                onClick={() => navigate("/mini-games")}
                variant="outline"
                className="bg-gray-800/50 hover:bg-gray-700 text-white border-gray-600 px-10 py-8 text-xl font-bold rounded-2xl"
              >
                More Games 🎯
              </Button>
            </div>
          </Card>
        )}

        {/* Floating decorative elements */}
        <div className="fixed top-20 left-10 w-20 h-20 text-6xl opacity-20 animate-bounce">
          A
        </div>
        <div className="fixed bottom-32 right-20 w-20 h-20 text-6xl opacity-20 animate-bounce" style={{ animationDelay: '1s' }}>
          B
        </div>
        <div className="fixed top-1/2 left-20 w-20 h-20 text-6xl opacity-20 animate-bounce" style={{ animationDelay: '0.5s' }}>
          C
        </div>
      </main>
    </div>
  );
};

export default LetterMatch;
