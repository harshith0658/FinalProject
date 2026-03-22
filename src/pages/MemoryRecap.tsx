import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Star, Award, Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface MemoryCard {
  id: number;
  content: string;
  type: "text" | "emoji";
  matched: boolean;
  flipped: boolean;
}

const MemoryRecap = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  const cardPairs = [
    { text: "Ocean", emoji: "🌊" },
    { text: "Mountain", emoji: "⛰️" },
    { text: "Forest", emoji: "🌲" },
    { text: "Desert", emoji: "🏜️" },
    { text: "River", emoji: "🏞️" },
    { text: "Volcano", emoji: "🌋" },
  ];

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const gameCards: MemoryCard[] = [];
    cardPairs.forEach((pair, index) => {
      gameCards.push({
        id: index * 2,
        content: pair.text,
        type: "text",
        matched: false,
        flipped: false,
      });
      gameCards.push({
        id: index * 2 + 1,
        content: pair.emoji,
        type: "emoji",
        matched: false,
        flipped: false,
      });
    });
    
    // Shuffle cards
    const shuffled = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
  };

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2 || gameComplete) return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, flipped: true } : c
    );
    setCards(newCards);

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      checkMatch(newFlipped, newCards);
    }
  };

  const checkMatch = (flipped: number[], currentCards: MemoryCard[]) => {
    const [first, second] = flipped;
    const firstCard = currentCards.find(c => c.id === first);
    const secondCard = currentCards.find(c => c.id === second);

    if (!firstCard || !secondCard) return;

    const pair = cardPairs.find(
      p => (p.text === firstCard.content && p.emoji === secondCard.content) ||
           (p.emoji === firstCard.content && p.text === secondCard.content)
    );

    setTimeout(() => {
      if (pair) {
        const updatedCards = currentCards.map(c =>
          c.id === first || c.id === second
            ? { ...c, matched: true }
            : c
        );
        setCards(updatedCards);
        setMatchedPairs(matchedPairs + 1);

        if (matchedPairs + 1 === cardPairs.length) {
          setGameComplete(true);
          toast({
            title: "🎉 Congratulations!",
            description: `You completed the game in ${moves + 1} moves!`,
          });
        }
      } else {
        const updatedCards = currentCards.map(c =>
          c.id === first || c.id === second
            ? { ...c, flipped: false }
            : c
        );
        setCards(updatedCards);
      }
      setFlippedCards([]);
    }, 800);
  };

  const resetGame = () => {
    setMoves(0);
    setMatchedPairs(0);
    setGameComplete(false);
    setFlippedCards([]);
    initializeGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-400 via-yellow-300 to-yellow-400">
      {/* Header */}
      <header className="bg-cyan-500 border-b-4 border-cyan-600 px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/mini-games")}
              className="hover:scale-110 transition-transform bg-white/20 hover:bg-white/30"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Memory Card Game</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-white/30">
              <span className="text-lg font-bold text-white">Moves: {moves}</span>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-white/30">
              <span className="text-lg font-bold text-white">Pairs: {matchedPairs}/{cardPairs.length}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Match the Geography Terms with their Symbols</h2>
          <p className="text-gray-700">Click on cards to flip them and find matching pairs!</p>
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => (
            <Card
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                card.flipped || card.matched
                  ? "bg-white border-4 border-gray-300"
                  : "bg-gradient-to-br from-pink-500 to-red-500 border-4 border-white"
              } ${card.matched ? "opacity-60" : ""}`}
              style={{
                perspective: "1000px",
              }}
            >
              {card.flipped || card.matched ? (
                <div className="text-center p-4">
                  {card.type === "emoji" ? (
                    <span className="text-5xl">{card.content}</span>
                  ) : (
                    <span className="text-2xl font-bold text-gray-800">{card.content}</span>
                  )}
                </div>
              ) : (
                <div className="w-full h-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-pink-400 rounded-full w-16 h-16 top-4 left-4 opacity-50" />
                  <div className="absolute inset-0 bg-pink-400 rounded-full w-10 h-10 bottom-8 right-6 opacity-50" />
                  <div className="absolute inset-0 bg-pink-400 rounded-full w-24 h-24 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50" />
                  <div className="absolute inset-0 bg-pink-400 rounded-full w-6 h-6 bottom-12 left-8 opacity-50" />
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Game Complete / Reset */}
        <div className="text-center">
          {gameComplete ? (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border-4 border-cyan-500">
                <h3 className="text-3xl font-bold text-gray-800 mb-4">🎉 Game Complete!</h3>
                <p className="text-xl text-gray-700 mb-2">Total Moves: {moves}</p>
                <div className="flex items-center justify-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <Coins className="w-6 h-6 text-yellow-600" />
                    <span className="text-lg font-bold text-yellow-600">+50</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 text-purple-600" />
                    <span className="text-lg font-bold text-purple-600">+50</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-green-600" />
                    <span className="text-lg font-bold text-green-600">+1</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={resetGame}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-6 text-lg font-semibold rounded-2xl shadow-lg"
              >
                Play Again
              </Button>
            </div>
          ) : (
            <Button
              onClick={resetGame}
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border-2 border-gray-300 hover:bg-white px-6 py-3 text-gray-800 font-semibold"
            >
              Reset Game
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default MemoryRecap;
