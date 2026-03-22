import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

interface Continent {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

const continents: Continent[] = [
  { id: "africa", name: "Africa", color: "bg-orange-500", emoji: "🦁" },
  { id: "asia", name: "Asia", color: "bg-red-500", emoji: "🐼" },
  { id: "europe", name: "Europe", color: "bg-blue-500", emoji: "🏰" },
  { id: "north-america", name: "North America", color: "bg-green-500", emoji: "🦅" },
  { id: "south-america", name: "South America", color: "bg-yellow-500", emoji: "🦜" },
  { id: "australia", name: "Australia", color: "bg-purple-500", emoji: "🦘" },
];

const ContinentMatch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [shuffledContinents, setShuffledContinents] = useState<Continent[]>([]);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    // Shuffle continents for the draggable items
    setShuffledContinents([...continents].sort(() => Math.random() - 0.5));
  }, []);

  const handleDragStart = (continentId: string) => {
    setDraggedItem(continentId);
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
      
      toast({
        title: "Perfect! 🎉",
        description: `You matched ${continents.find(c => c.id === targetId)?.name} correctly!`,
      });

      // Check if game is complete
      if (matched.size + 1 === continents.length) {
        setGameComplete(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        toast({
          title: "🎊 Amazing Work!",
          description: `You matched all continents! Score: ${score + 100}`,
        });
      }
    } else {
      toast({
        title: "Try again! 🤔",
        description: "That's not quite right. Give it another try!",
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
    setShuffledContinents([...continents].sort(() => Math.random() - 0.5));
  };

  const accuracy = attempts > 0 ? Math.round((matched.size / attempts) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
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
            <h1 className="text-2xl font-bold text-white">Match the Continents 🌍</h1>
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
              <h2 className="text-3xl font-bold mb-2 text-white">Drag the Names to Match!</h2>
              <p className="text-gray-400 text-lg">Match each continent name with its emoji</p>
              <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-400">
                <span>Matched: {matched.size}/{continents.length}</span>
                <span>•</span>
                <span>Accuracy: {accuracy}%</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Drop Zones */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-4 text-center">Drop Here 👇</h3>
                {continents.map((continent) => (
                  <Card
                    key={continent.id}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(continent.id)}
                    className={`p-6 border-2 border-dashed transition-all duration-300 ${
                      matched.has(continent.id)
                        ? `${continent.color} border-green-500 bg-green-950/50`
                        : "bg-gray-800/50 border-gray-600 hover:border-purple-500"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-4xl">{continent.emoji}</div>
                      {matched.has(continent.id) ? (
                        <div className="text-white font-bold text-xl flex items-center gap-2">
                          {continent.name}
                          <Trophy className="w-6 h-6 text-yellow-400" />
                        </div>
                      ) : (
                        <div className="text-gray-500 text-xl font-bold">???</div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Draggable Items */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-4 text-center">Drag From Here 👇</h3>
                {shuffledContinents.map((continent) => (
                  <Card
                    key={continent.id}
                    draggable={!matched.has(continent.id)}
                    onDragStart={() => handleDragStart(continent.id)}
                    className={`p-6 text-center cursor-move transition-all duration-300 ${
                      matched.has(continent.id)
                        ? "opacity-30 cursor-not-allowed"
                        : "hover:scale-105 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-2 border-purple-500 hover:shadow-lg hover:shadow-purple-500/50"
                    }`}
                  >
                    <div className="text-white font-bold text-2xl">
                      {continent.name}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button
                onClick={handleReset}
                variant="outline"
                className="bg-gray-800/50 hover:bg-gray-700 text-white border-gray-600"
              >
                Reset Game
              </Button>
            </div>
          </>
        ) : (
          <Card className="max-w-2xl mx-auto p-12 text-center bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-2 border-purple-500 animate-scale-in">
            <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">Congratulations! 🎉</h2>
            <p className="text-2xl text-gray-300 mb-6">You matched all continents!</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="text-yellow-400 text-3xl font-bold">{score}</div>
                <div className="text-gray-400">Final Score</div>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="text-green-400 text-3xl font-bold">{accuracy}%</div>
                <div className="text-gray-400">Accuracy</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={handleReset}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-2xl"
              >
                Play Again
              </Button>
              <Button
                onClick={() => navigate("/mini-games")}
                variant="outline"
                className="bg-gray-800/50 hover:bg-gray-700 text-white border-gray-600 px-8 py-6 text-lg font-semibold rounded-2xl"
              >
                Back to Games
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ContinentMatch;
